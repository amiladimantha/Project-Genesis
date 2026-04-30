'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createSubscription } from '@/app/dashboard/actions/subscriptions'
import { Modal } from '@/app/dashboard/components/Modal'

interface ImportCSVModalProps {
  isOpen: boolean
  onClose: () => void
}

export function ImportCSVModal({ isOpen, onClose }: ImportCSVModalProps) {
  const [csvData, setCsvData] = useState('')
  const [isPending, startTransition] = useTransition()
  const [results, setResults] = useState<{ success: number; failed: number } | null>(null)
  const router = useRouter()

  const sampleCSV = `name,amount,currency,billing_cycle,next_payment_date
Netflix,15.99,USD,monthly,2024-02-01
Spotify,10.99,USD,monthly,2024-02-05
Adobe CC,59.99,USD,monthly,2024-02-10`

  async function handleImport() {
    const lines = csvData.trim().split('\n')
    if (lines.length < 2) {
      alert('Please provide CSV data with headers and at least one row')
      return
    }

    const headers = lines[0].split(',').map((h) => h.trim().toLowerCase())
    const requiredHeaders = ['name', 'amount', 'billing_cycle', 'next_payment_date']
    const missingHeaders = requiredHeaders.filter((h) => !headers.includes(h))

    if (missingHeaders.length > 0) {
      alert(`Missing required columns: ${missingHeaders.join(', ')}`)
      return
    }

    let success = 0
    let failed = 0

    startTransition(async () => {
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map((v) => v.trim())
        const row: Record<string, string> = {}
        headers.forEach((h, idx) => {
          row[h] = values[idx] || ''
        })

        const formData = new FormData()
        formData.set('name', row.name)
        formData.set('amount', row.amount)
        formData.set('currency', row.currency || 'USD')
        formData.set('billing_cycle', row.billing_cycle)
        formData.set('next_payment_date', row.next_payment_date)

        const result = await createSubscription(formData)
        if (result.error) {
          failed++
        } else {
          success++
        }
      }

      setResults({ success, failed })
      router.refresh()
    })
  }

  function handleClose() {
    setCsvData('')
    setResults(null)
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Import from CSV">
      <div className="space-y-4">
        {results ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-emerald-500/20 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-lg font-semibold text-white mb-2">Import Complete</p>
            <p className="text-gray-400">
              {results.success} imported successfully
              {results.failed > 0 && `, ${results.failed} failed`}
            </p>
            <button
              onClick={handleClose}
              className="mt-6 px-6 py-2 bg-white/10 rounded-xl text-white hover:bg-white/20 transition"
            >
              Done
            </button>
          </div>
        ) : (
          <>
            <div>
              <label className="block text-sm text-gray-300 mb-2">
                Paste your CSV data below
              </label>
              <textarea
                value={csvData}
                onChange={(e) => setCsvData(e.target.value)}
                placeholder={sampleCSV}
                rows={8}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 font-mono text-sm outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl">
              <p className="text-sm text-blue-300">
                <strong>Required columns:</strong> name, amount, billing_cycle, next_payment_date
              </p>
              <p className="text-sm text-blue-300 mt-1">
                <strong>Optional:</strong> currency (defaults to USD)
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleClose}
                className="flex-1 py-3 px-4 bg-white/5 border border-white/10 text-white font-medium rounded-xl hover:bg-white/10 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleImport}
                disabled={isPending || !csvData.trim()}
                className="flex-1 py-3 px-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:opacity-90 disabled:opacity-50 text-white font-semibold rounded-xl transition"
              >
                {isPending ? 'Importing...' : 'Import'}
              </button>
            </div>
          </>
        )}
      </div>
    </Modal>
  )
}
