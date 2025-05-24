import React from 'react'
import { Layout } from '../components/Layout'

export function BankingPage() {
  return (
    <Layout>
      <div style={{
        padding: '2rem',
        backgroundColor: '#f5f5f5'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          <h1 style={{ color: '#333', marginBottom: '2rem' }}>Banking Services</h1>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '2rem'
          }}>
            {/* ATM Locator Card */}
            <div style={{
              backgroundColor: 'white',
              padding: '2rem',
              borderRadius: '10px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              <h2 style={{ color: '#4a90e2', marginBottom: '1rem' }}>ATM Locator</h2>
              <p style={{ color: '#666', marginBottom: '1.5rem' }}>
                Find the nearest ATM to your location. View operating hours and available services.
              </p>
              <button style={{
                backgroundColor: '#4a90e2',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '5px',
                cursor: 'pointer'
              }}>
                Find ATMs
              </button>
            </div>

            {/* Branch Services Card */}
            <div style={{
              backgroundColor: 'white',
              padding: '2rem',
              borderRadius: '10px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              <h2 style={{ color: '#4a90e2', marginBottom: '1rem' }}>Branch Services</h2>
              <p style={{ color: '#666', marginBottom: '1.5rem' }}>
                Locate branches, schedule appointments, and view available services.
              </p>
              <button style={{
                backgroundColor: '#4a90e2',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '5px',
                cursor: 'pointer'
              }}>
                Find Branches
              </button>
            </div>

            {/* Online Banking Card */}
            <div style={{
              backgroundColor: 'white',
              padding: '2rem',
              borderRadius: '10px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              <h2 style={{ color: '#4a90e2', marginBottom: '1rem' }}>Online Banking</h2>
              <p style={{ color: '#666', marginBottom: '1.5rem' }}>
                Access your accounts, transfer funds, and manage your banking needs online.
              </p>
              <button style={{
                backgroundColor: '#4a90e2',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '5px',
                cursor: 'pointer'
              }}>
                Sign In
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
} 