'use client'

import { useState } from 'react'
import type { Category } from '@/types/database.types'

interface SearchFiltersProps {
  categories: Category[]
  onFilterChange: (filters: FilterState) => void
}

export interface FilterState {
  search: string
  status: string
  category: string
  minAmount: string
  maxAmount: string
}

export function SearchFilters({ categories, onFilterChange }: SearchFiltersProps) {
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    status: '',
    category: '',
    minAmount: '',
    maxAmount: '',
  })
  const [isExpanded, setIsExpanded] = useState(false)

  function handleChange(key: keyof FilterState, value: string) {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  function clearFilters() {
    const cleared: FilterState = {
      search: '',
      status: '',
      category: '',
      minAmount: '',
      maxAmount: '',
    }
    setFilters(cleared)
    onFilterChange(cleared)
  }

  const hasActiveFilters = Object.values(filters).some((v) => v !== '')

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            placeholder="Search subscriptions..."
            value={filters.search}
            onChange={(e) => handleChange('search', e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-white placeholder-gray-500 transition"
          />
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`px-4 py-2.5 border rounded-xl transition flex items-center gap-2 ${
            isExpanded || hasActiveFilters
              ? 'bg-purple-500/20 border-purple-500/30 text-purple-300'
              : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
          }`}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
            />
          </svg>
          Filters
          {hasActiveFilters && (
            <span className="w-2 h-2 bg-purple-400 rounded-full" />
          )}
        </button>
      </div>

      {isExpanded && (
        <div className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Status</label>
              <select
                value={filters.status}
                onChange={(e) => handleChange('status', e.target.value)}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm"
              >
                <option value="">All</option>
                <option value="active">Active</option>
                <option value="paused">Paused</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Category</label>
              <select
                value={filters.category}
                onChange={(e) => handleChange('category', e.target.value)}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm"
              >
                <option value="">All</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Min Amount</label>
              <input
                type="number"
                placeholder="$0"
                value={filters.minAmount}
                onChange={(e) => handleChange('minAmount', e.target.value)}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Max Amount</label>
              <input
                type="number"
                placeholder="$999"
                value={filters.maxAmount}
                onChange={(e) => handleChange('maxAmount', e.target.value)}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm"
              />
            </div>
          </div>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-sm text-gray-400 hover:text-white transition"
            >
              Clear all filters
            </button>
          )}
        </div>
      )}
    </div>
  )
}
