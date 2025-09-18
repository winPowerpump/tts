// app/api/webhooks/helius/route.js
import { createServiceClient } from "@/lib/supabase-server"
import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    // Verify webhook signature
    const signature = request.headers.get('authorization')
    if (signature !== `Bearer ${process.env.HELIUS_WEBHOOK_SECRET}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const webhookData = await request.json()
    const supabase = createServiceClient()

    // Process transaction data from Helius webhook
    for (const transaction of webhookData) {
      if (transaction.type === 'TRANSFER') {
        // Find recipient in our database
        const { data: recipient } = await supabase
          .from('users')
          .select('id')
          .eq('wallet_address', transaction.accountData[0].account)
          .single()

        if (recipient) {
          // Check if we already have this donation
          const { data: existing } = await supabase
            .from('donations')
            .select('id')
            .eq('signature', transaction.signature)
            .single()

          if (!existing) {
            // Save new donation
            await supabase
              .from('donations')
              .insert({
                recipient_id: recipient.id,
                donor_wallet: transaction.feePayer,
                signature: transaction.signature,
                amount: transaction.nativeTransfers[0].amount / 1e9, // Convert lamports to SOL
                message: null // Extract from memo if available
              })
          }
        }
      }
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}