'use client'

import { useState } from 'react'
import { updateNotificationPreferences } from '@/app/dashboard/actions/notifications'
import type { NotificationPreferences } from '@/app/dashboard/actions/notifications'

interface NotificationPreferencesProps {
  initialPreferences: NotificationPreferences
}

export function NotificationPreferencesPanel({ initialPreferences }: NotificationPreferencesProps) {
  const [preferences, setPreferences] = useState(initialPreferences)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  const handleToggle = async (key: keyof NotificationPreferences) => {
    if (key === 'user_id' || key === 'created_at') return

    const newPreferences = {
      ...preferences,
      [key]: !preferences[key],
    }

    setPreferences(newPreferences)
    setSaving(true)

    const result = await updateNotificationPreferences(newPreferences)

    if (result.error) {
      setMessage(`Error: ${result.error}`)
      setPreferences(preferences) // Revert on error
    } else {
      setMessage('Preferences updated!')
      setTimeout(() => setMessage(''), 3000)
    }

    setSaving(false)
  }

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-white mb-2">Payment Alerts</h3>
        <p className="text-sm text-gray-400">
          Receive email reminders before your subscription payments are due.
        </p>
      </div>

      <div className="space-y-4">
        {/* Master toggle: Email enabled */}
        <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
          <div>
            <label className="block text-sm font-medium text-white">
              Enable Email Alerts
            </label>
            <p className="text-xs text-gray-400 mt-1">
              Receive email notifications for upcoming payments
            </p>
          </div>
          <button
            onClick={() => handleToggle('email_enabled')}
            disabled={saving}
            className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
              preferences.email_enabled ? 'bg-emerald-600' : 'bg-gray-600'
            } ${saving ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <span
              className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                preferences.email_enabled ? 'translate-x-7' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Alert timing options (only show if email enabled) */}
        {preferences.email_enabled && (
          <div className="space-y-3 pl-4 border-l-2 border-emerald-500/50">
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
              <div>
                <label className="block text-sm font-medium text-white">
                  Alert 7 Days Before
                </label>
                <p className="text-xs text-gray-400 mt-1">
                  Get notified one week in advance
                </p>
              </div>
              <button
                onClick={() => handleToggle('alert_7_days')}
                disabled={saving}
                className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                  preferences.alert_7_days ? 'bg-blue-600' : 'bg-gray-600'
                } ${saving ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <span
                  className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                    preferences.alert_7_days ? 'translate-x-7' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
              <div>
                <label className="block text-sm font-medium text-white">
                  Alert 3 Days Before
                </label>
                <p className="text-xs text-gray-400 mt-1">
                  Get notified three days before payment
                </p>
              </div>
              <button
                onClick={() => handleToggle('alert_3_days')}
                disabled={saving}
                className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                  preferences.alert_3_days ? 'bg-amber-600' : 'bg-gray-600'
                } ${saving ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <span
                  className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                    preferences.alert_3_days ? 'translate-x-7' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
              <div>
                <label className="block text-sm font-medium text-white">
                  Alert 1 Day Before
                </label>
                <p className="text-xs text-gray-400 mt-1">
                  Get notified the day before payment (urgent reminder)
                </p>
              </div>
              <button
                onClick={() => handleToggle('alert_1_day')}
                disabled={saving}
                className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                  preferences.alert_1_day ? 'bg-red-600' : 'bg-gray-600'
                } ${saving ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <span
                  className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                    preferences.alert_1_day ? 'translate-x-7' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        )}

        {/* Info message */}
        {message && (
          <div
            className={`p-3 rounded-lg text-sm ${
              message.startsWith('Error')
                ? 'bg-red-500/10 text-red-300 border border-red-500/20'
                : 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
            }`}
          >
            {message}
          </div>
        )}
      </div>

      <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
        <p className="text-xs text-blue-300">
          💡 <strong>Tip:</strong> Make sure your email address in account settings is up to date so
          you don't miss any payment reminders.
        </p>
      </div>
    </div>
  )
}
