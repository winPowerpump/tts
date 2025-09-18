// app/donate/[username]/donation-form.js
'use client'
import { useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js'
import { Heart } from 'lucide-react'

export default function DonationForm({ recipient }) {
  const [amount, setAmount] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  
  const { publicKey, sendTransaction } = useWallet()

  const handleDonate = async (e) => {
    e.preventDefault()
    if (!publicKey || !amount) return

    setLoading(true)
    setSuccess(false)

    try {
      const connection = new Connection(process.env.NEXT_PUBLIC_SOLANA_RPC_URL)
      const recipientPubkey = new PublicKey(recipient.wallet_address)
      const lamports = parseFloat(amount) * LAMPORTS_PER_SOL

      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: recipientPubkey,
          lamports
        })
      )

      const signature = await sendTransaction(transaction, connection)
      
      // Wait for confirmation
      await connection.confirmTransaction(signature, 'processed')

      // Save to database
      const response = await fetch('/api/donations/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientId: recipient.id,
          signature,
          amount: parseFloat(amount),
          message: message.trim(),
          donorWallet: publicKey.toString()
        })
      })

      if (response.ok) {
        setSuccess(true)
        setAmount('')
        setMessage('')
      }

    } catch (error) {
      console.error('Donation failed:', error)
      alert('Donation failed: ' + error.message)
    }

    setLoading(false)
  }

  return (
    <div className="bg-white rounded-lg p-6 max-w-md w-full">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">{recipient.display_name}</h2>
        {recipient.bio && <p className="text-gray-600 mt-2">{recipient.bio}</p>}
      </div>

      {!publicKey ? (
        <div className="text-center">
          <WalletMultiButton className="!bg-purple-600 hover:!bg-purple-700" />
          <p className="text-sm text-gray-500 mt-2">Connect your wallet to donate</p>
        </div>
      ) : success ? (
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart className="h-8 w-8 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-green-600 mb-2">Thank you!</h3>
          <p className="text-gray-600 mb-4">Your donation was sent successfully</p>
          <button 
            onClick={() => setSuccess(false)}
            className="text-black font-medium"
          >
            Send another donation
          </button>
        </div>
      ) : (
        <form onSubmit={handleDonate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amount (SOL)
            </label>
            <input
              type="number"
              step="0.001"
              min="0.001"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
              placeholder="0.1"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Message (optional)
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={200}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
              placeholder="Say something nice..."
            />
            <p className="text-xs text-gray-500 mt-1">{message.length}/200</p>
          </div>

          <button
            type="submit"
            disabled={loading || !amount}
            className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-md transition-colors"
          >
            {loading ? 'Sending...' : `Donate ${amount || '?'} SOL`}
          </button>
        </form>
      )}
    </div>
  )
}