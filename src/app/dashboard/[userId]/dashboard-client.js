// app/dashboard/[userId]/dashboard-client.js
'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase-client'
import { Copy, ExternalLink, Settings, TrendingUp } from 'lucide-react'

export default function DashboardClient({ user, initialDonations }) {
  const [donations, setDonations] = useState(initialDonations)
  const [stats, setStats] = useState({ total: 0, count: 0 })
  const [copied, setCopied] = useState('')
  const supabase = createClient()

  const donationUrl = `${window.location.origin}/donate/${user.username}`
  const obsUrl = `${window.location.origin}/obs/${user.id}`

  useEffect(() => {
    // Calculate stats
    const total = donations.reduce((sum, d) => sum + parseFloat(d.amount), 0)
    setStats({ total, count: donations.length })

    // Subscribe to new donations
    const channel = supabase
      .channel(`donations_${user.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'donations',
        filter: `recipient_id=eq.${user.id}`
      }, (payload) => {
        const newDonation = payload.new
        setDonations(prev => [newDonation, ...prev])
      })
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [donations, user.id])

  const copyToClipboard = async (text, type) => {
    await navigator.clipboard.writeText(text)
    setCopied(type)
    setTimeout(() => setCopied(''), 2000)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user.display_name}
          </h1>
          <p className="text-gray-600">Manage your donations and settings</p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6">
            <div className="flex items-center">
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Total Received</h3>
                <p className="text-2xl font-bold text-gray-900">{stats.total.toFixed(3)} SOL</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6">
            <div className="flex items-center">
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Total Donations</h3>
                <p className="text-2xl font-bold text-gray-900">{stats.count}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6">
            <div className="flex items-center">
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Average Donation</h3>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.count > 0 ? (stats.total / stats.count).toFixed(3) : '0.000'} SOL
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* URLs */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Donation Page</h3>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={donationUrl}
                readOnly
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
              />
              <button
                onClick={() => copyToClipboard(donationUrl, 'donation')}
                className="px-3 py-2 bg-black text-white rounded-md"
              >
                {copied === 'donation' ? '✓' : <Copy className="h-4 w-4" />}
              </button>
              <a
                href={donationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-2 bg-white border text-white rounded-md"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">OBS Widget URL</h3>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={obsUrl}
                readOnly
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
              />
              <button
                onClick={() => copyToClipboard(obsUrl, 'obs')}
                className="px-3 py-2 bg-black text-white rounded-md"
              >
                {copied === 'obs' ? '✓' : <Copy className="h-4 w-4" />}
              </button>
              <a
                href={obsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-2 bg-white text-white rounded-md border"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Add this URL as a Browser Source in OBS
            </p>
          </div>
        </div>

        {/* Recent Donations */}
        <div className="bg-white rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Recent Donations</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {donations.length === 0 ? (
              <div className="px-6 py-8 text-center text-gray-500">
                No donations yet. Share your donation page to get started!
              </div>
            ) : (
              donations.map((donation) => (
                <div key={donation.id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-black">
                          {donation.amount} SOL
                        </span>
                        <span className="text-gray-500">
                          from {donation.donor_wallet?.slice(0, 4)}...{donation.donor_wallet?.slice(-4)}
                        </span>
                      </div>
                      {donation.message && (
                        <p className="text-gray-700 mt-1">{donation.message}</p>
                      )}
                      <p className="text-sm text-gray-500 mt-1">
                        {new Date(donation.processed_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}