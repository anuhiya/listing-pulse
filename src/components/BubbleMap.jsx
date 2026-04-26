import { useEffect, useRef } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

mapboxgl.accessToken = 'YOpk.eyJ1IjoiYW51LTEzMTAiLCJhIjoiY21vN3Y3d2cyMGJncjJybjFyajV2em9vcyJ9.rsBkM0UThOLm-VU_P06nMw'

function getColor(fit) {
  if (fit === 'strong') return '#1D9E75'
  if (fit === 'partial') return '#EF9F27'
  return '#E24B4A'
}

function getDistance(lat1, lng1, lat2, lng2) {
  const R = 3958.8
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng/2) * Math.sin(dLng/2)
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
}

function getFit(rent, budget, originLat, originLng, nLat, nLng) {
  const miles = getDistance(originLat, originLng, nLat, nLng)
  const inBudget = rent <= budget
  const inCommute = miles <= 5
  if (inBudget && inCommute) return 'strong'
  if (inBudget) return 'partial'
  return 'over'
}

export default function BubbleMap({ neighborhoods, commuteOrigin, budget, bedroom, onHover, onSelect, selected, mapRef }) {
  const mapContainer = useRef(null)
  const map = useRef(null)
  const markers = useRef([])
  const mapLoaded = useRef(false)

  useEffect(() => {
    if (map.current) return
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [-73.97, 40.73],
      zoom: 10.5
    })
    if (mapRef) mapRef.current = map.current
    map.current.once('load', () => {
      mapLoaded.current = true
    })
  }, [])

  useEffect(() => {
    if (!commuteOrigin || !neighborhoods.length || !map.current) return

    const draw = () => {
      if (!mapLoaded.current) return

      markers.current.forEach(m => m.remove())
      markers.current = []

      try {
        if (map.current.getLayer('commute-ring-border')) map.current.removeLayer('commute-ring-border')
        if (map.current.getLayer('commute-ring')) map.current.removeLayer('commute-ring')
        if (map.current.getSource('commute-ring')) map.current.removeSource('commute-ring')
      } catch(e) {}

      const ringRadius = 0.055
      const points = 64
      const coords = Array.from({ length: points + 1 }, (_, i) => {
        const angle = (i / points) * 2 * Math.PI
        return [
          commuteOrigin.lng + ringRadius * Math.cos(angle) * 1.3,
          commuteOrigin.lat + ringRadius * Math.sin(angle)
        ]
      })

      map.current.addSource('commute-ring', {
        type: 'geojson',
        data: { type: 'Feature', geometry: { type: 'Polygon', coordinates: [coords] } }
      })
      map.current.addLayer({
        id: 'commute-ring',
        type: 'fill',
        source: 'commute-ring',
        paint: { 'fill-color': '#534AB7', 'fill-opacity': 0.08 }
      })
      map.current.addLayer({
        id: 'commute-ring-border',
        type: 'line',
        source: 'commute-ring',
        paint: { 'line-color': '#534AB7', 'line-width': 1.5, 'line-dasharray': [4, 3] }
      })

      const originEl = document.createElement('div')
      originEl.style.cssText = `
        width:14px;height:14px;border-radius:50%;
        background:#534AB7;border:2px solid #fff;cursor:pointer;
      `
      const originMarker = new mapboxgl.Marker({ element: originEl })
        .setLngLat([commuteOrigin.lng, commuteOrigin.lat])
        .addTo(map.current)
      markers.current.push(originMarker)

      neighborhoods.forEach(n => {
        const rent = n[bedroom]
        const fit = getFit(rent, budget, commuteOrigin.lat, commuteOrigin.lng, n.lat, n.lng)
        const color = getColor(fit)
        const isSelected = selected === n.id

        const el = document.createElement('div')
        el.style.cssText = `
          width:${isSelected ? '20px' : '14px'};
          height:${isSelected ? '20px' : '14px'};
          border-radius:50%;
          background:${color};
          border:${isSelected ? '3px solid #fff' : '1.5px solid rgba(255,255,255,0.3)'};
          cursor:pointer;
          opacity:${fit === 'over' ? 0.4 : 0.9};
          transition:all 0.2s;
        `

        el.addEventListener('mouseenter', (e) => onHover && onHover(n, e))
        el.addEventListener('mouseleave', () => onHover && onHover(null, null))
        el.addEventListener('click', () => onSelect && onSelect(n.id))

        const marker = new mapboxgl.Marker({ element: el })
          .setLngLat([n.lng, n.lat])
          .addTo(map.current)

        markers.current.push(marker)
      })
    }

    if (mapLoaded.current) {
      draw()
    } else {
      map.current.once('load', () => {
        mapLoaded.current = true
        draw()
      })
    }
  }, [neighborhoods, commuteOrigin, budget, bedroom, selected])

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />

      {/* Legend */}
      <div style={{
        position: 'absolute', bottom: '32px', left: '16px',
        background: 'rgba(10,20,30,0.85)', border: '1px solid #1a2a3a',
        borderRadius: '8px', padding: '10px 14px', zIndex: 10
      }}>
        <div style={{ fontSize: '10px', color: '#5580A0', marginBottom: '8px', letterSpacing: '0.5px' }}>
          MATCH QUALITY
        </div>
        {[
          { color: '#1D9E75', label: 'Strong match', sub: 'Within budget & commute' },
          { color: '#EF9F27', label: 'Partial match', sub: 'Within budget, far commute' },
          { color: '#E24B4A', label: 'Over budget', sub: 'Exceeds your budget' },
        ].map(item => (
          <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <div style={{
              width: '12px', height: '12px', borderRadius: '50%',
              background: item.color, flexShrink: 0
            }} />
            <div>
              <div style={{ fontSize: '11px', color: '#B5D4F4' }}>{item.label}</div>
              <div style={{ fontSize: '10px', color: '#5580A0' }}>{item.sub}</div>
            </div>
          </div>
        ))}
        <div style={{
          borderTop: '1px solid #1a2a3a', marginTop: '6px', paddingTop: '6px',
          display: 'flex', alignItems: 'center', gap: '8px'
        }}>
          <div style={{
            width: '12px', height: '12px', borderRadius: '50%',
            background: '#534AB7', flexShrink: 0
          }} />
          <div style={{ fontSize: '11px', color: '#B5D4F4' }}>Commute origin</div>
        </div>
      </div>

    </div>
  )
}