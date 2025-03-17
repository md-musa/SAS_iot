#include <SPI.h>
#include <MFRC522.h>
#include <WiFi.h>
#include <HTTPClient.h>

#define SS_PIN 21   // Connect SDA of RFID module to GPIO 21
#define RST_PIN 22  // Connect RST of RFID module to GPIO 22

MFRC522 mfrc522(SS_PIN, RST_PIN);  // Create MFRC522 instance

// Wi-Fi credentials
const char* ssid = "no internet";     // Replace with your Wi-Fi name
const char* password = "221-15-4983"; // Replace with your Wi-Fi password
const char* serverURL = "http://192.168.1.3:5000/users/receive-uid"; // Server URL (Replace with your server endpoint)

void setup() {
    Serial.begin(9600);   // Start Serial Monitor
    SPI.begin();          // Start SPI Communication
    mfrc522.PCD_Init();   // Initialize RFID Module

   Serial.println("Connecting to Wi-Fi...");

    // Connect to Wi-Fi
    WiFi.begin(ssid, password);
    while (WiFi.status() != WL_CONNECTED) {
        delay(1000);
        Serial.print(".");
    }
    
    Serial.println("\nConnected to Wi-Fi");
    Serial.print("IP Address: ");
    Serial.println(WiFi.localIP()); 


    Serial.println("Place your RFID card near the reader...");
}

void loop() {
   if (WiFi.status() != WL_CONNECTED) {
        Serial.println("Wi-Fi Disconnected. Reconnecting...");
        WiFi.begin(ssid, password);
        while (WiFi.status() != WL_CONNECTED) {
            delay(1000);
            Serial.print(".");
        }
        Serial.println("\nReconnected to Wi-Fi.");
    }

    if (!mfrc522.PICC_IsNewCardPresent()) {
        return; // If no card is present, return
    }
    if (!mfrc522.PICC_ReadCardSerial()) {
        return; // If card cannot be read, return
    }

    Serial.print("Card UID: ");
    String cardUID = "";
    
    for (byte i = 0; i < mfrc522.uid.size; i++) {
        Serial.print(mfrc522.uid.uidByte[i], HEX);
        cardUID += String(mfrc522.uid.uidByte[i], HEX);
    }
    Serial.println(cardUID);

    // Send UID to Server
    sendUIDToServer(cardUID);

    delay(2000);  // Wait before reading again
}

void sendUIDToServer(String uid) {
    if (WiFi.status() == WL_CONNECTED) {
        HTTPClient http;
         Serial.print("Trying to connect to:");
          Serial.println(serverURL);

        http.begin(serverURL);  
        http.addHeader("Content-Type", "application/json");

        String jsonData = "{ \"uid\": \"" + uid + "\" }";
        Serial.print("Sending Data: ");
        Serial.println( jsonData);

        int httpResponseCode = http.POST(jsonData);  
        Serial.print("HTTP Response Code: ");
        Serial.println(httpResponseCode);

        if (httpResponseCode > 0) {
            String response = http.getString();
            Serial.println("Server Response: " + response);
        } else {
            Serial.println("Error in sending request: " + String(httpResponseCode));
        }
        http.end();
    } else {
        Serial.println("Wi-Fi Disconnected. Cannot send data.");
    }
}





















