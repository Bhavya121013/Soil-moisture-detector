import React, { useState } from 'react';
import { Search, BookOpen, Droplet, Sun, ShieldAlert, ShieldCheck, Plus, Sparkles } from 'lucide-react';
import { SPECIES_DATABASE } from '../../data/speciesDatabase';
import { PlantSpecies, SpeciesCategory } from '../../types';

interface CareGuideDatabaseProps {
  onAddSpeciesToGarden: (species: PlantSpecies) => void;
}

export const CareGuideDatabase: React.FC<CareGuideDatabaseProps> = ({
  onAddSpeciesToGarden
}) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSpeciesModal, setSelectedSpeciesModal] = useState<PlantSpecies | null>(null);

  const categories = [
    { id: 'all', label: 'All Plants' },
    { id: 'indoor', label: 'Indoor Tropicals' },
    { id: 'beginner', label: 'Beginner-Friendly' },
    { id: 'succulent', label: 'Succulents & Cacti' },
    { id: 'herb', label: 'Culinary Herbs' },
    { id: 'low-light', label: 'Low-Light Tolerant' },
    { id: 'flowering', label: 'Flowering' }
  ];

  const filtered = SPECIES_DATABASE.filter(sp => {
    const matchesCategory =
      selectedCategory === 'all' || sp.category === selectedCategory;
    const matchesSearch =
      sp.commonName.toLowerCase().includes(search.toLowerCase()) ||
      sp.scientificName.toLowerCase().includes(search.toLowerCase()) ||
      sp.description.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.75rem', color: 'var(--forest-900)', margin: '0 0 0.5rem' }}>
          Botanical Care Encyclopedia
        </h2>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0 }}>
          Scientifically grounded care guides, moisture calibration ranges, sunlight schedules, and toxicity data for popular plant varieties.
        </p>
      </div>

      {/* Search & Filter Bar */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: 14, top: 12 }} />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: '2.5rem' }}
            placeholder="Search plant care guide by common or scientific name..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.4rem', overflowX: 'auto', paddingBottom: 2 }}>
          {categories.map(cat => (
            <button
              key={cat.id}
              className="badge"
              style={{
                background: selectedCategory === cat.id ? 'var(--forest-700)' : 'var(--cream-100)',
                color: selectedCategory === cat.id ? '#fff' : 'var(--forest-900)',
                cursor: 'pointer',
                padding: '0.45rem 0.8rem',
                fontSize: '0.8125rem'
              }}
              onClick={() => setSelectedCategory(cat.id)}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Species */}
      <div className="grid-plants">
        {filtered.map(sp => (
          <div
            key={sp.id}
            className="card card-hover"
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              cursor: 'pointer'
            }}
            onClick={() => setSelectedSpeciesModal(sp)}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ fontSize: '2rem' }}>{sp.avatarIcon}</span>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.125rem', color: 'var(--forest-900)' }}>
                      {sp.commonName}
                    </h3>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                      {sp.scientificName}
                    </div>
                  </div>
                </div>
                <span className="badge badge-sage" style={{ textTransform: 'capitalize' }}>
                  {sp.category}
                </span>
              </div>

              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.4, marginBottom: '1rem' }}>
                {sp.description.slice(0, 110)}...
              </p>

              {/* Moisture & Light Badges */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '1rem' }}>
                <div style={{ padding: '0.5rem', background: 'var(--water-100)', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.6875rem', color: 'var(--water-600)', fontWeight: 700 }}>
                    <Droplet size={12} />
                    <span>TARGET MOISTURE</span>
                  </div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--forest-900)', marginTop: '0.15rem' }}>
                    {sp.moistureMin}%–{sp.moistureMax}%
                  </div>
                </div>

                <div style={{ padding: '0.5rem', background: 'var(--cream-100)', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.6875rem', color: 'var(--olive-600)', fontWeight: 700 }}>
                    <Sun size={12} />
                    <span>LIGHT NEEDS</span>
                  </div>
                  <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--forest-900)', marginTop: '0.15rem' }}>
                    {sp.lightCategory}
                  </div>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
              <button
                className="btn btn-outline"
                style={{ flex: 1, padding: '0.45rem', fontSize: '0.8125rem' }}
                onClick={e => {
                  e.stopPropagation();
                  setSelectedSpeciesModal(sp);
                }}
              >
                Care Details
              </button>

              <button
                className="btn btn-primary"
                style={{ flex: 1, padding: '0.45rem', fontSize: '0.8125rem' }}
                onClick={e => {
                  e.stopPropagation();
                  onAddSpeciesToGarden(sp);
                }}
              >
                <Plus size={14} />
                <span>Add to Garden</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Species Full Modal */}
      {selectedSpeciesModal && (
        <div className="modal-backdrop" onClick={() => setSelectedSpeciesModal(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ fontSize: '2rem' }}>{selectedSpeciesModal.avatarIcon}</span>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--forest-900)' }}>
                    {selectedSpeciesModal.commonName}
                  </h3>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                    {selectedSpeciesModal.scientificName}
                  </div>
                </div>
              </div>
              <button className="btn btn-outline btn-icon" onClick={() => setSelectedSpeciesModal(null)}>
                &times;
              </button>
            </div>

            <div className="modal-body">
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '1.25rem' }}>
                {selectedSpeciesModal.description}
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem', marginBottom: '1.25rem' }}>
                <div style={{ padding: '0.875rem', background: 'var(--cream-100)', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.8125rem', color: 'var(--forest-900)', marginBottom: '0.25rem' }}>
                    💧 Moisture & Soil
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                    {selectedSpeciesModal.soilGuidance}
                  </div>
                  <div style={{ marginTop: '0.4rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--forest-700)' }}>
                    Ideal probe moisture: {selectedSpeciesModal.idealMoisture}%
                  </div>
                </div>

                <div style={{ padding: '0.875rem', background: 'var(--cream-100)', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.8125rem', color: 'var(--forest-900)', marginBottom: '0.25rem' }}>
                    ☀️ Sunlight Guidelines
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                    {selectedSpeciesModal.sunlightHours}
                  </div>
                  <div style={{ marginTop: '0.4rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--forest-700)' }}>
                    Temp: {selectedSpeciesModal.tempMinC}°C to {selectedSpeciesModal.tempMaxC}°C
                  </div>
                </div>
              </div>

              <div style={{ padding: '0.875rem', background: 'var(--cream-50)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', marginBottom: '1rem' }}>
                <div style={{ fontWeight: 700, fontSize: '0.8125rem', color: 'var(--forest-900)', marginBottom: '0.25rem' }}>
                  ⚠️ Warning Signs & Symptoms
                </div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                  {selectedSpeciesModal.commonProblems}
                </div>
              </div>

              <div style={{ padding: '0.875rem', background: 'var(--cream-50)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontWeight: 700, fontSize: '0.8125rem', color: 'var(--forest-900)', marginBottom: '0.25rem' }}>
                  🐾 Pet Toxicity Notice
                </div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                  {selectedSpeciesModal.toxicity}
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setSelectedSpeciesModal(null)}>
                Close
              </button>
              <button
                className="btn btn-primary"
                onClick={() => {
                  const sp = selectedSpeciesModal;
                  setSelectedSpeciesModal(null);
                  onAddSpeciesToGarden(sp);
                }}
              >
                <Plus size={16} />
                <span>Add {selectedSpeciesModal.commonName} to Garden</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
