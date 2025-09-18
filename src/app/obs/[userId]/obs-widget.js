'use client'

import { useState, useEffect } from 'react'
import { createClient } from '../../../lib/supabase-client'

export default function OBSWidget({ userId, settings = {} }) {
  const [donations, setDonations] = useState([])
  const [currentDonation, setCurrentDonation] = useState(null)
  const [usePolling, setUsePolling] = useState(false)
  const [lastChecked, setLastChecked] = useState(new Date())
  const [isActivated, setIsActivated] = useState(false)
  const [ttsReady, setTtsReady] = useState(false)
  const supabase = createClient()

  const {
    showAmount = true,
    showMessage = true,
    displayDuration = 5000,
    fontSize = '24px',
    fontColor = '#ffffff',
    backgroundColor = 'rgba(0,0,0,0.8)',
    enableTTS = true,
    ttsRate = 0.9,
    ttsVolume = 0.8,
    ttsPitch = 1
  } = settings

  // Activate widget and enable TTS
  const activateWidget = async () => {
    setIsActivated(true)
    
    if (enableTTS) {
      // Test TTS to ensure it's working
      try {
        const testUtterance = new SpeechSynthesisUtterance('Widget activated, TTS is ready')
        testUtterance.rate = ttsRate
        testUtterance.volume = ttsVolume
        testUtterance.pitch = ttsPitch
        
        testUtterance.onstart = () => setTtsReady(true)
        testUtterance.onerror = (e) => {
          console.error('TTS test failed:', e)
          setTtsReady(false)
        }
        
        speechSynthesis.speak(testUtterance)
      } catch (error) {
        console.error('TTS initialization failed:', error)
        setTtsReady(false)
      }
    }
  }

  // Improved TTS function
  const speakDonation = (donation) => {
    if (!enableTTS || !ttsReady || !donation.message) return

    // Cancel any ongoing speech
    speechSynthesis.cancel()

    // Wait for cancel to complete
    setTimeout(() => {
      const text = `${donation.amount} SOL donation: ${donation.message}`
      const utterance = new SpeechSynthesisUtterance(text)
      
      utterance.rate = ttsRate
      utterance.volume = ttsVolume
      utterance.pitch = ttsPitch
      
      // Try to use a good voice
      const voices = speechSynthesis.getVoices()
      if (voices.length > 0) {
        const englishVoice = voices.find(voice => 
          voice.lang.startsWith('en') && !voice.name.includes('Google')
        ) || voices[0]
        utterance.voice = englishVoice
      }

      utterance.onerror = (event) => {
        console.error('TTS Error:', event.error)
      }

      try {
        speechSynthesis.speak(utterance)
      } catch (error) {
        console.error('Failed to speak:', error)
      }
    }, 100)
  }

  useEffect(() => {
    if (!isActivated) return

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
  }, [userId, supabase, isActivated])

  // Polling fallback if real-time doesn't work
  useEffect(() => {
    if (!usePolling || !isActivated) return

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

    const interval = setInterval(pollForDonations, 3000)
    return () => clearInterval(interval)
  }, [usePolling, userId, lastChecked, supabase, isActivated])

  useEffect(() => {
    if (donations.length > 0 && !currentDonation && isActivated) {
      const nextDonation = donations[0]
      setCurrentDonation(nextDonation)
      
      // Use improved TTS function
      speakDonation(nextDonation)

      // Remove from queue after display duration
      setTimeout(() => {
        setCurrentDonation(null)
        setDonations(prev => prev.slice(1))
      }, displayDuration)
    }
  }, [donations, currentDonation, displayDuration, isActivated])

  // Load voices when available
  useEffect(() => {
    const loadVoices = () => {
      const voices = speechSynthesis.getVoices()
      console.log('Available voices:', voices.map(v => `${v.name} (${v.lang})`))
    }

    if (speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = loadVoices
    }
    loadVoices()
  }, [])

  // Show activation screen if not activated
  if (!isActivated) {
    return (
      <div className="fixed inset-0 bg-white flex items-center justify-center z-50">
        <div 
          className="bg-white text-black p-8 rounded-lg text-center max-w-md"
          style={{ fontFamily: 'Arial, sans-serif' }}
        >
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-2">Donation Widget</h2>
            <p className="text-gray-700 text-sm">
              Click to activate donation alerts{enableTTS ? ' and text-to-speech' : ''}
            </p>
          </div>
          
          <button
            onClick={activateWidget}
            className="bg-black text-white font-bold py-3 px-6 rounded-lg duration-200 w-full"
          >
            Activate Widget
          </button>
          
          <div className="mt-4 text-xs text-gray-400">
            <p>Waiting for user interaction...</p>
            {enableTTS && <p>TTS requires user activation</p>}
          </div>
        </div>
      </div>
    )
  }

  // Show current donation
  if (currentDonation) {
    return (
      <div 
        className="fixed top-4 right-4 bg-white p-4 rounded-lg max-w-sm animate-slide-in z-50"
        style={{ 
          fontSize
        }}
      >
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 flex items-center justify-center">
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

  // Show status when waiting
  return (
    <div className="fixed top-4 right-4 z-50">
      <div className="text-white text-xs opacity-50 pointer-events-none bg-black bg-opacity-20 px-2 py-1 rounded">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span>
            {usePolling ? 'Polling mode' : 'Real-time'} • 
            {ttsReady ? ' TTS ready' : ' TTS disabled'}
          </span>
        </div>
      </div>

      {/* Test button for development */}
      {process.env.NODE_ENV === 'development' && (
        <button 
          onClick={() => {
            const testDonation = {
              amount: '0.5',
              message: 'This is a test donation message!',
              donor_wallet: '1234567890abcdef'
            }
            setDonations(prev => [...prev, testDonation])
          }}
          className="mt-2 bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1 rounded"
        >
          Test Donation
        </button>
      )}
    </div>
  )
}