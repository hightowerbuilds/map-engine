import React from 'react'
import { Link, useRouter } from '@tanstack/react-router'

export function NavBar() {
  const router = useRouter()
  const currentPath = router.state.location.pathname

  const isActive = (path: string) => currentPath === path

  const navStyle = {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(10px)',
    padding: '1rem 2rem',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  }

  const linkContainerStyle = {
    display: 'flex',
    gap: '2rem',
    alignItems: 'center'
  }

  const linkStyle = (active: boolean) => ({
    textDecoration: 'none',
    color: active ? '#4a90e2' : '#666',
    fontWeight: active ? '600' : '400',
    padding: '0.5rem 1rem',
    borderRadius: '5px',
    transition: 'all 0.2s ease',
    backgroundColor: active ? 'rgba(74, 144, 226, 0.1)' : 'transparent'
  })

  return (
    <nav style={navStyle}>
      <Link 
        to="/"
        style={{
          textDecoration: 'none',
          color: '#333',
          fontSize: '1.5rem',
          fontWeight: 'bold',
          fontFamily: 'monospace',
          letterSpacing: '0.1em'
        }}
      >
        BUSTER
      </Link>

      <div style={linkContainerStyle}>
        <Link
          to="/dashboard"
          style={linkStyle(isActive('/dashboard'))}
        >
          Dashboard
        </Link>
        <Link
          to="/neighborhood"
          style={linkStyle(isActive('/neighborhood'))}
        >
          Neighborhood
        </Link>
      </div>
    </nav>
  )
} 