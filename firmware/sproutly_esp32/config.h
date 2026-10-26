#ifndef SPROUTLY_CONFIG_H
#define SPROUTLY_CONFIG_H

#include <Arduino.h>

// ==========================================
// Sproutly ESP32 Firmware Configuration
// ==========================================

// Firmware Information
#define FIRMWARE_VERSION "1.2.0"
#define DEVICE_DEFAULT_ID "sproutly-esp32-01"

// ------------------------------------------
// Wi-Fi Configuration
// ------------------------------------------
// Mode 1: Home Wi-Fi Station (STA) credentials
// If router is unavailable after 15 seconds, automatically starts AP mode!
#define DEFAULT_STA_SSID "Hitesh-Home-WiFi"
#define DEFAULT_STA_PASS "Hitesh2005#"

// Mode 2: Direct Hotspot Access Point (AP) mode
#define AP_SSID "Sproutly-Device-AP"
#define AP_PASS "sproutly123"
#define AP_CHANNEL 1
#define AP_IP IPAddress(192, 168, 4, 1)
#define AP_GATEWAY IPAddress(192, 168, 4, 1)
#define AP_SUBNET IPAddress(255, 255, 255, 0)

#define MDNS_HOSTNAME "sproutly" // accessible at http://sproutly.local

// ------------------------------------------
// Hardware Pinout Configuration
// ------------------------------------------
// Soil Moisture Sensor (Analog)
// Note: ADC1 pins (GPIO 32-39) are recommended because ADC2 conflicts with
// Wi-Fi!
#define SOIL_PIN 34

// DHT11 Sensor (Digital)
#define DHT_PIN 4
#define DHT_TYPE DHT11

// SH1106 / SH1107 I2C OLED Display (128x64 or 128x128)
#define OLED_SDA 21
#define OLED_SCL 22
#define OLED_I2C_ADDRESS 0x3C
#define OLED_WIDTH 128
#define OLED_HEIGHT 64
#define OLED_RESET -1 // Share reset with ESP32

// Optional Buzzer (Active or Passive Buzzer)
#define BUZZER_PIN 19
#define BUZZER_ENABLED true

// ------------------------------------------
// Default Sensor Calibration Values
// ------------------------------------------
// Typical Capacitive Soil Sensor readings on 12-bit ADC (0 - 4095):
// In dry air: ~3100 - 3500 (High ADC = Dry)
// Submerged in water: ~1200 - 1500 (Low ADC = Wet)
#define DEFAULT_CALIB_DRY 3200
#define DEFAULT_CALIB_WET 1350
#define REVERSE_POLARITY false // Set true if higher ADC value = wetter soil

// ------------------------------------------
// Polling & Timing Intervals (milliseconds)
// ------------------------------------------
#define SENSOR_READ_INTERVAL 3000   // Read sensors every 3 seconds
#define DISPLAY_CYCLE_INTERVAL 5000 // Rotate display screen every 5 seconds
#define WIFI_CONNECT_TIMEOUT 15000 // 15 seconds to try connecting to Home Wi-Fi

#endif // SPROUTLY_CONFIG_H
