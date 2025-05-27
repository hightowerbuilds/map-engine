import { useEffect, useState } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { useAuth } from '../../contexts/AuthContext'
import { db } from '../../lib/supabase'
import type { Database } from '../../lib/supabase'
import './styles.css'

type User = Database['public']['Tables']['users']['Row']

const FONT_FAMILIES = [
  'font-mono',
  'font-sans',
  'font-serif',
  'font-["Times_New_Roman"]',
  'font-["Arial"]',
  'font-["Helvetica"]',
  'font-["Courier_New"]',
  'font-["Georgia"]',
  'font-["Verdana"]',
  'font-["Trebuchet_MS"]',
  'font-["Impact"]',
  'font-["Comic_Sans_MS"]',
  'font-["Palatino"]',
  'font-["Lucida_Sans"]',
  'font-["Tahoma"]',
  'font-["Century_Gothic"]',
  'font-["Calibri"]',
  'font-["Garamond"]',
  'font-["Bookman"]',
  'font-["Avant_Garde"]',
  'font-["Baskerville"]',
  'font-["Bodoni"]',
  'font-["Didot"]',
  'font-["Futura"]',
  'font-["Gill_Sans"]',
  'font-["Optima"]',
  'font-["Rockwell"]',
  'font-["Brush_Script_MT"]',
  'font-["Copperplate"]',
  'font-["Papyrus"]'
]

export function NavBar() {
  const navigate = useNavigate()
  const { user: authUser, signOut } = useAuth()
  const [user, setUser] = useState<User | null>(null)
  const [currentFontIndex, setCurrentFontIndex] = useState(0)

  // Reset font to monospace on mount/refresh
  useEffect(() => {
    setCurrentFontIndex(0)
  }, [])

  useEffect(() => {
    const fetchUserData = async () => {
      if (!authUser) return

      try {
        const userData = await db.users.getById(authUser.id)
        setUser(userData)
      } catch (err) {
        console.error('Error fetching user data:', err)
      }
    }

    fetchUserData()
  }, [authUser])

  const handleLogout = async () => {
    try {
      await signOut()
      navigate({ to: '/' })
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const handleLogoClick = () => {
    setCurrentFontIndex((prevIndex) => (prevIndex + 1) % FONT_FAMILIES.length)
  }

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <span 
          className={`navbar-logo ${FONT_FAMILIES[currentFontIndex]} cursor-pointer`}
          onClick={handleLogoClick}
          title="Click to change font"
        >
          BUSTER
        </span>
      </div>
      <div className="navbar-menu">
        {authUser ? (
          <>
            <span className="navbar-welcome">
              Welcome {user?.first_name || 'User'}!
            </span>
            <Link to="/neighborhood" className="navbar-item">
              Neighborhood
            </Link>
            <Link to="/dashboard" className="navbar-item">
              Dashboard
            </Link>
            <Link to="/upload" className="navbar-item">
              Upload
            </Link>
            <button
              onClick={handleLogout}
              className="navbar-item navbar-logout"
            >
              Log Out
            </button>
          </>
        ) : (
          <>
            <Link to="/signup" className="navbar-item">
              Sign Up
            </Link>
            <Link to="/" className="navbar-item">
              Log In
            </Link>
          </>
        )}
      </div>
    </nav>
  )
} 