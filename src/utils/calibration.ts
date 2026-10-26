import { SensorCalibration } from '../types';

export const DEFAULT_CALIBRATION: SensorCalibration = {
  dryRaw: 3200,
  wetRaw: 1350,
  reversePolarity: false
};

/**
 * Converts a raw 12-bit ADC reading (0-4095) into a calibrated moisture percentage (0-100%).
 * Handles standard capacitive sensors (lower raw ADC = wetter) as well as reverse polarity.
 */
export function rawToMoisturePercent(raw: number, calib: SensorCalibration = DEFAULT_CALIBRATION): number {
  if (calib.dryRaw === calib.wetRaw) return 50;

  let percent = 0;
  if (!calib.reversePolarity) {
    // Normal capacitive: dry air ~3200 (0%), saturated water ~1350 (100%)
    percent = ((raw - calib.dryRaw) / (calib.wetRaw - calib.dryRaw)) * 100;
  } else {
    // Inverted sensor: higher ADC = wetter
    percent = ((raw - calib.dryRaw) / (calib.wetRaw - calib.dryRaw)) * 100;
  }

  return Math.max(0, Math.min(100, Math.round(percent)));
}

/**
 * Diagnostic check for sensor probe health.
 * Open circuit / disconnected probe often reads near rail 0 or 4095 on ESP32 ADC.
 */
export function evaluateSensorHealth(raw: number): {
  isHealthy: boolean;
  statusText: string;
} {
  if (raw <= 20) {
    return {
      isHealthy: false,
      statusText: 'Sensor shorted or pulled to GND (ADC ~0). Check probe wiring.'
    };
  }
  if (raw >= 4070) {
    return {
      isHealthy: false,
      statusText: 'Sensor disconnected or floating (ADC ~4095). Check VCC/Signal pin.'
    };
  }
  return {
    isHealthy: true,
    statusText: 'ADC reading within valid operational range.'
  };
}
