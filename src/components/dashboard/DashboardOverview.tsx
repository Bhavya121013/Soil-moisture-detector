import React, { useState } from 'react';
import { Plus, Search, Filter, Sparkles, Droplet, Sprout } from 'lucide-react';
import { Plant, PlantSpecies } from '../../types';
import { usePlant } from '../../context/PlantContext';
import { useDevice } from '../../context/DeviceContext';
import { GardenStats } from './GardenStats';
import { PlantCard } from './PlantCard';
import { EmptyGardenState } from './EmptyGardenState';
import { getCareRecommendation } from '../../utils/botanicalRecommender';

interface DashboardOverviewProps {
  onOpenAddPlant: () => void;
  onSelectPlant: (plant: Plant) => void;
  onOpenWaterModal: (plant: Plant) => void;
  onOpenEditModal: (plant: Plant) => void;
  onOpenDeleteModal: (plant: Plant) => void;
  onOpenCareCalendar: () => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  onOpenAddPlant,
  onSelectPlant,
  onOpenWaterModal,
  onOpenEditModal,
  onOpenDeleteModal,
  onOpenCareCalendar
}) => {
  const { plants, reminders, isDemoMode } = usePlant();
  const { getLatestReadingForPlant } = useDevice();

  const [search, setSearch] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'needs-water' | 'sensors-linked'>('all');

  // Friendly time greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const todayStr = new Date().toLocaleDateString([], {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  });

  // If garden is completely empty and not in demo mode, display the welcoming EmptyGardenState!
  if (plants.length === 0) {
    return <EmptyGardenState onOpenAddPlant={onOpenAddPlant} />;
  }

  // Filter plants based on search and filterMode
  const filteredPlants = plants.filter(p => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.location.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;

    if (filterMode === 'needs-water') {
      const r = getLatestReadingForPlant(p.id);
      const rec = getCareRecommendation(p, r);
      return rec.status === 'watering-needed' || rec.status === 'check-moisture';
    }

    if (filterMode === 'sensors-linked') {
      return !!p.deviceId;
    }

    return true;
  });

  return (
    <div>
      {/* Welcome & Daily Garden Summary */}
      <div style={{ marginBottom: '1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {todayStr}
            </div>
            <h1 style={{ margin: '0.2rem 0 0', fontSize: '1.75rem', color: 'var(--forest-900)' }}>
              {getGreeting()}, plant parent! 🌿
            </h1>
          </div>

          <button className="btn btn-primary" onClick={onOpenAddPlant}>
            <Plus size={16} />
            <span>Add Plant</span>
          </button>
        </div>
      </div>

      {/* Summary Statistics */}
      <GardenStats
        plants={plants}
        remindersCount={reminders.filter(r => !r.isCompleted).length}
      />

      {/* Filter and Search Toolbar */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.75rem',
          marginBottom: '1.5rem'
        }}
      >
        <div style={{ position: 'relative', width: '100%', maxWidth: 360 }}>
          <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: 12, top: 11 }} />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: '2.25rem', fontSize: '0.8125rem' }}
            placeholder="Search by plant name or room..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', overflowX: 'auto' }}>
          <button
            className="badge"
            style={{
              background: filterMode === 'all' ? 'var(--forest-700)' : 'var(--cream-100)',
              color: filterMode === 'all' ? '#fff' : 'var(--forest-900)',
              cursor: 'pointer',
              padding: '0.4rem 0.75rem'
            }}
            onClick={() => setFilterMode('all')}
          >
            All Plants ({plants.length})
          </button>

          <button
            className="badge"
            style={{
              background: filterMode === 'needs-water' ? 'var(--terracotta-500)' : 'var(--cream-100)',
              color: filterMode === 'needs-water' ? '#fff' : 'var(--forest-900)',
              cursor: 'pointer',
              padding: '0.4rem 0.75rem'
            }}
            onClick={() => setFilterMode('needs-water')}
          >
            💧 Needs Water
          </button>

          <button
            className="badge"
            style={{
              background: filterMode === 'sensors-linked' ? 'var(--forest-700)' : 'var(--cream-100)',
              color: filterMode === 'sensors-linked' ? '#fff' : 'var(--forest-900)',
              cursor: 'pointer',
              padding: '0.4rem 0.75rem'
            }}
            onClick={() => setFilterMode('sensors-linked')}
          >
            📡 With Sensors
          </button>
        </div>
      </div>

      {/* Plants Grid */}
      {filteredPlants.length === 0 ? (
        <div
          className="card"
          style={{
            textAlign: 'center',
            padding: '2.5rem 1rem',
            background: 'var(--cream-100)',
            border: '1px dashed var(--border-strong)'
          }}
        >
          <Sprout size={32} color="var(--forest-600)" style={{ margin: '0 auto 0.5rem' }} />
          <h4 style={{ margin: 0, color: 'var(--forest-900)' }}>No matching plants found</h4>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Try clearing your search query or switching filters.
          </p>
        </div>
      ) : (
        <div className="grid-plants">
          {filteredPlants.map(plant => (
            <PlantCard
              key={plant.id}
              plant={plant}
              onSelect={onSelectPlant}
              onOpenWaterModal={onOpenWaterModal}
              onOpenEditModal={onOpenEditModal}
              onOpenDeleteModal={onOpenDeleteModal}
            />
          ))}
        </div>
      )}
    </div>
  );
};
