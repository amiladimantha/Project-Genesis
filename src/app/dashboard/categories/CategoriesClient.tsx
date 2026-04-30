'use client'

import { useState } from 'react'
import { CategoriesList, CategoryForm, Modal } from '../components'
import type { Category } from '@/types/database.types'

interface CategoriesClientProps {
  categories: Category[]
}

export function CategoriesClient({ categories }: CategoriesClientProps) {
  const [showForm, setShowForm] = useState(false)

  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Categories</h1>
          <p className="text-gray-400 mt-1">Organize your subscriptions by category</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:opacity-90 text-white font-medium rounded-xl transition"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Category
        </button>
      </div>

      <div className="p-6 bg-white/5 border border-white/10 rounded-2xl">
        <CategoriesList categories={categories} />
      </div>

      <Modal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        title="Add Category"
      >
        <CategoryForm onClose={() => setShowForm(false)} />
      </Modal>
    </>
  )
}
