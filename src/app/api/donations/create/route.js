// app/api/donations/create/route.js
import { createServiceClient } from '@/lib/supabase-server'
import { validateSolanaTransaction } from '@/lib/solana'
import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const { recipientId, signature, amount, message, donorWallet } = await request.json()

    // Validate required fields
    if (!recipientId || !signature || !amount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const supabase = createServiceClient()

    // Get recipient wallet address
    const { data: recipient } = await supabase
      .from('users')
      .select('wallet_address')
      .eq('id', recipientId)
      .single()

    if (!recipient) {
      return NextResponse.json(
        { error: 'Recipient not found' },
        { status: 404 }
      )
    }

    // Validate Solana transaction
    const validation = await validateSolanaTransaction(
      signature,
      recipient.wallet_address,
      amount
    )

    if (!validation.valid) {
      return NextResponse.json(
        { error: 'Invalid transaction: ' + validation.error },
        { status: 400 }
      )
    }

    // Check if donation already exists
    const { data: existingDonation } = await supabase
      .from('donations')
      .select('id')
      .eq('signature', signature)
      .single()

    if (existingDonation) {
      return NextResponse.json(
        { error: 'Donation already recorded' },
        { status: 409 }
      )
    }

    // Save donation
    const { data: donation, error } = await supabase
      .from('donations')
      .insert({
        recipient_id: recipientId,
        donor_wallet: donorWallet,
        signature,
        amount: validation.amount,
        message: message?.substring(0, 200) || null
      })
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to save donation' },
        { status: 500 }
      )
    }

    return NextResponse.json({ donation }, { status: 201 })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}