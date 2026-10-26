import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { Plant } from '../../types';
import { usePlant } from '../../context/PlantContext';
import { useDevice } from '../../context/DeviceContext';

interface DeletePlantModalProps {
  plant: Plant | null;
  isOpen: boolean;
  onClose: () => void;
}

export const DeletePlantModal: React.FC<DeletePlantModalProps> = ({
  plant,
  isOpen,
  onClose
}) => {
  const { deletePlant } = usePlant();
  const { updateDevice } = useDevice();

  if (!isOpen || !plant) return null;

  const handleDelete = () => {
    // Unlink device if linked
    if (plant.deviceId) {
      updateDevice(plant.deviceId, { assignedPlantId: null });
    }
    deletePlant(plant.id);
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: 440 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--alert-red)' }}>
            <AlertTriangle size={20} />
            <h3 style={{ margin: 0, fontSize: '1.125rem' }}>Remove Plant</h3>
          </div>
          <button className="btn btn-outline btn-icon" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          <p style={{ fontSize: '0.9375rem', color: 'var(--text-main)', marginBottom: '0.75rem' }}>
            Are you sure you want to remove <strong>&ldquo;{plant.name}&rdquo;</strong> from your garden collection?
          </p>

          <div
            style={{
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              background: 'var(--alert-red-bg)',
              color: 'var(--alert-red)',
              fontSize: '0.8125rem',
              lineHeight: 1.5,
              border: '1px solid rgba(217, 83, 79, 0.2)'
            }}
          >
            <strong>Data notice:</strong> This will also remove {plant.name}&rsquo;s watering history and journal entries. Any linked ESP32 sensor will be unassigned and available to monitor another plant.
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-outline" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn btn-primary"
            style={{ background: 'var(--alert-red)', borderColor: 'var(--alert-red)' }}
            onClick={handleDelete}
          >
            <Trash2 size={16} />
            <span>Remove Plant</span>
          </button>
        </div>
      </div>
    </div>
  );
};
