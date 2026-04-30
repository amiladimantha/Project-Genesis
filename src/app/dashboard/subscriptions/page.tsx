import { getSubscriptions } from '../actions/subscriptions'
import { getCategories } from '../actions/categories'
import { SubscriptionsClient } from './SubscriptionsClient'

export default async function SubscriptionsPage() {
  const [subscriptionsResult, categoriesResult] = await Promise.all([
    getSubscriptions(),
    getCategories(),
  ])

  const subscriptions = subscriptionsResult.data || []
  const categories = categoriesResult.data || []

  return (
    <main className="max-w-5xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Subscriptions</h1>
        <p className="text-gray-400 mt-1">Manage all your recurring payments</p>
      </div>

      <SubscriptionsClient subscriptions={subscriptions} categories={categories} />
    </main>
  )
}
