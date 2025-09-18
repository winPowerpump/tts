// app/setup/page.js
import SetupForm from './setup-form'

export default function SetupPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 flex justify-center items-center">
      <div className="container mx-auto px-4">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Create Donation Page
            </h1>
          </div>
          
          <SetupForm />
        </div>
      </div>
    </div>
  )
}