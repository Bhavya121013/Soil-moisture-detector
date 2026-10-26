#ifndef SPROUTLY_DISPLAY_MANAGER_H
#define SPROUTLY_DISPLAY_MANAGER_H

#include "config.h"
#include "sensor_manager.h"
#include <Adafruit_GFX.h>
#include <Adafruit_SH110X.h>
#include <Arduino.h>
#include <Wire.h>

class DisplayManager {
private:
  Adafruit_SH1106G _display;
  bool _initialized;
  int _currentScreen;
  unsigned long _lastScreenSwitch;

public:
  DisplayManager()
      : _display(OLED_WIDTH, OLED_HEIGHT, &Wire, OLED_RESET),
        _initialized(false), _currentScreen(0), _lastScreenSwitch(0) {}

  void begin() {
    Wire.begin(OLED_SDA, OLED_SCL);
    // SH1106 128x64 I2C initialization
    if (_display.begin(OLED_I2C_ADDRESS, true)) {
      _initialized = true;
      _display.clearDisplay();
      drawSplashScreen();
      _display.display();
      delay(1500);
    } else {
      Serial.println(
          "[OLED] Warning: SH110X display not detected at address 0x3C");
      _initialized = false;
    }
  }

  void drawSplashScreen() {
    if (!_initialized)
      return;
    _display.clearDisplay();
    _display.setTextSize(2);
    _display.setTextColor(SH110X_WHITE);
    _display.setCursor(18, 12);
    _display.println("Sproutly");

    _display.setTextSize(1);
    _display.setCursor(12, 36);
    _display.println("Smart Plant Care");
    _display.setCursor(26, 48);
    _display.println("v" FIRMWARE_VERSION);
  }

  void drawConnectingScreen(const char *ssid) {
    if (!_initialized)
      return;
    _display.clearDisplay();
    _display.setTextSize(1);
    _display.setTextColor(SH110X_WHITE);
    _display.setCursor(0, 8);
    _display.println("Connecting to Wi-Fi:");
    _display.setCursor(0, 24);
    _display.println(ssid);

    // Draw simple loading dots
    int dots = (millis() / 500) % 4;
    _display.setCursor(0, 44);
    for (int i = 0; i < dots; i++) {
      _display.print(".");
    }
    _display.display();
  }

  void drawApModeScreen(const char *ssid, const char *ipStr) {
    if (!_initialized)
      return;
    _display.clearDisplay();
    _display.setTextSize(1);
    _display.setTextColor(SH110X_WHITE);
    _display.setCursor(0, 2);
    _display.println("MODE: DIRECT HOTSPOT");
    _display.drawLine(0, 12, 127, 12, SH110X_WHITE);

    _display.setCursor(0, 18);
    _display.print("SSID: ");
    _display.println(ssid);

    _display.setCursor(0, 32);
    _display.print("Pass: ");
    _display.println(AP_PASS);

    _display.setCursor(0, 46);
    _display.print("Open: http://");
    _display.setCursor(0, 56);
    _display.println(ipStr);

    _display.display();
  }

  void update(const SensorData &data, const char *wifiMode, const char *ipStr) {
    if (!_initialized)
      return;

    // Cycle screens periodically
    if (millis() - _lastScreenSwitch > DISPLAY_CYCLE_INTERVAL) {
      _currentScreen = (_currentScreen + 1) % 2;
      _lastScreenSwitch = millis();
    }

    _display.clearDisplay();

    if (_currentScreen == 0) {
      // Screen 0: Primary Plant Status & Moisture Gauge
      drawPrimaryScreen(data, wifiMode);
    } else {
      // Screen 1: Environment & Network Details
      drawEnvironmentScreen(data, wifiMode, ipStr);
    }

    _display.display();
  }

private:
  void drawPrimaryScreen(const SensorData &data, const char *wifiMode) {
    // Header Bar
    _display.setTextSize(1);
    _display.setTextColor(SH110X_WHITE);
    _display.setCursor(0, 0);
    _display.print("Sproutly ");
    _display.print(wifiMode);

    _display.drawLine(0, 10, 127, 10, SH110X_WHITE);

    // Plant Face Animation / Icon based on moisture
    int m = data.soilPercent;
    drawPlantAvatar(12, 20, m);

    // Moisture Text & Gauge
    _display.setTextSize(1);
    _display.setCursor(54, 16);
    _display.print("Soil Moist:");

    _display.setTextSize(2);
    _display.setCursor(54, 28);
    _display.print(m);
    _display.print("%");

    // Horizontal Progress Bar for Moisture (0 - 100%)
    int barX = 54;
    int barY = 48;
    int barW = 70;
    int barH = 8;
    _display.drawRect(barX, barY, barW, barH, SH110X_WHITE);
    int fillW = map(constrain(m, 0, 100), 0, 100, 0, barW - 4);
    if (fillW > 0) {
      _display.fillRect(barX + 2, barY + 2, fillW, barH - 4, SH110X_WHITE);
    }

    // Status label at bottom
    _display.setTextSize(1);
    _display.setCursor(0, 56);
    if (m < 25) {
      _display.print("Status: Soil is Dry!");
    } else if (m > 80) {
      _display.print("Status: Soil is Wet");
    } else {
      _display.print("Status: Looking Good!");
    }
  }

  void drawEnvironmentScreen(const SensorData &data, const char *wifiMode,
                             const char *ipStr) {
    // Header
    _display.setTextSize(1);
    _display.setTextColor(SH110X_WHITE);
    _display.setCursor(0, 0);
    _display.print("ENVIRONMENT");
    _display.setCursor(80, 0);
    _display.print(wifiMode);
    _display.drawLine(0, 10, 127, 10, SH110X_WHITE);

    // Temperature
    _display.setCursor(4, 16);
    _display.print("Temp: ");
    if (data.isDhtValid) {
      _display.print(data.temperatureC, 1);
      _display.print(" C (");
      _display.print((int)data.temperatureF);
      _display.print("F)");
    } else {
      _display.print("DHT Sensor --");
    }

    // Humidity
    _display.setCursor(4, 28);
    _display.print("Humid: ");
    if (data.isDhtValid) {
      _display.print((int)data.humidity);
      _display.print(" % RH");
    } else {
      _display.print("-- %");
    }

    // Raw ADC
    _display.setCursor(4, 40);
    _display.print("Raw ADC: ");
    _display.print(data.soilRaw);

    // IP address bar
    _display.drawLine(0, 52, 127, 52, SH110X_WHITE);
    _display.setCursor(0, 56);
    _display.print("IP: ");
    _display.print(ipStr);
  }

  void drawPlantAvatar(int x, int y, int moisture) {
    // Draw cute pixel art sprout pot and face
    // Pot
    _display.drawRect(x + 2, y + 14, 24, 16, SH110X_WHITE);
    _display.drawRect(x, y + 12, 28, 4, SH110X_WHITE);

    // Sprout Stem
    _display.drawLine(x + 14, y + 12, x + 14, y + 4, SH110X_WHITE);
    // Leaves
    _display.drawCircle(x + 10, y + 3, 3, SH110X_WHITE);
    _display.drawCircle(x + 18, y + 3, 3, SH110X_WHITE);

    // Expression based on moisture
    if (moisture < 25) {
      // Thirsty/Drooping: 'x' eyes, sad mouth
      _display.drawPixel(x + 8, y + 19, SH110X_WHITE);
      _display.drawPixel(x + 10, y + 21, SH110X_WHITE);
      _display.drawPixel(x + 18, y + 19, SH110X_WHITE);
      _display.drawPixel(x + 20, y + 21, SH110X_WHITE);
      _display.drawLine(x + 11, y + 26, x + 17, y + 24, SH110X_WHITE); // sad
    } else {
      // Happy: dot eyes, smile
      _display.fillRect(x + 8, y + 19, 2, 2, SH110X_WHITE);
      _display.fillRect(x + 18, y + 19, 2, 2, SH110X_WHITE);
      _display.drawPixel(x + 11, y + 25, SH110X_WHITE);
      _display.drawPixel(x + 12, y + 26, SH110X_WHITE);
      _display.drawPixel(x + 15, y + 26, SH110X_WHITE);
      _display.drawPixel(x + 16, y + 25, SH110X_WHITE);
    }
  }
};

#endif // SPROUTLY_DISPLAY_MANAGER_H
