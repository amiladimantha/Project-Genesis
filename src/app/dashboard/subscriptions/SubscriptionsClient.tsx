'use client'

import { useState } from 'react'
import { SubscriptionsList } from '../components/SubscriptionsList'
import { AddButtons } from '../components/AddButtons'
import { SearchFilters, type FilterState } from '../components/SearchFilters'
import { PopularServicesModal } from '../components/PopularServicesModal'
import { ImportCSVModal } from '../components/ImportCSVModal'
import { ExportButton } from '../components/ExportButton'
import type { Category } from '@/types/database.types'

type SubscriptionWithCategory = {
  id: string
  user_id: string
  name: string
  amount: number
  currency: string
  billing_cycle: 'monthly' | 'yearly' | 'weekly' | null
  next_payment_date: string
  category_id: string | null
  status: 'active' | 'cancelled' | 'paused'
  created_at: string
  category: Pick<Category, 'id' | 'name' | 'color' | 'icon'> | null
}

interface SubscriptionsClientProps {
  subscriptions: SubscriptionWithCategory[]
  categories: Category[]
}

export function SubscriptionsClient({ subscriptions, categories }: SubscriptionsClientProps) {
  const [showPopularServices, setShowPopularServices] = useState(false)
  const [showImport, setShowImport] = useState(false)
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    status: '',
    category: '',
    minAmount: '',
    maxAmount: '',
  })

  // Filter subscriptions
  const filteredSubscriptions = subscriptions.filter((sub) => {
    // Search term filter
    if (filters.search && !sub.name.toLowerCase().includes(filters.search.toLowerCase())) {
      return false
    }
    // Status filter
    if (filters.status && sub.status !== filters.status) {
      return false
    }
    // Category filter
    if (filters.category && sub.category_id !== filters.category) {
      return false
    }
    // Price range filter
    if (filters.minAmount && sub.amount < parseFloat(filters.minAmount)) {
      return false
    }
    if (filters.maxAmount && sub.amount > parseFloat(filters.maxAmount)) {
      return false
    }
    return true
  })

  return (
    <>
      {/* Header Actions */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <AddButtons categories={categories} />
        <button
          onClick={() => setShowPopularServices(true)}
          className="px-4 py-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl hover:bg-emerald-500/20 transition flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
          </svg>
          Popular Services
        </button>
        <button
          onClick={() => setShowImport(true)}
          className="px-4 py-2 bg-white/5 text-gray-400 border border-white/10 rounded-xl hover:bg-white/10 transition flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          Import CSV
        </button>
        <ExportButton subscriptions={subscriptions} />
      </div>

      {/* Filters */}
      <div className="mb-6">
        <SearchFilters
          categories={categories}
          onFilterChange={setFilters}
        />
      </div>

      {/* Results count */}
      <div className="text-sm text-gray-400 mb-4">
        Showing {filteredSubscriptions.length} of {subscriptions.length} subscriptions
      </div>

      {/* Subscriptions List */}
      <div className="p-6 bg-white/5 border border-white/10 rounded-2xl">
        <SubscriptionsList subscriptions={filteredSubscriptions} categories={categories} />
      </div>

      {/* Modals */}
      <PopularServicesModal
        isOpen={showPopularServices}
        onClose={() => setShowPopularServices(false)}
      />
      <ImportCSVModal
        isOpen={showImport}
        onClose={() => setShowImport(false)}
      />
    </>
  )
}
