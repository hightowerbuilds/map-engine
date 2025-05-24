import React from 'react'

// Define building type with more detailed information
export type BuildingInfo = {
  name: string
  type: string
  description: string
  hours: string
  address: string
  rating?: number
  features: Array<string>
}

interface BuildingModalProps {
  isOpen: boolean
  buildingInfo: BuildingInfo | null
  onClose: () => void
}

export function BuildingModal({ isOpen, buildingInfo, onClose }: BuildingModalProps) {
  if (!isOpen || !buildingInfo) return null

  return (
    <div 
      style={{
        position: 'absolute',
        top: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        padding: '20px',
        borderRadius: '10px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        zIndex: 1000,
        minWidth: '300px',
        maxWidth: '400px',
        backdropFilter: 'blur(5px)',
      }}
    >
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '15px',
        borderBottom: '1px solid #eee',
        paddingBottom: '10px'
      }}>
        <div>
          <h2 style={{ margin: 0, color: '#333' }}>{buildingInfo.name}</h2>
          <p style={{ margin: '5px 0 0 0', color: '#666', fontSize: '0.9em' }}>{buildingInfo.type}</p>
        </div>
        <button 
          onClick={onClose}
          style={{
            border: 'none',
            background: 'none',
            fontSize: '24px',
            cursor: 'pointer',
            padding: '5px',
            color: '#666'
          }}
        >
          ×
        </button>
      </div>

      <div style={{ marginBottom: '15px' }}>
        <p style={{ margin: '0 0 10px 0', color: '#444' }}>{buildingInfo.description}</p>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '5px',
          marginBottom: '10px' 
        }}>
          <span style={{ color: '#666' }}>📍</span>
          <span style={{ color: '#444' }}>{buildingInfo.address}</span>
        </div>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '5px',
          marginBottom: '10px' 
        }}>
          <span style={{ color: '#666' }}>🕒</span>
          <span style={{ color: '#444' }}>{buildingInfo.hours}</span>
        </div>
        {buildingInfo.rating && (
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '5px',
            marginBottom: '10px' 
          }}>
            <span style={{ color: '#666' }}>⭐</span>
            <span style={{ color: '#444' }}>{buildingInfo.rating.toFixed(1)} / 5.0</span>
          </div>
        )}
      </div>

      <div style={{ marginBottom: '15px' }}>
        <h3 style={{ 
          margin: '0 0 10px 0', 
          fontSize: '1em', 
          color: '#333' 
        }}>Features:</h3>
        <div style={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: '8px' 
        }}>
          {buildingInfo.features.map((feature, index) => (
            <span 
              key={index}
              style={{
                backgroundColor: 'rgba(74, 144, 226, 0.1)',
                color: '#4a90e2',
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '0.9em'
              }}
            >
              {feature}
            </span>
          ))}
        </div>
      </div>

      <div style={{ 
        display: 'flex', 
        justifyContent: 'center',
        borderTop: '1px solid #eee',
        paddingTop: '15px'
      }}>
        <button 
          style={{
            padding: '8px 16px',
            backgroundColor: '#f5f5f5',
            color: '#333',
            border: '1px solid #ddd',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
          onClick={() => window.open(`https://www.google.com/search?q=${buildingInfo.name}`, '_blank')}
        >
          Learn More
        </button>
      </div>
    </div>
  )
} 