// app/api/donations/[userId]/route.js
import { createServiceClient } from "@/lib/supabase-server"
import { NextResponse } from 'next/server'

export async function GET(request, { params }) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit')) || 50

    const supabase = createServiceClient()

    const { data: donations, error } = await supabase
      .from('donations')
      .select('*')
      .eq('recipient_id', params.userId)
      .order('processed_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch donations' },
        { status: 500 }
      )
    }

    return NextResponse.json({ donations })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}