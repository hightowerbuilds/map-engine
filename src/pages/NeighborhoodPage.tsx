import React, { useEffect, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import NeighborhoodScene from '../components/NeighborhoodScene'
import { SpendingBar } from '../components/SpendingBar'
import { Layout } from '../components/Layout'
import { useAuth } from '../contexts/AuthContext'
import { db } from '../lib/supabase'
import type { Database } from '../lib/supabase'
import type { BuildingInfo } from '../features/BuildingModal/index'

type SpendingLocation = Database['public']['Tables']['spending_locations']['Row']
type SpendingAmount = Database['public']['Tables']['spending_amounts']['Row']

interface LocationWithTotal extends SpendingLocation {
  totalSpent: number
}

// Base building dimensions [width, height, depth] for Three.js box geometry
const BASE_BUILDING_SIZE: [number, number, number] = [1.0, 1.65, 1.0] // [width, height, depth] - width and depth increased from 0.25 to 1.0
const HEIGHT_PER_DOLLAR = BASE_BUILDING_SIZE[1] / 10 // 0.165 units per dollar

// Helper function to generate a position for a building
function generatePosition(index: number, total: number, buildingHeight: number): [number, number, number] {
  // Calculate position in a single row
  const spacing = 3 // Space between buildings
  const x = (index - (total - 1) / 2) * spacing // Center the row around x=0
  const z = 0 // All buildings in the same z-plane
  
  // Position buildings on the ground by setting Y to half their height
  const y = buildingHeight / 2
  
  return [x, y, z]
}

// Generate a bright, unique color for each building
function generateBrightColor(index: number): string {
  // Array of bright, vibrant colors
  const brightColors = [
    '#FF6B6B', // Bright red
    '#4ECDC4', // Turquoise
    '#FFD93D', // Bright yellow
    '#95E1D3', // Mint
    '#FF8B94', // Coral
    '#6C5CE7', // Bright purple
    '#00B894', // Emerald
    '#FFA502', // Orange
    '#70A1FF', // Sky blue
    '#FF9FF3', // Pink
    '#54A0FF', // Blue
    '#FF9F43', // Light orange
    '#00D2D3', // Teal
    '#FF6B81', // Rose
    '#48DBFB', // Light blue
    '#1DD1A1', // Green
    '#FECA57', // Yellow
    '#FF9FF3', // Light pink
    '#5F27CD', // Deep purple
    '#FF9F43', // Peach
    '#00D2D3', // Cyan
    '#FF6B81', // Salmon
    '#48DBFB', // Aqua
    '#1DD1A1', // Mint green
    '#FECA57', // Gold
  ]

  // Use modulo to cycle through colors if we have more buildings than colors
  return brightColors[index % brightColors.length]
}

export function NeighborhoodPage() {
  const navigate = useNavigate()
  const { user: authUser, loading: authLoading } = useAuth()
  const [spendingLocations, setSpendingLocations] = useState<Array<LocationWithTotal>>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedLocationId, setSelectedLocationId] = useState<string | undefined>()

  useEffect(() => {
    const fetchLocations = async () => {
      if (authLoading) return
      if (!authUser) {
        navigate({ to: '/' })
        return
      }

      try {
        const locations = await db.spendingLocations.getByUserId(authUser.id)
        
        // Get totals for each location
        const locationsWithTotals = await Promise.all(
          locations.map(async (location) => {
            const total = await db.spendingAmounts.getTotalByLocationId(location.id)
            return { ...location, totalSpent: total }
          })
        )
        
        setSpendingLocations(locationsWithTotals)
      } catch (err) {
        console.error('Error fetching spending locations:', err)
        setError(err instanceof Error ? err.message : 'Failed to load spending locations')
      } finally {
        setLoading(false)
      }
    }

    fetchLocations()
  }, [authUser, authLoading, navigate])

  // Transform spending locations into buildings, maintaining original order
  const buildings = spendingLocations.map((location, index) => {
    // Calculate total height based on spending
    const spendingHeight = location.totalSpent * HEIGHT_PER_DOLLAR
    const totalHeight = BASE_BUILDING_SIZE[1] + spendingHeight
    
    const size: [number, number, number] = [
      BASE_BUILDING_SIZE[0],
      totalHeight,
      BASE_BUILDING_SIZE[2]
    ]
    
    // Pass the total height to generatePosition
    const position = generatePosition(index, spendingLocations.length, totalHeight)
    
    return {
      id: location.id,
      name: location.name,
      category: location.category,
      position,
      size,
      color: generateBrightColor(index),
      totalSpent: location.totalSpent,
      originalIndex: index // Add original index to maintain order
    }
  })

  // Sort buildings by their original index to maintain Dashboard order
  const sortedBuildings = [...buildings].sort((a, b) => a.originalIndex - b.originalIndex)

  const handleBuildingClick = (info: BuildingInfo) => {
    // Find the corresponding spending location
    const location = spendingLocations.find(loc => loc.name === info.name)
    if (location) {
      console.log('Selected spending location:', location)
      // You could add more detailed information here
      // For example, you could show transaction history for this location
    }
  }

  const handleLocationClick = (location: LocationWithTotal) => {
    setSelectedLocationId(location.id)
    // Find the corresponding building and trigger its click
    const building = buildings.find(b => b.id === location.id)
    if (building) {
      handleBuildingClick({
        name: building.name,
        type: building.category,
        description: `Total Spent: $${building.totalSpent.toLocaleString()}`,
        hours: 'Hours not available',
        address: 'Address not available',
        features: []
      })
    }
  }

  // Show loading state
  if (authLoading || loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 p-8 font-mono">
          <div className="max-w-4xl mx-auto">
            <p className="text-gray-600">Loading neighborhood...</p>
          </div>
        </div>
      </Layout>
    )
  }

  // Show error state
  if (error) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 p-8 font-mono">
          <div className="max-w-4xl mx-auto">
            <p className="text-red-600">{error}</p>
            <button
              onClick={() => navigate({ to: '/' })}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Return to Home
            </button>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout fullScreen>
      <div className="relative w-full h-full">
        <NeighborhoodScene buildings={sortedBuildings} onBuildingClick={handleBuildingClick} />
        <SpendingBar 
          locations={spendingLocations}
          onLocationClick={handleLocationClick}
          selectedLocationId={selectedLocationId}
        />
      </div>
    </Layout>
  )
} 