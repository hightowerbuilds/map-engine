import React, { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { db } from '../lib/supabase'

interface SpendingLocation {
  name: string
  category: string
}

export function SignUpPage() {
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    bank: '',
    currentBalance: '',
    address: '',
    spendingLocations: [
      { name: '', category: '' },
      { name: '', category: '' },
      { name: '', category: '' },
      { name: '', category: '' },
      { name: '', category: '' }
    ] as Array<SpendingLocation>
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      // Create user in the database
      const userData = {
        email: formData.email,
        first_name: formData.firstName,
        last_name: formData.lastName,
        bank: formData.bank,
        current_balance: parseFloat(formData.currentBalance),
        address: formData.address
      }

      // Create user and get the response with the generated id
      const newUser = await db.users.create(userData)

      if (!newUser?.id) {
        throw new Error('Failed to create user: No user ID returned')
      }

      // Create spending locations for the user
      const spendingLocationPromises = formData.spendingLocations
        .filter(location => location.name && location.category) // Only create non-empty locations
        .map(location => 
          db.spendingLocations.create({
            user_id: newUser.id,
            name: location.name,
            category: location.category
          })
        )

      await Promise.all(spendingLocationPromises)

      // Navigate to home page after successful signup
      navigate({ to: '/' })
    } catch (err) {
      console.error('Signup error:', err)
      setError(err instanceof Error ? err.message : 'An error occurred during signup')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSpendingLocationChange = (index: number, field: keyof SpendingLocation, value: string) => {
    const newSpendingLocations = [...formData.spendingLocations]
    newSpendingLocations[index] = {
      ...newSpendingLocations[index],
      [field]: value
    }
    setFormData({ ...formData, spendingLocations: newSpendingLocations })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-light text-gray-900 mb-4">
            Welcome to Map Engine
          </h1>
          <p className="text-lg text-gray-600">
            Let's get started with your financial journey
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white shadow-lg rounded-lg p-8">
          <div className="space-y-8">
            {/* Personal Information */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                  First Name
                </label>
                <input
                  type="text"
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                  Last Name
                </label>
                <input
                  type="text"
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
                disabled={isSubmitting}
              />
            </div>

            {/* Banking Information */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="bank" className="block text-sm font-medium text-gray-700">
                  Bank Name
                </label>
                <input
                  type="text"
                  id="bank"
                  value={formData.bank}
                  onChange={(e) => setFormData({ ...formData, bank: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label htmlFor="currentBalance" className="block text-sm font-medium text-gray-700">
                  Current Balance
                </label>
                <input
                  type="number"
                  id="currentBalance"
                  value={formData.currentBalance}
                  onChange={(e) => setFormData({ ...formData, currentBalance: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                  min="0"
                  step="0.01"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* Address */}
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                Address
              </label>
              <input
                type="text"
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
                placeholder="Street address, City, State, ZIP"
                disabled={isSubmitting}
              />
            </div>

            {/* Spending Locations */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Top 5 Spending Locations</h3>
              <p className="text-sm text-gray-500">
                Please list the places where you spend money most frequently
              </p>
              
              {formData.spendingLocations.map((location, index) => (
                <div key={index} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor={`location-${index}`} className="block text-sm font-medium text-gray-700">
                      Location {index + 1}
                    </label>
                    <input
                      type="text"
                      id={`location-${index}`}
                      value={location.name}
                      onChange={(e) => handleSpendingLocationChange(index, 'name', e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="e.g., Starbucks, Target, etc."
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                  <div>
                    <label htmlFor={`category-${index}`} className="block text-sm font-medium text-gray-700">
                      Category
                    </label>
                    <input
                      type="text"
                      id={`category-${index}`}
                      value={location.category}
                      onChange={(e) => handleSpendingLocationChange(index, 'category', e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="e.g., Coffee, Groceries, etc."
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Submit Button */}
            <div className="pt-6">
              <button
                type="submit"
                className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 ${
                  isSubmitting ? 'opacity-75 cursor-not-allowed' : ''
                }`}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Creating Account...' : 'Complete Sign Up'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
} 