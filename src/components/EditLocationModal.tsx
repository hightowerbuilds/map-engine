import { useState, useEffect } from 'react'
import { db } from '../lib/supabase'
import type { Database } from '../lib/supabase'

type SpendingLocation = Database['public']['Tables']['spending_locations']['Row']
type SpendingAmount = Database['public']['Tables']['spending_amounts']['Row']

interface EditLocationModalProps {
  isOpen: boolean
  onClose: () => void
  location: SpendingLocation | null
  onSave: (location: Partial<SpendingLocation>) => Promise<void>
  onSpendingChange?: () => void
}

const CATEGORIES = [
  'Restaurant',
  'Retail',
  'Entertainment',
  'Services',
  'Transportation',
  'Healthcare',
  'Education',
  'Other'
]

export function EditLocationModal({ isOpen, onClose, location, onSave, onSpendingChange }: EditLocationModalProps) {
  const [name, setName] = useState('')
  const [category, setCategory] = useState('')
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [spendingAmounts, setSpendingAmounts] = useState<Array<SpendingAmount>>([])
  const [totalSpent, setTotalSpent] = useState(0)

  useEffect(() => {
    if (location) {
      setName(location.name)
      setCategory(location.category)
      setAmount('')
      setDescription('')
      setError(null)
      
      // Fetch spending amounts for this location
      const fetchSpendingAmounts = async () => {
        try {
          const amounts = await db.spendingAmounts.getByLocationId(location.id)
          setSpendingAmounts(amounts)
          const total = await db.spendingAmounts.getTotalByLocationId(location.id)
          setTotalSpent(total)
        } catch (err) {
          console.error('Error fetching spending amounts:', err)
          setError('Failed to load spending history')
        }
      }
      
      fetchSpendingAmounts()
    }
  }, [location])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!location) return

    setIsSubmitting(true)
    setError(null)

    try {
      // Save location changes
      await onSave({
        id: location.id,
        name,
        category
      })

      // If there's a new amount, save it
      if (amount && parseFloat(amount) > 0) {
        await db.spendingAmounts.create({
          spending_location_id: location.id,
          amount: parseFloat(amount),
          description: description || null
        })

        // Refresh spending amounts
        const amounts = await db.spendingAmounts.getByLocationId(location.id)
        setSpendingAmounts(amounts)
        const total = await db.spendingAmounts.getTotalByLocationId(location.id)
        setTotalSpent(total)
        
        // Clear amount and description fields
        setAmount('')
        setDescription('')

        // Notify parent that spending has changed
        onSpendingChange?.()
      }

      onClose()
    } catch (err) {
      console.error('Error saving changes:', err)
      setError(err instanceof Error ? err.message : 'Failed to save changes')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteSpending = async (spendingId: string) => {
    if (!location) return

    try {
      await db.spendingAmounts.delete(spendingId)
      
      // Refresh spending amounts
      const amounts = await db.spendingAmounts.getByLocationId(location.id)
      setSpendingAmounts(amounts)
      const total = await db.spendingAmounts.getTotalByLocationId(location.id)
      setTotalSpent(total)

      // Notify parent that spending has changed
      onSpendingChange?.()
    } catch (err) {
      console.error('Error deleting spending:', err)
      setError(err instanceof Error ? err.message : 'Failed to delete spending')
    }
  }

  if (!isOpen || !location) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Edit Location</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Location Details */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Location Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Category</label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          {/* Spending History */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2">Spending History</h3>
            <p className="text-sm text-gray-600 mb-4">Total Spent: ${totalSpent.toLocaleString()}</p>
            
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {spendingAmounts.map((amount) => (
                <div key={amount.id} className="flex justify-between items-center text-sm p-2 bg-gray-50 rounded group">
                  <div className="flex-grow">
                    <p className="font-medium">${amount.amount.toLocaleString()}</p>
                    {amount.description && (
                      <p className="text-gray-600 text-xs">{amount.description}</p>
                    )}
                    <p className="text-gray-500 text-xs">
                      {new Date(amount.date).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteSpending(amount.id)}
                    className="ml-2 px-2 py-1 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Add New Spending */}
          <div className="mt-6 border-t pt-4">
            <h3 className="text-lg font-semibold mb-2">Add New Spending</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Amount</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Description (optional)</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="What was this for?"
                />
              </div>
            </div>
          </div>

          {error && (
            <p className="text-red-600 text-sm mt-2">{error}</p>
          )}

          <div className="flex justify-end gap-4 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 