import csv
import json
import os

# Neighborhood name mapping from StreetEasy to our system
NEIGHBORHOOD_MAP = {
    "Harlem": {"borough": "Manhattan", "lat": 40.8116, "lng": -73.9465},
    "Washington Heights": {"borough": "Manhattan", "lat": 40.8448, "lng": -73.9330, "rename": "Washington Hts"},
    "Inwood": {"borough": "Manhattan", "lat": 40.8677, "lng": -73.9212},
    "East Harlem": {"borough": "Manhattan", "lat": 40.7957, "lng": -73.9389},
    "Upper West Side": {"borough": "Manhattan", "lat": 40.7870, "lng": -73.9754, "rename": "UWS"},
    "Upper East Side": {"borough": "Manhattan", "lat": 40.7736, "lng": -73.9566, "rename": "UES"},
    "Midtown": {"borough": "Manhattan", "lat": 40.7549, "lng": -73.9840},
    "Chelsea": {"borough": "Manhattan", "lat": 40.7465, "lng": -74.0014},
    "Lower East Side": {"borough": "Manhattan", "lat": 40.7150, "lng": -73.9848, "rename": "LES"},
    "Bushwick": {"borough": "Brooklyn", "lat": 40.6944, "lng": -73.9213},
    "Bedford-Stuyvesant": {"borough": "Brooklyn", "lat": 40.6872, "lng": -73.9418, "rename": "Bed-Stuy"},
    "Crown Heights": {"borough": "Brooklyn", "lat": 40.6694, "lng": -73.9464, "rename": "Crown Hts"},
    "Park Slope": {"borough": "Brooklyn", "lat": 40.6728, "lng": -73.9772},
    "Williamsburg": {"borough": "Brooklyn", "lat": 40.7081, "lng": -73.9571},
    "Astoria": {"borough": "Queens", "lat": 40.7721, "lng": -73.9302},
    "Sunnyside": {"borough": "Queens", "lat": 40.7440, "lng": -73.9229},
    "Jackson Heights": {"borough": "Queens", "lat": 40.7557, "lng": -73.8831, "rename": "Jackson Hts"},
    "Flushing": {"borough": "Queens", "lat": 40.7675, "lng": -73.8330},
    "Forest Hills": {"borough": "Queens", "lat": 40.7196, "lng": -73.8448},
    "Fordham": {"borough": "Bronx", "lat": 40.8611, "lng": -73.8987},
    "Riverdale": {"borough": "Bronx", "lat": 40.8900, "lng": -73.9124},
    "Mott Haven": {"borough": "Bronx", "lat": 40.8084, "lng": -73.9246},
}

def get_latest_value(row, headers):
    # Go from the last column backwards and find the first non-empty value
    for col in reversed(headers[3:]):
        val = row.get(col, "").strip()
        if val and val != "":
            try:
                return int(float(val))
            except:
                continue
    return None

def read_csv(filename):
    data = {}
    filepath = os.path.join(os.path.dirname(__file__), filename)
    if not os.path.exists(filepath):
        print(f"  Warning: {filename} not found, skipping")
        return data
    with open(filepath, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        headers = reader.fieldnames
        for row in reader:
            name = row.get("areaName", "").strip()
            area_type = row.get("areaType", "").strip()
            if area_type != "neighborhood":
                continue
            val = get_latest_value(row, headers)
            if val:
                data[name] = val
    return data

print("Reading CSV files...")
studio   = read_csv("medianAskingRent_Studio.csv")
one_br   = read_csv("medianAskingRent_OneBd.csv")
two_br   = read_csv("medianAskingRent_TwoBd.csv")
three_br = read_csv("medianAskingRent_ThreePlusBd.csv")
inventory = read_csv("rentalInventory_All.csv")

print(f"  Studio: {len(studio)} neighborhoods")
print(f"  1BR: {len(one_br)} neighborhoods")
print(f"  2BR: {len(two_br)} neighborhoods")
print(f"  3BR: {len(three_br)} neighborhoods")
print(f"  Inventory: {len(inventory)} neighborhoods")

output = []
uid = 1

for se_name, info in NEIGHBORHOOD_MAP.items():
    display_name = info.get("rename", se_name)

    s  = studio.get(se_name)
    o  = one_br.get(se_name)
    tw = two_br.get(se_name)
    th = three_br.get(se_name)
    inv = inventory.get(se_name)

    # Use fallbacks if data missing
    s  = s  or (o - 300 if o else 1800)
    o  = o  or (s + 300 if s else 2100)
    tw = tw or (o + 600 if o else 2700)
    th = th or (tw + 700 if tw else 3400)
    inv = inv or 50

    output.append({
        "id": uid,
        "name": display_name,
        "borough": info["borough"],
        "lat": info["lat"],
        "lng": info["lng"],
        "studioRent": s,
        "oneBrRent": o,
        "twoBrRent": tw,
        "threeBrRent": th,
        "listings": inv
    })

    print(f"  {display_name}: studio=${s}, 1BR=${o}, 2BR=${tw}, inventory={inv}")
    uid += 1

out_path = os.path.join(os.path.dirname(__file__), "../public/listings.json")
with open(out_path, "w") as f:
    json.dump(output, f, indent=2)

print(f"\nDone. {len(output)} neighborhoods written to public/listings.json")
