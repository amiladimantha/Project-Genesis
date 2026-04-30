import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getSubscriptions, getSubscriptionStats } from './actions/subscriptions'
import { getCategories } from './actions/categories'
import { getMonthlySpendingTrend, getCategorySpending } from './actions/transactions'
import { getPendingAlerts } from './actions/notifications'
import { SubscriptionsList } from './components/SubscriptionsList'
import { CategoriesList } from './components/CategoriesList'
import { AddButtons } from './components/AddButtons'
import { SpendingPieChart } from './components/SpendingPieChart'
import { SpendingTrendChart } from './components/SpendingTrendChart'
import { UpcomingPayments } from './components/UpcomingPayments'
import { PaymentAlerts } from './components/PaymentAlerts'

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const [subscriptionsResult, categoriesResult, statsResult, trendResult, categorySpendingResult, alertsResult] = await Promise.all([
    getSubscriptions(),
    getCategories(),
    getSubscriptionStats(),
    getMonthlySpendingTrend(),
    getCategorySpending(),
    getPendingAlerts(),
  ])

  const subscriptions = subscriptionsResult.data || []
  const categories = categoriesResult.data || []
  const stats = statsResult.data || { monthlySpending: 0, upcomingPayments: 0, activeCount: 0 }
  const trendData = trendResult.data || []
  const categorySpending = categorySpendingResult.data || []
  const pendingAlerts = alertsResult.data || []

  function formatCurrency(amount: number) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  return (
    <main className="max-w-7xl mx-auto px-6 py-8">
      {/* Welcome */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-gray-400 mt-1">Track and manage your subscriptions</p>
      </div>

      {/* Payment Alerts */}
      <PaymentAlerts initialAlerts={pendingAlerts} />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="p-6 bg-white/5 border border-white/10 rounded-2xl">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-400">Monthly Spending</p>
              <p className="text-2xl font-bold">{formatCurrency(stats.monthlySpending)}</p>
            </div>
          </div>
        </div>
        <div className="p-6 bg-white/5 border border-white/10 rounded-2xl">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-400">Active Subscriptions</p>
              <p className="text-2xl font-bold">{stats.activeCount}</p>
            </div>
          </div>
        </div>
        <div className="p-6 bg-white/5 border border-white/10 rounded-2xl">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-400">Upcoming (30 days)</p>
              <p className="text-2xl font-bold">{formatCurrency(stats.upcomingPayments)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mb-8">
        <AddButtons categories={categories} />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="p-6 bg-white/5 border border-white/10 rounded-2xl">
          <h2 className="text-lg font-semibold mb-4">Spending by Category</h2>
          <SpendingPieChart data={categorySpending} />
        </div>
        <div className="p-6 bg-white/5 border border-white/10 rounded-2xl">
          <h2 className="text-lg font-semibold mb-4">Spending Trend</h2>
          <SpendingTrendChart data={trendData} />
        </div>
      </div>

      {/* Upcoming Payments */}
      <div className="mb-8">
        <UpcomingPayments subscriptions={subscriptions} />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Subscriptions List */}
        <div className="lg:col-span-2 p-6 bg-white/5 border border-white/10 rounded-2xl">
          <h2 className="text-lg font-semibold mb-4">Your Subscriptions</h2>
          <SubscriptionsList subscriptions={subscriptions} categories={categories} />
        </div>

        {/* Categories Sidebar */}
        <div className="p-6 bg-white/5 border border-white/10 rounded-2xl h-fit">
          <h2 className="text-lg font-semibold mb-4">Categories</h2>
          <CategoriesList categories={categories} />
        </div>
      </div>
    </main>
  )
}
