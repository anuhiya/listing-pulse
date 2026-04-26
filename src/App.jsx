import { useState, useEffect, useRef } from 'react'
import Controls from './components/Controls'
import BubbleMap from './components/BubbleMap'
import NeighborhoodPanel from './components/NeighborhoodPanel'
import BoroughChart from './components/BoroughChart'

const DEFAULT_ORIGIN = {
  lng: -73.9840,
  lat: 40.7549,
  label: 'Midtown Manhattan'
}

function getCommuteMinutes(origin, n) {
  if (!origin) return null
  const R = 3958.8
  const dLat = (n.lat - origin.lat) * Math.PI / 180
  const dLng = (n.lng - origin.lng) * Math.PI / 180
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(origin.lat * Math.PI / 180) * Math.cos(n.lat * Math.PI / 180) *
    Math.sin(dLng/2) * Math.sin(dLng/2)
  const miles = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return Math.round(miles * 12)
}

export default function App() {
  const [commuteOrigin, setCommuteOrigin] = useState(DEFAULT_ORIGIN)
  const [budget, setBudget] = useState(2500)
  const [bedroom, setBedroom] = useState('oneBrRent')
  const [neighborhoods, setNeighborhoods] = useState([])
  const [hovered, setHovered] = useState(null)
  const [selected, setSelected] = useState(null)
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 })
  const mapRef = useRef(null)

  useEffect(() => {
    fetch('/listings.json')
      .then(r => r.json())
      .then(data => {
        setNeighborhoods(data)
      })
  }, [])

  const handleHover = (n, e) => {
    setHovered(n)
    if (e) setTooltipPos({ x: e.clientX, y: e.clientY })
  }

  const handlePan = (lat, lng) => {
    if (mapRef.current) {
      mapRef.current.flyTo({ center: [lng, lat], zoom: 13, duration: 800 })
    }
  }

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#0a0a0a' }}>

      <div style={{
        background: '#042C53', padding: '10px 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between'
      }}>
        <span style={{ color: '#B5D4F4', fontSize: '15px', fontWeight: 600 }}>
          NYC Listing Pulse
        </span>
        <span style={{ color: '#5580A0', fontSize: '11px' }}>
          Live rental market visualization
        </span>
      </div>

      <Controls
        commuteOrigin={commuteOrigin}
        setCommuteOrigin={setCommuteOrigin}
        budget={budget} setBudget={setBudget}
        bedroom={bedroom} setBedroom={setBedroom}
      />

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', position: 'relative' }}>
        <div style={{ flex: 1 }}>
          <BubbleMap
            neighborhoods={neighborhoods}
            commuteOrigin={commuteOrigin}
            budget={budget}
            bedroom={bedroom}
            onHover={handleHover}
            onSelect={setSelected}
            selected={selected}
            mapRef={mapRef}
          />
        </div>

        {hovered && (
          <div style={{
            position: 'fixed',
            left: tooltipPos.x + 14,
            top: tooltipPos.y - 100,
            background: '#0f1923',
            border: '1px solid #1a2a3a',
            borderRadius: '8px',
            padding: '10px 14px',
            pointerEvents: 'none',
            zIndex: 1000,
            minWidth: '170px'
          }}>
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#B5D4F4', marginBottom: '4px' }}>
              {hovered.name}
            </div>
            <div style={{ fontSize: '14px', fontWeight: 600, color: '#1D9E75', marginBottom: '6px' }}>
              ${hovered[bedroom].toLocaleString()}/mo
            </div>
            <div style={{ fontSize: '11px', color: '#5580A0', lineHeight: 1.8 }}>
              {hovered.borough}<br />
              {hovered.listings} listings available<br />
              ~{getCommuteMinutes(commuteOrigin, hovered)} min commute
            </div>
          </div>
        )}

        <div style={{
          width: '320px', minWidth: '320px',
          display: 'flex', flexDirection: 'column',
          borderLeft: '1px solid #1a2a3a', overflow: 'hidden'
        }}>
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <NeighborhoodPanel
              neighborhoods={neighborhoods}
              commuteOrigin={commuteOrigin}
              budget={budget}
              bedroom={bedroom}
              selected={selected}
              onSelect={setSelected}
              onPan={handlePan}
            />
          </div>
          <BoroughChart
            neighborhoods={neighborhoods}
            commuteOrigin={commuteOrigin}
            budget={budget}
            bedroom={bedroom}
          />
        </div>
      </div>

    </div>
  )
}
