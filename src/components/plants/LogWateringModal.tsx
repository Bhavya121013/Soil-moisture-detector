import React, { useState } from 'react';
import { X, Droplet, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Plant, SensorReading } from '../../types';
import { usePlant } from '../../context/PlantContext';
import { useDevice } from '../../context/DeviceContext';
import { estimateWaterVolume } from '../../utils/botanicalRecommender';

interface LogWateringModalProps {
  plant: Plant | null;
  isOpen: boolean;
  onClose: () => void;
}

export const LogWateringModal: React.FC<LogWateringModalProps> = ({
  plant,
  isOpen,
  onClose
}) => {
  const { logWatering } = usePlant();
  const { getLatestReadingForPlant } = useDevice();

  const suggestedVolume = plant ? estimateWaterVolume(plant.potSize, plant.speciesId) : 300;
  const [amountMl, setAmountMl] = useState<number>(suggestedVolume);
  const [notes, setNotes] = useState('');

  React.useEffect(() => {
    if (plant) {
      setAmountMl(estimateWaterVolume(plant.potSize, plant.speciesId));
    }
  }, [plant]);

  if (!isOpen || !plant) return null;

  const currentReading: SensorReading | null = getLatestReadingForPlant(plant.id);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    logWatering({
      plantId: plant.id,
      amountMl: Number(amountMl) || undefined,
      notes: notes.trim() || undefined,
      moistureBefore: currentReading ? currentReading.soilPercent : undefined
    });

    // Fire cute confetti celebration
    try {
      confetti({
        particleCount: 45,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#7E9F83', '#A8C5AB', '#6BAED6', '#E29578']
      });
    } catch {
      // Ignore if confetti not supported
    }

    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: 460 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Droplet size={20} color="var(--water-600)" />
            <h3 style={{ margin: 0, fontSize: '1.25rem' }}>Log Watering &bull; {plant.name}</h3>
          </div>
          <button className="btn btn-outline btn-icon" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* Current Moisture Status */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.875rem 1rem',
                background: 'var(--cream-100)',
                borderRadius: 'var(--radius-md)',
                marginBottom: '1.25rem'
              }}
            >
              <div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Current Soil Moisture</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--forest-900)' }}>
                  {currentReading ? `${currentReading.soilPercent}%` : 'Manual tracking'}
                </div>
              </div>
              <span className="badge badge-water">
                <Sparkles size={12} />
                Approx. target: ~{suggestedVolume} ml
              </span>
            </div>

            <div className="form-group">
              <label className="form-label">Water Amount (milliliters)</label>
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                {[150, 250, 350, 500].map(vol => (
                  <button
                    key={vol}
                    type="button"
                    className="badge"
                    style={{
                      background: amountMl === vol ? 'var(--water-500)' : 'var(--bg-surface)',
                      color: amountMl === vol ? '#fff' : 'var(--forest-900)',
                      cursor: 'pointer',
                      padding: '0.4rem 0.65rem',
                      borderColor: 'var(--border-subtle)'
                    }}
                    onClick={() => setAmountMl(vol)}
                  >
                    {vol} ml
                  </button>
                ))}
              </div>
              <input
                type="number"
                className="form-input"
                min="10"
                max="3000"
                step="10"
                value={amountMl}
                onChange={e => setAmountMl(parseInt(e.target.value, 10) || 0)}
              />
              <div className="form-hint">
                Approximate estimation based on {plant.potSize || 'pot size'}. Adjust as needed.
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Watering Notes</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Added dilute organic liquid feed, drained saucer"
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
              <Droplet size={16} />
              <span>Record Watering</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
