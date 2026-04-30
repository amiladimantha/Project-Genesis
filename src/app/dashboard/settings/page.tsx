import { getProfile } from '../actions/profile'
import { getNotificationPreferences } from '../actions/notifications'
import { SettingsClient } from './SettingsClient'
import { redirect } from 'next/navigation'

export default async function SettingsPage() {
  const { data: profile, error } = await getProfile()

  if (error || !profile) {
    redirect('/login')
  }

  const { data: notificationPreferences } = await getNotificationPreferences()

  return (
    <main className="max-w-2xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-gray-400 mt-1">Manage your account preferences</p>
      </div>

      <SettingsClient profile={profile} notificationPreferences={notificationPreferences} />
    </main>
  )
}
