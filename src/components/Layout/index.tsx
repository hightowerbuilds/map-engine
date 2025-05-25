import React from 'react'
import { NavBar } from '../NavBar'
import './styles.css'

interface LayoutProps {
  children: React.ReactNode
  fullScreen?: boolean
}

export function Layout({ children, fullScreen = false }: LayoutProps) {
  return (
    <div className="layout">
      <NavBar />
      <main className={`layout-main ${fullScreen ? 'layout-main-fullscreen' : 'layout-main-normal'}`}>
        {children}
      </main>
    </div>
  )
} 