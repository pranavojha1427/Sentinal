import requests
import random
import time

API_URL = "http://localhost:8000/api/v1/citizen/ingest"

# Center: Bhopal, Madhya Pradesh
CENTER_LAT = 23.2599
CENTER_LON = 77.4126

# Hindi & English complaints about Roads
road_complaints = [
    ("hi", "यहाँ की सड़क पूरी तरह टूट चुकी है, बारिश में बहुत दिक्कत होती है।"),
    ("hi", "हमारे इलाके में पिछले एक साल से सड़क नहीं बनी है। गड्ढे ही गड्ढे हैं।"),
    ("en", "The main road is completely destroyed. Need immediate repair."),
    ("hi", "सड़क पर इतने गड्ढे हैं कि रोज़ एक्सीडेंट होते हैं।"),
    ("en", "Terrible road conditions near the market area. Vehicles are getting damaged."),
    ("hi", "रोड निर्माण का काम आधा छोड़ दिया गया है।"),
    ("en", "Contractor left the road work unfinished 6 months ago.")
]

# Random other complaints (Water, Health) that won't cluster enough to form a hotspot
other_complaints = [
    ("hi", "पीने का पानी दो दिन से नहीं आ रहा है।"),
    ("en", "Hospital is lacking basic medicines."),
    ("hi", "बिजली रोज़ 4 घंटे कट रही है।")
]

def generate_random_coordinate(lat, lon, max_offset_deg=0.03):
    # 0.03 degrees is roughly 3km
    return (
        lat + random.uniform(-max_offset_deg, max_offset_deg),
        lon + random.uniform(-max_offset_deg, max_offset_deg)
    )

def simulate():
    print("Starting Participatory Demand Simulation...")
    print("Sending 7 Road complaints (should trigger Hotspot) and 3 random complaints...\n")

    requests_to_send = []

    # 7 Road complaints to ensure clustering (threshold is 5)
    for i in range(7):
        lang, text = random.choice(road_complaints)
        lat, lon = generate_random_coordinate(CENTER_LAT, CENTER_LON)
        requests_to_send.append({
            "phone_number": f"+9198765{random.randint(10000, 99999)}",
            "device_id": f"device_{i}",
            "lat": lat,
            "lon": lon,
            "raw_text": text,
            "language": lang
        })

    # 3 other complaints
    for i in range(3):
        lang, text = random.choice(other_complaints)
        lat, lon = generate_random_coordinate(CENTER_LAT, CENTER_LON, 0.1) # Further away
        requests_to_send.append({
            "phone_number": f"+9199999{random.randint(10000, 99999)}",
            "device_id": f"device_other_{i}",
            "lat": lat,
            "lon": lon,
            "raw_text": text,
            "language": lang
        })

    # Shuffle so they arrive mixed
    random.shuffle(requests_to_send)

    success_count = 0
    for idx, payload in enumerate(requests_to_send):
        print(f"[{idx+1}/10] Sending complaint from {payload['phone_number']}...")
        try:
            resp = requests.post(API_URL, json=payload)
            if resp.status_code == 200:
                print(" -> Received by Ingestion Queue")
                success_count += 1
            else:
                print(f" -> Failed: {resp.status_code} - {resp.text}")
        except Exception as e:
            print(f" -> Connection Error: {e}")
        
        # Wait slightly between requests
        time.sleep(1)

    print(f"\nSimulation complete! Sent {success_count} requests.")
    print("Background Gemini AI and PostGIS processing will take 15-30 seconds to cluster them.")
    print("Check the Next.js map UI to watch the Red Hotspot appear in Bhopal!")

if __name__ == "__main__":
    simulate()
