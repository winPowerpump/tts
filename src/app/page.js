// app/page.js
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-black mb-6">
            Pump.fun tts Donations
          </h1>
          
          <div className="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex justify-center">
            <Link href="/setup" className="inline-flex items-center border-2 border-black bg-white text-white font-semibold px-8 py-3 rounded-lg">
              Create Donation Page
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
            <Link href="/demo" className="inline-flex items-center border-2 border-black text-black font-semibold px-8 py-3 rounded-lg">
              View Demo
            </Link>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mt-16 max-w-4xl mx-auto">
          <div className="text-center">
            <h3 className="text-xl font-semibold text-black mb-2">Instant Payments</h3>
            <p className="text-gray-600">Fast Solana transactions with low fees</p>
          </div>
          
          <div className="text-center">
            <h3 className="text-xl font-semibold text-black mb-2">OBS Integration</h3>
            <p className="text-gray-600">Live donation alerts with text-to-speech</p>
          </div>
          
          <div className="text-center">
            <h3 className="text-xl font-semibold text-black mb-2">Customizable</h3>
            <p className="text-gray-600">Personalize your donation page and alerts</p>
          </div>
        </div>
      </div>
    </div>
  )
}