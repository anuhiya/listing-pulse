function getDistance(lat1, lng1, lat2, lng2) {
  const R = 3958.8
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng/2) * Math.sin(dLng/2)
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
}

function getFit(rent, budget, commuteOrigin, nLat, nLng) {
  const miles = getDistance(commuteOrigin.lat, commuteOrigin.lng, nLat, nLng)
  const inBudget = rent <= budget
  const inCommute = miles <= 5
  if (inBudget && inCommute) return 'strong'
  if (inBudget) return 'partial'
  return 'over'
}

export default function NeighborhoodPanel({ neighborhoods, commuteOrigin, budget, bedroom, selected, onSelect, onPan }) {
  const results = neighborhoods
    .map(n => ({
  ...n,
  rent: n[bedroom],
  commute: Math.round(getDistance(commuteOrigin.lat, commuteOrigin.lng, n.lat, n.lng) * 12),
  fit: getFit(n[bedroom], budget, commuteOrigin, n.lat, n.lng)
}))
    .filter(n => n.fit !== 'over')
    .sort((a, b) => {
      if (a.fit === b.fit) return a.rent - b.rent
      return a.fit === 'strong' ? -1 : 1
    })

  const maxListings = Math.max(...results.map(r => r.listings), 1)

  const matchCount = results.length
  const totalListings = results.reduce((s, r) => s + r.listings, 0)

  return (
    <div style={{
      width: '320px', minWidth: '320px', height: '100%',
      background: '#0f1923', borderLeft: '1px solid #1a2a3a',
      display: 'flex', flexDirection: 'column', overflow: 'hidden'
    }}>

      {/* Summary strip */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr',
        borderBottom: '1px solid #1a2a3a'
      }}>
        <div style={{ padding: '12px 16px', borderRight: '1px solid #1a2a3a' }}>
          <div style={{ fontSize: '22px', fontWeight: 600, color: '#1D9E75' }}>
            {totalListings}
          </div>
          <div style={{ fontSize: '10px', color: '#5580A0' }}>
            listings match your criteria
          </div>
        </div>
        <div style={{ padding: '12px 16px' }}>
          <div style={{ fontSize: '22px', fontWeight: 600, color: '#B5D4F4' }}>
            {matchCount}
          </div>
          <div style={{ fontSize: '10px', color: '#5580A0' }}>
            neighborhoods
          </div>
        </div>
      </div>

      {/* Section header */}
      <div style={{
        padding: '8px 16px', fontSize: '10px', color: '#5580A0',
        letterSpacing: '0.5px', borderBottom: '1px solid #1a2a3a',
        background: '#0a1520'
      }}>
        SUGGESTED NEIGHBORHOODS — ranked by fit
      </div>

      {/* Neighborhood cards */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
        {results.length === 0 && (
          <p style={{ color: '#5580A0', fontSize: '12px', padding: '16px' }}>
            No neighborhoods match. Try increasing your budget.
          </p>
        )}
        {results.map(n => {
          const isSelected = selected === n.id
          const barColor = n.fit === 'strong' ? '#1D9E75' : '#EF9F27'
          const fitLabel = n.fit === 'strong' ? 'Strong match' : 'Partial match'
          const fitBg = n.fit === 'strong' ? '#0a2a1e' : '#2a1e0a'
          const fitColor = n.fit === 'strong' ? '#1D9E75' : '#EF9F27'

          return (
            <div
              key={n.id}
              onClick={() => {
  onSelect(isSelected ? null : n.id)
  onPan && onPan(n.lat, n.lng)
}}
              style={{
                background: isSelected ? '#0a2a1e' : '#0f1923',
                border: `1px solid ${isSelected ? '#1D9E75' : '#1a2a3a'}`,
                borderLeft: `3px solid ${barColor}`,
                borderRadius: '0 8px 8px 0',
                padding: '10px 12px',
                marginBottom: '6px',
                cursor: 'pointer',
                transition: 'all 0.15s'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                <span style={{ fontSize: '12px', fontWeight: 500, color: '#B5D4F4' }}>
                  {n.name}
                  <span style={{ fontSize: '10px', color: '#5580A0', fontWeight: 400 }}>
                    {' '}{n.borough}
                  </span>
                </span>
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#1D9E75' }}>
                  ${n.rent.toLocaleString()}/mo
                </span>
              </div>

              <div style={{ fontSize: '10px', color: '#5580A0', marginBottom: '6px' }}>
                {n.commute} min commute · {n.listings} listings
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  flex: 1, height: '4px', background: '#1a2a3a',
                  borderRadius: '2px', overflow: 'hidden'
                }}>
                  <div style={{
                    height: '100%', borderRadius: '2px',
                    width: `${(n.listings / maxListings) * 100}%`,
                    background: barColor,
                    transition: 'width 0.4s'
                  }} />
                </div>
                <span style={{
                  fontSize: '9px', padding: '2px 6px', borderRadius: '8px',
                  background: fitBg, color: fitColor
                }}>
                  {fitLabel}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
