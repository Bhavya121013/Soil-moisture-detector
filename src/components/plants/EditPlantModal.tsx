import React, { useState } from 'react';
import { X, Save } from 'lucide-react';
import { Plant, Environment, LightCondition } from '../../types';
import { SPECIES_DATABASE } from '../../data/speciesDatabase';
import { useDevice } from '../../context/DeviceContext';
import { usePlant } from '../../context/PlantContext';

interface EditPlantModalProps {
  plant: Plant | null;
  isOpen: boolean;
  onClose: () => void;
}

export const EditPlantModal: React.FC<EditPlantModalProps> = ({
  plant,
  isOpen,
  onClose
}) => {
  const { updatePlant } = usePlant();
  const { devices, updateDevice } = useDevice();

  const [name, setName] = useState(plant?.name || '');
  const [speciesId, setSpeciesId] = useState(plant?.speciesId || '');
  const [customSpeciesName, setCustomSpeciesName] = useState(plant?.customSpeciesName || '');
  const [location, setLocation] = useState(plant?.location || '');
  const [environment, setEnvironment] = useState<Environment>(plant?.environment || 'indoor');
  const [lightCondition, setLightCondition] = useState<LightCondition>(plant?.lightCondition || 'bright-indirect');
  const [potSize, setPotSize] = useState(plant?.potSize || '');
  const [hasDrainage, setHasDrainage] = useState(plant?.hasDrainage ?? true);
  const [soilType, setSoilType] = useState(plant?.soilType || '');
  const [deviceId, setDeviceId] = useState(plant?.deviceId || '');
  const [notes, setNotes] = useState(plant?.notes || '');
  const [customMoistMin, setCustomMoistMin] = useState<string>(
    plant?.customMoistureTargetMin ? String(plant.customMoistureTargetMin) : ''
  );
  const [customMoistMax, setCustomMoistMax] = useState<string>(
    plant?.customMoistureTargetMax ? String(plant.customMoistureTargetMax) : ''
  );

  React.useEffect(() => {
    if (plant) {
      setName(plant.name);
      setSpeciesId(plant.speciesId);
      setCustomSpeciesName(plant.customSpeciesName || '');
      setLocation(plant.location);
      setEnvironment(plant.environment);
      setLightCondition(plant.lightCondition);
      setPotSize(plant.potSize || '');
      setHasDrainage(plant.hasDrainage ?? true);
      setSoilType(plant.soilType || '');
      setDeviceId(plant.deviceId || '');
      setNotes(plant.notes || '');
      setCustomMoistMin(plant.customMoistureTargetMin ? String(plant.customMoistureTargetMin) : '');
      setCustomMoistMax(plant.customMoistureTargetMax ? String(plant.customMoistureTargetMax) : '');
    }
  }, [plant]);

  if (!isOpen || !plant) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    // Handle device reassignment
    if (plant.deviceId && plant.deviceId !== deviceId) {
      // Unlink previous device
      updateDevice(plant.deviceId, { assignedPlantId: null });
    }
    if (deviceId) {
      // Link new device
      updateDevice(deviceId, { assignedPlantId: plant.id });
    }

    updatePlant(plant.id, {
      name: name.trim(),
      speciesId,
      customSpeciesName: customSpeciesName.trim() || undefined,
      location: location.trim(),
      environment,
      lightCondition,
      potSize: potSize.trim() || undefined,
      hasDrainage,
      soilType: soilType.trim() || undefined,
      deviceId: deviceId || null,
      notes: notes.trim() || undefined,
      customMoistureTargetMin: customMoistMin ? parseInt(customMoistMin, 10) : undefined,
      customMoistureTargetMax: customMoistMax ? parseInt(customMoistMax, 10) : undefined
    });

    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--forest-900)' }}>
            Edit Plant &bull; {plant.name}
          </h3>
          <button className="btn btn-outline btn-icon" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSave}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Plant Name</label>
              <input
                type="text"
                className="form-input"
                value={name}
                onChange={e => setName(e.target.value)}
                required
              />
              <div className="form-hint">Renaming preserves all past sensor logs and watering history.</div>
            </div>

            <div className="form-group">
              <label className="form-label">Species</label>
              <select
                className="form-select"
                value={speciesId}
                onChange={e => setSpeciesId(e.target.value)}
              >
                <option value="unknown-general">Unspecified / General Botanical Profile</option>
                {SPECIES_DATABASE.map(sp => (
                  <option key={sp.id} value={sp.id}>
                    {sp.commonName} ({sp.scientificName})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Location</label>
              <input
                type="text"
                className="form-input"
                value={location}
                onChange={e => setLocation(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Linked ESP32 Device</label>
              <select
                className="form-select"
                value={deviceId}
                onChange={e => setDeviceId(e.target.value)}
              >
                <option value="">No hardware (Manual Tracking)</option>
                {devices.map(dev => (
                  <option key={dev.id} value={dev.id}>
                    {dev.name} ({dev.ip}) — {dev.isOnline ? 'Online' : 'Offline'}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div className="form-group">
                <label className="form-label">Custom Min Moisture (%)</label>
                <input
                  type="number"
                  className="form-input"
                  placeholder="e.g. 25"
                  min="5"
                  max="80"
                  value={customMoistMin}
                  onChange={e => setCustomMoistMin(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Custom Max Moisture (%)</label>
                <input
                  type="number"
                  className="form-input"
                  placeholder="e.g. 60"
                  min="20"
                  max="95"
                  value={customMoistMax}
                  onChange={e => setCustomMoistMax(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Personal Notes</label>
              <textarea
                className="form-textarea"
                rows={2}
                value={notes}
                onChange={e => setNotes(e.target.value)}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              <Save size={16} />
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
