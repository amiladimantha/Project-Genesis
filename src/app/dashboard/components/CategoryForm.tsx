'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createCategory, updateCategory } from '@/app/dashboard/actions/categories'
import type { Category } from '@/types/database.types'

const COLORS = [
  '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16',
  '#22c55e', '#14b8a6', '#06b6d4', '#0ea5e9', '#3b82f6',
  '#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899',
]

interface CategoryFormProps {
  category?: Category
  onClose?: () => void
}

export function CategoryForm({ category, onClose }: CategoryFormProps) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  const isEditing = !!category

  async function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = isEditing
        ? await updateCategory(category.id, formData)
        : await createCategory(formData)

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
          Category Name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          defaultValue={category?.name}
          placeholder="Entertainment, Software, etc."
          className={inputClass}
        />
      </div>

      <div>
        <label className={labelClass}>Color</label>
        <div className="flex flex-wrap gap-2">
          {COLORS.map((color) => (
            <label key={color} className="cursor-pointer">
              <input
                type="radio"
                name="color"
                value={color}
                defaultChecked={category?.color === color || (!category && color === COLORS[5])}
                className="sr-only peer"
              />
              <span
                className="block w-8 h-8 rounded-full border-2 border-transparent peer-checked:border-white peer-checked:ring-2 peer-checked:ring-offset-2 peer-checked:ring-offset-[#12121a] transition"
                style={{ backgroundColor: color }}
              />
            </label>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="icon" className={labelClass}>
          Icon (optional)
        </label>
        <input
          id="icon"
          name="icon"
          type="text"
          defaultValue={category?.icon || ''}
          placeholder="e.g., music, film, code"
          className={inputClass}
        />
        <p className="text-xs text-gray-500 mt-2">Lucide icon name for display</p>
      </div>

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
          className="flex-1 py-3 px-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:opacity-90 disabled:opacity-50 text-white font-semibold rounded-xl transition"
        >
          {isPending ? 'Saving...' : isEditing ? 'Update' : 'Add Category'}
        </button>
      </div>
    </form>
  )
}
