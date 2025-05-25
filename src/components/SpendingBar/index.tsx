import React from 'react'
import type { Database } from '../../lib/supabase'
import './styles.css'

type SpendingLocation = Database['public']['Tables']['spending_locations']['Row']
type SpendingAmount = Database['public']['Tables']['spending_amounts']['Row']

interface LocationWithTotal extends SpendingLocation {
  totalSpent: number
}

interface SpendingBarProps {
  locations: Array<LocationWithTotal>
  onLocationClick: (location: LocationWithTotal) => void
  selectedLocationId?: string
}

// Generate a green shade based on spending amount
function getGreenShade(totalSpent: number): string {
  // Define min and max spending amounts for color scaling
  const minSpent = 0
  const maxSpent = 1000 // Adjust this based on your typical spending range

  // Normalize the spending amount between 0 and 1
  const normalizedSpent = Math.min(Math.max((totalSpent - minSpent) / (maxSpent - minSpent), 0), 1)

  // Generate a green color where:
  // - Lower amounts are darker green (#1a472a)
  // - Higher amounts are brighter green (#50fa7b)
  const r = Math.floor(26 + (normalizedSpent * (80 - 26))) // 26 to 80
  const g = Math.floor(71 + (normalizedSpent * (250 - 71))) // 71 to 250
  const b = Math.floor(42 + (normalizedSpent * (123 - 42))) // 42 to 123

  return `rgb(${r}, ${g}, ${b})`
}

// Calculate circle size based on spending amount
function calculateCircleSize(totalSpent: number, maxSpent: number): number {
  const minSize = 40 // minimum circle size in pixels
  const maxSize = 120 // maximum circle size in pixels
  const scale = (totalSpent / maxSpent) * (maxSize - minSize) + minSize
  return Math.max(minSize, Math.min(maxSize, scale))
}

export function SpendingBar({ locations, onLocationClick, selectedLocationId }: SpendingBarProps) {
  // Find the maximum spending amount for scaling
  const maxSpent = Math.max(...locations.map(loc => loc.totalSpent))

  return (
    <div className="spending-bar">
      <div className="spending-bar-container">
        {locations.map((location) => {
          const size = calculateCircleSize(location.totalSpent, maxSpent)
          const isSelected = location.id === selectedLocationId
          
          return (
            <div
              key={location.id}
              className={`spending-bar-item ${isSelected ? 'selected' : ''}`}
              onClick={() => onLocationClick(location)}
            >
              <div
                className={`spending-bar-circle ${isSelected ? 'selected' : ''}`}
                style={{
                  width: size,
                  height: size,
                  backgroundColor: getGreenShade(location.totalSpent)
                }}
              >
                <span 
                  className="spending-bar-amount"
                  style={{
                    fontSize: `${Math.max(16, size * 0.22)}px`
                  }}
                >
                  ${Math.round(location.totalSpent).toLocaleString()}
                </span>
              </div>
              <div className="spending-bar-info">
                <p className="spending-bar-name">
                  {location.name}
                </p>
                <p className="spending-bar-category">
                  {location.category}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
} 