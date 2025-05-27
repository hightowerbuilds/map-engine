import { useEffect, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import NeighborhoodScene from '../components/NeighborhoodScene'
import { supabase } from '../lib/supabase'

type Building = {
  id: string
  name: string
  category: string
  position: [number, number, number]
  size: [number, number, number]
  color: string
  totalSpent: number
}

export const Route = createFileRoute('/_index')({
  component: Index,
})

function Index() {
  const [buildings, setBuildings] = useState<Array<Building>>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchBuildings() {
      try {
        setLoading(true)
        setError(null)

        // Fetch buildings from Supabase
        const { data, error: fetchError } = await supabase
          .from('buildings')
          .select('*')

        if (fetchError) {
          throw fetchError
        }

        // Transform the data to match the Building type
        const transformedBuildings: Array<Building> = (data || []).map((building: any) => ({
          id: building.id,
          name: building.name,
          category: building.category,
          position: building.position || [0, 0, 0],
          size: building.size || [1, 1, 1],
          color: building.color || '#808080',
          totalSpent: building.total_spent || 0
        }))

        setBuildings(transformedBuildings)
      } catch (err) {
        console.error('Error fetching buildings:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch buildings')
      } finally {
        setLoading(false)
      }
    }

    fetchBuildings()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-lg">Loading neighborhood...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-lg text-red-600">Error: {error}</p>
      </div>
    )
  }

  return (
    <div style={{ width: '100%', height: '100%', overflow: 'hidden' }}>
      <NeighborhoodScene 
        buildings={buildings}
        onBuildingClick={(building) => {
          console.log('Building clicked:', building)
        }}
      />
    </div>
  )
} 