import React from 'react'
import { NavBar } from './NavBar'

interface LayoutProps {
  children: React.ReactNode
  fullScreen?: boolean
}

export function Layout({ children, fullScreen = false }: LayoutProps) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <NavBar />
      <main style={{
        flex: 1,
        marginTop: fullScreen ? 0 : '80px', // Account for fixed navbar
        position: fullScreen ? 'relative' : 'static',
        height: fullScreen ? '100vh' : 'auto'
      }}>
        {children}
      </main>
    </div>
  )
} 