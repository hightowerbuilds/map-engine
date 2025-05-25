import React, { useEffect, useState } from 'react'
import { db } from '../lib/supabase'
import type { Database } from '../lib/supabase'

type SpendingAmount = Database['public']['Tables']['spending_amounts']['Row']

// Define building type with more detailed information
export type BuildingInfo = {
  name: string
  type: string
  description: string
  hours: string
  address: string
  rating?: number
  features: Array<string>
  id?: string
}

interface BuildingModalProps {
  isOpen: boolean
  buildingInfo: BuildingInfo | null
  onClose: () => void
}

export interface ModalManagerHandle {
  addModal: (info: BuildingInfo) => void
}

// Modal manager component
export const ModalManager = React.forwardRef<ModalManagerHandle>((_, ref) => {
  const [currentModal, setCurrentModal] = useState<BuildingInfo | null>(null)

  const addModal = (info: BuildingInfo) => {
    setCurrentModal(info)
  }

  const closeModal = () => {
    setCurrentModal(null)
  }

  React.useImperativeHandle(ref, () => ({
    addModal
  }))

  if (!currentModal) return null

  return (
    <BuildingModal
      isOpen={true}
      buildingInfo={currentModal}
      onClose={closeModal}
    />
  )
})

// Basic modal component
export function BuildingModal({ isOpen, buildingInfo, onClose }: BuildingModalProps) {
  const [transactions, setTransactions] = useState<Array<SpendingAmount>>([])
  const [totalSpent, setTotalSpent] = useState(0)

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!buildingInfo?.id) return
      
      try {
        const amounts = await db.spendingAmounts.getByLocationId(buildingInfo.id)
        setTransactions(amounts)
        const total = await db.spendingAmounts.getTotalByLocationId(buildingInfo.id)
        setTotalSpent(total)
      } catch (err) {
        console.error('Error fetching transactions:', err)
      }
    }
    fetchTransactions()
  }, [buildingInfo?.id])

  if (!isOpen || !buildingInfo) return null

  return (
    <div style={{ 
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000
    }}>
      <div 
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          padding: '20px',
          borderRadius: '10px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          minWidth: '300px',
          maxWidth: '400px',
          backdropFilter: 'blur(5px)',
          fontFamily: 'Courier, monospace',
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
            <h2 style={{ margin: 0, color: '#333', fontFamily: 'Courier, monospace' }}>{buildingInfo.name}</h2>
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
              color: '#666',
              fontFamily: 'Courier, monospace'
            }}
          >
            ×
          </button>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <p style={{ margin: '0 0 10px 0', color: '#444' }}>Total Spent: ${totalSpent.toLocaleString()}</p>
          
          {/* Transactions List */}
          <div style={{ 
            maxHeight: '300px', 
            overflowY: 'auto',
            border: '1px solid #eee',
            borderRadius: '4px',
            padding: '8px'
          }}>
            {transactions.map((transaction) => (
              <div 
                key={transaction.id}
                style={{
                  padding: '8px',
                  borderBottom: '1px solid #eee',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '14px'
                }}
              >
                <div>
                  <div style={{ color: '#333' }}>
                    ${transaction.amount.toLocaleString()}
                  </div>
                  <div style={{ color: '#666', fontSize: '12px' }}>
                    {new Date(transaction.date).toLocaleDateString()}
                  </div>
                  {transaction.description && (
                    <div style={{ color: '#666', fontSize: '12px', fontStyle: 'italic' }}>
                      {transaction.description}
                    </div>
                  )}
                </div>
              </div>
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
              cursor: 'pointer',
              fontFamily: 'Courier, monospace'
            }}
            onClick={() => window.open(`https://www.google.com/search?q=${buildingInfo.name}`, '_blank')}
          >
            Learn More
          </button>
        </div>
      </div>
    </div>
  )
} 