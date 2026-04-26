import { useState } from 'react'

const BEDROOM_OPTIONS = [
  { value: 'studioRent', label: 'Studio' },
  { value: 'oneBrRent', label: '1 Bedroom' },
  { value: 'twoBrRent', label: '2 Bedrooms' },
  { value: 'threeBrRent', label: '3 Bedrooms' },
]

export default function Controls({ commuteOrigin, setCommuteOrigin, budget, setBudget, bedroom, setBedroom }) {
  const [inputValue, setInputValue] = useState(commuteOrigin?.label || '')
  const [suggestions, setSuggestions] = useState([])
  const [loading, setLoading] = useState(false)

  const MAPBOX_TOKEN = 'pk.eyJ1IjoiYW51LTEzMTAiLCJhIjoiY21vN3Y3d2cyMGJncjJybjFyajV2em9vcyJ9.rsBkM0UThOLm-VU_P06nMw'

  const handleInput = async (e) => {
    const val = e.target.value
    setInputValue(val)
    if (val.length < 3) { setSuggestions([]); return }

    setLoading(true)
    try {
      const res = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(val)}.json?proximity=-73.97,40.73&bbox=-74.25,40.49,-73.70,40.92&access_token=${MAPBOX_TOKEN}&autocomplete=true&limit=5`
      )
      const data = await res.json()
      setSuggestions(data.features || [])
    } catch (e) {
      console.error(e)
    }
    setLoading(false)
  }

  const handleSelect = (feature) => {
    const [lng, lat] = feature.center
    setCommuteOrigin({ lng, lat, label: feature.place_name })
    setInputValue(feature.place_name)
    setSuggestions([])
  }

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1fr 1fr 1fr',
      gap: '16px',
      padding: '16px 24px',
      background: '#042C53',
      borderBottom: '1px solid #185FA5',
      position: 'relative',
      zIndex: 100
    }}>

      {/* Commute Origin */}
      <div style={{ position: 'relative' }}>
        <p style={{ color: '#85B7EB', fontSize: '11px', margin: '0 0 6px' }}>
          Where are you commuting from?
        </p>
        <input
          type="text"
          value={inputValue}
          onChange={handleInput}
          placeholder="Type your workplace address..."
          style={{
            width: '100%', padding: '6px 8px', borderRadius: '6px',
            border: '1px solid #185FA5', background: '#0C447C',
            color: '#B5D4F4', fontSize: '12px', boxSizing: 'border-box'
          }}
        />
        {loading && (
          <div style={{ color: '#5580A0', fontSize: '11px', marginTop: '4px' }}>
            Searching...
          </div>
        )}
        {suggestions.length > 0 && (
          <div style={{
            position: 'absolute', top: '100%', left: 0, right: 0,
            background: '#0C447C', border: '1px solid #185FA5',
            borderRadius: '6px', zIndex: 200, marginTop: '2px'
          }}>
            {suggestions.map(s => (
              <div
                key={s.id}
                onClick={() => handleSelect(s)}
                style={{
                  padding: '8px 10px', cursor: 'pointer',
                  color: '#B5D4F4', fontSize: '11px',
                  borderBottom: '1px solid #185FA5'
                }}
                onMouseEnter={e => e.target.style.background = '#185FA5'}
                onMouseLeave={e => e.target.style.background = 'transparent'}
              >
                {s.place_name}
              </div>
            ))}
          </div>
        )}
        {commuteOrigin && (
          <div style={{ color: '#1D9E75', fontSize: '10px', marginTop: '4px' }}>
            {commuteOrigin.label.split(',')[0]}
          </div>
        )}
      </div>

      {/* Budget Slider */}
      <div>
        <p style={{ color: '#85B7EB', fontSize: '11px', margin: '0 0 6px' }}>
          Monthly budget: <strong style={{ color: '#B5D4F4' }}>${budget.toLocaleString()}</strong>
        </p>
        <input
          type="range"
          min={1000} max={5000} step={100}
          value={budget}
          onChange={e => setBudget(Number(e.target.value))}
          style={{ width: '100%' }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#5580A0', fontSize: '10px' }}>
          <span>$1,000</span>
          <span>$5,000</span>
        </div>
      </div>

      {/* Bedrooms */}
      <div>
        <p style={{ color: '#85B7EB', fontSize: '11px', margin: '0 0 6px' }}>
          Bedrooms
        </p>
        <select
          value={bedroom}
          onChange={e => setBedroom(e.target.value)}
          style={{
            width: '100%', padding: '6px 8px', borderRadius: '6px',
            border: '1px solid #185FA5', background: '#0C447C',
            color: '#B5D4F4', fontSize: '12px'
          }}
        >
          {BEDROOM_OPTIONS.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

    </div>
  )
}