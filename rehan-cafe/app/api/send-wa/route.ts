import { NextRequest, NextResponse } from 'next/server'

const FONNTE_TOKEN = process.env.FONNTE_TOKEN
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://rehan-coffeshop-system-prototype.vercel.app'

export async function POST(req: NextRequest) {
  if (!FONNTE_TOKEN) {
    return NextResponse.json({ error: 'FONNTE_TOKEN not configured' }, { status: 500 })
  }

  const body = await req.json()
  const { phone, name, table, date, time, guests, total, items, type } = body

  // Normalize phone: remove leading 0, add 62 prefix
  const normalized = phone.replace(/\D/g, '').replace(/^0/, '62').replace(/^(\d)/, '62$1').replace(/^6262/, '62')

  if (type === 'reminder') {
    const text = `🔔 *Reminder Reservasi — Rehan Cafe & Eatery*\n\nHalo *${name}*!\n\nReservasimu akan dimulai dalam *10 menit* lagi.\n\n📅 ${date} · ⏰ ${time}\n🪑 Meja ${table} — ${guests} orang\n\nHarap datang tepat waktu. Pesananmu akan segera diproses!\n\n_Rehan Cafe & Eatery_`

    await sendFonnte(normalized, text)
    return NextResponse.json({ ok: true })
  }

  // Confirmation message with receipt image
  const itemsParam = (items as { name: string; price: number }[])
    .map((i) => `${i.name}:${i.price}`).join('|')

  const receiptUrl = `${APP_URL}/api/receipt?name=${encodeURIComponent(name)}&table=${table}&date=${date}&time=${time}&guests=${guests}&total=${total}&phone=${encodeURIComponent(phone)}&items=${encodeURIComponent(itemsParam)}`

  const text = `✅ *Reservasi Terkonfirmasi!*\n\n*Rehan Cafe & Eatery*\n\nHalo *${name}*! Reservasimu sudah dikonfirmasi.\n\n📅 ${date} · ⏰ ${time}\n🪑 Meja ${table} — ${guests} orang\n💰 Total: Rp ${Number(total).toLocaleString('id-ID')}\n\nStruk reservasimu ada di gambar di atas.\nHarap datang 5 menit sebelum waktu reservasi.\n\n_Terima kasih & sampai jumpa!_`

  // Send image first, then text
  await sendFonnteImage(normalized, receiptUrl, text)

  return NextResponse.json({ ok: true })
}

async function sendFonnte(target: string, message: string) {
  return fetch('https://api.fonnte.com/send', {
    method: 'POST',
    headers: { Authorization: FONNTE_TOKEN!, 'Content-Type': 'application/json' },
    body: JSON.stringify({ target, message }),
  })
}

async function sendFonnteImage(target: string, url: string, caption: string) {
  return fetch('https://api.fonnte.com/send', {
    method: 'POST',
    headers: { Authorization: FONNTE_TOKEN!, 'Content-Type': 'application/json' },
    body: JSON.stringify({ target, message: caption, type: 'image', url }),
  })
}
