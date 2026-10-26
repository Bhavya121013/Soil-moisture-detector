import React from 'react';
import {
  Droplet,
  Thermometer,
  Wind,
  Wifi,
  WifiOff,
  MoreVertical,
  Edit2,
  Trash2,
  ExternalLink,
  Clock
} from 'lucide-react';
import { Plant } from '../../types';
import { useDevice } from '../../context/DeviceContext';
import { getSpeciesById } from '../../data/speciesDatabase';
import { getCareRecommendation, getPlantMood } from '../../utils/botanicalRecommender';

interface PlantCardProps {
  plant: Plant;
  onSelect: (plant: Plant) => void;
  onOpenWaterModal: (plant: Plant) => void;
  onOpenEditModal: (plant: Plant) => void;
  onOpenDeleteModal: (plant: Plant) => void;
}

export const PlantCard: React.FC<PlantCardProps> = ({
  plant,
  onSelect,
  onOpenWaterModal,
  onOpenEditModal,
  onOpenDeleteModal
}) => {
  const { getLatestReadingForPlant, devices } = useDevice();
  const [menuOpen, setMenuOpen] = React.useState(false);

  const species = getSpeciesById(plant.speciesId);
  const reading = getLatestReadingForPlant(plant.id);
  const recommendation = getCareRecommendation(plant, reading);
  const mood = getPlantMood(plant, reading);

  const assignedDevice = devices.find(d => d.assignedPlantId === plant.id || d.id === plant.deviceId);
  const isOnline = assignedDevice?.isOnline ?? false;

  const currentMoisture = reading ? reading.soilPercent : null;
  const targetMin = plant.customMoistureTargetMin ?? species.moistureMin;
  const targetMax = plant.customMoistureTargetMax ?? species.moistureMax;

  // Visual status class for borders & highlights
  const isThirsty = recommendation.status === 'watering-needed' || (currentMoisture !== null && currentMoisture < targetMin);
  const cardBorderClass = isThirsty ? 'attention-needed' : '';

  // SVG Circular progress math
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = currentMoisture !== null
    ? circumference - (currentMoisture / 100) * circumference
    : circumference;

  return (
    <div
      className={`card card-hover ${cardBorderClass}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        borderColor: isThirsty ? 'var(--terracotta-400)' : 'var(--border-subtle)'
      }}
    >
      <div>
        {/* Top Header: Species & Options Menu */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '1.5rem' }}>{species.avatarIcon}</span>
            <div>
              <h3
                style={{
                  margin: 0,
                  fontSize: '1.125rem',
                  fontWeight: 700,
                  color: 'var(--forest-900)',
                  cursor: 'pointer'
                }}
                onClick={() => onSelect(plant)}
              >
                {plant.name}
              </h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {plant.customSpeciesName || species.commonName}
              </span>
            </div>
          </div>

          <div style={{ position: 'relative' }}>
            <button
              className="btn btn-outline btn-icon"
              style={{ width: 30, height: 30 }}
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Options"
            >
              <MoreVertical size={16} />
            </button>

            {menuOpen && (
              <>
                <div
                  style={{ position: 'fixed', inset: 0, zIndex: 10 }}
                  onClick={() => setMenuOpen(false)}
                />
                <div
                  style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    width: 140,
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    boxShadow: 'var(--shadow-lg)',
                    zIndex: 20,
                    padding: '0.35rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.15rem'
                  }}
                >
                  <button
                    className="nav-item"
                    style={{ padding: '0.4rem 0.6rem', fontSize: '0.8125rem' }}
                    onClick={() => {
                      setMenuOpen(false);
                      onSelect(plant);
                    }}
                  >
                    <ExternalLink size={14} />
                    <span>View Details</span>
                  </button>
                  <button
                    className="nav-item"
                    style={{ padding: '0.4rem 0.6rem', fontSize: '0.8125rem' }}
                    onClick={() => {
                      setMenuOpen(false);
                      onOpenEditModal(plant);
                    }}
                  >
                    <Edit2 size={14} />
                    <span>Edit / Rename</span>
                  </button>
                  <button
                    className="nav-item"
                    style={{ padding: '0.4rem 0.6rem', fontSize: '0.8125rem', color: 'var(--alert-red)' }}
                    onClick={() => {
                      setMenuOpen(false);
                      onOpenDeleteModal(plant);
                    }}
                  >
                    <Trash2 size={14} />
                    <span>Remove</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Badges Bar: Mood & Location */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1rem' }}>
          <span className="badge" style={{ background: 'var(--cream-100)', color: 'var(--forest-800)', borderColor: 'var(--border-subtle)' }}>
            📍 {plant.location || 'Home'}
          </span>
          <span className="badge" style={{ background: 'var(--sage-100)', color: 'var(--forest-900)' }}>
            {mood.emoji} {mood.label}
          </span>
          {assignedDevice ? (
            <span className="badge" style={{ background: isOnline ? 'var(--sage-50)' : 'var(--cream-200)', color: isOnline ? 'var(--forest-700)' : 'var(--text-muted)' }}>
              {isOnline ? <Wifi size={12} color="#5F7F64" /> : <WifiOff size={12} />}
              {assignedDevice.name}
            </span>
          ) : (
            <span className="badge" style={{ background: 'var(--cream-200)', color: 'var(--text-muted)' }}>
              Manual Care
            </span>
          )}
        </div>

        {/* Primary Sensor Gauges */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--bg-surface-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '0.875rem 1rem',
            marginBottom: '1rem'
          }}
        >
          {/* Circular Moisture Meter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
            <div style={{ position: 'relative', width: 68, height: 68 }}>
              <svg width="68" height="68" viewBox="0 0 70 70">
                <circle
                  cx="35"
                  cy="35"
                  r={radius}
                  stroke="var(--border-subtle)"
                  strokeWidth="6"
                  fill="none"
                />
                <circle
                  cx="35"
                  cy="35"
                  r={radius}
                  stroke={isThirsty ? 'var(--terracotta-500)' : 'var(--forest-700)'}
                  strokeWidth="6"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  fill="none"
                  transform="rotate(-90 35 35)"
                  style={{ transition: 'stroke-dashoffset 0.8s ease' }}
                />
              </svg>
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <span style={{ fontSize: '0.9375rem', fontWeight: 800, color: 'var(--forest-900)' }}>
                  {currentMoisture !== null ? `${currentMoisture}%` : '--'}
                </span>
                <span style={{ fontSize: '0.5625rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Moist
                </span>
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--forest-900)' }}>
                Soil Moisture
              </div>
              <div style={{ fontSize: '0.6875rem', color: 'var(--text-secondary)' }}>
                Target: {targetMin}%–{targetMax}%
              </div>
              {reading && (
                <div style={{ fontSize: '0.625rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                  Raw ADC: {reading.soilRaw}
                </div>
              )}
            </div>
          </div>

          {/* Environmental DHT11 readings */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', textAlign: 'right' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.35rem', fontSize: '0.8125rem' }}>
              <Thermometer size={14} color="var(--terracotta-500)" />
              <span style={{ fontWeight: 600 }}>
                {reading?.isDhtValid ? `${reading.temperatureC}°C` : '--'}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.35rem', fontSize: '0.8125rem' }}>
              <Wind size={14} color="var(--water-500)" />
              <span style={{ fontWeight: 600 }}>
                {reading?.isDhtValid ? `${Math.round(reading.humidityPercent)}% RH` : '--'}
              </span>
            </div>
          </div>
        </div>

        {/* Personalized Recommendation Snippet */}
        <div
          style={{
            padding: '0.75rem',
            borderRadius: 'var(--radius-sm)',
            background: isThirsty ? 'var(--terracotta-100)' : 'var(--cream-100)',
            borderLeft: `4px solid ${isThirsty ? 'var(--terracotta-500)' : 'var(--forest-600)'}`,
            marginBottom: '1rem'
          }}
        >
          <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--forest-900)', marginBottom: '0.2rem' }}>
            {recommendation.headline}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
            {recommendation.explanation}
          </div>
        </div>
      </div>

      {/* Card Footer: Last updated & Quick action */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
            <Clock size={12} />
            {reading
              ? `Reported ${new Date(reading.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
              : plant.lastWateredDate
              ? `Watered ${new Date(plant.lastWateredDate).toLocaleDateString()}`
              : 'No log yet'}
          </span>

          {plant.careStreak && plant.careStreak > 1 && (
            <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--terracotta-500)' }}>
              🔥 {plant.careStreak}-day streak
            </span>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
          <button
            className="btn btn-primary"
            style={{ padding: '0.5rem', fontSize: '0.8125rem' }}
            onClick={() => onOpenWaterModal(plant)}
          >
            <Droplet size={14} />
            <span>Log Water</span>
          </button>

          <button
            className="btn btn-outline"
            style={{ padding: '0.5rem', fontSize: '0.8125rem' }}
            onClick={() => onSelect(plant)}
          >
            <ExternalLink size={14} />
            <span>Details</span>
          </button>
        </div>
      </div>
    </div>
  );
};
