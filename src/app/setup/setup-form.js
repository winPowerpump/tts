// app/setup/setup-form.js
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useWallet } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'

export default function SetupForm() {
  const [formData, setFormData] = useState({
    username: '',
    displayName: '',
    bio: '',
    pageColor: '#6366f1'
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const { publicKey } = useWallet()
  const router = useRouter()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!publicKey) return

    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/users/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          walletAddress: publicKey.toString()
        })
      })

      const result = await response.json()

      if (response.ok) {
        router.push(`/dashboard/${result.user.id}`)
      } else {
        setError(result.error || 'Failed to create account')
      }
    } catch (err) {
      setError('Something went wrong. Please try again.')
    }

    setLoading(false)
  }

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  return (
    <div className="bg-white rounded-lg p-6">
      {!publicKey ? (
        <div className="text-center">
          <WalletMultiButton className="!bg-purple-600 hover:!bg-purple-700" />
          <p className="text-sm text-gray-500 mt-4">
            connect wallet to start
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Username *
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              pattern="^[a-zA-Z0-9_-]+$"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
              placeholder="your-username"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Your donation page: /donate/{formData.username || 'username'}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Display Name *
            </label>
            <input
              type="text"
              name="displayName"
              value={formData.displayName}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
              placeholder="Your Name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bio
            </label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
              placeholder="Tell people about yourself..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Page Color
            </label>
            <input
              type="color"
              name="pageColor"
              value={formData.pageColor}
              onChange={handleChange}
              className="w-full h-10 border border-gray-300 rounded-md"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-md transition-colors"
          >
            {loading ? 'Creating...' : 'Create Donation Page'}
          </button>
        </form>
      )}
    </div>
  )
}