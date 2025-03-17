#include <SPI.h>
#include <MFRC522.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

#define SS_PIN 21   
#define RST_PIN 22  

MFRC522 mfrc522(SS_PIN, RST_PIN); 

// Wi-Fi credentials
const char* ssid = "no internet";    
const char* password = "221-15-4983"; 
const char* serverURL = "http://192.168.1.3:5000/users/receive-uid"; 

void setup() {
    Serial.begin(9600);   
    SPI.begin();          
    mfrc522.PCD_Init();   

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

    if (!mfrc522.PICC_IsNewCardPresent()) return;
    if (!mfrc522.PICC_ReadCardSerial()) return;

    Serial.print("Card UID: ");
    String cardUID = "";
    
    for (byte i = 0; i < mfrc522.uid.size; i++) {
        //Serial.print(mfrc522.uid.uidByte[i], HEX);
        cardUID += String(mfrc522.uid.uidByte[i], HEX);
    }
    Serial.println(cardUID);

    // Send UID to Server
    sendUIDToServer(cardUID);

    delay(2000);  
}

void sendUIDToServer(String uid) {
    if (WiFi.status() == WL_CONNECTED) {
        HTTPClient http;
         Serial.print("Trying to connect to:");
          Serial.println(serverURL);

        http.begin(serverURL);  
        http.addHeader("Content-Type", "application/json");

        String jsonData = "{ \"nfcUID\": \"" + uid + "\" }";
        Serial.print("Sending Data: ");
        Serial.println(jsonData);

        int httpResponseCode = http.POST(jsonData);  
        Serial.print("HTTP Response Code: ");
        Serial.println(httpResponseCode);

        if (httpResponseCode > 0) {
            String response = http.getString();
           // Serial.println("Server Response: " + response);
            parseJsonResponse(response);
        } else {
            Serial.println("Error in sending request: " + String(httpResponseCode));
        }
        http.end();
    } else {
        Serial.println("Wi-Fi Disconnected. Cannot send data.");
    }
}




void parseJsonResponse(String response) {
   String name = extractValue(response, "\"name\":");
  String userID = extractValue(response, "\"userID\":");

  // Print the extracted values
  Serial.println("|--------------------------------------|");
  Serial.println("| Name: " + name);
  Serial.println("| Student ID: " + userID);
  Serial.println("|--------------------------------------|");
  Serial.println();
  Serial.println();
}

String extractValue(String response, String key) {
  int startIndex = response.indexOf(key);  
  if (startIndex == -1) {
    return "Not Found";  
  }
  startIndex = response.indexOf(":", startIndex) + 2;  
  int endIndex = response.indexOf("\"", startIndex);
  return response.substring(startIndex, endIndex);
}


















