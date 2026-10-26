import { Plant, SensorReading, CareRecommendation, PlantMoodState } from '../types';
import { getSpeciesById } from '../data/speciesDatabase';

/**
 * Generates an intelligent, personalized care recommendation for a plant.
 * Combines species thresholds, live sensor data, ambient temperature & humidity, and watering logs.
 */
export function getCareRecommendation(
  plant: Plant,
  latestReading?: SensorReading | null
): CareRecommendation {
  const species = getSpeciesById(plant.speciesId);
  const targetMin = plant.customMoistureTargetMin ?? species.moistureMin;
  const targetMax = plant.customMoistureTargetMax ?? species.moistureMax;
  const ideal = species.idealMoisture;

  // Case 1: No device attached / Manual tracking mode
  if (!plant.deviceId) {
    // Check days since last watered
    if (plant.lastWateredDate) {
      const daysSince = Math.floor((Date.now() - new Date(plant.lastWateredDate).getTime()) / (86400 * 1000));
      if (daysSince >= species.wateringFrequencyDays) {
        return {
          status: 'check-moisture',
          headline: `Time for a manual moisture check`,
          explanation: `It has been ${daysSince} days since ${plant.name} was last watered (typical interval is ~${species.wateringFrequencyDays} days). Check the top 2 inches of soil before watering.`,
          urgency: 'medium',
          actionLabel: 'Check & Log Water',
          suggestedWaterMl: estimateWaterVolume(plant.potSize, species.id)
        };
      }
      return {
        status: 'looking-good',
        headline: `On schedule`,
        explanation: `${plant.name} was watered ${daysSince} days ago. Typical interval is ~${species.wateringFrequencyDays} days. No action needed right now.`,
        urgency: 'low'
      };
    }
    return {
      status: 'needs-data',
      headline: `Manual tracking active`,
      explanation: `No sensor is linked to ${plant.name}. Log your watering events or link an ESP32 node to see live soil moisture trends.`,
      urgency: 'info',
      actionLabel: 'Log First Watering'
    };
  }

  // Case 2: Device linked but no reading received yet
  if (!latestReading) {
    return {
      status: 'sensor-offline',
      headline: `Awaiting sensor data`,
      explanation: `${plant.name} is linked to a sensor, but no readings have been received yet. Ensure your ESP32 is powered on and connected.`,
      urgency: 'medium',
      actionLabel: 'Check Device'
    };
  }

  // Check data freshness (stale if > 15 minutes old)
  const readingAgeMs = Date.now() - new Date(latestReading.timestamp).getTime();
  const isStale = readingAgeMs > 15 * 60 * 1000;
  const currentMoisture = latestReading.soilPercent;

  if (isStale) {
    const minutesAgo = Math.round(readingAgeMs / (60 * 1000));
    return {
      status: 'sensor-offline',
      headline: `Sensor reading is stale`,
      explanation: `Last reading for ${plant.name} was recorded ${minutesAgo} minutes ago. The device may be disconnected from Wi-Fi or sleeping.`,
      urgency: 'medium',
      actionLabel: 'Troubleshoot Node'
    };
  }

  // Environmental context
  const isHot = latestReading.isDhtValid && latestReading.temperatureC > 29;
  const isCold = latestReading.isDhtValid && latestReading.temperatureC < (species.tempMinC - 1);
  const isDryAir = latestReading.isDhtValid && latestReading.humidityPercent < 35;

  // Case 3: Moisture is below target range
  if (currentMoisture < targetMin) {
    const deficit = targetMin - currentMoisture;
    let environmentalNote = '';
    if (isHot) {
      environmentalNote = ` Ambient temperature is high (${latestReading.temperatureC}°C), which increases evaporation rate.`;
    }

    if (currentMoisture <= Math.max(10, targetMin - 15)) {
      return {
        status: 'watering-needed',
        headline: `Moisture is significantly low (${currentMoisture}%)`,
        explanation: `${plant.name}'s soil moisture has dropped to ${currentMoisture}%, well below its preferred minimum of ${targetMin}%.${environmentalNote} Inspect soil with your finger and water if the root zone feels dry.`,
        urgency: 'high',
        actionLabel: 'Log Watering',
        suggestedWaterMl: estimateWaterVolume(plant.potSize, species.id)
      };
    }

    return {
      status: 'check-moisture',
      headline: `Moisture approaching lower threshold (${currentMoisture}%)`,
      explanation: `Moisture is currently ${currentMoisture}%, slightly below ${plant.name}'s ideal range (${targetMin}%–${targetMax}%).${environmentalNote} Feel the topsoil before hydrating.`,
      urgency: 'medium',
      actionLabel: 'Inspect & Water',
      suggestedWaterMl: estimateWaterVolume(plant.potSize, species.id)
    };
  }

  // Case 4: Moisture is above target range (potential overwatering risk)
  if (currentMoisture > targetMax + 15) {
    return {
      status: 'check-environment',
      headline: `Soil is very wet (${currentMoisture}%)`,
      explanation: `Soil moisture is ${currentMoisture}%, noticeably above ${species.commonName}'s upper threshold (${targetMax}%). Allow soil to dry out and ensure drainage holes are unobstructed to prevent root rot.`,
      urgency: 'medium',
      actionLabel: 'Check Drainage'
    };
  }

  // Case 5: Temperature alert
  if (isCold) {
    return {
      status: 'check-environment',
      headline: `Chilly environment (${latestReading.temperatureC}°C)`,
      explanation: `Current temperature is ${latestReading.temperatureC}°C, which is cooler than ${species.commonName}'s recommended minimum of ${species.tempMinC}°C. Move away from cold window drafts if possible.`,
      urgency: 'medium'
    };
  }

  // Case 6: Optimal condition!
  let praise = `Soil moisture is optimal at ${currentMoisture}% (target: ${targetMin}%–${targetMax}%).`;
  if (latestReading.isDhtValid) {
    praise += ` Temperature (${latestReading.temperatureC}°C) and humidity (${Math.round(latestReading.humidityPercent)}%) are comfortably within range.`;
  }

  return {
    status: 'looking-good',
    headline: `Thriving & balanced`,
    explanation: praise,
    urgency: 'low'
  };
}

/**
 * Returns a friendly plant avatar mood state based on actual sensor conditions.
 */
export function getPlantMood(
  plant: Plant,
  latestReading?: SensorReading | null
): PlantMoodState {
  if (!plant.deviceId || !latestReading) {
    return {
      mood: 'waiting',
      label: 'Relaxed',
      emoji: '😌',
      message: 'Tracking your care routine smoothly.',
      badgeClass: 'bg-cream-100 text-forest-700 border-forest-200'
    };
  }

  const species = getSpeciesById(plant.speciesId);
  const m = latestReading.soilPercent;
  const targetMin = plant.customMoistureTargetMin ?? species.moistureMin;

  if (m < 20) {
    return {
      mood: 'dry-warning',
      label: 'Very Thirsty',
      emoji: '🥺',
      message: 'My soil is quite parched. A sip of water would be lovely!',
      badgeClass: 'bg-red-50 text-red-700 border-red-200'
    };
  }

  if (m < targetMin) {
    return {
      mood: 'thirsty',
      label: 'Slightly Thirsty',
      emoji: '🧐',
      message: 'Soil is drying down nicely. Check if it is time to hydrate.',
      badgeClass: 'bg-amber-50 text-amber-700 border-amber-200'
    };
  }

  if (latestReading.isDhtValid && latestReading.temperatureC < species.tempMinC) {
    return {
      mood: 'chilled',
      label: 'Feeling Chilly',
      emoji: '🥶',
      message: 'Brrr! A bit nippy here today.',
      badgeClass: 'bg-blue-50 text-blue-700 border-blue-200'
    };
  }

  if (latestReading.isDhtValid && latestReading.temperatureC > 31) {
    return {
      mood: 'warm',
      label: 'A Bit Warm',
      emoji: '☀️',
      message: 'Basking in the warmth, but drinking water faster!',
      badgeClass: 'bg-orange-50 text-orange-700 border-orange-200'
    };
  }

  return {
    mood: 'happy',
    label: 'Happy & Thriving',
    emoji: '😊',
    message: 'Moisture and warmth are just right today!',
    badgeClass: 'bg-sage-100 text-forest-800 border-sage-300'
  };
}

/**
 * Calculates approximate watering volume in milliliters based on pot size and species category.
 * Explicitly declared as an approximation.
 */
export function estimateWaterVolume(potSize?: string, speciesId?: string): number {
  let baseVolume = 300; // default for 6-8 inch pot

  if (potSize) {
    const lower = potSize.toLowerCase();
    if (lower.includes('4') || lower.includes('small')) baseVolume = 150;
    else if (lower.includes('6')) baseVolume = 250;
    else if (lower.includes('8')) baseVolume = 380;
    else if (lower.includes('10')) baseVolume = 550;
    else if (lower.includes('12') || lower.includes('large')) baseVolume = 850;
  }

  const species = speciesId ? getSpeciesById(speciesId) : null;
  if (species?.category === 'succulent') {
    baseVolume = Math.round(baseVolume * 0.65);
  } else if (species?.category === 'herb' || species?.id === 'boston-fern') {
    baseVolume = Math.round(baseVolume * 1.25);
  }

  return baseVolume;
}
