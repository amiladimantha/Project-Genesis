import { getTransactions } from '../actions/transactions'
import { getCategories } from '../actions/categories'
import { getSubscriptions } from '../actions/subscriptions'
import { TransactionsClient } from './TransactionsClient'

export default async function TransactionsPage() {
  const [transactionsResult, categoriesResult, subscriptionsResult] = await Promise.all([
    getTransactions(),
    getCategories(),
    getSubscriptions(),
  ])

  return (
    <main className="max-w-5xl mx-auto px-6 py-8">
      <TransactionsClient
        transactions={transactionsResult.data || []}
        categories={categoriesResult.data || []}
        subscriptions={subscriptionsResult.data || []}
      />
    </main>
  )
}
