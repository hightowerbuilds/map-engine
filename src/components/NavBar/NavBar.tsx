import React from 'react'
import { Link } from '@tanstack/react-router'
import './styles.css'

export function NavBar() {
  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <span className="navbar-logo"> BUSTER </span>
      </div>
      <div className="navbar-menu">
        <Link to="/neighborhood" className="navbar-item">
          Neighborhood
        </Link>
        <Link to="/dashboard" className="navbar-item">
          Dashboard
        </Link>
      </div>
    </nav>
  )
} 