'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { deleteSubscription } from '@/app/dashboard/actions/subscriptions'
import { SubscriptionForm } from './SubscriptionForm'
import { Modal } from './Modal'
import type { Subscription, Category } from '@/types/database.types'

type SubscriptionWithCategory = Subscription & {
  category: Pick<Category, 'id' | 'name' | 'color' | 'icon'> | null
}

interface SubscriptionsListProps {
  subscriptions: SubscriptionWithCategory[]
  categories: Category[]
}

export function SubscriptionsList({ subscriptions, categories }: SubscriptionsListProps) {
  const [editingSubscription, setEditingSubscription] = useState<SubscriptionWithCategory | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this subscription?')) return
    
    setDeletingId(id)
    startTransition(async () => {
      const result = await deleteSubscription(id)
      if (result.error) {
        alert(result.error)
      }
      setDeletingId(null)
      router.refresh()
    })
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  function formatCurrency(amount: number, currency: string) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount)
  }

  function getBillingBadgeColor(cycle: string | null) {
    switch (cycle) {
      case 'weekly': return 'bg-purple-500/20 text-purple-300 border-purple-500/30'
      case 'monthly': return 'bg-blue-500/20 text-blue-300 border-blue-500/30'
      case 'yearly': return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30'
    }
  }

  function getStatusBadgeColor(status: string) {
    switch (status) {
      case 'active': return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
      case 'paused': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
      case 'cancelled': return 'bg-red-500/20 text-red-300 border-red-500/30'
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30'
    }
  }

  if (subscriptions.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <div className="w-16 h-16 mx-auto mb-4 bg-white/5 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
        <p className="text-lg mb-1">No subscriptions yet</p>
        <p className="text-sm text-gray-500">Add your first subscription to start tracking.</p>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-3">
        {subscriptions.map((sub) => (
          <div
            key={sub.id}
            className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition group"
          >
            <div className="flex items-center gap-4">
              {sub.category?.color ? (
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: `${sub.category.color}20` }}
                >
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: sub.category.color }}
                  />
                </div>
              ) : (
                <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center">
                  <span className="w-3 h-3 rounded-full bg-gray-500" />
                </div>
              )}
              <div>
                <p className="font-medium text-white">{sub.name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-xs px-2 py-0.5 rounded-full border ${getBillingBadgeColor(sub.billing_cycle)}`}>
                    {sub.billing_cycle}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full border ${getStatusBadgeColor(sub.status)}`}>
                    {sub.status}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="font-semibold text-white">
                  {formatCurrency(sub.amount, sub.currency)}
                </p>
                <p className="text-xs text-gray-500">
                  Next: {formatDate(sub.next_payment_date)}
                </p>
              </div>

              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
                <button
                  onClick={() => setEditingSubscription(sub)}
                  className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition"
                  title="Edit"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
                <button
                  onClick={() => handleDelete(sub.id)}
                  disabled={isPending && deletingId === sub.id}
                  className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition disabled:opacity-50"
                  title="Delete"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal
        isOpen={!!editingSubscription}
        onClose={() => setEditingSubscription(null)}
        title="Edit Subscription"
      >
        {editingSubscription && (
          <SubscriptionForm
            subscription={editingSubscription}
            categories={categories}
            onClose={() => setEditingSubscription(null)}
          />
        )}
      </Modal>
    </>
  )
}
