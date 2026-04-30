'use client'

import { useEffect, useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { updateProfile, updatePassword, deleteAccount } from '../actions/profile'
import { supportedCurrencies } from '@/lib/currency'
import type { Profile } from '@/types/database.types'

interface SettingsClientProps {
  profile: Profile
}

export function SettingsClient({ profile }: SettingsClientProps) {
  const [isPending, startTransition] = useTransition()
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [selectedCurrency, setSelectedCurrency] = useState(profile.currency || 'USD')
  const [isCurrencyOpen, setIsCurrencyOpen] = useState(false)
  const currencyDropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  const inputClass = "w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-white placeholder-gray-500 transition"

  async function handleProfileUpdate(formData: FormData) {
    setMessage(null)
    startTransition(async () => {
      const result = await updateProfile(formData)
      if (result.error) {
        setMessage({ type: 'error', text: result.error })
      } else {
        setMessage({ type: 'success', text: 'Profile updated successfully' })
        router.refresh()
      }
    })
  }

  async function handlePasswordUpdate(formData: FormData) {
    setMessage(null)
    startTransition(async () => {
      const result = await updatePassword(formData)
      if (result.error) {
        setMessage({ type: 'error', text: result.error })
      } else {
        setMessage({ type: 'success', text: 'Password updated successfully' })
      }
    })
  }

  async function handleDeleteAccount() {
    if (!confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return
    }
    if (!confirm('All your data will be permanently deleted. Type "DELETE" to confirm.')) {
      return
    }

    startTransition(async () => {
      const result = await deleteAccount()
      if (result.error) {
        setMessage({ type: 'error', text: result.error })
      } else {
        router.push('/')
      }
    })
  }

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (!currencyDropdownRef.current) return
      if (!currencyDropdownRef.current.contains(event.target as Node)) {
        setIsCurrencyOpen(false)
      }
    }

    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [])

  return (
    <div className="space-y-8">
      {message && (
        <div
          className={`p-4 rounded-xl ${
            message.type === 'success'
              ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
              : 'bg-red-500/10 border border-red-500/20 text-red-400'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Profile Section */}
      <div className="p-6 bg-white/5 border border-white/10 rounded-2xl">
        <h2 className="text-lg font-semibold text-white mb-4">Profile</h2>
        <form action={handleProfileUpdate} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Email</label>
            <input
              type="email"
              value={profile.email}
              disabled
              className={`${inputClass} opacity-50 cursor-not-allowed`}
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">Full Name</label>
            <input
              name="full_name"
              type="text"
              defaultValue={profile.full_name || ''}
              placeholder="Your name"
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">Default Currency</label>
            <input type="hidden" name="currency" value={selectedCurrency} />
            <div ref={currencyDropdownRef} className="relative">
              <button
                type="button"
                onClick={() => setIsCurrencyOpen((prev) => !prev)}
                className={`${inputClass} flex items-center justify-between`}
              >
                <span>{selectedCurrency}</span>
                <svg
                  className={`w-5 h-5 text-gray-400 transition-transform ${isCurrencyOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isCurrencyOpen && (
                <div className="absolute z-30 mt-2 w-full max-h-56 overflow-y-auto rounded-xl border border-white/15 bg-[#131520] shadow-2xl backdrop-blur-xl">
                  {supportedCurrencies.map((curr) => (
                    <button
                      key={curr}
                      type="button"
                      onClick={() => {
                        setSelectedCurrency(curr)
                        setIsCurrencyOpen(false)
                      }}
                      className={`w-full px-4 py-2.5 text-left transition ${
                        selectedCurrency === curr
                          ? 'bg-purple-500/20 text-purple-200'
                          : 'text-gray-200 hover:bg-white/10'
                      }`}
                    >
                      {curr}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <button
            type="submit"
            disabled={isPending}
            className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:opacity-90 disabled:opacity-50 text-white font-semibold rounded-xl transition"
          >
            {isPending ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>

      {/* Password Section */}
      <div className="p-6 bg-white/5 border border-white/10 rounded-2xl">
        <h2 className="text-lg font-semibold text-white mb-4">Change Password</h2>
        <form action={handlePasswordUpdate} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">New Password</label>
            <input
              name="new_password"
              type="password"
              required
              minLength={6}
              placeholder="••••••••"
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">Confirm Password</label>
            <input
              name="confirm_password"
              type="password"
              required
              minLength={6}
              placeholder="••••••••"
              className={inputClass}
            />
          </div>
          <button
            type="submit"
            disabled={isPending}
            className="w-full py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl transition"
          >
            {isPending ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>

      {/* Danger Zone */}
      <div className="p-6 bg-red-500/5 border border-red-500/20 rounded-2xl">
        <h2 className="text-lg font-semibold text-red-400 mb-2">Danger Zone</h2>
        <p className="text-sm text-gray-400 mb-4">
          Once you delete your account, there is no going back. Please be certain.
        </p>
        <button
          onClick={handleDeleteAccount}
          disabled={isPending}
          className="px-6 py-3 bg-red-500/20 border border-red-500/30 text-red-400 font-semibold rounded-xl hover:bg-red-500/30 transition"
        >
          Delete Account
        </button>
      </div>
    </div>
  )
}
