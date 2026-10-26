import React from 'react';
import { Sprout, Cpu, Droplet, AlertTriangle } from 'lucide-react';
import { Plant, SensorReading } from '../../types';
import { useDevice } from '../../context/DeviceContext';
import { getCareRecommendation } from '../../utils/botanicalRecommender';

interface GardenStatsProps {
  plants: Plant[];
  remindersCount: number;
}

export const GardenStats: React.FC<GardenStatsProps> = ({ plants, remindersCount }) => {
  const { devices, getLatestReadingForPlant } = useDevice();

  const onlineDevicesCount = devices.filter(d => d.isOnline).length;

  // Calculate plants needing water or attention
  let plantsNeedingAttention = 0;
  plants.forEach(plant => {
    const reading = getLatestReadingForPlant(plant.id);
    const rec = getCareRecommendation(plant, reading);
    if (rec.status === 'watering-needed' || rec.status === 'check-moisture') {
      plantsNeedingAttention++;
    }
  });

  return (
    <div className="grid-stats" style={{ marginBottom: '1.75rem' }}>
      <div className="card" style={{ padding: '1.125rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
          <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
            Plants Tracked
          </span>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--sage-100)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Sprout size={16} color="var(--forest-700)" />
          </div>
        </div>
        <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--forest-900)' }}>
          {plants.length}
        </div>
        <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
          {plants.filter(p => !!p.deviceId).length} with live ESP32 sensors
        </div>
      </div>

      <div className="card" style={{ padding: '1.125rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
          <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
            Sensor Nodes
          </span>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--water-100)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Cpu size={16} color="var(--water-600)" />
          </div>
        </div>
        <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--forest-900)' }}>
          {onlineDevicesCount}
          <span style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--text-muted)' }}>
            /{devices.length}
          </span>
        </div>
        <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
          {onlineDevicesCount > 0 ? 'Broadcasting live telemetry' : 'No active hardware online'}
        </div>
      </div>

      <div
        className="card"
        style={{
          padding: '1.125rem',
          borderColor: plantsNeedingAttention > 0 ? 'rgba(226, 149, 120, 0.4)' : 'var(--border-subtle)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
          <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
            Needs Water
          </span>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: plantsNeedingAttention > 0 ? 'var(--terracotta-100)' : 'var(--cream-100)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Droplet size={16} color={plantsNeedingAttention > 0 ? 'var(--terracotta-500)' : 'var(--text-muted)'} />
          </div>
        </div>
        <div style={{ fontSize: '1.75rem', fontWeight: 800, color: plantsNeedingAttention > 0 ? 'var(--terracotta-500)' : 'var(--forest-900)' }}>
          {plantsNeedingAttention}
        </div>
        <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
          {plantsNeedingAttention > 0 ? 'Based on species moisture thresholds' : 'All monitored soil is well hydrated'}
        </div>
      </div>

      <div className="card" style={{ padding: '1.125rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
          <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
            Care Duties Due
          </span>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--cream-200)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <AlertTriangle size={16} color="var(--forest-600)" />
          </div>
        </div>
        <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--forest-900)' }}>
          {remindersCount}
        </div>
        <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
          Checkups & scheduled tasks
        </div>
      </div>
    </div>
  );
};
