import React, { useState } from 'react';
import {
  Cpu,
  Plus,
  Wifi,
  WifiOff,
  Sliders,
  Volume2,
  RefreshCw,
  Trash2,
  AlertCircle,
  HelpCircle,
  CheckCircle2,
  Clock,
  Layers
} from 'lucide-react';
import { ESP32Device } from '../../types';
import { useDevice } from '../../context/DeviceContext';
import { usePlant } from '../../context/PlantContext';
import { DeviceCalibrationModal } from './DeviceCalibrationModal';
import { AddDeviceModal } from './AddDeviceModal';

export const DeviceManager: React.FC = () => {
  const { devices, pollDeviceNow, triggerBuzzer, deleteDevice, updateDevice } = useDevice();
  const { plants } = usePlant();

  const [calibratingDevice, setCalibratingDevice] = useState<ESP32Device | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [pollingId, setPollingId] = useState<string | null>(null);
  const [buzzerTestingId, setBuzzerTestingId] = useState<string | null>(null);
  const [showTroubleshooter, setShowTroubleshooter] = useState(false);

  const handlePoll = async (id: string) => {
    setPollingId(id);
    await pollDeviceNow(id);
    setPollingId(null);
  };

  const handleBuzzer = async (id: string) => {
    setBuzzerTestingId(id);
    await triggerBuzzer(id);
    setTimeout(() => {
      setBuzzerTestingId(null);
    }, 1500);
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.5rem', color: 'var(--forest-900)' }}>
            ESP32 Sensor Nodes
          </h2>
          <p style={{ margin: '0.25rem 0 0', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
            Manage Wi-Fi microcontrollers, monitor probe health, and adjust dry/wet ADC calibration.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn btn-outline" onClick={() => setShowTroubleshooter(!showTroubleshooter)}>
            <HelpCircle size={16} />
            <span>Connection Guide</span>
          </button>
          <button className="btn btn-primary" onClick={() => setIsAddOpen(true)}>
            <Plus size={16} />
            <span>Add Device</span>
          </button>
        </div>
      </div>

      {/* Troubleshooting and Setup Guide Banner */}
      {showTroubleshooter && (
        <div
          className="card"
          style={{
            marginBottom: '1.5rem',
            background: 'var(--cream-100)',
            borderLeft: '4px solid var(--forest-600)',
            padding: '1.25rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <h4 style={{ margin: 0, fontSize: '1rem', color: 'var(--forest-900)' }}>
              ESP32 Network Connection Guide
            </h4>
            <button className="btn btn-outline btn-icon" style={{ width: 26, height: 26 }} onClick={() => setShowTroubleshooter(false)}>
              &times;
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
            <div style={{ background: 'var(--bg-surface)', padding: '0.875rem', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ fontWeight: 700, color: 'var(--forest-900)', marginBottom: '0.25rem' }}>
                Mode 1: Home Wi-Fi (STA)
              </div>
              <div>
                The ESP32 connects to your 2.4 GHz home router and receives an IP (e.g. <code>192.168.1.150</code>). Both your phone/PC and the ESP32 must be on the same Wi-Fi network.
              </div>
            </div>

            <div style={{ background: 'var(--bg-surface)', padding: '0.875rem', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ fontWeight: 700, color: 'var(--forest-900)', marginBottom: '0.25rem' }}>
                Mode 2: Direct Hotspot (AP)
              </div>
              <div>
                If your router is out of range, the ESP32 broadcasts its own Wi-Fi SSID <strong>Sproutly-Device-AP</strong> (password: <code>sproutly123</code>) at IP <code>192.168.4.1</code>. Connect your phone directly to it!
              </div>
            </div>

            <div style={{ background: 'var(--bg-surface)', padding: '0.875rem', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ fontWeight: 700, color: 'var(--forest-900)', marginBottom: '0.25rem' }}>
                Browser HTTPS & Local IP Access
              </div>
              <div>
                When accessed via HTTPS, browsers block plain HTTP local calls. Run Sproutly locally (e.g. <code>http://localhost:5173</code>) or directly from the ESP32 web portal at <code>http://192.168.4.1</code>.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Devices List */}
      {devices.length === 0 ? (
        <div
          className="card"
          style={{
            textAlign: 'center',
            padding: '3rem 1.5rem',
            background: 'var(--cream-100)',
            border: '1px dashed var(--border-strong)'
          }}
        >
          <Cpu size={40} color="var(--forest-600)" style={{ margin: '0 auto 0.75rem' }} />
          <h3 style={{ margin: '0 0 0.5rem', color: 'var(--forest-900)' }}>No Hardware Nodes Configured</h3>
          <p style={{ maxWidth: 440, margin: '0 auto 1.25rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Connect an ESP32 microcontroller with a capacitive soil moisture probe and DHT11 sensor to monitor your plants with real telemetry.
          </p>
          <button className="btn btn-primary" onClick={() => setIsAddOpen(true)}>
            <Plus size={16} />
            <span>Add Your First Node</span>
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {devices.map(dev => {
            const assignedPlant = plants.find(p => p.id === dev.assignedPlantId || p.deviceId === dev.id);
            const reading = dev.lastReading;

            return (
              <div key={dev.id} className="card" style={{ padding: '1.5rem' }}>
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    gap: '1rem',
                    marginBottom: '1rem'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                    <div
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 'var(--radius-md)',
                        background: dev.isOnline ? 'var(--sage-100)' : 'var(--cream-200)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <Cpu size={24} color={dev.isOnline ? 'var(--forest-700)' : 'var(--text-muted)'} />
                    </div>

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <h3 style={{ margin: 0, fontSize: '1.125rem', color: 'var(--forest-900)' }}>
                          {dev.name}
                        </h3>
                        <span
                          className={`badge ${dev.isOnline ? 'badge-sage' : 'badge-amber'}`}
                          style={{ fontSize: '0.6875rem' }}
                        >
                          {dev.isOnline ? (
                            <>
                              <Wifi size={12} color="#5F7F64" /> Online
                            </>
                          ) : (
                            <>
                              <WifiOff size={12} /> Offline
                            </>
                          )}
                        </span>
                        <span className="badge" style={{ background: 'var(--cream-100)', color: 'var(--forest-800)' }}>
                          Mode: {dev.mode}
                        </span>
                      </div>

                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                        Endpoint: <a href={`http://${dev.ip}`} target="_blank" rel="noreferrer" style={{ color: 'var(--forest-700)', fontWeight: 600 }}>http://{dev.ip}</a> &bull;{' '}
                        {dev.lastSeen
                          ? `Last contact: ${new Date(dev.lastSeen).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`
                          : 'Never contacted'}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <button
                      className="btn btn-outline"
                      style={{ fontSize: '0.75rem', padding: '0.4rem 0.75rem' }}
                      onClick={() => handlePoll(dev.id)}
                      disabled={pollingId === dev.id}
                      title="Fetch latest reading from ESP32 immediately"
                    >
                      <RefreshCw size={14} className={pollingId === dev.id ? 'animate-spin' : ''} />
                      <span>{pollingId === dev.id ? 'Pinging...' : 'Ping Node'}</span>
                    </button>

                    <button
                      className="btn btn-outline"
                      style={{ fontSize: '0.75rem', padding: '0.4rem 0.75rem' }}
                      onClick={() => setCalibratingDevice(dev)}
                      title="Adjust dry/wet reference thresholds"
                    >
                      <Sliders size={14} />
                      <span>Calibrate</span>
                    </button>

                    <button
                      className="btn btn-outline"
                      style={{ fontSize: '0.75rem', padding: '0.4rem 0.75rem' }}
                      onClick={() => handleBuzzer(dev.id)}
                      disabled={buzzerTestingId === dev.id}
                      title="Beep buzzer to locate hardware"
                    >
                      <Volume2 size={14} />
                      <span>{buzzerTestingId === dev.id ? 'Beeping!' : 'Beep Buzzer'}</span>
                    </button>

                    <button
                      className="btn btn-outline btn-icon"
                      style={{ width: 32, height: 32, color: 'var(--alert-red)' }}
                      onClick={() => deleteDevice(dev.id)}
                      title="Remove device"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {dev.connectionError && (
                  <div
                    style={{
                      padding: '0.625rem 0.875rem',
                      borderRadius: 'var(--radius-sm)',
                      background: 'var(--alert-red-bg)',
                      color: 'var(--alert-red)',
                      fontSize: '0.75rem',
                      marginBottom: '1rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}
                  >
                    <AlertCircle size={14} />
                    <span>{dev.connectionError}</span>
                  </div>
                )}

                {/* Live Reading Summary Bar */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                    gap: '0.75rem',
                    padding: '0.875rem',
                    background: 'var(--bg-surface-subtle)',
                    borderRadius: 'var(--radius-md)',
                    marginBottom: '0.75rem'
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>SOIL MOISTURE</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--forest-900)' }}>
                      {reading ? `${reading.soilPercent}%` : '--'}
                    </div>
                    <div style={{ fontSize: '0.625rem', color: 'var(--text-muted)' }}>
                      Raw: {reading ? reading.soilRaw : '--'}
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>TEMPERATURE</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--forest-900)' }}>
                      {reading?.isDhtValid ? `${reading.temperatureC}°C` : '--'}
                    </div>
                    <div style={{ fontSize: '0.625rem', color: 'var(--text-muted)' }}>
                      {reading?.isDhtValid ? `${Math.round(reading.temperatureF)}°F` : '--'}
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>HUMIDITY</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--forest-900)' }}>
                      {reading?.isDhtValid ? `${Math.round(reading.humidityPercent)}%` : '--'}
                    </div>
                    <div style={{ fontSize: '0.625rem', color: 'var(--text-muted)' }}>
                      Relative Air Humidity
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>CALIBRATION</div>
                    <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--forest-900)', marginTop: '0.2rem' }}>
                      Dry: {dev.calibration.dryRaw}
                    </div>
                    <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--forest-900)' }}>
                      Wet: {dev.calibration.wetRaw}
                    </div>
                  </div>
                </div>

                {/* Plant Association Dropdown */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8125rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Monitoring Plant:</span>
                    <select
                      className="form-select"
                      style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', width: 'auto' }}
                      value={dev.assignedPlantId || ''}
                      onChange={e => {
                        const val = e.target.value || null;
                        updateDevice(dev.id, { assignedPlantId: val });
                      }}
                    >
                      <option value="">Unassigned</option>
                      {plants.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.location})
                        </option>
                      ))}
                    </select>
                  </div>

                  {assignedPlant && (
                    <span style={{ fontSize: '0.75rem', color: 'var(--forest-700)', fontWeight: 600 }}>
                      Currently feeding telemetry to <strong>{assignedPlant.name}</strong>
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      <AddDeviceModal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} />
      <DeviceCalibrationModal
        device={calibratingDevice}
        isOpen={!!calibratingDevice}
        onClose={() => setCalibratingDevice(null)}
      />
    </div>
  );
};
