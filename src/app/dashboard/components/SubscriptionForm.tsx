'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createSubscription, updateSubscription } from '@/app/dashboard/actions/subscriptions'
import type { Subscription, Category } from '@/types/database.types'
import { Select } from '@/components/Select'

interface SubscriptionFormProps {
  subscription?: Subscription
  categories: Category[]
  onClose?: () => void
}

export function SubscriptionForm({ subscription, categories, onClose }: SubscriptionFormProps) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  const isEditing = !!subscription

  const [currency, setCurrency] = useState(subscription?.currency || 'USD')
  const [billingCycle, setBillingCycle] = useState(subscription?.billing_cycle || 'monthly')
  const [categoryId, setCategoryId] = useState(subscription?.category_id || '')
  const [status, setStatus] = useState(subscription?.status || 'active')

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
          <Select
            id="currency"
            name="currency"
            value={currency}
            onChange={setCurrency}
            options={[
              { value: 'USD', label: 'USD' },
              { value: 'EUR', label: 'EUR' },
              { value: 'GBP', label: 'GBP' },
              { value: 'CAD', label: 'CAD' },
              { value: 'AUD', label: 'AUD' },
            ]}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="billing_cycle" className={labelClass}>
            Billing Cycle
          </label>
          <Select
            id="billing_cycle"
            name="billing_cycle"
            required
            value={billingCycle as string}
            onChange={(v) => setBillingCycle(v as 'weekly' | 'monthly' | 'yearly')}
            options={[
              { value: 'weekly', label: 'Weekly' },
              { value: 'monthly', label: 'Monthly' },
              { value: 'yearly', label: 'Yearly' },
            ]}
          />
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
        <Select
          id="category_id"
          name="category_id"
          value={categoryId}
          onChange={setCategoryId}
          options={[
            { value: '', label: 'No Category' },
            ...categories.map((cat) => ({ value: cat.id, label: cat.name })),
          ]}
        />
      </div>

      {isEditing && (
        <div>
          <label htmlFor="status" className={labelClass}>
            Status
          </label>
          <Select
            id="status"
            name="status"
            value={status as string}
            onChange={(v) => setStatus(v as 'active' | 'paused' | 'cancelled')}
            options={[
              { value: 'active', label: 'Active' },
              { value: 'paused', label: 'Paused' },
              { value: 'cancelled', label: 'Cancelled' },
            ]}
          />
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
