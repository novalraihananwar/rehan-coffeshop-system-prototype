import { ImageResponse } from '@vercel/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const name = searchParams.get('name') ?? 'Customer'
  const table = searchParams.get('table') ?? '-'
  const date = searchParams.get('date') ?? '-'
  const time = searchParams.get('time') ?? '-'
  const guests = searchParams.get('guests') ?? '2'
  const total = searchParams.get('total') ?? '0'
  const phone = searchParams.get('phone') ?? ''
  const itemsRaw = searchParams.get('items') ?? ''

  const items = itemsRaw ? itemsRaw.split('|').map((i) => {
    const [namePart, price] = i.split(':')
    return { name: namePart, price }
  }) : []

  const formatted = new Intl.NumberFormat('id-ID').format(Number(total))

  return new ImageResponse(
    (
      <div
        style={{
          width: '600px',
          minHeight: '800px',
          background: '#FDF8F2',
          display: 'flex',
          flexDirection: 'column',
          fontFamily: 'serif',
          padding: '48px 40px',
          border: '1px solid #E8D5BC',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '32px' }}>
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#2C1810', letterSpacing: '3px', textTransform: 'uppercase' }}>
            Rehan Cafe & Eatery
          </div>
          <div style={{ fontSize: '13px', color: '#8B6347', marginTop: '4px', letterSpacing: '1px' }}>
            STRUK RESERVASI
          </div>
          <div style={{ width: '200px', height: '1px', background: '#D4A96A', marginTop: '16px' }} />
        </div>

        {/* Reservation Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '28px' }}>
          {[
            ['Nama', name],
            ['No. HP', phone || '-'],
            ['Meja', `No. ${table}`],
            ['Tanggal', date],
            ['Jam', time],
            ['Jumlah Tamu', `${guests} orang`],
          ].map(([label, val]) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#4A2C1A' }}>
              <span style={{ color: '#8B6347' }}>{label}</span>
              <span style={{ fontWeight: 'bold' }}>{val}</span>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div style={{ width: '100%', height: '1px', background: '#E8D5BC', marginBottom: '20px' }} />

        {/* Items */}
        {items.length > 0 && (
          <>
            <div style={{ fontSize: '12px', color: '#8B6347', fontWeight: 'bold', letterSpacing: '1px', marginBottom: '12px' }}>
              PESANAN
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
              {items.map((item, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#4A2C1A' }}>
                  <span>{item.name}</span>
                  <span style={{ fontWeight: 'bold' }}>Rp {new Intl.NumberFormat('id-ID').format(Number(item.price))}</span>
                </div>
              ))}
            </div>
            <div style={{ width: '100%', height: '1px', background: '#E8D5BC', marginBottom: '16px' }} />
          </>
        )}

        {/* Total */}
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: 'bold', color: '#2C1810', marginBottom: '32px' }}>
          <span>TOTAL</span>
          <span>Rp {formatted}</span>
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: '200px', height: '1px', background: '#D4A96A', marginBottom: '12px' }} />
          <div style={{ fontSize: '13px', color: '#8B6347', textAlign: 'center' }}>
            Harap datang 5 menit sebelum waktu reservasi
          </div>
          <div style={{ fontSize: '12px', color: '#A08060', textAlign: 'center' }}>
            Pesanan akan diproses pada pukul {time}
          </div>
          <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#6B4226', marginTop: '12px' }}>
            Terima kasih & selamat datang!
          </div>
        </div>
      </div>
    ),
    { width: 600, height: 900 }
  )
}
