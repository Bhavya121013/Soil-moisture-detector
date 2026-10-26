import React, { useState } from 'react';
import {
  ArrowLeft,
  Droplet,
  Thermometer,
  Wind,
  Wifi,
  Sun,
  BookOpen,
  Calendar,
  AlertCircle,
  Plus,
  Edit2,
  Clock,
  ShieldCheck,
  ShieldAlert,
  Sparkles
} from 'lucide-react';
import { Plant } from '../../types';
import { usePlant } from '../../context/PlantContext';
import { useDevice } from '../../context/DeviceContext';
import { getSpeciesById } from '../../data/speciesDatabase';
import { getCareRecommendation, getPlantMood } from '../../utils/botanicalRecommender';
import { SensorHistoryCharts } from '../history/SensorHistoryCharts';

interface PlantDetailViewProps {
  plant: Plant;
  onBack: () => void;
  onOpenWaterModal: (plant: Plant) => void;
  onOpenEditModal: (plant: Plant) => void;
  onOpenJournalModal: (plant: Plant) => void;
}

export const PlantDetailView: React.FC<PlantDetailViewProps> = ({
  plant,
  onBack,
  onOpenWaterModal,
  onOpenEditModal,
  onOpenJournalModal
}) => {
  const { waterings, journal, reminders } = usePlant();
  const { getLatestReadingForPlant, getHistoricalReadingsForPlant, devices } = useDevice();
  const [activeTab, setActiveTab] = useState<'charts' | 'waterings' | 'journal' | 'species'>('charts');

  const species = getSpeciesById(plant.speciesId);
  const latestReading = getLatestReadingForPlant(plant.id);
  const historicalReadings = getHistoricalReadingsForPlant(plant.id);
  const recommendation = getCareRecommendation(plant, latestReading);
  const mood = getPlantMood(plant, latestReading);

  const plantWaterings = waterings.filter(w => w.plantId === plant.id);
  const plantJournal = journal.filter(j => j.plantId === plant.id);
  const plantReminders = reminders.filter(r => r.plantId === plant.id && !r.isCompleted);

  const assignedDevice = devices.find(d => d.assignedPlantId === plant.id || d.id === plant.deviceId);

  const targetMin = plant.customMoistureTargetMin ?? species.moistureMin;
  const targetMax = plant.customMoistureTargetMax ?? species.moistureMax;
  const currentMoisture = latestReading ? latestReading.soilPercent : null;

  return (
    <div>
      {/* Top Header & Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <button className="btn btn-outline" onClick={onBack}>
          <ArrowLeft size={16} />
          <span>Back to Garden</span>
        </button>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn btn-outline" onClick={() => onOpenEditModal(plant)}>
            <Edit2 size={16} />
            <span>Edit Plant</span>
          </button>
          <button className="btn btn-primary" onClick={() => onOpenWaterModal(plant)}>
            <Droplet size={16} />
            <span>Log Water</span>
          </button>
        </div>
      </div>

      {/* Main Plant Profile Banner */}
      <div
        className="card"
        style={{
          padding: '1.75rem',
          marginBottom: '1.5rem',
          background: 'linear-gradient(135deg, var(--bg-surface) 0%, var(--cream-100) 100%)'
        }}
      >
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: '1.25rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <div
              style={{
                width: 76,
                height: 76,
                borderRadius: 'var(--radius-lg)',
                background: 'var(--sage-100)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2.5rem',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              {species.avatarIcon}
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                <h1 style={{ margin: 0, fontSize: '1.75rem', color: 'var(--forest-900)' }}>
                  {plant.name}
                </h1>
                <span className="badge badge-sage">
                  {mood.emoji} {mood.label}
                </span>
                {plant.careStreak && plant.careStreak > 1 && (
                  <span className="badge badge-terracotta">
                    🔥 {plant.careStreak}-day care streak
                  </span>
                )}
              </div>

              <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                <strong>{plant.customSpeciesName || species.commonName}</strong> &bull;{' '}
                <em style={{ color: 'var(--text-muted)' }}>{species.scientificName}</em>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                <span>📍 {plant.location}</span>
                <span>🪴 {plant.potSize || 'Standard pot'}</span>
                {plant.hasDrainage && <span>💧 Drainage hole</span>}
              </div>
            </div>
          </div>

          {/* Quick Care Status Widget */}
          <div
            style={{
              padding: '1rem',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              minWidth: 240
            }}
          >
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
              BOTANICAL STATUS
            </div>
            <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--forest-900)' }}>
              {recommendation.headline}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem', lineHeight: 1.4 }}>
              {recommendation.explanation}
            </div>
          </div>
        </div>
      </div>

      {/* Live Hardware Telemetry Panel */}
      <div className="grid-stats" style={{ marginBottom: '1.5rem' }}>
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Soil Moisture
            </span>
            <Droplet size={18} color="var(--water-600)" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--forest-900)' }}>
            {currentMoisture !== null ? `${currentMoisture}%` : '--'}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Preferred range: {targetMin}%–{targetMax}%
          </div>
          {latestReading && (
            <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              Raw ADC: {latestReading.soilRaw}
            </div>
          )}
        </div>

        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Ambient Temperature
            </span>
            <Thermometer size={18} color="var(--terracotta-500)" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--forest-900)' }}>
            {latestReading?.isDhtValid ? `${latestReading.temperatureC}°C` : '--'}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {latestReading?.isDhtValid ? `${Math.round(latestReading.temperatureF)}°F &bull; Tolerates ${species.tempMinC}°C-${species.tempMaxC}°C` : 'DHT11 not connected'}
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Relative Humidity
            </span>
            <Wind size={18} color="var(--water-500)" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--forest-900)' }}>
            {latestReading?.isDhtValid ? `${Math.round(latestReading.humidityPercent)}%` : '--'}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Species min: {species.humidityMin}% RH
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Sensor Hardware
            </span>
            <Wifi size={18} color={assignedDevice?.isOnline ? '#5F7F64' : 'var(--text-muted)'} />
          </div>
          <div style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--forest-900)' }}>
            {assignedDevice ? assignedDevice.name : 'Manual Care Mode'}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {assignedDevice
              ? `${assignedDevice.isOnline ? 'Online' : 'Offline'} (${assignedDevice.ip})`
              : 'No ESP32 node linked'}
          </div>
        </div>
      </div>

      {/* Honest Botanical Sunlight Guidance Card */}
      <div
        className="card"
        style={{
          padding: '1.25rem',
          marginBottom: '1.5rem',
          borderLeft: '4px solid var(--olive-500)',
          background: 'var(--cream-50)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <Sun size={20} color="var(--olive-600)" />
          <h4 style={{ margin: 0, fontSize: '1rem', color: 'var(--forest-900)' }}>
            Honest Sunlight & Environmental Intelligence
          </h4>
        </div>
        <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: '0 0 0.5rem' }}>
          <strong>Notice:</strong> The soil moisture probe and DHT11 temperature/humidity sensors <em>do not measure light intensity</em>. Sunlight guidance is calculated from {species.commonName}&rsquo;s botanical classification and your specified location ({plant.location}).
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem', marginTop: '0.75rem' }}>
          <div style={{ padding: '0.75rem', background: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--text-muted)' }}>SPECIES LIGHT CATEGORY</div>
            <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--forest-900)', marginTop: '0.2rem' }}>
              {species.lightCategory}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
              {species.sunlightHours}
            </div>
          </div>

          <div style={{ padding: '0.75rem', background: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--text-muted)' }}>REPORTED PLACEMENT</div>
            <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--forest-900)', marginTop: '0.2rem' }}>
              {plant.lightCondition.toUpperCase().replace('-', ' ')}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
              {plant.environment === 'indoor' ? 'Indoors' : 'Outdoors / Balcony'}
            </div>
          </div>

          <div style={{ padding: '0.75rem', background: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--text-muted)' }}>MOISTURE EVAPORATION TREND</div>
            <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--forest-900)', marginTop: '0.2rem' }}>
              Steady Drying Rate
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
              Moisture decline correlates with temperature & pot drainage.
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border-subtle)', marginBottom: '1.25rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
        <button
          className={`btn ${activeTab === 'charts' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setActiveTab('charts')}
          style={{ padding: '0.5rem 1rem', fontSize: '0.8125rem' }}
        >
          Sensor Charts
        </button>
        <button
          className={`btn ${activeTab === 'waterings' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setActiveTab('waterings')}
          style={{ padding: '0.5rem 1rem', fontSize: '0.8125rem' }}
        >
          Watering History ({plantWaterings.length})
        </button>
        <button
          className={`btn ${activeTab === 'journal' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setActiveTab('journal')}
          style={{ padding: '0.5rem 1rem', fontSize: '0.8125rem' }}
        >
          Plant Journal ({plantJournal.length})
        </button>
        <button
          className={`btn ${activeTab === 'species' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setActiveTab('species')}
          style={{ padding: '0.5rem 1rem', fontSize: '0.8125rem' }}
        >
          Botanical Care Guide
        </button>
      </div>

      {/* Tab 1: Sensor Charts */}
      {activeTab === 'charts' && (
        <SensorHistoryCharts plant={plant} readings={historicalReadings} />
      )}

      {/* Tab 2: Watering History Log */}
      {activeTab === 'waterings' && (
        <div className="card">
          <div className="card-header">
            <h4 className="card-title">Recorded Hydration Events</h4>
            <button className="btn btn-primary" style={{ fontSize: '0.75rem', padding: '0.4rem 0.75rem' }} onClick={() => onOpenWaterModal(plant)}>
              <Plus size={14} />
              <span>Log Watering</span>
            </button>
          </div>

          {plantWaterings.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--text-muted)' }}>
              <Droplet size={32} color="var(--water-400)" style={{ margin: '0 auto 0.5rem' }} />
              <p>No watering events recorded yet for {plant.name}.</p>
              <button className="btn btn-outline" onClick={() => onOpenWaterModal(plant)}>
                Log First Watering
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {plantWaterings.map(w => (
                <div
                  key={w.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.875rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--cream-50)',
                    border: '1px solid var(--border-subtle)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--water-100)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Droplet size={18} color="var(--water-600)" />
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--forest-900)' }}>
                        {new Date(w.timestamp).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })} at{' '}
                        {new Date(w.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        {w.notes || 'Routine hydration'}
                      </div>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    {w.amountMl && (
                      <span className="badge badge-water" style={{ fontSize: '0.8125rem' }}>
                        {w.amountMl} ml
                      </span>
                    )}
                    {w.moistureBefore !== undefined && (
                      <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                        Before: {w.moistureBefore}%
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Plant Journal */}
      {activeTab === 'journal' && (
        <div className="card">
          <div className="card-header">
            <h4 className="card-title">Plant Observations & Growth Diary</h4>
            <button className="btn btn-primary" style={{ fontSize: '0.75rem', padding: '0.4rem 0.75rem' }} onClick={() => onOpenJournalModal(plant)}>
              <Plus size={14} />
              <span>New Entry</span>
            </button>
          </div>

          {plantJournal.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--text-muted)' }}>
              <BookOpen size={32} color="var(--forest-500)" style={{ margin: '0 auto 0.5rem' }} />
              <p>No journal entries added yet.</p>
              <button className="btn btn-outline" onClick={() => onOpenJournalModal(plant)}>
                Write First Growth Entry
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              {plantJournal.map(j => (
                <div
                  key={j.id}
                  style={{
                    padding: '1rem',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-surface-subtle)',
                    border: '1px solid var(--border-subtle)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--forest-900)' }}>
                      {j.title}
                    </div>
                    <span className="badge badge-sage" style={{ textTransform: 'capitalize' }}>
                      {j.mood || 'growing'}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                    {j.date}
                  </div>
                  <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    {j.notes}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Species Botanical Guide */}
      {activeTab === 'species' && (
        <div className="card">
          <h4 className="card-title" style={{ marginBottom: '1rem' }}>
            Botanical Encyclopedia &bull; {species.commonName}
          </h4>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
            <div style={{ padding: '1rem', background: 'var(--cream-100)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--forest-900)', marginBottom: '0.35rem' }}>
                💧 Soil & Hydration Guidance
              </div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                {species.soilGuidance}
              </div>
              <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--forest-700)' }}>
                Target Moisture: {species.moistureMin}%–{species.moistureMax}% (Ideal ~{species.idealMoisture}%)
              </div>
            </div>

            <div style={{ padding: '1rem', background: 'var(--cream-100)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--forest-900)', marginBottom: '0.35rem' }}>
                ☀️ Light & Environment
              </div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                {species.sunlightHours}
              </div>
              <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--forest-700)' }}>
                Temperature Range: {species.tempMinC}°C to {species.tempMaxC}°C
              </div>
            </div>

            <div style={{ padding: '1rem', background: 'var(--cream-100)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--forest-900)', marginBottom: '0.35rem' }}>
                🐾 Pet Safety & Toxicity
              </div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                {species.toxicity}
              </div>
            </div>

            <div style={{ padding: '1rem', background: 'var(--cream-100)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--forest-900)', marginBottom: '0.35rem' }}>
                ⚠️ Common Plant Problems
              </div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                {species.commonProblems}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
