export type LightCondition = 'low' | 'indirect' | 'bright-indirect' | 'direct' | 'unknown';
export type Environment = 'indoor' | 'outdoor' | 'greenhouse';
export type SpeciesCategory = 'indoor' | 'succulent' | 'herb' | 'flowering' | 'low-light' | 'beginner' | 'tropical';

export interface PlantSpecies {
  id: string;
  commonName: string;
  scientificName: string;
  category: SpeciesCategory;
  moistureMin: number; // e.g. 25%
  moistureMax: number; // e.g. 50%
  idealMoisture: number; // e.g. 38%
  tempMinC: number;
  tempMaxC: number;
  humidityMin: number;
  lightCategory: string;
  sunlightHours: string;
  wateringFrequencyDays: number;
  soilGuidance: string;
  commonProblems: string;
  toxicity: string;
  description: string;
  avatarIcon: string;
}

export interface Plant {
  id: string;
  name: string;
  speciesId: string; // references PlantSpecies.id or 'unknown' or 'custom'
  customSpeciesName?: string;
  photoUrl?: string;
  avatarPreset?: string;
  location: string;
  environment: Environment;
  lightCondition: LightCondition;
  potSize?: string;
  hasDrainage?: boolean;
  soilType?: string;
  plantingDate?: string;
  lastWateredDate?: string;
  deviceId?: string | null;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  careStreak?: number;
  customMoistureTargetMin?: number;
  customMoistureTargetMax?: number;
}

export interface SensorCalibration {
  dryRaw: number;
  wetRaw: number;
  reversePolarity: boolean;
}

export interface ESP32Device {
  id: string;
  name: string;
  ip: string; // e.g. 192.168.1.150 or sproutly.local
  mode: 'STA' | 'AP';
  pollInterval: number; // ms, default 3000
  isOnline: boolean;
  lastSeen: string | null;
  firmwareVersion?: string;
  calibration: SensorCalibration;
  assignedPlantId: string | null;
  lastReading?: SensorReading | null;
  connectionError?: string | null;
}

export interface SensorReading {
  id: string;
  deviceId: string;
  plantId?: string;
  timestamp: string; // ISO string
  soilRaw: number;
  soilPercent: number;
  temperatureC: number;
  temperatureF: number;
  humidityPercent: number;
  isSoilValid: boolean;
  isDhtValid: boolean;
  wifiRssi?: number;
  buzzerActive?: boolean;
  isDemo?: boolean;
}

export interface WateringLog {
  id: string;
  plantId: string;
  timestamp: string;
  amountMl?: number;
  notes?: string;
  moistureBefore?: number;
  moistureAfter?: number;
}

export interface JournalEntry {
  id: string;
  plantId: string;
  date: string;
  title: string;
  notes: string;
  photoUrl?: string;
  mood?: 'thriving' | 'growing' | 'flowering' | 'struggling' | 'pruned';
}

export interface CareReminder {
  id: string;
  plantId: string;
  type: 'water' | 'sunlight' | 'fertilize' | 'sensor_check' | 'inspect';
  title: string;
  description: string;
  dueDate: string;
  isCompleted: boolean;
  completedAt?: string;
}

export interface AppNotification {
  id: string;
  type: 'urgent' | 'warning' | 'info' | 'success';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  plantId?: string;
  deviceId?: string;
  actionUrl?: string;
}

export interface PlantMoodState {
  mood: 'happy' | 'thirsty' | 'chilled' | 'warm' | 'dry-warning' | 'waiting' | 'cozy';
  label: string;
  emoji: string;
  message: string;
  badgeClass: string;
}

export interface CareRecommendation {
  status: 'looking-good' | 'check-moisture' | 'watering-needed' | 'check-environment' | 'sensor-offline' | 'needs-data';
  headline: string;
  explanation: string;
  urgency: 'low' | 'medium' | 'high' | 'info';
  actionLabel?: string;
  suggestedWaterMl?: number;
}
