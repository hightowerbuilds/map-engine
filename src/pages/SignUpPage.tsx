import React, { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { db } from '../lib/supabase'
import { Modal } from '../components/Modal'

interface SpendingLocation {
  name: string
  category: string
}

interface FormErrors {
  confirmPassword?: string
}

export function SignUpPage() {
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [formErrors, setFormErrors] = useState<FormErrors>({})
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
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

  const validateForm = (): boolean => {
    const errors: FormErrors = {}
    
    // Only validate password confirmation
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match'
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

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
        address: formData.address,
        password: formData.password // Include password in user data
      }

      // Create user and get the response with the generated id
      const newUser = await db.users.create(userData)

      if (!newUser?.id) {
        throw new Error('Failed to create user: No user ID returned')
      }

      // Create spending locations for the user
      const spendingLocationPromises = formData.spendingLocations
        .filter(location => location.name && location.category)
        .map(location => 
          db.spendingLocations.create({
            user_id: newUser.id,
            name: location.name,
            category: location.category
          })
        )

      await Promise.all(spendingLocationPromises)

      // Show success modal instead of navigating immediately
      setShowSuccessModal(true)
    } catch (err) {
      console.error('Signup error:', err)
      setError(err instanceof Error ? err.message : 'An error occurred during signup')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false)
    navigate({ to: '/' })
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
      {/* Success Modal */}
      <Modal
        isOpen={showSuccessModal}
        onClose={handleSuccessModalClose}
        title="Welcome to Map Engine!"
        showCloseButton={false}
      >
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 mb-4">
            <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
          <p className="text-lg text-gray-600 mb-6">
            Your account has been successfully created! We're excited to have you on board.
          </p>
          <button
            onClick={handleSuccessModalClose}
            className="inline-flex justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            Get Started
          </button>
        </div>
      </Modal>

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

            {/* Email and Password */}
            <div className="space-y-6">
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

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="relative mt-1">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    required
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  Confirm Password
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                    formErrors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                  }`}
                  required
                  disabled={isSubmitting}
                />
                {formErrors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.confirmPassword}</p>
                )}
              </div>
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