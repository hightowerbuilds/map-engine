import React, { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { AnimatedBackground } from '../components/AnimatedBackground'
import { LoginModal } from '../components/LoginModal'

export function HomePage() {
  const navigate = useNavigate()
  const [showLoginModal, setShowLoginModal] = useState(false)

  return (
    <div className="relative min-h-screen">
      <AnimatedBackground />
      
      {/* Login Modal */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-12 text-center">
        <h1 className="text-5xl font-bold text-white mb-6 font-mono tracking-wider">
          BUSTER
        </h1>
        <p className="text-xl text-white/90 mb-8 max-w-2xl font-mono">
          Visualize your financial journey through time and space
        </p>
        <div className="space-x-4">
          <button
            onClick={() => navigate({ to: '/signup' })}
            className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 font-mono"
          >
            Sign Up
          </button>
          <button
            onClick={() => setShowLoginModal(true)}
            className="px-6 py-3 bg-white/10 backdrop-blur-sm text-white rounded-md hover:bg-white/20 transition-colors duration-200 font-mono"
          >
            Log In
          </button>
        </div>
      </div>
    </div>
  )
} 