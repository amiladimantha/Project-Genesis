'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { createTransaction, deleteTransaction } from '../actions/transactions'
import { Modal } from '../components/Modal'
import { Select } from '@/components/Select'
import type { Transaction, Category, Subscription } from '@/types/database.types'

type TransactionWithRelations = Transaction & {
  category: Pick<Category, 'id' | 'name' | 'color'> | null
  subscription: Pick<Subscription, 'id' | 'name'> | null
}

interface TransactionsClientProps {
  transactions: TransactionWithRelations[]
  categories: Category[]
  subscriptions: Subscription[]
}

export function TransactionsClient({ transactions, categories, subscriptions }: TransactionsClientProps) {
  const [showForm, setShowForm] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [categoryId, setCategoryId] = useState('')
  const [subscriptionId, setSubscriptionId] = useState('')
  const router = useRouter()

  async function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await createTransaction(formData)
      if (result.error) {
        alert(result.error)
      } else {
        setShowForm(false)
        setCategoryId('')
        setSubscriptionId('')
        router.refresh()
      }
    })
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this transaction?')) return
    startTransition(async () => {
      await deleteTransaction(id)
      router.refresh()
    })
  }

  const inputClass = "w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-white placeholder-gray-500 transition"

  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Transactions</h1>
          <p className="text-gray-400 mt-1">Track your one-off expenses</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 hover:opacity-90 text-white font-medium rounded-xl transition"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Transaction
        </button>
      </div>

      <div className="p-6 bg-white/5 border border-white/10 rounded-2xl">
        {transactions.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <div className="w-16 h-16 mx-auto mb-4 bg-white/5 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <p className="text-lg mb-1">No transactions yet</p>
            <p className="text-sm text-gray-500">Add your first expense to start tracking.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {transactions.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl group"
              >
                <div className="flex items-center gap-4">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${tx.category?.color || '#6b7280'}20` }}
                  >
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: tx.category?.color || '#6b7280' }}
                    />
                  </div>
                  <div>
                    <p className="font-medium text-white">{tx.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-gray-500">
                        {format(new Date(tx.date), 'MMM d, yyyy')}
                      </span>
                      {tx.category && (
                        <span className="text-xs text-gray-500">• {tx.category.name}</span>
                      )}
                      {tx.subscription && (
                        <span className="text-xs text-purple-400">• {tx.subscription.name}</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <p className="font-semibold text-white">
                    ${Number(tx.amount).toFixed(2)}
                  </p>
                  <button
                    onClick={() => handleDelete(tx.id)}
                    className="p-2 text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="Add Transaction">
        <form action={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
            <input
              name="name"
              type="text"
              required
              placeholder="Coffee, Groceries, etc."
              className={inputClass}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Amount</label>
              <input
                name="amount"
                type="number"
                step="0.01"
                required
                placeholder="0.00"
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Date</label>
              <input
                name="date"
                type="date"
                defaultValue={new Date().toISOString().split('T')[0]}
                className={inputClass}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
            <Select
              name="category_id"
              value={categoryId}
              onChange={setCategoryId}
              options={[
                { value: '', label: 'No Category' },
                ...categories.map((cat) => ({ value: cat.id, label: cat.name })),
              ]}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Related Subscription (optional)</label>
            <Select
              name="subscription_id"
              value={subscriptionId}
              onChange={setSubscriptionId}
              options={[
                { value: '', label: 'None' },
                ...subscriptions.map((sub) => ({ value: sub.id, label: sub.name })),
              ]}
            />
          </div>
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="flex-1 py-3 px-4 bg-white/5 border border-white/10 text-white font-medium rounded-xl hover:bg-white/10 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex-1 py-3 px-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:opacity-90 disabled:opacity-50 text-white font-semibold rounded-xl transition"
            >
              {isPending ? 'Adding...' : 'Add Transaction'}
            </button>
          </div>
        </form>
      </Modal>
    </>
  )
}
