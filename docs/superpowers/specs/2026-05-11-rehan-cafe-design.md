# Rehan Cafe & Eatery — Design Spec
**Date:** 2026-05-11  
**Scope:** Frontend Prototype (Phase 1)  
**Status:** Approved

---

## Overview

Sistem manajemen cafe modern untuk **Rehan Cafe & Eatery** dengan dua sisi utama:
1. **Customer Side** — QR ordering, menu, reservasi, checkout, tracking, review
2. **Admin Dashboard** — operasional realtime, inventory, kitchen display, role management

Phase 1 adalah **frontend prototype lengkap** dengan mock data dan simulated realtime. Backend Express/Node diintegrasikan di Phase 2.

---

## Visual Design System

### Arah Visual: Warm Luxury
Mood: hangat, mewah, premium seperti specialty coffee cafe modern.

| Token | Value | Penggunaan |
|---|---|---|
| `cream-base` | `#F5EDD8` | Background utama |
| `warm-white` | `#FFFAF4` | Card, surface |
| `latte` | `#D4B896` | Border, divider |
| `espresso-light` | `#D4A96A` | Accent, highlight |
| `espresso-mid` | `#8B6240` | Secondary text |
| `espresso-dark` | `#6B4226` | Primary button, CTA |
| `espresso-deep` | `#3D2314` | Sidebar, heading |
| `espresso-black` | `#2A1608` | Sidebar gradient |
| `olive-sage` | `#5C6B52` | Badge, tag aksen |
| `text-muted` | `#A08060` | Label, placeholder |

### Typography
- **Font:** Inter (utama) + Poppins (heading display)
- **Heading:** Poppins 700–800, tracking tight
- **Body:** Inter 400–600
- **Label:** Inter 500, uppercase, letter-spacing 1.5px

### Design Principles
- Rounded corners: `border-radius: 12–16px` untuk card, `20px` untuk pill/badge
- Shadow: `0 4px 20px rgba(107,66,38,0.12)` — soft warm shadow
- Glassmorphism ringan: `backdrop-filter: blur(8px)` + `bg-white/80` untuk overlay card
- Animasi: Framer Motion, `ease-out` 200–300ms, tidak ada yang jarring
- Whitespace: generous padding, konten tidak cramped

---

## Tech Stack

| Layer | Teknologi |
|---|---|
| Framework | Next.js 14 (App Router) + TypeScript |
| Styling | Tailwind CSS + custom design tokens |
| Components | Shadcn/ui (di-theme dengan Warm Luxury) |
| Animation | Framer Motion |
| Charts | Recharts |
| State | Zustand |
| Data | Mock JSON files + setInterval untuk simulated realtime |
| Icons | Lucide React |

---

## Struktur Aplikasi

```
/app
  /(customer)/
    table/[tableId]/
      page.tsx                ← Menu utama (grid foto)
      detail/[menuId]/page.tsx
      cart/page.tsx
      checkout/page.tsx
      success/page.tsx
      tracking/page.tsx
      reservation/page.tsx
      review/page.tsx
  /(admin)/
    admin/
      login/page.tsx
      dashboard/page.tsx
      orders/page.tsx
      kitchen/page.tsx
      menu/page.tsx
      tables/page.tsx
      inventory/page.tsx
      staff/page.tsx
      loyalty/page.tsx
      reports/page.tsx
      suppliers/page.tsx
      activity/page.tsx
      settings/page.tsx

/components
  /customer/
    MenuGrid.tsx
    MenuCard.tsx
    CartBar.tsx
    CategoryTabs.tsx
    OrderTracking.tsx
  /admin/
    Sidebar.tsx
    StatCard.tsx
    OrderTable.tsx
    KitchenDisplay.tsx
    TableMap.tsx
    SalesChart.tsx
  /ui/                        ← shared (Button, Badge, Modal, dll)

/lib
  /mock-data/
    menu.ts                   ← 30+ menu items
    orders.ts
    tables.ts                 ← 100 meja
    staff.ts
    inventory.ts
    customers.ts
    suppliers.ts
  /store/
    cart.store.ts
    order.store.ts
    admin.store.ts
  /utils/
    format.ts                 ← currency, date formatter
    mock-realtime.ts          ← setInterval simulators
```

---

## Customer Side — Halaman Detail

### 1. QR Landing / Splash
- URL: `/table/[tableId]`
- Nomor meja auto-detect dari URL param (tidak perlu input manual)
- Splash screen 1.5 detik dengan logo + animasi, lalu redirect ke menu
- Pilihan mode: **Dine In** / **Takeaway** / **Pre-order**

### 2. Menu Utama
- Layout: **Grid 2 kolom** dengan foto besar mendominasi
- Category tabs horizontal scroll: Semua / Kopi / Non-Kopi / Makanan / Dessert / Bundle
- Setiap card: foto, nama, deskripsi singkat, harga, tombol `+ Tambah`
- Filter: Bestseller / New / Promo
- Sticky cart bar di bawah (muncul saat ada item di cart)
- Search menu

### 3. Detail Menu
- Foto fullscreen dengan overlay gradient
- Nama, deskripsi, rating
- Pilihan ukuran: Small / Medium / Large (dengan perbedaan harga)
- Catatan pesanan (free text)
- Quantity selector
- Tombol "Tambah ke Keranjang"
- Bundle suggestion ("Cocok dimakan dengan...")

### 4. Keranjang
- List item dengan foto kecil, nama, ukuran, jumlah, harga
- Edit quantity / hapus item
- Catatan untuk dapur
- Total harga + estimasi waktu
- Tombol "Pesan Sekarang"

### 5. Checkout
- Ringkasan order
- Pilih metode bayar: QRIS / GoPay / OVO / Dana / Debit / Kredit / Cash / Bayar di Kasir
- Tampilan QR code animasi (mock) untuk QRIS
- Konfirmasi pesanan

### 6. Payment Success
- Animasi konfetti/checkmark
- Nomor antrian besar (misal: **A-047**)
- Estimasi waktu: "Pesananmu siap dalam ~15 menit"
- Detail pesanan lengkap (struk digital)
- Info WiFi di bawah struk:
  ```
  WiFi Access  : REHAN-GUEST
  Password     : ngopidulu2026
  ```
- Tombol "Lacak Pesanan" dan "Pesan Lagi"

### 7. Order Tracking
- Status timeline: Pesanan Diterima → Sedang Diproses → Siap Diambil → Selesai
- Simulated progress dengan setInterval
- Estimasi waktu countdown
- Detail item yang dipesan

### 8. Reservasi
- Pilih tanggal & waktu
- Visual grid meja (simplified): hijau = kosong, coklat = terisi, kuning = reserved
- Pilih meja yang diinginkan
- Input nama & jumlah tamu
- Konfirmasi reservasi

### 9. Review
- Rating bintang (1–5) untuk makanan, minuman, pelayanan, suasana
- Text ulasan opsional
- Upload foto opsional (mock)
- Submit → animasi terima kasih

---

## Menu Data (Mock)

### Minuman (Kopi)
| Menu | Harga (M) |
|---|---|
| Caramel Latte | Rp 38.000 |
| Spanish Latte | Rp 42.000 |
| Americano | Rp 28.000 |
| Cappuccino | Rp 32.000 |
| Matcha Latte | Rp 40.000 |
| Vanilla Latte | Rp 38.000 |
| Hazelnut Latte | Rp 38.000 |
| Cafe Mocha | Rp 40.000 |
| Butterscotch Latte | Rp 40.000 |
| Affogato | Rp 45.000 |
| V60 Manual Brew | Rp 35.000 |
| Aeropress | Rp 35.000 |
| Cold Brew | Rp 38.000 |

### Minuman (Non-Kopi)
| Menu | Harga (M) |
|---|---|
| Chocolate Signature | Rp 38.000 |
| Matcha Milk | Rp 36.000 |
| Lychee Tea | Rp 32.000 |
| Peach Tea | Rp 32.000 |
| Mojito Lychee | Rp 35.000 |
| Mojito Passion Fruit | Rp 35.000 |
| Strawberry Milk | Rp 35.000 |

### Makanan
| Menu | Harga |
|---|---|
| Chicken Katsu | Rp 55.000 |
| Creamy Pasta | Rp 58.000 |
| Spaghetti Bolognese | Rp 58.000 |
| Truffle Fries | Rp 45.000 |
| Croissant Sandwich | Rp 52.000 |
| Beef Blackpepper Rice | Rp 65.000 |
| Chicken Salted Egg | Rp 62.000 |
| Chicken Rice Bowl | Rp 52.000 |
| Salmon Rice Bowl | Rp 72.000 |
| Beef Steak | Rp 95.000 |

### Dessert
| Menu | Harga |
|---|---|
| Cheesecake | Rp 42.000 |
| Croffle | Rp 38.000 |
| Tiramisu | Rp 45.000 |
| Chocolate Lava | Rp 45.000 |

### Bundle Packages
| Paket | Isi | Harga |
|---|---|---|
| Coffee & Croffle Package | 1 Latte + Croffle | Rp 68.000 |
| Dinner Couple Package | 2 Main Course + 2 Drinks | Rp 175.000 |
| Study All Day Pack | 1 Manual Brew + Croissant Sandwich | Rp 78.000 |
| Sweet Treat Bundle | Cheesecake + Matcha Latte | Rp 70.000 |

---

## Admin Side — Halaman Detail

### Layout Admin
- **Sidebar kiri** lebar dengan icon + label navigasi, gradient espresso gelap (`#2A1608` → `#3D2314`)
- Header konten dengan breadcrumb + branch selector dropdown + notifikasi bell + avatar
- Konten utama dengan background `#F5EDD8` / `#FFFAF4`

### Role & Akses

| Role | Email Login | Akses |
|---|---|---|
| **Super Admin** | superadmin@rehancafe.com | Seluruh cabang, seluruh laporan, management role & sistem, monitoring realtime semua aktivitas |
| **Owner** | owner@rehancafe.com | Dashboard pemasukan, profit & loss, multi-branch analytics, laporan penjualan, monitoring meja & order realtime |
| **Manager Cabang** | manager.kedungkandang@rehancafe.com | Operasional cabang, stock management, supplier management, jadwal staff, approval pembelian bahan |
| **Kasir** | cashier01@rehancafe.com | Input pembayaran, print struk, verifikasi transaksi, melihat meja kosong/terisi, customer order handling |
| **Barista** | barista01@rehancafe.com | Melihat pesanan minuman, update status drink, queue preparation realtime |
| **Kitchen Staff** | kitchen01@rehancafe.com | Melihat pesanan makanan, update status makanan, kitchen display system |
| **Staff Gudang / Inventory** | inventory@rehancafe.com | Monitoring stock bahan baku, update stock masuk/keluar, expired reminder, supplier stock tracking |
| **Supplier Portal** | supplier.arabica@rehancafe.com | Melihat purchase order, upload invoice bahan, konfirmasi pengiriman |
| **Customer Member** | member@guest.com | Loyalty point, histori order, reservasi meja, promo member |

### Role-Based Page Access (Mock Frontend)

| Halaman Admin | Super Admin | Owner | Manager | Kasir | Barista | Kitchen | Inventory | Supplier |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| Dashboard Overview | ✅ | ✅ | ✅ | — | — | — | — | — |
| Orders | ✅ | ✅ | ✅ | ✅ | — | — | — | — |
| Kitchen Display | ✅ | — | ✅ | — | ✅ (minuman) | ✅ (makanan) | — | — |
| Menu Management | ✅ | ✅ | ✅ | — | — | — | — | — |
| Table Map | ✅ | ✅ | ✅ | ✅ | — | — | — | — |
| Inventory | ✅ | ✅ | ✅ | — | — | — | ✅ | — |
| Staff & Role | ✅ | — | ✅ | — | — | — | — | — |
| Loyalty & Customer | ✅ | ✅ | ✅ | ✅ | — | — | — | — |
| Laporan | ✅ | ✅ | ✅ | — | — | — | — | — |
| Supplier | ✅ | — | ✅ | — | — | — | ✅ | ✅ |
| Activity Log | ✅ | ✅ | — | — | — | — | — | — |
| Settings | ✅ | — | — | — | — | — | — | — |

### 1. Dashboard Overview
- Header: tanggal hari ini + branch selector
- Stat cards (6): Total Pendapatan, Total Orders, Customer Hari Ini, Meja Aktif, Avg Order Value, Profit Bersih
- Grafik penjualan per jam (line chart, simulated realtime dengan setInterval)
- Grafik jam paling ramai (bar chart)
- Top 5 menu terlaris (ranked list)
- Order terbaru (5 order terakhir, live update)
- Stock menipis (notifikasi merah jika stock < threshold)

### 2. Order Management
- Table view semua order dengan status badge
- Status: Pending → Confirmed → Preparing → Ready → Completed → Cancelled
- Filter: by status, by meja, by waktu
- Klik order → detail order slide panel
- Tombol ubah status order
- Simulated incoming order setiap beberapa detik

### 3. Kitchen Display (KDS)
- Tampilan fullscreen, font besar, dark mode
- Card per order: nomor meja, nomor antrian, list item, waktu masuk
- Column: Antrian / Sedang Dibuat / Siap
- Warna urgent jika sudah > 15 menit
- Tombol "Selesai" per item / per order
- Auto-refresh simulated

### 4. Menu Management
- Grid semua menu dengan foto, nama, harga, status (aktif/nonaktif)
- Add / Edit / Delete menu
- Upload foto (mock)
- Set harga per ukuran (S/M/L)
- Toggle available/unavailable (misal habis hari ini)
- Manage bundle packages

### 5. Table Map (Visual Layout Meja)
- Grid visual ~100 meja dengan nomor
- Status warna: 🟢 Kosong / 🟫 Terisi / 🟡 Reserved / ⬜ Cleaning
- Klik meja → detail (siapa, order apa, berapa lama)
- Ubah status meja manual
- Simulated occupancy berubah realtime

### 6. Inventory
- **Stock Bahan Baku:** nama bahan, satuan, stock saat ini, threshold minimum, tanggal expired
- Badge merah jika stock < minimum
- Badge kuning jika mendekati expired (< 3 hari)
- Notifikasi panel di atas
- **Stock Produk Jadi:** menu yang stoknya terbatas
- Simulated pengurangan otomatis per order (mock)

### 7. Staff & Role Management
- List semua staff dengan nama, role, cabang, status aktif
- Add / Edit staff
- Assign role
- Activity summary per staff

### 8. Loyalty & Customer
- List member dengan poin, tier (Bronze/Silver/Gold)
- Histori transaksi per customer
- Statistik member baru per bulan

### 9. Laporan & Analitik
- Grafik pendapatan: harian / mingguan / bulanan
- Grafik performa per cabang (multi-branch)
- Table transaksi dengan export mock (CSV)
- Grafik kategori menu terlaris

### 10. Supplier Management
- List supplier dengan nama, produk, kontak
- Add / Edit supplier
- Riwayat pembelian (mock)

### 11. Activity Log
- Timeline semua aktivitas: order masuk, pembayaran, perubahan menu, login staff
- Filter by type / by user / by waktu

### 12. Settings
- Info cafe (nama, logo, alamat, nomor WhatsApp)
- Konfigurasi WiFi (nama + password yang tampil di struk)
- Jam operasional
- Branch management (tambah/edit cabang)
- Printer settings (mock)

---

## Simulated Realtime (Mock)

Karena ini frontend prototype, "realtime" disimulasikan dengan:

| Fitur | Mekanisme |
|---|---|
| Order baru masuk | `setInterval` 15–30 detik, tambah order random ke store |
| Status order berubah | `setInterval` per order, progress otomatis |
| Grafik penjualan | `setInterval` 5 detik, update nilai chart |
| Meja berubah status | Triggered saat order masuk/selesai di store |
| Stock berkurang | Triggered saat order confirmed di store |
| Notifikasi bell | Aggregasi event dari semua store |

---

## Constraints & Decisions

- **No backend Phase 1** — semua data dari mock JSON + Zustand store, tidak ada API call
- **No real auth** — admin login mock dengan hardcoded credentials per role:
  - Super Admin: `superadmin@rehancafe.com` / `RehanMaster#2026`
  - Owner: `owner@rehancafe.com` / `OwnerCafe#2026`
  - Manager: `manager.kedungkandang@rehancafe.com` / `ManagerCafe#2026`
  - Kasir: `cashier01@rehancafe.com` / `Cashier#2026`
  - Barista: `barista01@rehancafe.com` / `BrewCoffee#2026`
  - Kitchen Staff: `kitchen01@rehancafe.com` / `KitchenPrep#2026`
  - Inventory: `inventory@rehancafe.com` / `Inventory#2026`
  - Supplier Portal: `supplier.arabica@rehancafe.com` / `Supplier#2026`
  - Customer Member: `member@guest.com` / `GuestCafe#2026`
- **Multi-branch mock** — 3 cabang: Cabang Utama (Sudirman), Cabang Selatan (Fatmawati), Cabang Timur (Bekasi)
- **No real payment** — checkout flow UI lengkap tapi tidak ada payment gateway
- **No file upload** — foto menu dari Unsplash URL (static, warm-toned food photography)
- **Mobile-first customer side** — dioptimalkan untuk HP (320px–430px)
- **Desktop-first admin side** — dioptimalkan untuk laptop/tablet (1024px+)
- **Responsive breakpoints** — customer: mobile only; admin: md/lg breakpoint
