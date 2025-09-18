// app/donate/[username]/page.js
import { createServerComponentClient } from '@/lib/supabase-server'
import DonationForm from './donation-form'
import { notFound } from 'next/navigation'

export async function generateMetadata({ params }) {
  const supabase = createServerComponentClient()
  
  const { data: user } = await supabase
    .from('users')
    .select('display_name, bio')
    .eq('username', params.username)
    .single()

  if (!user) {
    return {
      title: 'User Not Found - Solana Donations'
    }
  }

  return {
    title: `Donate to ${user.display_name}`,
    description: user.bio || `Support ${user.display_name} with Solana donations`
  }
}

export default async function DonatePage({ params }) {
  const supabase = createServerComponentClient()
  
  const { data: user } = await supabase
    .from('users')
    .select('*')
    .eq('username', params.username)
    .single()

  if (!user) {
    notFound()
  }

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4"
    >
      <DonationForm recipient={user} />
    </div>
  )
}