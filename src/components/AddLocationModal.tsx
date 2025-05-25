import React, { useState } from 'react'
import { Modal } from './Modal'
import { db } from '../lib/supabase'
import type { Database } from '../lib/supabase'

type SpendingLocation = Database['public']['Tables']['spending_locations']['Row']

interface AddLocationModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (location: SpendingLocation) => void
  userId: string
}

const CATEGORIES = [
  'Restaurant',
  'Groceries',
  'The Internet',
  'Gas',
  'Healthcare',
  'Education',
  'Other'
]

export function AddLocationModal({ isOpen, onClose, onSave, userId }: AddLocationModalProps) {
  const [name, setName] = useState('')
  const [category, setCategory] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !category) return

    setIsSubmitting(true)
    setError(null)

    try {
      const newLocation = await db.spendingLocations.create({
        user_id: userId,
        name,
        category
      })

      onSave(newLocation)
      onClose()
      // Reset form
      setName('')
      setCategory('')
    } catch (err) {
      console.error('Error creating location:', err)
      setError(err instanceof Error ? err.message : 'Failed to create location')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add New Spending Location"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Location Name
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="e.g., Starbucks, Target, etc."
            required
            disabled={isSubmitting}
          />
        </div>

        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700">
            Category
          </label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
            disabled={isSubmitting}
          >
            <option value="">Select a category</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            disabled={isSubmitting || !name || !category}
          >
            {isSubmitting ? 'Adding...' : 'Add Location'}
          </button>
        </div>
      </form>
    </Modal>
  )
} 