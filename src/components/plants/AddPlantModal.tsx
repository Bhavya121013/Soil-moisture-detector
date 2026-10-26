import React, { useState } from 'react';
import { X, Search, Sparkles, Check, ChevronRight, ChevronLeft, Sprout } from 'lucide-react';
import { Plant, Environment, LightCondition } from '../../types';
import { SPECIES_DATABASE, UNKNOWN_SPECIES_FALLBACK } from '../../data/speciesDatabase';
import { useDevice } from '../../context/DeviceContext';
import { usePlant } from '../../context/PlantContext';

interface AddPlantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlantAdded?: (plant: Plant) => void;
}

const AVATAR_OPTIONS = [
  { id: 'sprout', emoji: '🌱', label: 'Sprout' },
  { id: 'herb', emoji: '🌿', label: 'Herb' },
  { id: 'monstera', emoji: '🍃', label: 'Tropical' },
  { id: 'succulent', emoji: '🪴', label: 'Succulent' },
  { id: 'cactus', emoji: '🌵', label: 'Cactus' },
  { id: 'flower', emoji: '🌸', label: 'Flowering' },
  { id: 'tree', emoji: '🌳', label: 'Tree' }
];

const LOCATION_SUGGESTIONS = [
  'Living Room',
  'Balcony',
  'Kitchen Window',
  'Bedroom',
  'Home Office',
  'Garden Patio',
  'Bathroom'
];

export const AddPlantModal: React.FC<AddPlantModalProps> = ({
  isOpen,
  onClose,
  onPlantAdded
}) => {
  const { addPlant } = usePlant();
  const { devices } = useDevice();

  // Step 1: Quick Setup; Step 2: Personalize Care
  const [step, setStep] = useState<1 | 2>(1);

  // Form State
  const [name, setName] = useState('');
  const [speciesSearch, setSpeciesSearch] = useState('');
  const [selectedSpeciesId, setSelectedSpeciesId] = useState<string>('');
  const [customSpeciesName, setCustomSpeciesName] = useState('');
  const [isUnknownSpecies, setIsUnknownSpecies] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState('🌱');
  const [deviceId, setDeviceId] = useState<string>('');

  // Step 2 Optional Personalization
  const [location, setLocation] = useState('Living Room');
  const [environment, setEnvironment] = useState<Environment>('indoor');
  const [lightCondition, setLightCondition] = useState<LightCondition>('bright-indirect');
  const [potSize, setPotSize] = useState('8 inch (20 cm)');
  const [hasDrainage, setHasDrainage] = useState(true);
  const [soilType, setSoilType] = useState('Well-draining indoor potting mix');
  const [lastWateredDaysAgo, setLastWateredDaysAgo] = useState('2');
  const [notes, setNotes] = useState('');

  // Validation errors
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  // Filter species database
  const filteredSpecies = SPECIES_DATABASE.filter(
    s =>
      s.commonName.toLowerCase().includes(speciesSearch.toLowerCase()) ||
      s.scientificName.toLowerCase().includes(speciesSearch.toLowerCase())
  );

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please give your plant a friendly name (e.g. "Olive" or "Balcony Basil").');
      return;
    }
    setError(null);
    setStep(2);
  };

  const handleFinalSubmit = () => {
    if (!name.trim()) {
      setError('Plant name is required.');
      setStep(1);
      return;
    }

    const speciesId = isUnknownSpecies
      ? UNKNOWN_SPECIES_FALLBACK.id
      : selectedSpeciesId || UNKNOWN_SPECIES_FALLBACK.id;

    const lastWateredDate = lastWateredDaysAgo
      ? new Date(Date.now() - parseFloat(lastWateredDaysAgo) * 86400 * 1000).toISOString()
      : undefined;

    const newPlant = addPlant({
      name: name.trim(),
      speciesId,
      customSpeciesName: customSpeciesName.trim() || undefined,
      avatarPreset: selectedAvatar,
      location: location.trim() || 'Home',
      environment,
      lightCondition,
      potSize: potSize.trim() || undefined,
      hasDrainage,
      soilType: soilType.trim() || undefined,
      lastWateredDate,
      deviceId: deviceId || null,
      notes: notes.trim() || undefined
    });

    if (onPlantAdded) {
      onPlantAdded(newPlant);
    }

    onClose();
    // Reset form
    setStep(1);
    setName('');
    setSelectedSpeciesId('');
    setCustomSpeciesName('');
    setIsUnknownSpecies(false);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <div>
            <h3 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--forest-900)' }}>
              {step === 1 ? 'Add a New Plant' : 'Personalize Care Details'}
            </h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Step {step} of 2 &bull; {step === 1 ? 'Quick essentials' : 'Optional botanical tuning'}
            </span>
          </div>
          <button className="btn btn-outline btn-icon" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body">
          {error && (
            <div
              style={{
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                background: 'var(--alert-red-bg)',
                color: 'var(--alert-red)',
                fontSize: '0.8125rem',
                fontWeight: 600,
                marginBottom: '1rem',
                border: '1px solid rgba(217, 83, 79, 0.2)'
              }}
            >
              {error}
            </div>
          )}

          {step === 1 ? (
            /* ==========================================================
               STAGE 1: QUICK SETUP
               ========================================================== */
            <div>
              {/* Question 1: Plant Name */}
              <div className="form-group">
                <label className="form-label">
                  What would you like to name your plant? <span style={{ color: 'var(--terracotta-500)' }}>*</span>
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Emerald, Sunny, Balcony Basil, Chef Leaf"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  autoFocus
                  required
                />
                <div className="form-hint">Choose whatever cute or descriptive name you prefer.</div>
              </div>

              {/* Plant Avatar / Icon */}
              <div className="form-group">
                <label className="form-label">Choose a botanical avatar</label>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {AVATAR_OPTIONS.map(opt => (
                    <button
                      key={opt.id}
                      type="button"
                      style={{
                        padding: '0.5rem 0.75rem',
                        borderRadius: 'var(--radius-md)',
                        border: selectedAvatar === opt.emoji ? '2px solid var(--forest-700)' : '1px solid var(--border-subtle)',
                        background: selectedAvatar === opt.emoji ? 'var(--sage-100)' : 'var(--bg-surface)',
                        cursor: 'pointer',
                        fontSize: '1.25rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem'
                      }}
                      onClick={() => setSelectedAvatar(opt.emoji)}
                    >
                      <span>{opt.emoji}</span>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--forest-900)' }}>
                        {opt.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Question 2: Plant Species Search */}
              <div className="form-group">
                <label className="form-label">What kind of plant is it?</label>

                {!isUnknownSpecies && (
                  <>
                    <div style={{ position: 'relative', marginBottom: '0.5rem' }}>
                      <Search
                        size={16}
                        color="var(--text-muted)"
                        style={{ position: 'absolute', left: 12, top: 12 }}
                      />
                      <input
                        type="text"
                        className="form-input"
                        style={{ paddingLeft: '2.25rem' }}
                        placeholder="Search species (e.g. Basil, Monstera, Snake Plant)..."
                        value={speciesSearch}
                        onChange={e => setSpeciesSearch(e.target.value)}
                      />
                    </div>

                    {/* Species Match List */}
                    <div
                      style={{
                        maxHeight: 160,
                        overflowY: 'auto',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-md)',
                        marginBottom: '0.5rem',
                        background: 'var(--bg-surface)'
                      }}
                    >
                      {filteredSpecies.map(sp => {
                        const isSelected = selectedSpeciesId === sp.id;
                        return (
                          <div
                            key={sp.id}
                            style={{
                              padding: '0.625rem 0.875rem',
                              borderBottom: '1px solid var(--border-subtle)',
                              cursor: 'pointer',
                              background: isSelected ? 'var(--sage-100)' : 'transparent',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between'
                            }}
                            onClick={() => {
                              setSelectedSpeciesId(sp.id);
                              setSelectedAvatar(sp.avatarIcon);
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <span>{sp.avatarIcon}</span>
                              <div>
                                <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--forest-900)' }}>
                                  {sp.commonName}
                                </div>
                                <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                                  {sp.scientificName} &bull; Ideal moist: {sp.idealMoisture}%
                                </div>
                              </div>
                            </div>
                            {isSelected && <Check size={16} color="var(--forest-700)" />}
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.35rem' }}>
                  <input
                    type="checkbox"
                    id="unknownSpeciesCheck"
                    checked={isUnknownSpecies}
                    onChange={e => setIsUnknownSpecies(e.target.checked)}
                  />
                  <label htmlFor="unknownSpeciesCheck" style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                    I don&apos;t know the exact species (use baseline general profile)
                  </label>
                </div>

                {isUnknownSpecies && (
                  <div style={{ marginTop: '0.5rem' }}>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Optional general description (e.g. Green leafy plant, Hanging vine)"
                      value={customSpeciesName}
                      onChange={e => setCustomSpeciesName(e.target.value)}
                    />
                  </div>
                )}
              </div>

              {/* Question 3: Link an ESP32 Sensor Node */}
              <div className="form-group">
                <label className="form-label">Connect an ESP32 Sensor Node</label>
                <select
                  className="form-select"
                  value={deviceId}
                  onChange={e => setDeviceId(e.target.value)}
                >
                  <option value="">No hardware right now (Manual Care Tracking)</option>
                  {devices.map(dev => (
                    <option key={dev.id} value={dev.id}>
                      {dev.name} ({dev.ip}) — {dev.isOnline ? 'Online' : 'Offline'}
                    </option>
                  ))}
                </select>
                <div className="form-hint">
                  You can always link or move a sensor node to this plant anytime later in Devices.
                </div>
              </div>
            </div>
          ) : (
            /* ==========================================================
               STAGE 2: PERSONALIZE CARE (OPTIONAL)
               ========================================================== */
            <div>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
                These optional details help Sproutly customize sunlight reminders and moisture drying estimates for <strong>{name}</strong>.
              </p>

              {/* Location */}
              <div className="form-group">
                <label className="form-label">Plant Location</label>
                <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', marginBottom: '0.4rem' }}>
                  {LOCATION_SUGGESTIONS.map(loc => (
                    <button
                      key={loc}
                      type="button"
                      className="badge"
                      style={{
                        background: location === loc ? 'var(--forest-700)' : 'var(--cream-100)',
                        color: location === loc ? '#fff' : 'var(--forest-900)',
                        cursor: 'pointer',
                        padding: '0.3rem 0.6rem'
                      }}
                      onClick={() => setLocation(loc)}
                    >
                      {loc}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Custom location"
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                />
              </div>

              {/* Light Condition */}
              <div className="form-group">
                <label className="form-label">Reported Sunlight Condition</label>
                <select
                  className="form-select"
                  value={lightCondition}
                  onChange={e => setLightCondition(e.target.value as LightCondition)}
                >
                  <option value="low">Low Indirect Light (Corners, low natural light)</option>
                  <option value="indirect">Medium Indirect Light (Gentle room daylight)</option>
                  <option value="bright-indirect">Bright Indirect Light (Near bright window without harsh rays)</option>
                  <option value="direct">Direct Sunlight (Direct rays on foliage)</option>
                  <option value="unknown">Not Sure</option>
                </select>
                <div className="form-hint">
                  Note: ESP32 soil and DHT11 sensors do not measure photons directly; this setting is used for botanical guidance.
                </div>
              </div>

              {/* Pot & Soil */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className="form-group">
                  <label className="form-label">Pot Size</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. 8 inch, 20 cm"
                    value={potSize}
                    onChange={e => setPotSize(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Drainage Hole</label>
                  <select
                    className="form-select"
                    value={hasDrainage ? 'yes' : 'no'}
                    onChange={e => setHasDrainage(e.target.value === 'yes')}
                  >
                    <option value="yes">Yes (Saucer/Drilled Hole)</option>
                    <option value="no">No (Requires careful watering)</option>
                  </select>
                </div>
              </div>

              {/* Last Watered Days Ago */}
              <div className="form-group">
                <label className="form-label">When was it last watered?</label>
                <select
                  className="form-select"
                  value={lastWateredDaysAgo}
                  onChange={e => setLastWateredDaysAgo(e.target.value)}
                >
                  <option value="0">Today</option>
                  <option value="1">Yesterday</option>
                  <option value="2">2 days ago</option>
                  <option value="4">4 days ago</option>
                  <option value="7">About a week ago</option>
                  <option value="14">2+ weeks ago</option>
                  <option value="">I am not sure</option>
                </select>
              </div>

              {/* Personal Notes */}
              <div className="form-group">
                <label className="form-label">Personal Notes</label>
                <textarea
                  className="form-textarea"
                  rows={2}
                  placeholder="Notes on where you bought it, soil amendments, or care goals..."
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                />
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="modal-footer">
          {step === 2 && (
            <button className="btn btn-outline" onClick={() => setStep(1)}>
              <ChevronLeft size={16} />
              <span>Back</span>
            </button>
          )}

          <button className="btn btn-outline" onClick={onClose}>
            Cancel
          </button>

          {step === 1 ? (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                type="button"
                className="btn btn-outline"
                onClick={handleFinalSubmit}
                disabled={!name.trim()}
                title="Save immediately without extra personalization"
              >
                Quick Save
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleNext}
                disabled={!name.trim()}
              >
                <span>Continue</span>
                <ChevronRight size={16} />
              </button>
            </div>
          ) : (
            <button type="button" className="btn btn-primary" onClick={handleFinalSubmit}>
              <Sprout size={16} />
              <span>Add to Garden</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
