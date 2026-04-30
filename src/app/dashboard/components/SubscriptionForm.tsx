'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createSubscription, updateSubscription } from '@/app/dashboard/actions/subscriptions'
import type { Subscription, Category } from '@/types/database.types'

interface SubscriptionFormProps {
  subscription?: Subscription
  categories: Category[]
  onClose?: () => void
}

export function SubscriptionForm({ subscription, categories, onClose }: SubscriptionFormProps) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  const isEditing = !!subscription

  async function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = isEditing
        ? await updateSubscription(subscription.id, formData)
        : await createSubscription(formData)

      if (result.error) {
        alert(result.error)
      } else {
        onClose?.()
        router.refresh()
      }
    })
  }

  const inputClass = "w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-white placeholder-gray-500 transition"
  const labelClass = "block text-sm font-medium text-gray-300 mb-2"

  return (
    <form action={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="name" className={labelClass}>
          Subscription Name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          defaultValue={subscription?.name}
          placeholder="Netflix, Spotify, etc."
          className={inputClass}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="amount" className={labelClass}>
            Amount
          </label>
          <input
            id="amount"
            name="amount"
            type="number"
            step="0.01"
            min="0"
            required
            defaultValue={subscription?.amount}
            placeholder="9.99"
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="currency" className={labelClass}>
            Currency
          </label>
          <select
            id="currency"
            name="currency"
            defaultValue={subscription?.currency || 'USD'}
            className={inputClass}
          >
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="GBP">GBP</option>
            <option value="CAD">CAD</option>
            <option value="AUD">AUD</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="billing_cycle" className={labelClass}>
            Billing Cycle
          </label>
          <select
            id="billing_cycle"
            name="billing_cycle"
            required
            defaultValue={subscription?.billing_cycle || 'monthly'}
            className={inputClass}
          >
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
        </div>
        <div>
          <label htmlFor="next_payment_date" className={labelClass}>
            Next Payment
          </label>
          <input
            id="next_payment_date"
            name="next_payment_date"
            type="date"
            required
            defaultValue={subscription?.next_payment_date}
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label htmlFor="category_id" className={labelClass}>
          Category
        </label>
        <select
          id="category_id"
          name="category_id"
          defaultValue={subscription?.category_id || ''}
          className={inputClass}
        >
          <option value="">No Category</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {isEditing && (
        <div>
          <label htmlFor="status" className={labelClass}>
            Status
          </label>
          <select
            id="status"
            name="status"
            defaultValue={subscription?.status}
            className={inputClass}
          >
            <option value="active">Active</option>
            <option value="paused">Paused</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      )}

      <div className="flex gap-3 pt-4">
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 px-4 bg-white/5 border border-white/10 text-white font-medium rounded-xl hover:bg-white/10 transition"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isPending}
          className="flex-1 py-3 px-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:opacity-90 disabled:opacity-50 text-white font-semibold rounded-xl transition"
        >
          {isPending ? 'Saving...' : isEditing ? 'Update' : 'Add Subscription'}
        </button>
      </div>
    </form>
  )
}
