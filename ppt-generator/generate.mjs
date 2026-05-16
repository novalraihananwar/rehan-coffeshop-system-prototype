import { chromium } from 'playwright';
import PptxGenJS from 'pptxgenjs';
import fs from 'fs';
import path from 'path';

const BASE_URL = 'http://localhost:3000';
const SCREENSHOTS_DIR = './screenshots';

if (!fs.existsSync(SCREENSHOTS_DIR)) fs.mkdirSync(SCREENSHOTS_DIR);

const PAGES = [
  { name: 'splash',      url: '/table/1',              waitFor: 2000, label: 'QR Welcome Page' },
  { name: 'menu',        url: '/table/1',              scroll: 600,   waitFor: 2500, label: 'Menu Utama' },
  { name: 'cart',        url: '/table/1/cart',         waitFor: 2000, label: 'Keranjang Pesanan' },
  { name: 'checkout',    url: '/table/1/checkout',     waitFor: 2000, label: 'Halaman Checkout' },
  { name: 'tracking',    url: '/table/1/tracking',     waitFor: 2000, label: 'Order Tracking' },
  { name: 'reservation', url: '/table/1/reservation',  waitFor: 2000, label: 'Reservasi Meja' },
  { name: 'review',      url: '/table/1/review',       waitFor: 2000, label: 'Beri Ulasan' },
];

async function takeScreenshots() {
  console.log('Launching browser...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 }, // iPhone 14 size
    deviceScaleFactor: 2,
  });

  for (const page of PAGES) {
    const p = await context.newPage();
    console.log(`  Screenshot: ${page.label} (${page.url})`);
    await p.goto(BASE_URL + page.url, { waitUntil: 'networkidle' });
    await p.waitForTimeout(page.waitFor || 2000);
    if (page.scroll) {
      await p.evaluate((y) => window.scrollBy(0, y), page.scroll);
      await p.waitForTimeout(800);
    }
    await p.screenshot({ path: `${SCREENSHOTS_DIR}/${page.name}.png`, fullPage: false });
    await p.close();
    console.log(`  ✓ ${page.name}.png`);
  }

  // Admin screenshots (landscape)
  const adminCtx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1.5,
  });

  const adminPages = [
    { name: 'admin_login',     url: '/admin/login',     waitFor: 2000, label: 'Admin Login' },
    { name: 'admin_dashboard', url: '/admin/dashboard', waitFor: 3000, label: 'Dashboard Admin' },
    { name: 'admin_orders',    url: '/admin/orders',    waitFor: 2000, label: 'Manajemen Order' },
    { name: 'admin_menu',      url: '/admin/menu',      waitFor: 2000, label: 'Manajemen Menu' },
    { name: 'admin_tables',    url: '/admin/tables',    waitFor: 2000, label: 'Denah Meja' },
    { name: 'admin_kitchen',   url: '/admin/kitchen',   waitFor: 2000, label: 'Kitchen Display' },
  ];

  for (const page of adminPages) {
    const p = await adminCtx.newPage();
    console.log(`  Screenshot: ${page.label} (${page.url})`);

    if (page.url === '/admin/dashboard') {
      // Login first
      await p.goto(BASE_URL + '/admin/login', { waitUntil: 'networkidle' });
      await p.waitForTimeout(1500);
      const emailInput = await p.$('input[type="email"]');
      const passInput  = await p.$('input[type="password"]');
      if (emailInput && passInput) {
        await emailInput.fill('superadmin@rehancafe.com');
        await passInput.fill('RehanMaster#2026');
        await p.keyboard.press('Enter');
        await p.waitForTimeout(2500);
      }
    } else if (page.url !== '/admin/login') {
      // Go to login first, then target page
      await p.goto(BASE_URL + '/admin/login', { waitUntil: 'networkidle' });
      await p.waitForTimeout(1000);
      const emailInput = await p.$('input[type="email"]');
      const passInput  = await p.$('input[type="password"]');
      if (emailInput && passInput) {
        await emailInput.fill('superadmin@rehancafe.com');
        await passInput.fill('RehanMaster#2026');
        await p.keyboard.press('Enter');
        await p.waitForTimeout(2000);
      }
      await p.goto(BASE_URL + page.url, { waitUntil: 'networkidle' });
    } else {
      await p.goto(BASE_URL + page.url, { waitUntil: 'networkidle' });
    }

    await p.waitForTimeout(page.waitFor || 2000);
    await p.screenshot({ path: `${SCREENSHOTS_DIR}/${page.name}.png` });
    await p.close();
    console.log(`  ✓ ${page.name}.png`);
  }

  await browser.close();
  console.log('\nAll screenshots done!\n');
}

function imgToBase64(filePath) {
  if (!fs.existsSync(filePath)) return null;
  return fs.readFileSync(filePath).toString('base64');
}

async function buildPPT() {
  console.log('Building PowerPoint...');
  const pptx = new PptxGenJS();

  // ─── Theme ───────────────────────────────────────────────────────────────────
  const BROWN   = '3B1F0F';
  const CREAM   = 'FDF6EC';
  const GOLD    = 'C9A96E';
  const WHITE   = 'FFFFFF';
  const DARK    = '1A0F07';
  const GRAY    = '8B7355';

  pptx.layout = 'LAYOUT_WIDE'; // 13.33" x 7.5"
  pptx.author  = 'Rehan Cafe & Eatery';
  pptx.subject = 'Presentasi Sistem Digital';
  pptx.title   = 'Rehan Cafe & Eatery — Sistem Pemesanan Digital';

  const addBg = (slide, color = CREAM) => {
    slide.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: '100%', h: '100%', fill: { color } });
  };

  const addAccentLine = (slide, y = 0.85) => {
    slide.addShape(pptx.ShapeType.rect, { x: 0.4, y, w: 1.2, h: 0.06, fill: { color: GOLD } });
  };

  // ─── SLIDE 1: Cover ──────────────────────────────────────────────────────────
  {
    const s = pptx.addSlide();
    addBg(s, DARK);
    // Decorative top band
    s.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: '100%', h: 0.12, fill: { color: GOLD } });
    // Bottom band
    s.addShape(pptx.ShapeType.rect, { x: 0, y: 7.38, w: '100%', h: 0.12, fill: { color: GOLD } });

    s.addText('REHAN CAFE & EATERY', {
      x: 0.5, y: 1.5, w: 8, h: 1.2,
      fontSize: 48, bold: true, color: GOLD,
      fontFace: 'Georgia', charSpacing: 3,
    });
    s.addText('Sistem Pemesanan Digital Modern', {
      x: 0.5, y: 2.8, w: 8, h: 0.6,
      fontSize: 22, color: CREAM, fontFace: 'Calibri', italic: true,
    });
    s.addShape(pptx.ShapeType.rect, { x: 0.5, y: 3.5, w: 3, h: 0.05, fill: { color: GOLD } });
    s.addText('QR Ordering  •  Admin Dashboard  •  Realtime Kitchen Display', {
      x: 0.5, y: 3.8, w: 9, h: 0.5,
      fontSize: 14, color: GRAY, fontFace: 'Calibri',
    });
    s.addText('2026', {
      x: 0.5, y: 6.6, w: 2, h: 0.5,
      fontSize: 13, color: GOLD, fontFace: 'Calibri',
    });

    // Phone mockup placeholder if screenshot exists
    const img = imgToBase64('./screenshots/splash.png');
    if (img) {
      s.addImage({ data: `image/png;base64,${img}`, x: 9.5, y: 0.4, w: 3.2, h: 6.8, sizing: { type: 'contain', w: 3.2, h: 6.8 } });
    }
  }

  // ─── SLIDE 2: Tentang Sistem ─────────────────────────────────────────────────
  {
    const s = pptx.addSlide();
    addBg(s, CREAM);
    s.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: '100%', h: 0.1, fill: { color: BROWN } });
    s.addText('Tentang Sistem', { x: 0.4, y: 0.3, w: 12, h: 0.7, fontSize: 32, bold: true, color: BROWN, fontFace: 'Georgia' });
    addAccentLine(s, 1.05);

    const bullets = [
      { icon: '📱', title: 'QR Code Ordering',     desc: 'Pelanggan scan QR di meja → langsung pesan tanpa antri kasir' },
      { icon: '⚡', title: 'Realtime Dashboard',    desc: 'Owner & manager pantau order, revenue, dan aktivitas secara langsung' },
      { icon: '👨‍🍳', title: 'Kitchen Display (KDS)', desc: 'Dapur terima notifikasi pesanan otomatis — tidak perlu kertas bon' },
      { icon: '📊', title: 'Laporan Lengkap',       desc: 'Grafik penjualan harian, menu terlaris, dan performa staff' },
      { icon: '🪑', title: '100 Meja Terkelola',    desc: 'Denah meja interaktif, status occupied/available secara realtime' },
      { icon: '🎁', title: 'Program Loyalitas',     desc: 'Poin reward untuk pelanggan setia, kelola member dari dashboard' },
    ];

    bullets.forEach((b, i) => {
      const col = i % 2 === 0 ? 0.4 : 6.9;
      const row = Math.floor(i / 2);
      const y = 1.4 + row * 1.5;

      s.addShape(pptx.ShapeType.roundRect, { x: col, y, w: 6, h: 1.2, fill: { color: WHITE }, line: { color: GOLD, width: 1.5 }, rectRadius: 0.1 });
      s.addText(b.icon + '  ' + b.title, { x: col + 0.2, y: y + 0.1, w: 5.6, h: 0.4, fontSize: 13, bold: true, color: BROWN });
      s.addText(b.desc, { x: col + 0.2, y: y + 0.55, w: 5.6, h: 0.55, fontSize: 11, color: GRAY, wrap: true });
    });
  }

  // ─── SLIDE 3: Customer Journey ────────────────────────────────────────────────
  {
    const s = pptx.addSlide();
    addBg(s, CREAM);
    s.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: '100%', h: 0.1, fill: { color: BROWN } });
    s.addText('Pengalaman Pelanggan', { x: 0.4, y: 0.3, w: 12, h: 0.7, fontSize: 32, bold: true, color: BROWN, fontFace: 'Georgia' });
    addAccentLine(s, 1.05);

    const steps = [
      { num: '1', label: 'Scan QR di Meja' },
      { num: '2', label: 'Pilih Menu' },
      { num: '3', label: 'Tambah ke Keranjang' },
      { num: '4', label: 'Checkout & Bayar' },
      { num: '5', label: 'Tracking Order' },
      { num: '6', label: 'Makan & Beri Review' },
    ];

    steps.forEach((st, i) => {
      const x = 0.4 + i * 2.15;
      s.addShape(pptx.ShapeType.ellipse, { x: x + 0.55, y: 1.3, w: 1, h: 1, fill: { color: BROWN } });
      s.addText(st.num, { x: x + 0.55, y: 1.3, w: 1, h: 1, fontSize: 22, bold: true, color: GOLD, align: 'center', valign: 'middle' });
      if (i < 5) {
        s.addShape(pptx.ShapeType.rect, { x: x + 1.55, y: 1.76, w: 0.6, h: 0.08, fill: { color: GOLD } });
      }
      s.addText(st.label, { x, y: 2.5, w: 2, h: 0.6, fontSize: 11, color: BROWN, align: 'center', wrap: true, bold: true });
    });

    // Screenshots row
    const screenFiles = ['splash', 'menu', 'cart', 'checkout', 'tracking', 'review'];
    screenFiles.forEach((fname, i) => {
      const imgData = imgToBase64(`./screenshots/${fname}.png`);
      const x = 0.4 + i * 2.15;
      if (imgData) {
        s.addImage({ data: `image/png;base64,${imgData}`, x, y: 3.3, w: 2, h: 3.8, sizing: { type: 'contain', w: 2, h: 3.8 } });
      } else {
        s.addShape(pptx.ShapeType.roundRect, { x, y: 3.3, w: 2, h: 3.8, fill: { color: '8B7355' }, rectRadius: 0.1 });
        s.addText('No Image', { x, y: 4.8, w: 2, h: 0.5, fontSize: 10, color: WHITE, align: 'center' });
      }
    });
  }

  // ─── SLIDE 4: Customer — QR & Menu ──────────────────────────────────────────
  {
    const s = pptx.addSlide();
    addBg(s, CREAM);
    s.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: '100%', h: 0.1, fill: { color: BROWN } });
    s.addText('Tampilan Pelanggan — Menu & Pemesanan', { x: 0.4, y: 0.25, w: 12, h: 0.7, fontSize: 28, bold: true, color: BROWN, fontFace: 'Georgia' });
    addAccentLine(s, 1.0);

    const screens = [
      { file: 'splash',   cap: 'Welcome Screen\nScan QR Meja' },
      { file: 'menu',     cap: 'Menu Grid\nFoto + Harga' },
      { file: 'cart',     cap: 'Keranjang\nRingkasan Order' },
      { file: 'checkout', cap: 'Checkout\nPilih Pembayaran' },
    ];

    screens.forEach((sc, i) => {
      const x = 0.3 + i * 3.25;
      const imgData = imgToBase64(`./screenshots/${sc.file}.png`);
      if (imgData) {
        s.addImage({ data: `image/png;base64,${imgData}`, x, y: 1.2, w: 3, h: 5.3, sizing: { type: 'contain', w: 3, h: 5.3 } });
      } else {
        s.addShape(pptx.ShapeType.roundRect, { x, y: 1.2, w: 3, h: 5.3, fill: { color: GRAY }, rectRadius: 0.1 });
      }
      s.addText(sc.cap, { x, y: 6.6, w: 3, h: 0.7, fontSize: 11, color: BROWN, align: 'center', bold: true, wrap: true });
    });
  }

  // ─── SLIDE 5: Customer — Tracking & Reservasi ────────────────────────────────
  {
    const s = pptx.addSlide();
    addBg(s, CREAM);
    s.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: '100%', h: 0.1, fill: { color: BROWN } });
    s.addText('Tracking Order & Fitur Lainnya', { x: 0.4, y: 0.25, w: 12, h: 0.7, fontSize: 28, bold: true, color: BROWN, fontFace: 'Georgia' });
    addAccentLine(s, 1.0);

    const screens = [
      { file: 'tracking',    cap: 'Order Tracking\nStatus Realtime' },
      { file: 'reservation', cap: 'Reservasi Meja\nBooking Online' },
      { file: 'review',      cap: 'Beri Ulasan\nRating & Feedback' },
    ];

    screens.forEach((sc, i) => {
      const x = 0.8 + i * 4.1;
      const imgData = imgToBase64(`./screenshots/${sc.file}.png`);
      if (imgData) {
        s.addImage({ data: `image/png;base64,${imgData}`, x, y: 1.2, w: 3.6, h: 5.5, sizing: { type: 'contain', w: 3.6, h: 5.5 } });
      } else {
        s.addShape(pptx.ShapeType.roundRect, { x, y: 1.2, w: 3.6, h: 5.5, fill: { color: GRAY }, rectRadius: 0.1 });
      }
      s.addText(sc.cap, { x, y: 6.8, w: 3.6, h: 0.55, fontSize: 12, color: BROWN, align: 'center', bold: true, wrap: true });
    });
  }

  // ─── SLIDE 6: Admin Dashboard ────────────────────────────────────────────────
  {
    const s = pptx.addSlide();
    addBg(s, DARK);
    s.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: '100%', h: 0.1, fill: { color: GOLD } });
    s.addText('Dashboard Admin — Kendali Penuh di Genggaman', {
      x: 0.4, y: 0.25, w: 12.5, h: 0.7, fontSize: 26, bold: true, color: GOLD, fontFace: 'Georgia'
    });

    const imgData = imgToBase64('./screenshots/admin_dashboard.png');
    if (imgData) {
      s.addImage({ data: `image/png;base64,${imgData}`, x: 0.3, y: 1.1, w: 12.7, h: 6.2, sizing: { type: 'contain', w: 12.7, h: 6.2 } });
    } else {
      s.addShape(pptx.ShapeType.rect, { x: 0.3, y: 1.1, w: 12.7, h: 6.2, fill: { color: BROWN } });
      s.addText('Admin Dashboard Screenshot', { x: 5, y: 3.8, w: 3.5, h: 0.6, fontSize: 14, color: CREAM, align: 'center' });
    }
  }

  // ─── SLIDE 7: Admin Grid ─────────────────────────────────────────────────────
  {
    const s = pptx.addSlide();
    addBg(s, CREAM);
    s.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: '100%', h: 0.1, fill: { color: BROWN } });
    s.addText('Fitur Admin Lengkap', { x: 0.4, y: 0.25, w: 12, h: 0.7, fontSize: 28, bold: true, color: BROWN, fontFace: 'Georgia' });
    addAccentLine(s, 1.0);

    const screens = [
      { file: 'admin_orders',  cap: 'Manajemen Order' },
      { file: 'admin_menu',    cap: 'Manajemen Menu' },
      { file: 'admin_tables',  cap: 'Denah Meja 100 Kursi' },
      { file: 'admin_kitchen', cap: 'Kitchen Display (KDS)' },
    ];

    screens.forEach((sc, i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const x = 0.3 + col * 6.65;
      const y = 1.2 + row * 3.0;
      const imgData = imgToBase64(`./screenshots/${sc.file}.png`);
      if (imgData) {
        s.addImage({ data: `image/png;base64,${imgData}`, x, y, w: 6.2, h: 2.6, sizing: { type: 'cover', w: 6.2, h: 2.6 } });
      } else {
        s.addShape(pptx.ShapeType.roundRect, { x, y, w: 6.2, h: 2.6, fill: { color: GRAY }, rectRadius: 0.08 });
      }
      s.addText(sc.cap, { x, y: y + 2.65, w: 6.2, h: 0.3, fontSize: 11, color: BROWN, align: 'center', bold: true });
    });
  }

  // ─── SLIDE 8: 9 Role & Credentials ───────────────────────────────────────────
  {
    const s = pptx.addSlide();
    addBg(s, CREAM);
    s.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: '100%', h: 0.1, fill: { color: BROWN } });
    s.addText('9 Role Pengguna', { x: 0.4, y: 0.25, w: 12, h: 0.7, fontSize: 32, bold: true, color: BROWN, fontFace: 'Georgia' });
    addAccentLine(s, 1.0);

    const roles = [
      { icon: '👑', role: 'Super Admin',   desc: 'Akses penuh semua fitur' },
      { icon: '🏠', role: 'Owner',         desc: 'Laporan & analitik bisnis' },
      { icon: '📋', role: 'Manager',       desc: 'Operasional harian' },
      { icon: '💳', role: 'Kasir',         desc: 'Proses pembayaran' },
      { icon: '☕', role: 'Barista',       desc: 'Antrian minuman' },
      { icon: '🍳', role: 'Kitchen',       desc: 'Display pesanan dapur' },
      { icon: '📦', role: 'Inventory',     desc: 'Stok & supplier' },
      { icon: '🚚', role: 'Supplier',      desc: 'Portal pengiriman bahan' },
      { icon: '🎁', role: 'Member',        desc: 'Poin & reward pelanggan' },
    ];

    roles.forEach((r, i) => {
      const col = i % 3;
      const row = Math.floor(i / 3);
      const x = 0.3 + col * 4.35;
      const y = 1.3 + row * 1.8;
      s.addShape(pptx.ShapeType.roundRect, { x, y, w: 4.1, h: 1.5, fill: { color: WHITE }, line: { color: GOLD, width: 1.5 }, rectRadius: 0.1 });
      s.addText(r.icon + '  ' + r.role, { x: x + 0.15, y: y + 0.1, w: 3.8, h: 0.5, fontSize: 14, bold: true, color: BROWN });
      s.addText(r.desc, { x: x + 0.15, y: y + 0.7, w: 3.8, h: 0.5, fontSize: 11, color: GRAY });
    });
  }

  // ─── SLIDE 9: Keunggulan / Why Choose ────────────────────────────────────────
  {
    const s = pptx.addSlide();
    addBg(s, BROWN);
    s.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: '100%', h: 0.1, fill: { color: GOLD } });
    s.addText('Mengapa Memilih Sistem Ini?', { x: 0.4, y: 0.3, w: 12, h: 0.7, fontSize: 30, bold: true, color: GOLD, fontFace: 'Georgia' });

    const points = [
      { num: '01', title: 'Tidak Perlu Antri Kasir',     body: 'Pelanggan memesan langsung dari meja via HP — pengalaman premium seperti restoran bintang 5.' },
      { num: '02', title: 'Hemat Biaya Operasional',     body: 'Kurangi kesalahan order manual, efisiensi staff, tidak perlu cetak bon kertas.' },
      { num: '03', title: 'Data & Analitik Real-Time',   body: 'Semua transaksi tercatat otomatis — laporan penjualan, menu favorit, jam sibuk tersedia kapan saja.' },
      { num: '04', title: 'Mudah Digunakan',             body: 'Antarmuka intuitif, tidak perlu training lama — staff bisa langsung pakai.' },
      { num: '05', title: 'Skalabel & Dapat Dikembangkan', body: 'Siap untuk integrasi backend, payment gateway, dan fitur tambahan sesuai kebutuhan.' },
      { num: '06', title: 'Desain Premium Warm Luxury',  body: 'Visual yang elegan mencerminkan brand Rehan Cafe — meningkatkan persepsi kualitas pelanggan.' },
    ];

    points.forEach((p, i) => {
      const col = i % 2 === 0 ? 0.4 : 6.9;
      const row = Math.floor(i / 2);
      const y = 1.3 + row * 1.9;
      s.addShape(pptx.ShapeType.rect, { x: col, y, w: 0.6, h: 1.5, fill: { color: GOLD } });
      s.addText(p.num, { x: col, y: y + 0.45, w: 0.6, h: 0.6, fontSize: 14, bold: true, color: BROWN, align: 'center' });
      s.addShape(pptx.ShapeType.roundRect, { x: col + 0.6, y, w: 5.7, h: 1.5, fill: { color: '2A150A' }, rectRadius: 0.1 });
      s.addText(p.title, { x: col + 0.8, y: y + 0.1, w: 5.3, h: 0.5, fontSize: 13, bold: true, color: GOLD });
      s.addText(p.body, { x: col + 0.8, y: y + 0.6, w: 5.3, h: 0.8, fontSize: 10.5, color: CREAM, wrap: true });
    });
  }

  // ─── SLIDE 10: Closing ────────────────────────────────────────────────────────
  {
    const s = pptx.addSlide();
    addBg(s, DARK);
    s.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: '100%', h: 0.12, fill: { color: GOLD } });
    s.addShape(pptx.ShapeType.rect, { x: 0, y: 7.38, w: '100%', h: 0.12, fill: { color: GOLD } });

    s.addText('Siap Membawa Cafe Anda', { x: 1, y: 1.8, w: 11.3, h: 1, fontSize: 38, bold: true, color: CREAM, fontFace: 'Georgia', align: 'center' });
    s.addText('ke Level Berikutnya?', { x: 1, y: 2.8, w: 11.3, h: 1, fontSize: 38, bold: true, color: GOLD, fontFace: 'Georgia', align: 'center' });
    s.addShape(pptx.ShapeType.rect, { x: 4, y: 3.9, w: 5.3, h: 0.06, fill: { color: GOLD } });

    s.addText('Hubungi kami untuk demo langsung & konsultasi gratis', {
      x: 1, y: 4.2, w: 11.3, h: 0.6, fontSize: 16, color: CREAM, align: 'center', italic: true,
    });

    s.addText('✉  novalraihananwar@gmail.com', {
      x: 3.5, y: 5.1, w: 6.3, h: 0.55, fontSize: 14, color: GOLD, align: 'center',
    });
    s.addText('🌐  rehancafe.com  |  📱  WhatsApp tersedia', {
      x: 3, y: 5.7, w: 7.3, h: 0.55, fontSize: 13, color: CREAM, align: 'center',
    });

    s.addText('REHAN CAFE & EATERY  —  Warm. Modern. Efficient.', {
      x: 1, y: 6.7, w: 11.3, h: 0.5, fontSize: 13, color: GRAY, align: 'center', italic: true,
    });
  }

  // ─── Save ─────────────────────────────────────────────────────────────────────
  const outPath = '../Rehan_Cafe_Presentasi.pptx';
  await pptx.writeFile({ fileName: outPath });
  console.log(`\nPPT saved: ${path.resolve(outPath)}`);
}

(async () => {
  try {
    await takeScreenshots();
    await buildPPT();
    console.log('\nDone! File: D:\\cursor test v2\\Rehan_Cafe_Presentasi.pptx');
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
})();
