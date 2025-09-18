// app/dashboard/[userId]/page.js
import { createServerComponentClient } from '@/lib/supabase-server'
import { notFound } from 'next/navigation'
import DashboardClient from './dashboard-client'

export default async function DashboardPage({ params }) {
  const supabase = createServerComponentClient()
  
  const { data: user } = await supabase
    .from('users')
    .select('*')
    .eq('id', params.userId)
    .single()

  if (!user) {
    notFound()
  }

  // Get recent donations
  const { data: donations } = await supabase
    .from('donations')
    .select('*')
    .eq('recipient_id', params.userId)
    .order('processed_at', { ascending: false })
    .limit(10)

  return <DashboardClient user={user} initialDonations={donations || []} />
}