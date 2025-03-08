import network
import time
from umqtt.simple import MQTTClient
from machine import Pin, SPI, I2C
import mfrc522
import ssd1306

# **Konfigurasi WiFi**
SSID = "LAPTOP-ZIKRI 8513"
PASSWORD = "ASUKOECOK"

# **Konfigurasi MQTT**
BROKER = "147.93.107.208"
PORT = 1883
TOPIC_PUBLISH = "/esp32/ping"
TOPIC_SUBSCRIBE = "/esp32/response"
CLIENT_ID = "esp32_client"

# **Konfigurasi RFID RC522**
spi = SPI(2, baudrate=2500000, polarity=0, phase=0)
rdr = mfrc522.MFRC522(spi=spi, gpioRst=4, gpioCs=5)

# **Konfigurasi OLED**
i2c = I2C(scl=Pin(22), sda=Pin(21))
oled = ssd1306.SSD1306_I2C(128, 64, i2c)

# **Fungsi untuk menampilkan teks di OLED**
def show_oled(text):
    oled.fill(0)  # Bersihkan layar
    oled.text(text, 0, 20)
    oled.show()

# **Fungsi untuk menghubungkan ke WiFi**
def connect_wifi():
    wlan = network.WLAN(network.STA_IF)
    wlan.active(True)
    
    if not wlan.isconnected():
        print("Menghubungkan ke WiFi...", end="")
        wlan.connect(SSID, PASSWORD)
        
        timeout = 10
        for _ in range(timeout):
            if wlan.isconnected():
                print("\nWiFi Terhubung:", wlan.ifconfig())
                show_oled("WiFi Terhubung")
                return True
            print(".", end="")
            time.sleep(1)
        
        print("\nWiFi Gagal")
        show_oled("WiFi Gagal")
        return False
    else:
        print("Sudah terhubung ke WiFi:", wlan.ifconfig())
        return True

# Callback untuk menerima data dari MQTT dan menampilkannya di OLED
def on_mqtt_message(topic, msg):
    message = msg.decode('utf-8')
    print(f"Pesan dari MQTT: {message}")
    show_oled(f"Resp: {message}")  # Menampilkan pesan di OLED

# Fungsi untuk menghubungkan ke MQTT dengan callback yang benar
def connect_mqtt():
    client = MQTTClient(CLIENT_ID, BROKER, PORT)
    client.set_callback(on_mqtt_message)  # Jangan pakai kurung, cukup referensi fungsi

    while True:
        try:
            client.connect()
            client.subscribe(TOPIC_SUBSCRIBE)  # Subscribe ke topic
            print(f"Terhubung ke MQTT & Berlangganan {TOPIC_SUBSCRIBE}")
            show_oled("MQTT Terhubung")
            return client
        except OSError as e:
            print(f"MQTT Gagal: {e}, retry...")
            show_oled("MQTT Gagal")
            time.sleep(5)

# Program utama
connect_wifi()
mqtt_client = connect_mqtt()

print("Tunggu kartu RFID...")

last_uid = None
card_present = False

while True:
    mqtt_client.check_msg()  # Periksa apakah ada pesan baru dari MQTT

    (stat, tag_type) = rdr.request(rdr.REQIDL)  # Cari kartu RFID
    if stat == rdr.OK:  # Jika ada kartu yang terdeteksi
        (stat, raw_uid) = rdr.anticoll()
        if stat == rdr.OK:
            card_id = "0x%02x%02x%02x%02x" % (raw_uid[0], raw_uid[1], raw_uid[2], raw_uid[3])
            print(f"Kartu terdeteksi: {card_id}")
            show_oled(f"Scan: {card_id}")

            if not card_present or card_id != last_uid:  # Jika kartu baru ditempelkan
                last_uid = card_id
                card_present = True
                print(f"UID: {card_id} dikirim ke MQTT")
                show_oled(f"UID: {card_id}")

                try:
                    mqtt_client.publish(TOPIC_PUBLISH, card_id)
                    print(f"Pesan terkirim: {card_id} ke {TOPIC_PUBLISH}")
                    show_oled("Data dikirim")
                except OSError:
                    print("MQTT Disconnect, mencoba reconnect...")
                    show_oled("MQTT Reconnect...")
                    mqtt_client = connect_mqtt()

    else:  # Jika kartu tidak ada
        if card_present:
            print("Kartu diangkat, siap scan lagi")
            show_oled("Scan kartu baru")
        card_present = False

    time.sleep(1)  # Percepat loop agar lebih responsif
