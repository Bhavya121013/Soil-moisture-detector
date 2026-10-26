import { Plant, ESP32Device, SensorReading, WateringLog, CareReminder, JournalEntry } from '../types';

export const DEMO_DEVICES: ESP32Device[] = [
  {
    id: 'sproutly-demo-01',
    name: 'Balcony ESP32 Node',
    ip: '192.168.1.185',
    mode: 'STA',
    pollInterval: 3000,
    isOnline: true,
    lastSeen: new Date().toISOString(),
    firmwareVersion: '1.2.0',
    calibration: {
      dryRaw: 3200,
      wetRaw: 1350,
      reversePolarity: false
    },
    assignedPlantId: 'demo-plant-1',
    lastReading: {
      id: 'demo-read-1',
      deviceId: 'sproutly-demo-01',
      plantId: 'demo-plant-1',
      timestamp: new Date().toISOString(),
      soilRaw: 2150,
      soilPercent: 52,
      temperatureC: 23.6,
      temperatureF: 74.5,
      humidityPercent: 58.2,
      isSoilValid: true,
      isDhtValid: true,
      wifiRssi: -54,
      buzzerActive: false,
      isDemo: true
    }
  },
  {
    id: 'sproutly-demo-02',
    name: 'Kitchen Herb Node',
    ip: '192.168.1.192',
    mode: 'STA',
    pollInterval: 3000,
    isOnline: true,
    lastSeen: new Date(Date.now() - 4 * 60 * 1000).toISOString(),
    firmwareVersion: '1.2.0',
    calibration: {
      dryRaw: 3300,
      wetRaw: 1400,
      reversePolarity: false
    },
    assignedPlantId: 'demo-plant-2',
    lastReading: {
      id: 'demo-read-2',
      deviceId: 'sproutly-demo-02',
      plantId: 'demo-plant-2',
      timestamp: new Date(Date.now() - 4 * 60 * 1000).toISOString(),
      soilRaw: 2750,
      soilPercent: 29,
      temperatureC: 27.8,
      temperatureF: 82.0,
      humidityPercent: 42.1,
      isSoilValid: true,
      isDhtValid: true,
      wifiRssi: -62,
      buzzerActive: false,
      isDemo: true
    }
  }
];

export const DEMO_PLANTS: Plant[] = [
  {
    id: 'demo-plant-1',
    name: 'Emerald Queen',
    speciesId: 'monstera-deliciosa',
    avatarPreset: 'leaf-tropical',
    location: 'Living Room by West Window',
    environment: 'indoor',
    lightCondition: 'bright-indirect',
    potSize: '10 inch (25 cm) terracotta',
    hasDrainage: true,
    soilType: 'Chunky aroid mix with orchid bark',
    plantingDate: '2026-03-15',
    lastWateredDate: new Date(Date.now() - 3 * 86400 * 1000).toISOString(),
    deviceId: 'sproutly-demo-01',
    notes: 'Given to me as a housewarming gift. Unfurled a huge new leaf with double fenestrations last week!',
    createdAt: '2026-03-15T10:00:00Z',
    updatedAt: new Date().toISOString(),
    careStreak: 12
  },
  {
    id: 'demo-plant-2',
    name: 'Pesto Prime',
    speciesId: 'sweet-basil',
    avatarPreset: 'herb-pot',
    location: 'Kitchen Sunny Windowsill',
    environment: 'indoor',
    lightCondition: 'direct',
    potSize: '6 inch ceramic',
    hasDrainage: true,
    soilType: 'Organic vegetable potting soil',
    plantingDate: '2026-08-01',
    lastWateredDate: new Date(Date.now() - 2.5 * 86400 * 1000).toISOString(),
    deviceId: 'sproutly-demo-02',
    notes: 'Pinching off flower buds to encourage bushy foliage growth.',
    createdAt: '2026-08-01T14:30:00Z',
    updatedAt: new Date().toISOString(),
    careStreak: 8
  },
  {
    id: 'demo-plant-3',
    name: 'Sergeant Sansei',
    speciesId: 'snake-plant',
    avatarPreset: 'succulent-upright',
    location: 'Home Office Corner',
    environment: 'indoor',
    lightCondition: 'low',
    potSize: '8 inch ceramic with saucer',
    hasDrainage: true,
    soilType: 'Cactus and succulent grit blend',
    plantingDate: '2025-11-20',
    lastWateredDate: new Date(Date.now() - 12 * 86400 * 1000).toISOString(),
    deviceId: null, // Tracked manually without sensor!
    notes: 'Very hardy. Only needs water roughly once every 2-3 weeks.',
    createdAt: '2025-11-20T09:15:00Z',
    updatedAt: new Date().toISOString(),
    careStreak: 15
  }
];

export const DEMO_WATERING_LOGS: WateringLog[] = [
  {
    id: 'demo-water-1',
    plantId: 'demo-plant-1',
    timestamp: new Date(Date.now() - 3 * 86400 * 1000).toISOString(),
    amountMl: 450,
    notes: 'Watered thoroughly until runoff appeared in saucer. Emptied saucer after 20 mins.',
    moistureBefore: 28,
    moistureAfter: 68
  },
  {
    id: 'demo-water-2',
    plantId: 'demo-plant-1',
    timestamp: new Date(Date.now() - 10 * 86400 * 1000).toISOString(),
    amountMl: 500,
    notes: 'Bi-weekly routine watering with dilute seaweed fertilizer.',
    moistureBefore: 25,
    moistureAfter: 72
  },
  {
    id: 'demo-water-3',
    plantId: 'demo-plant-2',
    timestamp: new Date(Date.now() - 2.5 * 86400 * 1000).toISOString(),
    amountMl: 250,
    notes: 'Basil was drooping slightly. Perked up in 2 hours!',
    moistureBefore: 24,
    moistureAfter: 70
  },
  {
    id: 'demo-water-4',
    plantId: 'demo-plant-3',
    timestamp: new Date(Date.now() - 12 * 86400 * 1000).toISOString(),
    amountMl: 200,
    notes: 'Monthly hydration. Soil was bone dry.',
    moistureBefore: 12,
    moistureAfter: 35
  }
];

export const DEMO_REMINDERS: CareReminder[] = [
  {
    id: 'demo-rem-1',
    plantId: 'demo-plant-2',
    type: 'water',
    title: 'Moisture Check for Pesto Prime',
    description: 'Basil soil moisture has dropped to 29%. Check topsoil and water if dry.',
    dueDate: new Date(Date.now() + 4 * 3600 * 1000).toISOString(),
    isCompleted: false
  },
  {
    id: 'demo-rem-2',
    plantId: 'demo-plant-1',
    type: 'inspect',
    title: 'Wipe Monstera leaves',
    description: 'Wipe dust off broad leaves with damp cloth to maximize photosynthesis.',
    dueDate: new Date(Date.now() + 2 * 86400 * 1000).toISOString(),
    isCompleted: false
  },
  {
    id: 'demo-rem-3',
    plantId: 'demo-plant-3',
    type: 'water',
    title: 'Snake Plant watering check',
    description: 'Last watered 12 days ago. Test soil 2-3 inches deep.',
    dueDate: new Date(Date.now() + 3 * 86400 * 1000).toISOString(),
    isCompleted: false
  }
];

export const DEMO_JOURNAL: JournalEntry[] = [
  {
    id: 'demo-j-1',
    plantId: 'demo-plant-1',
    date: '2026-10-18',
    title: 'New fenestrated leaf opening!',
    notes: 'Spotted a new leaf spike 10 days ago, now fully unrolled with 6 distinct splits. Vibrant emerald green.',
    mood: 'growing'
  },
  {
    id: 'demo-j-2',
    plantId: 'demo-plant-2',
    date: '2026-10-12',
    title: 'Harvested fresh basil for homemade pesto',
    notes: 'Pinched top 3 sets of leaves right above node. Stimulated two new side shoots already.',
    mood: 'thriving'
  }
];

// Generate 24 hours of simulated sensor history for charts
export function generateDemoHistory(plantId: string, hours = 24): SensorReading[] {
  const readings: SensorReading[] = [];
  const now = Date.now();
  const stepMs = (hours * 3600 * 1000) / 48; // 48 sample points

  const isBasil = plantId === 'demo-plant-2';
  const baseMoist = isBasil ? 30 : 54;
  const baseTemp = isBasil ? 26.5 : 23.0;
  const baseHumid = isBasil ? 44.0 : 57.0;

  for (let i = 48; i >= 0; i--) {
    const t = new Date(now - i * stepMs);
    const hourOfDay = t.getHours();
    
    // Diurnal temperature wave (cooler at night, warmer at 2pm)
    const tempWave = Math.sin(((hourOfDay - 8) / 24) * 2 * Math.PI) * 2.5;
    // Humidity inversely related to temp
    const humidWave = -tempWave * 3.5;
    // Moisture gradually declining over time
    const drying = (48 - i) * 0.28;
    const moistVal = Math.max(10, Math.min(100, Math.round(baseMoist - drying + Math.sin(i) * 1.5)));

    readings.push({
      id: `hist-${i}`,
      deviceId: isBasil ? 'sproutly-demo-02' : 'sproutly-demo-01',
      plantId,
      timestamp: t.toISOString(),
      soilRaw: Math.round(3200 - (moistVal / 100) * 1850),
      soilPercent: moistVal,
      temperatureC: parseFloat((baseTemp + tempWave + (Math.random() * 0.4 - 0.2)).toFixed(1)),
      temperatureF: parseFloat((((baseTemp + tempWave) * 9 / 5) + 32).toFixed(1)),
      humidityPercent: parseFloat((baseHumid + humidWave + (Math.random() * 1.0 - 0.5)).toFixed(1)),
      isSoilValid: true,
      isDhtValid: true,
      wifiRssi: -55 - Math.round(Math.random() * 8),
      isDemo: true
    });
  }

  return readings;
}
