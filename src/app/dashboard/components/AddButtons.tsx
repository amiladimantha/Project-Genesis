'use client'

import { useState } from 'react'
import { Modal } from './Modal'
import { SubscriptionForm } from './SubscriptionForm'
import { CategoryForm } from './CategoryForm'
import type { Category } from '@/types/database.types'

interface AddButtonsProps {
  categories: Category[]
}

export function AddButtons({ categories }: AddButtonsProps) {
  const [showSubscriptionForm, setShowSubscriptionForm] = useState(false)
  const [showCategoryForm, setShowCategoryForm] = useState(false)

  return (
    <>
      <div className="flex gap-3">
        <button
          onClick={() => setShowSubscriptionForm(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 hover:opacity-90 text-white font-medium rounded-xl transition"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Subscription
        </button>
        <button
          onClick={() => setShowCategoryForm(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-medium rounded-xl transition"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z" />
          </svg>
          Add Category
        </button>
      </div>

      <Modal
        isOpen={showSubscriptionForm}
        onClose={() => setShowSubscriptionForm(false)}
        title="Add Subscription"
      >
        <SubscriptionForm
          categories={categories}
          onClose={() => setShowSubscriptionForm(false)}
        />
      </Modal>

      <Modal
        isOpen={showCategoryForm}
        onClose={() => setShowCategoryForm(false)}
        title="Add Category"
      >
        <CategoryForm onClose={() => setShowCategoryForm(false)} />
      </Modal>
    </>
  )
}
