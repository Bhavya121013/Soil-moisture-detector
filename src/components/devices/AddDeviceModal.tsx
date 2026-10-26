import React, { useState } from 'react';
import { X, Cpu, Wifi, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { ESP32Device } from '../../types';
import { useDevice } from '../../context/DeviceContext';
import { usePlant } from '../../context/PlantContext';
import { fetchEsp32Data } from '../../utils/esp32Client';

interface AddDeviceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddDeviceModal: React.FC<AddDeviceModalProps> = ({
  isOpen,
  onClose
}) => {
  const { addDevice } = useDevice();
  const { plants } = usePlant();

  const [name, setName] = useState('');
  const [ip, setIp] = useState('192.168.1.150');
  const [mode, setMode] = useState<'STA' | 'AP'>('STA');
  const [pollInterval, setPollInterval] = useState('3000');
  const [assignedPlantId, setAssignedPlantId] = useState('');

  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);

    const tempDevice: ESP32Device = {
      id: 'test',
      name: name || 'Test Device',
      ip: ip.trim(),
      mode,
      pollInterval: parseInt(pollInterval, 10) || 3000,
      isOnline: false,
      lastSeen: null,
      calibration: { dryRaw: 3200, wetRaw: 1350, reversePolarity: false },
      assignedPlantId: null
    };

    try {
      const { reading, rawResponse } = await fetchEsp32Data(tempDevice, 3000);
      setTestResult({
        success: true,
        message: `Success! Connected to ${rawResponse.deviceId || 'ESP32'}. Moisture: ${reading.soilPercent}%, Temp: ${reading.temperatureC}°C`
      });
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.message
      });
    } finally {
      setTesting(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !ip.trim()) return;

    addDevice({
      name: name.trim(),
      ip: ip.trim(),
      mode,
      pollInterval: parseInt(pollInterval, 10) || 3000,
      calibration: { dryRaw: 3200, wetRaw: 1350, reversePolarity: false },
      assignedPlantId: assignedPlantId || null
    });

    onClose();
    setName('');
    setTestResult(null);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: 500 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Cpu size={20} color="var(--forest-700)" />
            <h3 style={{ margin: 0, fontSize: '1.25rem' }}>Add ESP32 Sensor Node</h3>
          </div>
          <button className="btn btn-outline btn-icon" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Device Friendly Name *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Balcony Node, Living Room Node #1"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                autoFocus
              />
            </div>

            <div className="form-group">
              <label className="form-label">Connection Mode</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <button
                  type="button"
                  className="badge"
                  style={{
                    padding: '0.625rem',
                    background: mode === 'STA' ? 'var(--forest-700)' : 'var(--bg-surface)',
                    color: mode === 'STA' ? '#fff' : 'var(--forest-900)',
                    borderColor: 'var(--border-subtle)',
                    cursor: 'pointer',
                    justifyContent: 'center'
                  }}
                  onClick={() => {
                    setMode('STA');
                    if (ip === '192.168.4.1') setIp('192.168.1.150');
                  }}
                >
                  Home Wi-Fi (STA)
                </button>
                <button
                  type="button"
                  className="badge"
                  style={{
                    padding: '0.625rem',
                    background: mode === 'AP' ? 'var(--forest-700)' : 'var(--bg-surface)',
                    color: mode === 'AP' ? '#fff' : 'var(--forest-900)',
                    borderColor: 'var(--border-subtle)',
                    cursor: 'pointer',
                    justifyContent: 'center'
                  }}
                  onClick={() => {
                    setMode('AP');
                    setIp('192.168.4.1');
                  }}
                >
                  Direct Hotspot (AP)
                </button>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Local IP Address or Hostname *</label>
              <input
                type="text"
                className="form-input"
                placeholder="192.168.1.150 or sproutly.local"
                value={ip}
                onChange={e => setIp(e.target.value)}
                required
              />
              <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.35rem' }}>
                <span
                  style={{ fontSize: '0.6875rem', color: 'var(--forest-700)', cursor: 'pointer', textDecoration: 'underline' }}
                  onClick={() => setIp('sproutly.local')}
                >
                  use sproutly.local
                </span>
                <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>&bull;</span>
                <span
                  style={{ fontSize: '0.6875rem', color: 'var(--forest-700)', cursor: 'pointer', textDecoration: 'underline' }}
                  onClick={() => setIp('192.168.4.1')}
                >
                  use 192.168.4.1 (hotspot)
                </span>
              </div>
            </div>

            {/* Test Connection Button */}
            <div style={{ marginBottom: '1.25rem' }}>
              <button
                type="button"
                className="btn btn-outline"
                style={{ width: '100%', fontSize: '0.8125rem' }}
                onClick={handleTestConnection}
                disabled={testing || !ip.trim()}
              >
                <RefreshCw size={14} className={testing ? 'animate-spin' : ''} />
                <span>{testing ? 'Pinging ESP32 Node...' : 'Test Connection Now'}</span>
              </button>

              {testResult && (
                <div
                  style={{
                    marginTop: '0.5rem',
                    padding: '0.625rem 0.875rem',
                    borderRadius: 'var(--radius-md)',
                    background: testResult.success ? 'var(--sage-100)' : 'var(--alert-red-bg)',
                    color: testResult.success ? 'var(--forest-900)' : 'var(--alert-red)',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  {testResult.success ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                  <span>{testResult.message}</span>
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Associate with a Plant</label>
              <select
                className="form-select"
                value={assignedPlantId}
                onChange={e => setAssignedPlantId(e.target.value)}
              >
                <option value="">Leave Unassigned (Assign later)</option>
                {plants.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.location})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={!name.trim() || !ip.trim()}>
              <Cpu size={16} />
              <span>Save Device</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
