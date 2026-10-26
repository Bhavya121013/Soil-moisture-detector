import React, { useState } from 'react';
import { X, Sliders, Save, CheckCircle2, AlertCircle } from 'lucide-react';
import { ESP32Device, SensorCalibration } from '../../types';
import { rawToMoisturePercent } from '../../utils/calibration';
import { useDevice } from '../../context/DeviceContext';

interface DeviceCalibrationModalProps {
  device: ESP32Device | null;
  isOpen: boolean;
  onClose: () => void;
}

export const DeviceCalibrationModal: React.FC<DeviceCalibrationModalProps> = ({
  device,
  isOpen,
  onClose
}) => {
  const { calibrateDevice } = useDevice();

  const [dryRaw, setDryRaw] = useState<number>(device?.calibration.dryRaw ?? 3200);
  const [wetRaw, setWetRaw] = useState<number>(device?.calibration.wetRaw ?? 1350);
  const [reversePolarity, setReversePolarity] = useState<boolean>(device?.calibration.reversePolarity ?? false);
  const [testRaw, setTestRaw] = useState<number>(device?.lastReading?.soilRaw ?? 2200);

  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  React.useEffect(() => {
    if (device) {
      setDryRaw(device.calibration.dryRaw);
      setWetRaw(device.calibration.wetRaw);
      setReversePolarity(device.calibration.reversePolarity);
      setTestRaw(device.lastReading?.soilRaw ?? 2200);
      setStatusMsg(null);
    }
  }, [device]);

  if (!isOpen || !device) return null;

  const currentCalib: SensorCalibration = {
    dryRaw,
    wetRaw,
    reversePolarity
  };

  const calculatedPercent = rawToMoisturePercent(testRaw, currentCalib);

  const handleCaptureDry = () => {
    if (device.lastReading) {
      setDryRaw(device.lastReading.soilRaw);
      setStatusMsg({ type: 'success', text: `Captured current live reading (${device.lastReading.soilRaw}) as Dry Reference.` });
    }
  };

  const handleCaptureWet = () => {
    if (device.lastReading) {
      setWetRaw(device.lastReading.soilRaw);
      setStatusMsg({ type: 'success', text: `Captured current live reading (${device.lastReading.soilRaw}) as Wet Reference.` });
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setStatusMsg(null);
    try {
      const res = await calibrateDevice(device.id, currentCalib);
      setStatusMsg({ type: 'success', text: res.message });
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: 520 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sliders size={20} color="var(--forest-700)" />
            <h3 style={{ margin: 0, fontSize: '1.25rem' }}>Soil Sensor Calibration &bull; {device.name}</h3>
          </div>
          <button className="btn btn-outline btn-icon" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '1rem', lineHeight: 1.5 }}>
            Soil moisture sensors produce varying analog voltage (ADC 0-4095) depending on soil composition, salinity, and probe coating. Calibrate the dry and moist references to ensure accurate percentage readings.
          </p>

          {statusMsg && (
            <div
              style={{
                padding: '0.75rem',
                borderRadius: 'var(--radius-md)',
                background: statusMsg.type === 'success' ? 'var(--sage-100)' : 'var(--alert-red-bg)',
                color: statusMsg.type === 'success' ? 'var(--forest-900)' : 'var(--alert-red)',
                fontSize: '0.8125rem',
                fontWeight: 600,
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              {statusMsg.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
              <span>{statusMsg.text}</span>
            </div>
          )}

          {/* Current Live Sensor Reading */}
          {device.lastReading && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.75rem 1rem',
                background: 'var(--cream-100)',
                borderRadius: 'var(--radius-md)',
                marginBottom: '1rem'
              }}
            >
              <div>
                <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>CURRENT LIVE RAW ADC</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--forest-900)' }}>
                  {device.lastReading.soilRaw}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button className="btn btn-outline" style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem' }} onClick={handleCaptureDry}>
                  Set as Dry
                </button>
                <button className="btn btn-outline" style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem' }} onClick={handleCaptureWet}>
                  Set as Wet
                </button>
              </div>
            </div>
          )}

          {/* Reference Inputs */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Dry Reference ADC (0%)</label>
              <input
                type="number"
                className="form-input"
                min="0"
                max="4095"
                value={dryRaw}
                onChange={e => setDryRaw(parseInt(e.target.value, 10) || 0)}
              />
              <div className="form-hint">Probe held in dry air or desiccated soil (typical ~3200).</div>
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Wet Reference ADC (100%)</label>
              <input
                type="number"
                className="form-input"
                min="0"
                max="4095"
                value={wetRaw}
                onChange={e => setWetRaw(parseInt(e.target.value, 10) || 0)}
              />
              <div className="form-hint">Probe submerged in water or saturated soil (typical ~1350).</div>
            </div>
          </div>

          {/* Invert Polarity */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <input
              type="checkbox"
              id="reversePolarityCheck"
              checked={reversePolarity}
              onChange={e => setReversePolarity(e.target.checked)}
            />
            <label htmlFor="reversePolarityCheck" style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
              Reverse Sensor Polarity (check only if higher raw ADC corresponds to wetter soil)
            </label>
          </div>

          {/* Live Simulator Preview */}
          <div
            style={{
              padding: '1rem',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-surface-subtle)',
              border: '1px solid var(--border-subtle)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--forest-900)' }}>
                CALIBRATION TEST PREVIEW
              </span>
              <span className="badge badge-water" style={{ fontSize: '0.875rem', fontWeight: 800 }}>
                {calculatedPercent}% Moisture
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="4095"
              value={testRaw}
              onChange={e => setTestRaw(parseInt(e.target.value, 10))}
              style={{ width: '100%', cursor: 'pointer' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
              <span>Simulated ADC: {testRaw}</span>
              <span>Calculated: {calculatedPercent}%</span>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-outline" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="btn btn-primary" onClick={handleSave} disabled={saving}>
            <Save size={16} />
            <span>{saving ? 'Saving...' : 'Save to ESP32 Hardware'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
