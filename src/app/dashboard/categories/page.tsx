import { getCategories } from '../actions/categories'
import { CategoriesClient } from './CategoriesClient'

export default async function CategoriesPage() {
  const { data: categories } = await getCategories()

  return (
    <main className="max-w-3xl mx-auto px-6 py-8">
      <CategoriesClient categories={categories || []} />
    </main>
  )
}
