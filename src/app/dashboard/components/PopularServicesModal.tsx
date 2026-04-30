'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { popularServices, serviceCategories, type PopularService } from '@/lib/popular-services'
import { createSubscription } from '@/app/dashboard/actions/subscriptions'
import { Modal } from './Modal'

interface PopularServicesModalProps {
  isOpen: boolean
  onClose: () => void
}

export function PopularServicesModal({ isOpen, onClose }: PopularServicesModalProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('All')
  const [search, setSearch] = useState('')
  const [isPending, startTransition] = useTransition()
  const [adding, setAdding] = useState<string | null>(null)
  const router = useRouter()

  const filteredServices = popularServices.filter((service) => {
    const matchesCategory = selectedCategory === 'All' || service.category === selectedCategory
    const matchesSearch = service.name.toLowerCase().includes(search.toLowerCase())
    return matchesCategory && matchesSearch
  })

  async function handleAddService(service: PopularService) {
    setAdding(service.name)
    
    const formData = new FormData()
    formData.set('name', service.name)
    formData.set('amount', service.amount.toString())
    formData.set('currency', service.currency)
    formData.set('billing_cycle', service.billing_cycle)
    formData.set('next_payment_date', new Date().toISOString().split('T')[0])

    startTransition(async () => {
      const result = await createSubscription(formData)
      if (result.error) {
        alert(result.error)
      } else {
        router.refresh()
        onClose()
      }
      setAdding(null)
    })
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Popular Service">
      <div className="space-y-4">
        {/* Search */}
        <input
          type="text"
          placeholder="Search services..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 outline-none focus:ring-2 focus:ring-purple-500"
        />

        {/* Category Filter */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <button
            onClick={() => setSelectedCategory('All')}
            className={`px-3 py-1.5 text-sm rounded-full whitespace-nowrap transition ${
              selectedCategory === 'All'
                ? 'bg-purple-500 text-white'
                : 'bg-white/5 text-gray-400 hover:text-white'
            }`}
          >
            All
          </button>
          {serviceCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 text-sm rounded-full whitespace-nowrap transition ${
                selectedCategory === cat
                  ? 'bg-purple-500 text-white'
                  : 'bg-white/5 text-gray-400 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Services Grid */}
        <div className="max-h-80 overflow-y-auto space-y-2 pr-2">
          {filteredServices.map((service) => (
            <button
              key={service.name}
              onClick={() => handleAddService(service)}
              disabled={isPending}
              className="w-full flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition disabled:opacity-50 group"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{service.icon}</span>
                <div className="text-left">
                  <p className="font-medium text-white">{service.name}</p>
                  <p className="text-xs text-gray-500">{service.category}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="font-semibold text-white">${service.amount}</p>
                  <p className="text-xs text-gray-500">/{service.billing_cycle}</p>
                </div>
                {adding === service.name ? (
                  <span className="text-purple-400 text-sm">Adding...</span>
                ) : (
                  <svg
                    className="w-5 h-5 text-gray-500 group-hover:text-purple-400 transition"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                )}
              </div>
            </button>
          ))}
        </div>

        {filteredServices.length === 0 && (
          <p className="text-center text-gray-400 py-8">No services found</p>
        )}
      </div>
    </Modal>
  )
}
