# The Listing Pulse
### Visualizing NYC's Rental Market Through Commute, Budget, and Supply Data

**Live Demo:** https://anuhiya.github.io/listing-pulse

---

## Overview

The Listing Pulse is an interactive data visualization that reveals the spatial dynamics of New York City's rental market through three user-defined constraints: commute origin, monthly budget, and bedroom count.

Rather than presenting listings one by one, this visualization surfaces the patterns behind them — which neighborhoods offer the best budget-to-commute trade-off, how supply is distributed across the five boroughs, and how dramatically the picture changes as constraints shift.

---

## Features

- **Neighborhood bubble map** — 22 NYC neighborhoods shown as colored circles on a dark Mapbox base map. Green means strong match (within budget and commute), amber means partial match (within budget, far commute), red means over budget.
- **Live geocoding search** — type any real NYC address (e.g. "NYU Tandon", "Columbia University") and the commute ring draws around that exact location using the Mapbox Geocoding API.
- **Commute ring** — a dashed purple ring showing the 5-mile proximity boundary from your typed workplace origin.
- **Ranked neighborhood panel** — neighborhoods sorted by match quality then price, each showing median rent, commute estimate, listing count, and a proportional supply bar.
- **Borough bar chart** — total matching listings aggregated by borough, showing macro-level supply distribution.
- **Cross-view linking** — clicking a neighborhood card smoothly pans the map to that location.
- **Hover tooltips** — shows neighborhood name, median rent, borough, listing count, and estimated commute time.

---

## Data Sources

- **StreetEasy** — median asking rent by neighborhood and bedroom type, updated monthly. Downloaded as CSV files from https://streeteasy.com/blog/download-data/. Current data: March 2026.
- **Rental inventory** — total listing counts per neighborhood from StreetEasy's rental inventory dataset.

---

## Tech Stack

| Technology | Purpose |
|---|---|
| React + Vite | Application shell |
| D3.js v7 | Borough bar chart, proportional bars, animated transitions |
| Mapbox GL JS | Base map, neighborhood bubbles, commute ring |
| Mapbox Geocoding API | Live address search |
| Python | Data pipeline script |
| GitHub Pages | Static site deployment |

---

## Project Structure
listing-pulse/
├── public/
│   └── listings.json          ← real StreetEasy data, 22 neighborhoods
├── scripts/
│   ├── buildListings.py       ← data pipeline script
│   └── *.csv                  ← StreetEasy source files
├── src/
│   ├── components/
│   │   ├── Controls.jsx       ← commute search, budget slider, bedroom dropdown
│   │   ├── BubbleMap.jsx      ← Mapbox map, D3 bubbles, commute ring
│   │   ├── NeighborhoodPanel.jsx  ← ranked neighborhood cards
│   │   └── BoroughChart.jsx   ← D3 borough bar chart
│   ├── data/
│   │   └── commuteTable.js    ← fallback commute lookup
│   ├── App.jsx
│   └── main.jsx
├── package.json
└── vite.config.js

---

## Running Locally

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Open http://localhost:5173 in your browser.

---

## Refreshing the Data

```bash
# Run the data pipeline to fetch latest StreetEasy data
python3 scripts/buildListings.py
```

This reads the StreetEasy CSV files and writes updated rent and inventory data to `public/listings.json`.

---

## Deploying

```bash
npm run deploy
```

Deploys to GitHub Pages at https://anuhiya.github.io/listing-pulse.

---

## Course

CS-GY 6313 / CUSP-GX 6006: Data Visualization  
New York University  
Student: Anuhiya Surekha Suresh Babu (as21237)