import React from 'react'
import { Link, useRouter } from '@tanstack/react-router'
import './styles.css'

export function NavBar() {
  const router = useRouter()
  const currentPath = router.state.location.pathname

  const isActive = (path: string) => currentPath === path

  return (
    <nav className="navbar">
      <Link 
        to="/"
        className="navbar-brand"
      >
        BUSTER
      </Link>

      <div className="navbar-links">
        <Link
          to="/dashboard"
          className={`navbar-link ${isActive('/dashboard') ? 'active' : ''}`}
        >
          Dashboard
        </Link>
        <Link
          to="/neighborhood"
          className={`navbar-link ${isActive('/neighborhood') ? 'active' : ''}`}
        >
          Neighborhood
        </Link>
      </div>
    </nav>
  )
} 