import React, { useEffect, useState } from 'react'
import { db } from '../../lib/supabase'
import type { Database } from '../../lib/supabase'
import './styles.css'

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
    <div className="building-modal-overlay">
      <div className="building-modal-container">
        <div className="building-modal-header">
          <div>
            <h2 className="building-modal-title">{buildingInfo.name}</h2>
            <p className="building-modal-subtitle">{buildingInfo.type}</p>
          </div>
          <button 
            onClick={onClose}
            className="building-modal-close-button"
          >
            ×
          </button>
        </div>

        <div className="building-modal-content">
          <p className="building-modal-total">Total Spent: ${totalSpent.toLocaleString()}</p>
          
          <div className="building-modal-transactions">
            {transactions.map((transaction) => (
              <div 
                key={transaction.id}
                className="building-modal-transaction"
              >
                <div>
                  <div className="building-modal-transaction-amount">
                    ${transaction.amount.toLocaleString()}
                  </div>
                  <div className="building-modal-transaction-date">
                    {new Date(transaction.date).toLocaleDateString()}
                  </div>
                  {transaction.description && (
                    <div className="building-modal-transaction-description">
                      {transaction.description}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
} 