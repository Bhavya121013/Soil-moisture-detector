#ifndef SPROUTLY_SENSOR_MANAGER_H
#define SPROUTLY_SENSOR_MANAGER_H

#include <Arduino.h>
#include <DHT.h>
#include <Preferences.h>
#include "config.h"

struct SensorData {
  int soilRaw;
  int soilPercent;
  float temperatureC;
  float temperatureF;
  float humidity;
  bool isDhtValid;
  bool isSoilValid;
  unsigned long lastReadTime;
};

class SensorManager {
private:
  DHT _dht;
  Preferences _prefs;
  int _calibDry;
  int _calibWet;
  bool _reversePolarity;
  SensorData _currentData;
  unsigned long _lastReadMs;

  // Smoothing buffer
  static const int SAMPLES = 8;
  int _sampleBuffer[SAMPLES];
  int _sampleIndex;

public:
  SensorManager() : _dht(DHT_PIN, DHT_TYPE), _calibDry(DEFAULT_CALIB_DRY), 
                    _calibWet(DEFAULT_CALIB_WET), _reversePolarity(REVERSE_POLARITY),
                    _lastReadMs(0), _sampleIndex(0) {
    _currentData.soilRaw = 0;
    _currentData.soilPercent = 0;
    _currentData.temperatureC = 0.0f;
    _currentData.temperatureF = 0.0f;
    _currentData.humidity = 0.0f;
    _currentData.isDhtValid = false;
    _currentData.isSoilValid = false;
    _currentData.lastReadTime = 0;
    
    for (int i = 0; i < SAMPLES; i++) {
      _sampleBuffer[i] = 0;
    }
  }

  void begin() {
    analogReadResolution(12); // ESP32 12-bit ADC (0 - 4095)
    analogSetAttenuation(ADC_11db); // 0 - 3.3V range
    pinMode(SOIL_PIN, INPUT);

    _dht.begin();

    // Load calibration from NVS Preferences
    _prefs.begin("sproutly", false);
    _calibDry = _prefs.getInt("dry", DEFAULT_CALIB_DRY);
    _calibWet = _prefs.getInt("wet", DEFAULT_CALIB_WET);
    _reversePolarity = _prefs.getBool("rev", REVERSE_POLARITY);
    _prefs.end();

    // Initialize smoothing buffer with initial readings
    int initialVal = analogRead(SOIL_PIN);
    for (int i = 0; i < SAMPLES; i++) {
      _sampleBuffer[i] = initialVal;
    }

    readSensors();
  }

  void update() {
    if (millis() - _lastReadMs >= SENSOR_READ_INTERVAL) {
      readSensors();
      _lastReadMs = millis();
    }
  }

  void readSensors() {
    // 1. Read Soil Moisture with moving average
    int raw = analogRead(SOIL_PIN);
    _sampleBuffer[_sampleIndex] = raw;
    _sampleIndex = (_sampleIndex + 1) % SAMPLES;

    long sum = 0;
    for (int i = 0; i < SAMPLES; i++) {
      sum += _sampleBuffer[i];
    }
    _currentData.soilRaw = sum / SAMPLES;
    _currentData.isSoilValid = (_currentData.soilRaw > 50 && _currentData.soilRaw < 4050);

    // Calculate percentage based on calibration
    _currentData.soilPercent = calculateMoisturePercent(_currentData.soilRaw);

    // 2. Read DHT11 Temperature & Humidity
    float h = _dht.readHumidity();
    float tC = _dht.readTemperature();

    if (!isnan(h) && !isnan(tC)) {
      _currentData.humidity = h;
      _currentData.temperatureC = tC;
      _currentData.temperatureF = (tC * 9.0f / 5.0f) + 32.0f;
      _currentData.isDhtValid = true;
    } else {
      _currentData.isDhtValid = false;
    }

    _currentData.lastReadTime = millis();
  }

  int calculateMoisturePercent(int raw) {
    if (_calibDry == _calibWet) return 50;

    int percent = 0;
    if (!_reversePolarity) {
      // Standard: Lower raw ADC = wetter (Capacitive sensor: dry air ~3200, wet water ~1350)
      percent = map(raw, _calibDry, _calibWet, 0, 100);
    } else {
      // Reverse: Higher raw ADC = wetter
      percent = map(raw, _calibDry, _calibWet, 0, 100);
    }
    return constrain(percent, 0, 100);
  }

  void setCalibration(int dryVal, int wetVal, bool reverse = false) {
    _calibDry = dryVal;
    _calibWet = wetVal;
    _reversePolarity = reverse;

    _prefs.begin("sproutly", false);
    _prefs.putInt("dry", _calibDry);
    _prefs.putInt("wet", _calibWet);
    _prefs.putBool("rev", _reversePolarity);
    _prefs.end();

    // Recalculate percent immediately
    _currentData.soilPercent = calculateMoisturePercent(_currentData.soilRaw);
  }

  SensorData getData() const {
    return _currentData;
  }

  int getCalibDry() const { return _calibDry; }
  int getCalibWet() const { return _calibWet; }
  bool getReversePolarity() const { return _reversePolarity; }
};

#endif // SPROUTLY_SENSOR_MANAGER_H
