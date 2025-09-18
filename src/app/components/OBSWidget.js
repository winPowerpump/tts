// components/OBSWidget.js (Updated)
'use client'
import { useState, useEffect } from 'react'
import { createClient } from '../lib/supabase-client' // Fixed import path

export default function OBSWidget({ userId, settings = {} }) {
  const [donations, setDonations] = useState([])
  const [currentDonation, setCurrentDonation] = useState(null)
  const [usePolling, setUsePolling] = useState(false)
  const [lastChecked, setLastChecked] = useState(new Date())
  const supabase = createClient() // Updated function name

  const {
    showAmount = true,
    showMessage = true,
    displayDuration = 5000,
    fontSize = '24px',
    fontColor = '#ffffff',
    backgroundColor = 'rgba(0,0,0,0.8)',
    enableTTS = true
  } = settings

  useEffect(() => {
    // Try real-time subscription first
    const channel = supabase
      .channel(`donations_${userId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'donations',
        filter: `recipient_id=eq.${userId}`
      }, (payload) => {
        console.log('Real-time donation received:', payload)
        const newDonation = payload.new
        setDonations(prev => [...prev, newDonation])
      })
      .subscribe((status) => {
        console.log('Subscription status:', status)
        if (status === 'SUBSCRIBED') {
          console.log('Real-time enabled successfully')
        } else if (status === 'CHANNEL_ERROR') {
          console.log('Real-time failed, falling back to polling')
          setUsePolling(true)
        }
      })

    return () => supabase.removeChannel(channel)
  }, [userId, supabase])

  // Polling fallback if real-time doesn't work
  useEffect(() => {
    if (!usePolling) return

    const pollForDonations = async () => {
      try {
        const { data: newDonations, error } = await supabase
          .from('donations')
          .select('*')
          .eq('recipient_id', userId)
          .gte('processed_at', lastChecked.toISOString())
          .order('processed_at', { ascending: false })

        if (error) {
          console.error('Polling error:', error)
          return
        }

        if (newDonations && newDonations.length > 0) {
          console.log('New donations found via polling:', newDonations)
          setDonations(prev => [...prev, ...newDonations])
          setLastChecked(new Date())
        }
      } catch (error) {
        console.error('Polling failed:', error)
      }
    }

    // Poll every 3 seconds
    const interval = setInterval(pollForDonations, 3000)
    return () => clearInterval(interval)
  }, [usePolling, userId, lastChecked, supabase])

  useEffect(() => {
    if (donations.length > 0 && !currentDonation) {
      const nextDonation = donations[0]
      setCurrentDonation(nextDonation)
      
      // Text-to-speech
      if (enableTTS && nextDonation.message) {
        const utterance = new SpeechSynthesisUtterance(
          `${nextDonation.amount} SOL donation: ${nextDonation.message}`
        )
        utterance.rate = 0.9
        utterance.volume = 0.8
        speechSynthesis.speak(utterance)
      }

      // Remove from queue after display duration
      setTimeout(() => {
        setCurrentDonation(null)
        setDonations(prev => prev.slice(1))
      }, displayDuration)
    }
  }, [donations, currentDonation, displayDuration, enableTTS])

  if (!currentDonation) {
    return (
      <div className="fixed top-4 right-4 text-white text-xs opacity-50 pointer-events-none">
        {usePolling ? 'Polling mode' : 'Waiting for donations...'}
      </div>
    )
  }

  return (
    <div 
      className="fixed top-4 right-4 p-4 rounded-lg shadow-lg max-w-sm animate-slide-in z-50"
      style={{ 
        backgroundColor,
        color: fontColor,
        fontSize
      }}
    >
      <div className="flex items-center space-x-3">
        <div className="flex-shrink-0">
          <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
            💜
          </div>
        </div>
        <div className="flex-1 min-w-0">
          {showAmount && (
            <p className="text-lg font-bold">
              {currentDonation.amount} SOL
            </p>
          )}
          {showMessage && currentDonation.message && (
            <p className="text-sm opacity-90 break-words">
              {currentDonation.message}
            </p>
          )}
          <p className="text-xs opacity-70">
            from {currentDonation.donor_wallet?.slice(0, 4)}...{currentDonation.donor_wallet?.slice(-4)}
          </p>
        </div>
      </div>
    </div>
  )
}