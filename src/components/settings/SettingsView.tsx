import React, { useState, useRef } from 'react';
import {
  Settings as SettingsIcon,
  Download,
  Upload,
  Cloud,
  CheckCircle2,
  AlertCircle,
  Bell,
  Trash2,
  Key,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import {
  loadUserSettings,
  saveUserSettings,
  exportGardenBackupJson,
  importGardenBackupJson,
  exportReadingsCsv,
  loadUserReadings,
  AppSettings
} from '../../utils/storage';
import { useNotification } from '../../context/NotificationContext';
import { usePlant } from '../../context/PlantContext';

export const SettingsView: React.FC = () => {
  const { requestBrowserPermission } = useNotification();
  const { plants } = usePlant();

  const [settings, setSettings] = useState<AppSettings>(() => loadUserSettings());
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [cloudTesting, setCloudTesting] = useState(false);
  const [cloudStatus, setCloudStatus] = useState<{ success: boolean; msg: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpdate = (updates: Partial<AppSettings>) => {
    const updated = { ...settings, ...updates };
    setSettings(updated);
    saveUserSettings(updated);
    if (updates.theme) {
      document.documentElement.setAttribute('data-theme', updates.theme);
    }
    setSaveStatus('Preferences saved successfully.');
    setTimeout(() => setSaveStatus(null), 2500);
  };

  const handleToggleNotifications = async () => {
    const nextVal = !settings.enableBrowserNotifications;
    if (nextVal) {
      const granted = await requestBrowserPermission();
      if (!granted) {
        alert('Browser notification permission was blocked or denied.');
        return;
      }
    }
    handleUpdate({ enableBrowserNotifications: nextVal });
  };

  const handleExportJson = () => {
    const json = exportGardenBackupJson();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sproutly-garden-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportCsv = () => {
    const readings = loadUserReadings();
    if (readings.length === 0) {
      alert('No sensor history recorded yet to export.');
      return;
    }
    const csv = exportReadingsCsv(readings);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sproutly-telemetry-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = ev => {
      const content = ev.target?.result as string;
      const res = importGardenBackupJson(content);
      alert(res.message);
      if (res.success) {
        window.location.reload();
      }
    };
    reader.readAsText(file);
  };

  const handleTestCloud = async () => {
    if (!settings.supabaseUrl || !settings.supabaseAnonKey) {
      setCloudStatus({
        success: false,
        msg: 'Please enter both Supabase Project URL and Anon API key.'
      });
      return;
    }

    setCloudTesting(true);
    setCloudStatus(null);

    try {
      // Test contact with Supabase health endpoint
      const cleaned = settings.supabaseUrl.replace(/\/+$/, '');
      const res = await fetch(`${cleaned}/auth/v1/health`, {
        headers: { apikey: settings.supabaseAnonKey }
      });

      if (res.ok) {
        setCloudStatus({
          success: true,
          msg: 'Connected successfully to Supabase cloud instance!'
        });
        handleUpdate({ cloudSyncEnabled: true });
      } else {
        setCloudStatus({
          success: false,
          msg: `Supabase returned HTTP ${res.status}. Check your URL & Anon key.`
        });
      }
    } catch (err: any) {
      setCloudStatus({
        success: false,
        msg: `Could not reach Supabase endpoint: ${err.message}`
      });
    } finally {
      setCloudTesting(false);
    }
  };

  const handleClearAllData = () => {
    const confirmed = window.confirm(
      'WARNING: Are you sure you want to completely erase your local Sproutly garden, devices, and history? This cannot be undone.'
    );
    if (confirmed) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div style={{ maxWidth: 840, margin: '0 auto' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.75rem', color: 'var(--forest-900)', margin: '0 0 0.5rem' }}>
          Settings & Botanical Sync
        </h2>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0 }}>
          Configure temperature units, notification alerts, cloud synchronization, and local data backups.
        </p>
      </div>

      {saveStatus && (
        <div
          style={{
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-md)',
            background: 'var(--sage-100)',
            color: 'var(--forest-900)',
            fontSize: '0.8125rem',
            fontWeight: 600,
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <CheckCircle2 size={16} />
          <span>{saveStatus}</span>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* 1. Appearance & Units */}
        <div className="card">
          <h3 className="card-title" style={{ marginBottom: '1rem' }}>
            Display & Preferences
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Temperature Unit</label>
              <select
                className="form-select"
                value={settings.tempUnit}
                onChange={e => handleUpdate({ tempUnit: e.target.value as 'C' | 'F' })}
              >
                <option value="C">Celsius (°C)</option>
                <option value="F">Fahrenheit (°F)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Visual Theme</label>
              <select
                className="form-select"
                value={settings.theme}
                onChange={e => handleUpdate({ theme: e.target.value as 'nature-light' | 'night-canopy' })}
              >
                <option value="nature-light">Sunlit Nature Warm Light</option>
                <option value="night-canopy">Night Canopy Dark Mode</option>
              </select>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.875rem 1rem',
              background: 'var(--cream-100)',
              borderRadius: 'var(--radius-md)',
              marginTop: '0.5rem'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Bell size={18} color="var(--forest-700)" />
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--forest-900)' }}>
                  Browser & Desktop Notifications
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Receive urgent push notifications when soil moisture drops below critical levels.
                </div>
              </div>
            </div>

            <button
              className={`btn ${settings.enableBrowserNotifications ? 'btn-primary' : 'btn-outline'}`}
              style={{ fontSize: '0.8125rem' }}
              onClick={handleToggleNotifications}
            >
              {settings.enableBrowserNotifications ? 'Enabled' : 'Disabled'}
            </button>
          </div>
        </div>

        {/* 2. PlantNet API Integration */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <Key size={18} color="var(--forest-700)" />
            <h3 className="card-title" style={{ margin: 0 }}>
              PlantNet Image Identification API (Optional)
            </h3>
          </div>

          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '1rem' }}>
            By default, Sproutly uses an intelligent offline botanical matcher. To connect to PlantNet&rsquo;s global computer-vision botanical model, paste your free API key from{' '}
            <a href="https://my.plantnet.org" target="_blank" rel="noreferrer" style={{ color: 'var(--forest-700)', fontWeight: 600 }}>
              my.plantnet.org
            </a>
            .
          </p>

          <div className="form-group">
            <label className="form-label">PlantNet API Key</label>
            <input
              type="password"
              className="form-input"
              placeholder="e.g. 2b10k..."
              value={settings.plantNetApiKey || ''}
              onChange={e => handleUpdate({ plantNetApiKey: e.target.value })}
            />
          </div>
        </div>

        {/* 3. Cloud Synchronization (Supabase) */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <Cloud size={18} color="var(--water-600)" />
            <h3 className="card-title" style={{ margin: 0 }}>
              Multi-Device Cloud Synchronization (Supabase)
            </h3>
          </div>

          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '1rem' }}>
            Sproutly operates in local-first offline mode by default. To sync your garden across phone, tablet, and laptop, connect your own Supabase project.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '0.75rem', marginBottom: '1rem' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Supabase Project URL</label>
              <input
                type="text"
                className="form-input"
                placeholder="https://xyzcompany.supabase.co"
                value={settings.supabaseUrl || ''}
                onChange={e => handleUpdate({ supabaseUrl: e.target.value })}
              />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Anon / Public API Key</label>
              <input
                type="password"
                className="form-input"
                placeholder="eyJhbGciOiJIUzI1NiIsInR5..."
                value={settings.supabaseAnonKey || ''}
                onChange={e => handleUpdate({ supabaseAnonKey: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button
              className="btn btn-outline"
              onClick={handleTestCloud}
              disabled={cloudTesting || !settings.supabaseUrl}
              style={{ fontSize: '0.8125rem' }}
            >
              <RefreshCw size={14} className={cloudTesting ? 'animate-spin' : ''} />
              <span>{cloudTesting ? 'Testing Cloud Connection...' : 'Test Cloud Connection'}</span>
            </button>

            {cloudStatus && (
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: cloudStatus.success ? 'var(--forest-800)' : 'var(--alert-red)'
                }}
              >
                {cloudStatus.msg}
              </span>
            )}
          </div>
        </div>

        {/* 4. Backup & Data Portability */}
        <div className="card">
          <h3 className="card-title" style={{ marginBottom: '0.75rem' }}>
            Backup & Data Portability
          </h3>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
            Export your garden profile, watering histories, and sensor logs to JSON or CSV for safekeeping.
          </p>

          <input
            type="file"
            ref={fileInputRef}
            accept=".json"
            style={{ display: 'none' }}
            onChange={handleImportJson}
          />

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button className="btn btn-primary" onClick={handleExportJson}>
              <Download size={16} />
              <span>Export Garden Backup (JSON)</span>
            </button>

            <button className="btn btn-outline" onClick={handleExportCsv}>
              <Download size={16} />
              <span>Export Sensor Telemetry (CSV)</span>
            </button>

            <button className="btn btn-outline" onClick={() => fileInputRef.current?.click()}>
              <Upload size={16} />
              <span>Restore from Backup</span>
            </button>
          </div>
        </div>

        {/* 5. Danger Zone */}
        <div className="card" style={{ borderColor: 'rgba(217, 83, 79, 0.3)', background: 'var(--cream-50)' }}>
          <h3 className="card-title" style={{ color: 'var(--alert-red)', marginBottom: '0.5rem' }}>
            Danger Zone
          </h3>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
            Permanently erase all local plants, sensor records, and calibration data from this browser.
          </p>

          <button
            className="btn btn-outline"
            style={{ color: 'var(--alert-red)', borderColor: 'var(--alert-red)' }}
            onClick={handleClearAllData}
          >
            <Trash2 size={16} />
            <span>Reset All Local Data</span>
          </button>
        </div>
      </div>
    </div>
  );
};
