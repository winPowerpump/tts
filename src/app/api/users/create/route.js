// app/api/users/create/route.js
import { createServiceClient } from "@/lib/supabase-server"
import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const { username, displayName, bio, pageColor, walletAddress } = await request.json()

    // Validate required fields
    if (!username || !displayName || !walletAddress) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate username format
    if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
      return NextResponse.json(
        { error: 'Username can only contain letters, numbers, underscores, and hyphens' },
        { status: 400 }
      )
    }

    const supabase = createServiceClient()

    // Check if username already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('username', username)
      .single()

    if (existingUser) {
      return NextResponse.json(
        { error: 'Username already taken' },
        { status: 409 }
      )
    }

    // Create user
    const { data: user, error } = await supabase
      .from('users')
      .insert({
        username,
        display_name: displayName,
        bio: bio || null,
        wallet_address: walletAddress,
        page_color: pageColor || '#6366f1'
      })
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to create user' },
        { status: 500 }
      )
    }

    return NextResponse.json({ user })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
