#include <Wire.h>
#include <SPI.h>
#include <MFRC522.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <LiquidCrystal_I2C.h>

// ==== Hardware Pins ====
#define SS_PIN 15       // RFID SDA
#define RST_PIN 4       // RFID RST
#define BUZZER_PIN 25   // Buzzer

// ==== Objects ====
MFRC522 mfrc522(SS_PIN, RST_PIN);
LiquidCrystal_I2C lcd(0x27, 16, 2);

// ==== WiFi Credentials ====
const char* ssid = "no internet";
const char* password = "221-15-4983";

// ==== Server URL ====
const char* serverURL = "http://192.168.1.7:5000/attendances/create";

// ==== LCD Utility Functions ====
void showLCDMessage(const String& line1, const String& line2 = "") {
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print(line1);
  if (line2 != "") {
    lcd.setCursor(0, 1);
    lcd.print(line2);
    Serial.println("[LCD] " + line1 + " | " + line2);
  } else {
    Serial.println("[LCD] " + line1);
  }
}

void showLongMessage(const String& message) {
  lcd.clear();
  if (message.length() <= 16) {
    lcd.setCursor(0, 0);
    lcd.print(message);
  } else {
    lcd.setCursor(0, 0);
    lcd.print(message.substring(0, 16));
    lcd.setCursor(0, 1);
    lcd.print(message.substring(16, min(message.length(), (size_t)32)));
  }
  Serial.println("[LCD] " + message);
}

// ==== Buzzer Utility ====
void buzzSuccess() {
  digitalWrite(BUZZER_PIN, HIGH);
  delay(150);
  digitalWrite(BUZZER_PIN, LOW);
  Serial.println("[BUZZER] Success tone");
}

void buzzFailure() {
  for (int i = 0; i < 2; i++) {
    digitalWrite(BUZZER_PIN, HIGH);
    delay(100);
    digitalWrite(BUZZER_PIN, LOW);
    delay(100);
  }
  Serial.println("[BUZZER] Failure tone (2 beeps)");
}

// ==== Setup ====
void setup() {
  Serial.begin(9600);
  Wire.begin(21, 22); // SDA, SCL for ESP32
  lcd.init();
  lcd.backlight();

  pinMode(BUZZER_PIN, OUTPUT);
  digitalWrite(BUZZER_PIN, LOW);

  SPI.begin();
  mfrc522.PCD_Init();

  showLCDMessage("Welcome", "Initializing...");
  delay(1000);

  // ==== Connect to WiFi ====
  WiFi.begin(ssid, password);
  showLCDMessage("Connecting", "to Wi-Fi...");
  Serial.println("Connecting to Wi-Fi...");
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.print(".");
  }
  Serial.println("\n[WiFi] Connected to Wi-Fi");
  Serial.print("[WiFi] IP Address: ");
  Serial.println(WiFi.localIP());

  showLCDMessage("Wi-Fi Connected");
  delay(1500);
  showLCDMessage("Scan your card");
}

// ==== Main Loop ====
void loop() {
  // Reconnect if WiFi drops
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("[WiFi] Disconnected. Attempting to reconnect...");
    WiFi.begin(ssid, password);
    while (WiFi.status() != WL_CONNECTED) {
      delay(1000);
      Serial.print(".");
    }
    Serial.println("\n[WiFi] Reconnected.");
    showLCDMessage("Wi-Fi", "Reconnected");
    delay(1000);
    showLCDMessage("Scan your card");
  }

  // Wait for RFID card
  if (!mfrc522.PICC_IsNewCardPresent() || !mfrc522.PICC_ReadCardSerial()) return;

  // Read UID
  String cardUID = "";
  for (byte i = 0; i < mfrc522.uid.size; i++) {
    cardUID += String(mfrc522.uid.uidByte[i], HEX);
  }
  cardUID.toUpperCase();
  Serial.println("[RFID] Card UID: " + cardUID);

  showLCDMessage("Loading...");
  sendUIDToServer(cardUID);

  delay(2000);
  showLCDMessage("Scan your card");
}

// ==== Send UID to Server ====
void sendUIDToServer(const String& uid) {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(serverURL);
    http.addHeader("Content-Type", "application/json");

    String jsonData = "{ \"nfcUID\": \"" + uid + "\" }";
    Serial.println("[HTTP] Sending JSON: " + jsonData);

    int httpResponseCode = http.POST(jsonData);
    Serial.print("[HTTP] Response Code: ");
    Serial.println(httpResponseCode);

    if (httpResponseCode > 0) {
      String response = http.getString();
      Serial.println("[HTTP] Response:");
      Serial.println(response);

      String message = extractValue(response, "\"message\":");
      Serial.println("[Parsed] Message: " + message);
      showLongMessage(message);

      if (message.indexOf("Invalid") != -1 || message.indexOf("not recognized") != -1) {
        buzzFailure(); // ❌ Invalid card
      } else {
        buzzSuccess(); // ✅ Valid card
      }
    } else {
      Serial.println("[HTTP] Failed to send UID.");
      showLCDMessage("Send Failed");
    }

    http.end();
  } else {
    Serial.println("[WiFi] Not connected.");
    showLCDMessage("Wi-Fi Error");
  }
}

// ==== Simple JSON Message Extractor ====
String extractValue(String response, String key) {
  int startIndex = response.indexOf(key);
  if (startIndex == -1) return "Not Found";

  startIndex = response.indexOf(":", startIndex) + 2;
  int endIndex = response.indexOf("\"", startIndex);
  return response.substring(startIndex, endIndex);
}
