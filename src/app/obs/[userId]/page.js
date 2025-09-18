// app/obs/[userId]/page.js (Fixed - remove styled-jsx)
import { createServerComponentClient } from '@/lib/supabase-server'
import { notFound } from 'next/navigation'
import OBSWidget from './obs-widget'

export default async function OBSWidgetPage({ params, searchParams }) {
  const supabase = createServerComponentClient()
  
  const { data: user } = await supabase
    .from('users')
    .select('id, display_name')
    .eq('id', params.userId)
    .single()

  if (!user) {
    notFound()
  }

  const settings = {
    showAmount: searchParams.showAmount !== 'false',
    showMessage: searchParams.showMessage !== 'false',
    displayDuration: parseInt(searchParams.duration || '5000'),
    fontSize: searchParams.fontSize || '24px',
    fontColor: searchParams.fontColor || '#ffffff',
    backgroundColor: searchParams.backgroundColor || 'rgba(0,0,0,0.8)',
    enableTTS: searchParams.tts !== 'false'
  }

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>OBS Donation Widget</title>
      </head>
      <body className="obs-body">
        <div className="obs-container">
          <OBSWidget userId={params.userId} settings={settings} />
        </div>
      </body>
    </html>
  )
}