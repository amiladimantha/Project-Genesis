'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { deleteCategory } from '@/app/dashboard/actions/categories'
import { CategoryForm } from './CategoryForm'
import { Modal } from './Modal'
import type { Category } from '@/types/database.types'

interface CategoriesListProps {
  categories: Category[]
}

export function CategoriesList({ categories }: CategoriesListProps) {
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function handleDelete(id: string) {
    if (!confirm('Are you sure? Subscriptions using this category will become uncategorized.')) return
    
    setDeletingId(id)
    startTransition(async () => {
      const result = await deleteCategory(id)
      if (result.error) {
        alert(result.error)
      }
      setDeletingId(null)
      router.refresh()
    })
  }

  if (categories.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        <p>No categories yet.</p>
        <p className="text-sm text-gray-500 mt-1">Create one to organize your subscriptions.</p>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-2">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded-xl group hover:bg-white/10 transition"
          >
            <div className="flex items-center gap-3">
              <span
                className="w-4 h-4 rounded-full flex-shrink-0"
                style={{ backgroundColor: cat.color || '#6b7280' }}
              />
              <span className="font-medium text-white">{cat.name}</span>
            </div>

            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
              <button
                onClick={() => setEditingCategory(cat)}
                className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition"
                title="Edit"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>
              <button
                onClick={() => handleDelete(cat.id)}
                disabled={isPending && deletingId === cat.id}
                className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition disabled:opacity-50"
                title="Delete"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>

      <Modal
        isOpen={!!editingCategory}
        onClose={() => setEditingCategory(null)}
        title="Edit Category"
      >
        {editingCategory && (
          <CategoryForm
            category={editingCategory}
            onClose={() => setEditingCategory(null)}
          />
        )}
      </Modal>
    </>
  )
}
