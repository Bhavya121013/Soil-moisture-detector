/*
 * Sproutly — Smart Plant Care Companion
 * ESP32 Microcontroller Firmware
 *
 * Hardware components:
 * - ESP32 NodeMCU / ESP-WROOM-32
 * - Capacitive / Resistive Soil Moisture Sensor (Analog GPIO 34)
 * - DHT11 Temperature & Humidity Sensor (Digital GPIO 4)
 * - SH1106 / SH1107 128x64 OLED Display (I2C: SDA=GPIO 21, SCL=GPIO 22)
 * - Optional Buzzer (GPIO 19)
 *
 * Features:
 * - Dual Wi-Fi Modes:
 *   1. Home Wi-Fi (STA) with mDNS (http://sproutly.local)
 *   2. Direct Hotspot (AP) auto-fallback (SSID: Sproutly-Device-AP,
 * 192.168.4.1)
 * - REST API with full CORS support (/api/data, /api/status, /api/calibrate)
 * - Animated OLED graphics with expressive plant avatar and gauge bar
 * - Non-Volatile Storage (NVS Preferences) for sensor calibration
 */

#include "config.h"
#include "display_manager.h"
#include "sensor_manager.h"
#include "web_server_manager.h"
#include <Arduino.h>
#include <ESPmDNS.h>
#include <WiFi.h>

// Global Manager Instances
SensorManager sensorMgr;
DisplayManager displayMgr;
WebServerManager serverMgr(&sensorMgr);

String currentWifiMode = "STA";
String currentIpAddress = "0.0.0.0";

void setupWifi() {
  Serial.println(
      "[Wi-Fi] Attempting connection to Home Wi-Fi: " DEFAULT_STA_SSID);
  displayMgr.drawConnectingScreen(DEFAULT_STA_SSID);

  WiFi.mode(WIFI_STA);
  WiFi.begin(DEFAULT_STA_SSID, DEFAULT_STA_PASS);

  unsigned long startAttemptTime = millis();

  // Try connecting for 15 seconds
  while (WiFi.status() != WL_CONNECTED &&
         millis() - startAttemptTime < WIFI_CONNECT_TIMEOUT) {
    delay(500);
    Serial.print(".");
    displayMgr.drawConnectingScreen(DEFAULT_STA_SSID);
  }
  Serial.println();

  if (WiFi.status() == WL_CONNECTED) {
    currentWifiMode = "STA";
    currentIpAddress = WiFi.localIP().toString();
    Serial.print("[Wi-Fi] Connected to Home Network! IP: ");
    Serial.println(currentIpAddress);

    // Setup mDNS responder
    if (MDNS.begin(MDNS_HOSTNAME)) {
      Serial.println("[mDNS] Responder started at http://" MDNS_HOSTNAME
                     ".local");
      MDNS.addService("http", "tcp", 80);
    }
  } else {
    // Fallback to Access Point (Direct Hotspot) Mode
    Serial.println("[Wi-Fi] Home network unavailable. Starting Direct Hotspot "
                   "(AP) mode...");
    WiFi.disconnect();
    WiFi.mode(WIFI_AP);
    WiFi.softAPConfig(AP_IP, AP_GATEWAY, AP_SUBNET);
    WiFi.softAP(AP_SSID, AP_PASS, AP_CHANNEL);

    currentWifiMode = "AP";
    currentIpAddress = WiFi.softAPIP().toString();
    Serial.print("[Wi-Fi] Hotspot active! Connect to SSID: ");
    Serial.println(AP_SSID);
    Serial.print("[Wi-Fi] Default Gateway / IP: ");
    Serial.println(currentIpAddress);

    displayMgr.drawApModeScreen(AP_SSID, currentIpAddress.c_str());
    delay(2500);
  }
}

void setup() {
  Serial.begin(115200);
  delay(500);
  Serial.println("\n======================================");
  Serial.println("  SPROUTLY — SMART PLANT CARE SYSTEM  ");
  Serial.println("  Firmware v" FIRMWARE_VERSION);
  Serial.println("======================================");

#if BUZZER_ENABLED
  pinMode(BUZZER_PIN, OUTPUT);
  digitalWrite(BUZZER_PIN, LOW);
#endif

  // Initialize display
  displayMgr.begin();

  // Initialize sensors and load NVS calibration
  sensorMgr.begin();

  // Setup Wi-Fi (Home network or Hotspot fallback)
  setupWifi();

  // Start HTTP REST server
  serverMgr.begin(currentWifiMode.c_str());

  Serial.println("[SYSTEM] Ready! Sensor loop running.");
}

void loop() {
  // 1. Process incoming HTTP client requests
  serverMgr.handleClient();

  // 2. Periodic sensor reading
  sensorMgr.update();

  // 3. Periodic display refresh
  displayMgr.update(sensorMgr.getData(), currentWifiMode.c_str(),
                    currentIpAddress.c_str());

  // 4. Minor yield for watchdog & network stability
  delay(10);
}
