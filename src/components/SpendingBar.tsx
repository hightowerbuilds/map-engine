import React from 'react'
import type { Database } from '../lib/supabase'

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

// Helper function to generate a color based on category (reusing from NeighborhoodPage)
function getColorForCategory(category: string): string {
  const colors: { [key: string]: string } = {
    'Restaurant': '#e24a4a',
    'Retail': '#4a90e2',
    'Entertainment': '#e2a84a',
    'Services': '#50c878',
    'Transportation': '#9b4ae2',
    'Healthcare': '#e24a9b',
    'Education': '#4ae2d9',
    'Other': '#808080'
  }
  
  return colors[category] || '#808080'
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
    <div 
      className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-gray-200 shadow-lg"
      style={{ 
        height: '180px',
        zIndex: 1000,
        padding: '24px',
        overflowX: 'auto',
        whiteSpace: 'nowrap'
      }}
    >
      <div 
        className="flex items-center gap-10 px-6"
        style={{ 
          minWidth: 'min-content',
          height: '100%'
        }}
      >
        {locations.map((location) => {
          const size = calculateCircleSize(location.totalSpent, maxSpent)
          const isSelected = location.id === selectedLocationId
          
          return (
            <div
              key={location.id}
              className="flex flex-col items-center cursor-pointer group hover:-translate-y-1 transition-transform duration-200"
              onClick={() => onLocationClick(location)}
              style={{ 
                transform: isSelected ? 'scale(1.1)' : 'scale(1)'
              }}
            >
              <div
                className={`relative rounded-full flex items-center justify-center transition-all duration-200 ${
                  isSelected ? 'ring-4 ring-blue-500 shadow-lg' : 'shadow-md'
                }`}
                style={{
                  width: size,
                  height: size,
                  backgroundColor: getColorForCategory(location.category)
                }}
              >
                <span 
                  className="text-white font-mono text-sm font-bold"
                  style={{
                    fontSize: `${Math.max(14, size * 0.2)}px`
                  }}
                >
                  ${Math.round(location.totalSpent).toLocaleString()}
                </span>
              </div>
              <div 
                className="mt-3 text-center"
                style={{
                  maxWidth: size,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
              >
                <p className="text-sm font-medium text-gray-900 truncate">
                  {location.name}
                </p>
                <p className="text-xs text-gray-500 mt-1">
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