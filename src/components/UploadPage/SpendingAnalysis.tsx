import React from 'react'
import type { SpendingAnalysis } from '../../lib/gemini'

interface SpendingAnalysisProps {
  analysis: SpendingAnalysis
}

export function SpendingAnalysis({ analysis }: SpendingAnalysisProps) {
  return (
    <div className="mt-8 bg-white rounded-lg shadow">
      {/* Summary Section */}
      <div className="p-6 border-b">
        <h2 className="text-2xl font-bold mb-4">Spending Summary</h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-gray-50 p-4 rounded">
            <div className="text-sm text-gray-600">Total Spent</div>
            <div className="text-xl font-semibold">${analysis.summary.totalSpent.toLocaleString()}</div>
          </div>
          <div className="bg-gray-50 p-4 rounded">
            <div className="text-sm text-gray-600">Transactions</div>
            <div className="text-xl font-semibold">{analysis.summary.transactionCount}</div>
          </div>
          <div className="bg-gray-50 p-4 rounded">
            <div className="text-sm text-gray-600">Date Range</div>
            <div className="text-xl font-semibold">
              {new Date(analysis.summary.dateRange.start).toLocaleDateString()} - {new Date(analysis.summary.dateRange.end).toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>

      {/* Locations Section */}
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4">Spending Locations</h2>
        <div className="space-y-4">
          {analysis.locations.map((location, index) => (
            <div key={index} className="border rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="text-lg font-semibold">{location.name}</h3>
                  {location.address && (
                    <p className="text-sm text-gray-600">
                      {[location.address, location.city, location.state, location.zip]
                        .filter(Boolean)
                        .join(', ')}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold">${location.totalSpent.toLocaleString()}</div>
                  <div className="text-sm text-gray-600">{location.transactions.length} transactions</div>
                </div>
              </div>
              
              {/* Transactions List */}
              <div className="mt-4 space-y-2">
                {location.transactions.map((transaction, tIndex) => (
                  <div key={tIndex} className="flex justify-between items-center text-sm bg-gray-50 p-2 rounded">
                    <div>
                      <div className="font-medium">
                        {new Date(transaction.date).toLocaleDateString()}
                        {transaction.time && ` at ${transaction.time}`}
                      </div>
                      {transaction.description && (
                        <div className="text-gray-600">{transaction.description}</div>
                      )}
                    </div>
                    <div className="font-semibold">${transaction.amount.toLocaleString()}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
} 