import { createClient } from '@/lib/supabase/server'
import { signOut } from '@/app/auth/actions'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ThemeToggle } from '@/components/ThemeToggle'
import { MobileNav } from '@/components/MobileNav'

const navLinks = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/dashboard/subscriptions', label: 'Subscriptions' },
  { href: '/dashboard/transactions', label: 'Transactions' },
  { href: '/dashboard/categories', label: 'Categories' },
  { href: '/dashboard/settings', label: 'Settings' },
]

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] dark:bg-[#0a0a0f] text-white">
      {/* Background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[128px]" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[128px]" />
      </div>

      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0a0a0f]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg" />
              <span className="font-bold text-xl">FinTrack</span>
            </Link>
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <span className="text-sm text-gray-400 hidden sm:inline">{user.email}</span>
            <form className="hidden md:block">
              <button
                formAction={signOut}
                className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition"
              >
                Sign Out
              </button>
            </form>
            <MobileNav userEmail={user.email || ''} />
          </div>
        </div>
      </header>

      <div className="relative z-10">
        {children}
      </div>
    </div>
  )
}
