// app/demo/page.js
import Link from 'next/link'
import { ArrowLeft, ExternalLink } from 'lucide-react'

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Link 
            href="/"
            className="inline-flex items-center text-purple-600 hover:text-purple-700 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Demo</h1>
          <p className="text-gray-600">See how the donation platform works</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Example Donation Page
            </h2>
            <p className="text-gray-600 mb-4">
              This is what your supporters will see when they visit your donation page.
            </p>
            <div className="bg-gradient-to-br from-purple-100 to-blue-100 rounded-lg p-6 mb-4">
              <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm mx-auto">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    💜
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Demo Creator</h3>
                  <p className="text-gray-600 text-sm">Supporting amazing content!</p>
                </div>
                <div className="space-y-3">
                  <input 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    placeholder="0.1"
                    readOnly
                  />
                  <textarea 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    placeholder="Keep up the great work!"
                    readOnly
                    rows={2}
                  />
                  <button className="w-full bg-purple-600 text-white font-medium py-2 rounded-md text-sm">
                    Connect Wallet to Donate
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              OBS Widget Preview
            </h2>
            <p className="text-gray-600 mb-4">
              Live donation alerts that appear on your stream with text-to-speech.
            </p>
            <div className="bg-gray-900 rounded-lg p-6 relative h-64">
              <div className="absolute top-4 right-4 bg-black bg-opacity-80 text-white p-3 rounded-lg max-w-xs animate-slide-in">
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-sm">
                    💜
                  </div>
                  <div>
                    <p className="font-bold text-sm">0.5 SOL</p>
                    <p className="text-xs opacity-90">Thanks for the great stream!</p>
                  </div>
                </div>
              </div>
              <div className="absolute bottom-4 left-4 text-white text-sm opacity-50">
                Your stream content here...
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            How It Works
          </h2>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-xl">1️⃣</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Create Account</h3>
              <p className="text-sm text-gray-600">Connect wallet and set up your donation page</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-xl">2️⃣</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Share Link</h3>
              <p className="text-sm text-gray-600">Share your donation page with supporters</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-xl">3️⃣</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Add to OBS</h3>
              <p className="text-sm text-gray-600">Add widget as browser source for live alerts</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-xl">4️⃣</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Receive Donations</h3>
              <p className="text-sm text-gray-600">Get instant SOL donations with messages</p>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link 
            href="/setup"
            className="inline-flex items-center bg-purple-600 hover:bg-purple-700 text-white font-semibold px-8 py-3 rounded-lg transition-colors"
          >
            Get Started Now
            <ExternalLink className="ml-2 h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  )
}