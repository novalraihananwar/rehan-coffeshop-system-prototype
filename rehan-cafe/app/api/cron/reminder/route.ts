import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://rehan-coffeshop-system-prototype.vercel.app'

export async function GET(req: NextRequest) {
  // Verify cron secret to prevent unauthorized calls
  const authHeader = req.headers.get('authorization')
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const now = new Date()
  const reminderTime = new Date(now.getTime() + 10 * 60 * 1000) // 10 minutes from now

  const reminderDate = reminderTime.toISOString().split('T')[0]
  const reminderHour = String(reminderTime.getHours()).padStart(2, '0')
  const reminderMinute = String(reminderTime.getMinutes()).padStart(2, '0')
  const reminderHHMM = `${reminderHour}:${reminderMinute}`

  // Find reservations at exactly the reminder time that haven't been reminded yet
  const { data: reservations } = await supabase
    .from('reservations')
    .select('*')
    .eq('date', reminderDate)
    .eq('time', reminderHHMM)
    .eq('reminder_sent', false)
    .eq('status', 'confirmed')

  if (!reservations || reservations.length === 0) {
    return NextResponse.json({ ok: true, reminded: 0 })
  }

  let reminded = 0
  for (const rsv of reservations) {
    if (!rsv.customer_phone) continue

    try {
      await fetch(`${APP_URL}/api/send-wa`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'reminder',
          phone: rsv.customer_phone,
          name: rsv.customer_name,
          table: rsv.table_number,
          date: rsv.date,
          time: rsv.time,
          guests: rsv.guest_count,
        }),
      })

      await supabase.from('reservations').update({ reminder_sent: true }).eq('id', rsv.id)
      reminded++
    } catch {
      // Continue with other reservations even if one fails
    }
  }

  return NextResponse.json({ ok: true, reminded })
}
