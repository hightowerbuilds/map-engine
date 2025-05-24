import React from 'react'
import { Link } from '@tanstack/react-router'
import { AnimatedBackground } from '../components/AnimatedBackground'

export function HomePage() {
  return (
    <div className="relative min-h-screen">
      <AnimatedBackground />
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-8 text-center">
        <h1 className="mb-8 text-6xl font-bold text-white">
          Welcome to Map Engine
        </h1>
        <p className="max-w-2xl mb-12 text-xl text-gray-300">
          Explore our interactive 3D neighborhood map and discover local businesses,
          services, and points of interest in your area.
        </p>
        <div className="flex gap-6">
          <Link
            to="/neighborhood"
            className="px-8 py-4 text-lg font-semibold text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            Explore Neighborhood
          </Link>
          <Link
            to="/banking"
            className="px-8 py-4 text-lg font-semibold text-white transition-colors border-2 border-white rounded-lg hover:bg-white/10"
          >
            Banking Services
          </Link>
        </div>
      </div>
    </div>
  )
} 