import { useEffect, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Layout } from '../components/Layout'
import { EditLocationModal } from '../components/EditLocationModal'
import { AddLocationModal } from '../components/AddLocationModal'
import { useAuth } from '../contexts/AuthContext'
import { auth, db } from '../lib/supabase'
import type { Database } from '../lib/supabase'

type User = Database['public']['Tables']['users']['Row']
type SpendingLocation = Database['public']['Tables']['spending_locations']['Row']

interface LocationWithTotal extends SpendingLocation {
  totalSpent: number
}

export function DashboardPage() {
  const navigate = useNavigate()
  const { user: authUser, loading: authLoading, session } = useAuth()
  const [user, setUser] = useState<User | null>(null)
  const [locationsWithTotals, setLocationsWithTotals] = useState<Array<LocationWithTotal>>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [editingLocation, setEditingLocation] = useState<SpendingLocation | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await auth.signOut()
      navigate({ to: '/' })
    } catch (err) {
      console.error('Error signing out:', err)
      setError('Failed to sign out')
    } finally {
      setIsLoggingOut(false)
    }
  }

  // Debug log auth state
  useEffect(() => {
    console.log('Dashboard: Auth state:', { authUser, authLoading, session })
  }, [authUser, authLoading, session])

  const fetchLocationsWithTotals = async () => {
    if (!authUser) return

    try {
      console.log('Dashboard: Fetching locations for user:', authUser.id)
      const locations = await db.spendingLocations.getByUserId(authUser.id)
      console.log('Dashboard: Fetched locations:', locations)
      
      // Get all totals in a single query
      const totals = await db.spendingAmounts.getAllTotalsByLocationIds(locations.map(loc => loc.id))
      console.log('Dashboard: Fetched totals:', Object.fromEntries(totals))
      
      // Combine locations with their totals
      const locationsWithTotalsData = locations.map(location => {
        const total = totals.get(location.id) || 0
        console.log(`Dashboard: Location ${location.id} (${location.name}) total:`, total)
        return {
          ...location,
          totalSpent: total
        }
      })
      
      console.log('Dashboard: Combined locations with totals:', locationsWithTotalsData)
      setLocationsWithTotals(locationsWithTotalsData)
    } catch (err) {
      console.error('Error fetching locations:', err)
      setError(err instanceof Error ? err.message : 'Failed to load locations')
    }
  }

  useEffect(() => {
    const fetchUserData = async () => {
      console.log('Dashboard: Starting fetchUserData', { authLoading, authUser })
      
      if (authLoading) {
        console.log('Dashboard: Still loading auth...')
        return
      }

      if (!authUser) {
        console.log('Dashboard: No auth user, redirecting to home')
        navigate({ to: '/' })
        return
      }

      try {
        console.log('Dashboard: Fetching user data for ID:', authUser.id)
        const userData = await db.users.getById(authUser.id)
        console.log('Dashboard: User data fetched:', userData)
        
        // Check for null values in user data
        if (!userData) {
          throw new Error('User data is null')
        }
        if (typeof userData.current_balance !== 'number') {
          console.error('Dashboard: current_balance is not a number:', userData.current_balance)
          throw new Error('Invalid user data: current_balance is not a number')
        }
        
        setUser(userData)
        await fetchLocationsWithTotals()
      } catch (err) {
        console.error('Dashboard: Error fetching user data:', err)
        setError(err instanceof Error ? err.message : 'Failed to load user data')
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [authUser, authLoading, navigate])

  const handleEditLocation = async (updatedLocation: Partial<SpendingLocation>) => {
    if (!updatedLocation.id) return

    try {
      const updated = await db.spendingLocations.update(updatedLocation.id, updatedLocation)
      
      // Update locationsWithTotals
      const total = await db.spendingAmounts.getTotalByLocationId(updated.id)
      setLocationsWithTotals(locations => 
        locations.map(loc => 
          loc.id === updated.id ? { ...updated, totalSpent: total } : loc
        )
      )
    } catch (err) {
      console.error('Error updating location:', err)
      throw err
    }
  }

  const handleAddLocation = async (newLocation: SpendingLocation) => {
    try {
      // Add to locationsWithTotals with 0 total spent
      setLocationsWithTotals(locations => [...locations, { ...newLocation, totalSpent: 0 }])
    } catch (err) {
      console.error('Error adding location:', err)
      setError(err instanceof Error ? err.message : 'Failed to add location')
    }
  }

  // Show loading state while auth is initializing
  if (authLoading) {
    console.log('Dashboard: Rendering auth loading state')
    return (
      <div className="min-h-screen bg-gray-50 p-8 font-mono">
        <div className="max-w-4xl mx-auto">
          <p className="text-gray-600">Initializing authentication...</p>
        </div>
      </div>
    )
  }

  // Show loading state while fetching user data
  if (loading) {
    console.log('Dashboard: Rendering data loading state')
    return (
      <div className="min-h-screen bg-gray-50 p-8 font-mono">
        <div className="max-w-4xl mx-auto">
          <p className="text-gray-600">Loading user data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    console.log('Dashboard: Rendering error state:', error)
    return (
      <div className="min-h-screen bg-gray-50 p-8 font-mono">
        <div className="max-w-4xl mx-auto">
          <p className="text-red-600">Error: {error}</p>
          <button
            onClick={() => navigate({ to: '/' })}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Return to Home
          </button>
        </div>
      </div>
    )
  }

  if (!user) {
    console.log('Dashboard: No user data found')
    return (
      <div className="min-h-screen bg-gray-50 p-8 font-mono">
        <div className="max-w-4xl mx-auto">
          <p className="text-gray-600">No user data found</p>
          <button
            onClick={() => navigate({ to: '/' })}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Return to Home
          </button>
        </div>
      </div>
    )
  }

  console.log('Dashboard: Rendering user data:', user)

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 p-8 font-mono">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <div className="flex gap-4">
              <button
                onClick={() => navigate({ to: '/neighborhood' })}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                Map
              </button>
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {isLoggingOut ? 'Signing out...' : 'Sign out'}
              </button>
            </div>
          </div>

          {/* Header */}
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Welcome, {user.first_name}
              </h1>
              <p className="text-gray-600">Account Dashboard</p>
            </div>
          </div>

          {/* User Information */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Name</p>
                <p className="text-gray-900">{user.first_name} {user.last_name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="text-gray-900">{user.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Bank</p>
                <p className="text-gray-900">{user.bank}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Current Balance</p>
                <p className="text-gray-900">${user.current_balance.toLocaleString()}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-sm text-gray-500">Address</p>
                <p className="text-gray-900">{user.address}</p>
              </div>
            </div>
          </div>

          {/* Spending Locations */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Spending Locations</h2>
              <button
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Add Location
              </button>
            </div>
            <div className="space-y-4">
              {locationsWithTotals.map((location) => (
                <div key={location.id} className="flex justify-between items-center border-b border-gray-100 last:border-0 pb-4 last:pb-0">
                  <div>
                    <p className="text-gray-900">{location.name}</p>
                    <p className="text-sm text-gray-500">{location.category}</p>
                    <p className="text-sm font-medium text-green-600 mt-1">
                      Total Spent: ${location.totalSpent.toLocaleString()}
                    </p>
                  </div>
                  <button
                    onClick={() => setEditingLocation(location)}
                    className="px-3 py-1 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors"
                  >
                    Edit
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <EditLocationModal
        isOpen={!!editingLocation}
        onClose={() => setEditingLocation(null)}
        location={editingLocation}
        onSave={handleEditLocation}
        onSpendingChange={fetchLocationsWithTotals}
      />

      <AddLocationModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={handleAddLocation}
        userId={authUser?.id || ''}
      />
    </Layout>
  )
} 