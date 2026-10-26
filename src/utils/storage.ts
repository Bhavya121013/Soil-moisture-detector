import type { Plant, ESP32Device, SensorReading, WateringLog, JournalEntry, CareReminder, AppNotification } from '../types';

const STORAGE_KEYS = {
  PLANTS: 'sproutly_real_plants_v1',
  DEVICES: 'sproutly_real_devices_v1',
  READINGS: 'sproutly_real_readings_v1',
  WATERING: 'sproutly_real_waterings_v1',
  JOURNAL: 'sproutly_real_journal_v1',
  REMINDERS: 'sproutly_real_reminders_v1',
  NOTIFICATIONS: 'sproutly_real_notifications_v1',
  SETTINGS: 'sproutly_settings_v1',
  IS_DEMO_MODE: 'sproutly_is_demo_mode_v1'
};

export interface AppSettings {
  tempUnit: 'C' | 'F';
  theme: 'nature-light' | 'night-canopy';
  enableBrowserNotifications: boolean;
  plantNetApiKey?: string;
  supabaseUrl?: string;
  supabaseAnonKey?: string;
  cloudSyncEnabled: boolean;
}

export const DEFAULT_SETTINGS: AppSettings = {
  tempUnit: 'C',
  theme: 'nature-light',
  enableBrowserNotifications: false,
  plantNetApiKey: '',
  supabaseUrl: '',
  supabaseAnonKey: '',
  cloudSyncEnabled: false
};

// Generic safe storage accessors
function loadItem<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return defaultValue;
    return JSON.parse(raw);
  } catch (e) {
    console.error(`Failed to load from localStorage key "${key}":`, e);
    return defaultValue;
  }
}

function saveItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Failed to save to localStorage key "${key}":`, e);
  }
}

// User Plants (Defaults to EMPTY array as required!)
export function loadUserPlants(): Plant[] {
  return loadItem<Plant[]>(STORAGE_KEYS.PLANTS, []);
}

export function saveUserPlants(plants: Plant[]): void {
  saveItem(STORAGE_KEYS.PLANTS, plants);
}

// User Devices (Defaults to EMPTY array)
export function loadUserDevices(): ESP32Device[] {
  return loadItem<ESP32Device[]>(STORAGE_KEYS.DEVICES, []);
}

export function saveUserDevices(devices: ESP32Device[]): void {
  saveItem(STORAGE_KEYS.DEVICES, devices);
}

// Sensor Readings History
export function loadUserReadings(): SensorReading[] {
  return loadItem<SensorReading[]>(STORAGE_KEYS.READINGS, []);
}

export function saveUserReadings(readings: SensorReading[]): void {
  // Cap historical readings at latest 2000 items to avoid localStorage overflow
  const capped = readings.slice(-2000);
  saveItem(STORAGE_KEYS.READINGS, capped);
}

// Watering Logs
export function loadUserWateringLogs(): WateringLog[] {
  return loadItem<WateringLog[]>(STORAGE_KEYS.WATERING, []);
}

export function saveUserWateringLogs(logs: WateringLog[]): void {
  saveItem(STORAGE_KEYS.WATERING, logs);
}

// Journal Entries
export function loadUserJournal(): JournalEntry[] {
  return loadItem<JournalEntry[]>(STORAGE_KEYS.JOURNAL, []);
}

export function saveUserJournal(entries: JournalEntry[]): void {
  saveItem(STORAGE_KEYS.JOURNAL, entries);
}

// Care Reminders
export function loadUserReminders(): CareReminder[] {
  return loadItem<CareReminder[]>(STORAGE_KEYS.REMINDERS, []);
}

export function saveUserReminders(reminders: CareReminder[]): void {
  saveItem(STORAGE_KEYS.REMINDERS, reminders);
}

// In-app Notifications
export function loadUserNotifications(): AppNotification[] {
  return loadItem<AppNotification[]>(STORAGE_KEYS.NOTIFICATIONS, []);
}

export function saveUserNotifications(notifications: AppNotification[]): void {
  saveItem(STORAGE_KEYS.NOTIFICATIONS, notifications);
}

// Settings
export function loadUserSettings(): AppSettings {
  return loadItem<AppSettings>(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
}

export function saveUserSettings(settings: AppSettings): void {
  saveItem(STORAGE_KEYS.SETTINGS, settings);
}

// Demo mode state
export function loadIsDemoMode(): boolean {
  return loadItem<boolean>(STORAGE_KEYS.IS_DEMO_MODE, false);
}

export function saveIsDemoMode(isDemo: boolean): void {
  saveItem(STORAGE_KEYS.IS_DEMO_MODE, isDemo);
}

// Export Full Backup JSON
export function exportGardenBackupJson(): string {
  const backup = {
    exportedAt: new Date().toISOString(),
    version: '1.2.0',
    plants: loadUserPlants(),
    devices: loadUserDevices(),
    waterings: loadUserWateringLogs(),
    journal: loadUserJournal(),
    reminders: loadUserReminders(),
    settings: loadUserSettings()
  };
  return JSON.stringify(backup, null, 2);
}

// Import Backup JSON
export function importGardenBackupJson(jsonString: string): { success: boolean; message: string } {
  try {
    const data = JSON.parse(jsonString);
    if (!data.plants || !Array.isArray(data.plants)) {
      return { success: false, message: 'Invalid backup file: missing plants array' };
    }
    saveUserPlants(data.plants);
    if (Array.isArray(data.devices)) saveUserDevices(data.devices);
    if (Array.isArray(data.waterings)) saveUserWateringLogs(data.waterings);
    if (Array.isArray(data.journal)) saveUserJournal(data.journal);
    if (Array.isArray(data.reminders)) saveUserReminders(data.reminders);
    return { success: true, message: `Successfully restored ${data.plants.length} plant(s)!` };
  } catch (err: any) {
    return { success: false, message: `Import failed: ${err.message}` };
  }
}

// Export Readings to CSV
export function exportReadingsCsv(readings: SensorReading[]): string {
  const headers = ['Timestamp', 'Device ID', 'Plant ID', 'Soil Moisture (%)', 'Raw ADC', 'Temp (°C)', 'Temp (°F)', 'Humidity (%RH)'];
  const rows = readings.map(r => [
    r.timestamp,
    r.deviceId,
    r.plantId || 'N/A',
    r.soilPercent,
    r.soilRaw,
    r.temperatureC,
    r.temperatureF,
    r.humidityPercent
  ]);

  return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
}
