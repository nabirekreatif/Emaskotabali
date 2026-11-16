/* ==========================================================================
 *  Toko Emas — Banner Event (Lelang Live + Flash Sale) & halaman Lelang Live
 *  (live bidding: tawar naik, nama tersamarkan, auto-extend, komitmen,
 *  pemenang #1 + cadangan #2, kode pemenang + QR).
 *  © Nabire Kreatif — template berlisensi
 * ========================================================================== */
(function () {
  'use strict';
  const A = window.App, { esc, I, rp, img, cabNama } = A;
  const T = A.T;
  const FINAL = ['menunggu_bayar', 'dibayar', 'hangus', 'tidak_laku', 'batal', 'selesai'];
  let offset = 0;                                  // selisih jam server − jam perangkat (ms)
  const now = () => Date.now() + offset;
  const ms = iso => { const t = Date.parse(iso); return isNaN(t) ? 0 : t; };
  const tgl = iso => (A.tglEmas ? A.tglEmas(iso) : iso);
  const gram = n => (A.gramEmas ? A.gramEmas(n) : n);
  const singkat = n => { n = Number(n) || 0; return n >= 1e6 ? (Math.round(n / 1e5) / 10 + 'jt').replace('.', ',') : n >= 1e3 ? Math.round(n / 1e3) + 'rb' : String(n); };
  const kotak = m => (A.kotakWaktu ? A.kotakWaktu(m) : '');
  const Mem = () => A.Member || { tok: () => '', me: () => null };

  /* ---------- data & status (dihitung di perangkat dari jadwal) ---------- */
  function daftar() {
    const b = (A.pub && A.pub.bid) || [];
    if (A.demo) {                                   // demo: jadwal relatif terhadap waktu buka halaman
      b.forEach(x => { if (x._rel && !x._fix) { x._fix = 1; x.mulai = new Date(Date.now() + x._rel[0] * 6e4).toISOString(); x.selesai = new Date(Date.now() + x._rel[1] * 6e4).toISOString(); } });
    }
    return b;
  }
  function stat(b) {
    if (FINAL.indexOf(b.status) > -1) return b.status;
    const t = now();
    return t < ms(b.mulai) ? 'terjadwal' : t >= ms(b.selesai) ? 'tutup' : 'berlangsung';
  }
  const grup = () => {
    const g = { live: [], soon: [], done: [] };
    daftar().forEach(b => { const s = stat(b); (s === 'berlangsung' ? g.live : s === 'terjadwal' ? g.soon : g.done).push(b); });
    g.live.sort((a, b) => ms(a.selesai) - ms(b.selesai)); g.soon.sort((a, b) => ms(a.mulai) - ms(b.mulai)); g.done.sort((a, b) => ms(b.selesai) - ms(a.selesai));
    return g;
  };
  A.bidGrup = grup;
  const STL = { berlangsung: ['LIVE', 'live'], terjadwal: ['Segera', 'soon'], tutup: ['Menentukan pemenang', 'wait'], menunggu_bayar: ['Ada pemenang', 'win'], dibayar: ['Terjual', 'win'], hangus: ['Tidak ditebus', 'off'], tidak_laku: ['Tidak ada penawar', 'off'], batal: ['Dibatalkan', 'off'], selesai: ['Selesai', 'off'] };
  const badge = b => { const s = stat(b), x = STL[s] || STL.selesai; return '<span class="bd-st st-' + x[1] + '">' + (s === 'berlangsung' ? '<i class="dot"></i>' : '') + esc(x[0]) + '</span>'; };
  const harga = b => Number(b.harga) || Number(b.harga_awal) || 0;
  const foto = (b, w) => b.foto ? '<img src="' + esc(img(b.foto, w || 400)) + '" alt="' + esc(b.nama) + '" loading="lazy">' : '<span class="ph">' + I('diamond') + '</span>';

  /* ======================= BAGIAN LINK BIO: Banner Lelang / Event ======================= */
  function kartuLive(g) {
    const b = g.live[0] || g.soon[0]; if (!b) return '';
    const live = stat(b) === 'berlangsung', lain = (live ? g.live.length : g.soon.length) - 1;
    const target = live ? ms(b.selesai) : ms(b.mulai);
    return '<a class="ev-card ev-live" href="#/lelang/' + encodeURIComponent(b.id) + '" data-ev="live">' +
      '<div class="ev-top"><span class="ev-tag">' + (live ? '<i class="dot"></i>LIVE' : I('schedule') + 'SEGERA') + '</span><span class="ev-kind">' + I('gavel') + 'Lelang Live</span>' +
      (live && b.jumlah ? '<span class="ev-hot">' + I('local_fire_department', 'fill') + b.jumlah + ' tawaran</span>' : '') + '</div>' +
      '<div class="ev-body"><div class="ev-img">' + foto(b, 300) + '</div><div class="ev-info"><h3>' + esc(T('bid_judul')) + '</h3><p class="ev-desc">' + esc(T('bid_sub')) + '</p>' +
      '<div class="ev-prod ell">' + esc(b.nama) + (b.kadar ? ' · ' + esc(b.kadar) : '') + (Number(b.berat) ? ' · ' + gram(b.berat) + ' gr' : '') + '</div>' +
      '<div class="ev-price"><small>' + (live && b.jumlah ? 'Tawaran tertinggi' : 'Harga awal') + '</small><b data-flash>' + rp(harga(b)) + '</b>' + (live && b.pemimpin ? '<em>' + I('person') + esc(b.pemimpin) + '</em>' : '') + '</div></div></div>' +
      '<div class="ev-foot"><div class="ev-cd"><small>' + (live ? 'Berakhir dalam' : 'Dimulai dalam') + '</small><div class="cdbox" data-cdb="' + (target - offset) + '" data-cdend="1">' + kotak(target - now()) + '</div></div>' +
      '<span class="ev-cta">' + (live ? 'Ikut Tawar' : 'Lihat Lot') + I('arrow_forward') + '</span></div>' +
      (lain > 0 ? '<div class="ev-more">+' + lain + ' lot lain ' + (live ? 'sedang berlangsung' : 'dijadwalkan') + '</div>' : '') + '</a>';
  }
  function kartuFlash() {
    const L = A.lelangState ? A.lelangState() : {}; if (!L.nyala || (!L.aktif && !L.akanDatang)) return '';
    const items = ((A.pub && A.pub.products) || []).filter(p => p.lelang);
    const sisa = items.reduce((t, p) => t + Math.max(0, Number(p.lelang_sisa) || 0), 0);
    const hemat = items.map(p => (Number(p.harga) || 0) - (Number(p.harga_lelang) || 0)).filter(x => x > 0).sort((a, b) => b - a)[0] || 0;
    const target = L.aktif ? L.selesaiMs : L.mulaiMs, fotos = items.filter(p => (p.foto || [])[0]).slice(0, 3);
    return '<a class="ev-card ev-flash" href="#/flash-sale" data-ev="flash">' +
      '<div class="ev-top"><span class="ev-tag">' + I('bolt', 'fill') + (L.aktif ? 'FLASH SALE' : 'SEGERA DIBUKA') + '</span>' + (L.aktif && sisa ? '<span class="ev-hot">' + I('local_fire_department', 'fill') + 'Sisa ' + sisa + ' barang</span>' : '') + '</div>' +
      '<div class="ev-body"><div class="ev-stack">' + (fotos.length ? fotos.map(p => '<img src="' + esc(img(p.foto[0], 200)) + '" alt="" loading="lazy">').join('') : '<span class="ph">' + I('bolt') + '</span>') + '</div>' +
      '<div class="ev-info"><h3>' + esc(L.judul || 'Flash Sale') + '</h3><p class="ev-desc">' + esc(L.sub || 'Harga spesial terbatas khusus member. Ambil kode, tukar di toko.') + '</p>' +
      '<div class="ev-chips"><span>' + items.length + ' produk</span>' + (hemat ? '<span class="sv">Hemat s/d ' + singkat(hemat) + '</span>' : '') + '</div></div></div>' +
      '<div class="ev-foot"><div class="ev-cd"><small>' + (L.aktif ? (target ? 'Berakhir dalam' : 'Selama stok ada') : 'Dibuka dalam') + '</small>' + (target ? '<div class="cdbox" data-cdb="' + target + '" data-cdend="1">' + kotak(target - Date.now()) + '</div>' : '') + '</div>' +
      '<span class="ev-cta">' + (L.aktif ? 'Ambil Promo' : 'Lihat Produk') + I('arrow_forward') + '</span></div></a>';
  }
  /* banner Flash Sale ringkas di Katalog & Galeri (Dasbor → Poster & Widget) */
  A.slots && A.slots.push(function fsmini(name) {
    const k = { katalog: 'flash_di_katalog', galeri: 'flash_di_galeri' }[name]; if (!k || String(T(k)).toUpperCase() === 'TIDAK') return null;
    const L = A.lelangState ? A.lelangState() : {}; if (!L.nyala || (!L.aktif && !L.akanDatang)) return null;
    const items = ((A.pub && A.pub.products) || []).filter(p => p.lelang), target = L.aktif ? L.selesaiMs : L.mulaiMs;
    if (!items.length) return null;
    const hemat = items.map(p => (Number(p.harga) || 0) - (Number(p.harga_lelang) || 0)).filter(x => x > 0).sort((a, b) => b - a)[0] || 0;
    return { key: 'fsmini', after: ['.pg-slot[data-slot="kgold"]', '.kat-title + p', '.gal-hero'], html: '<a class="fs-mini" href="#/flash-sale"><span class="fsm-ic">' + I('bolt', 'fill') + '</span><div class="fsm-t"><b class="ell">' + esc(L.judul || 'Flash Sale') + '</b><small>' + (L.aktif ? items.length + ' produk' + (hemat ? ' · hemat s/d ' + singkat(hemat) : '') : 'Segera dibuka') + '</small></div>' +
      (target ? '<div class="fsm-cd"><small>' + (L.aktif ? 'Berakhir' : 'Mulai') + '</small><span class="cdbox sm" data-cdb="' + target + '">' + kotak(target - Date.now()) + '</span></div>' : '') + '<span class="fsm-go">' + I('arrow_forward') + '</span></a>' };
  });
  if (A.SECTIONS) A.SECTIONS.lelang = () => { const g = grup(), h = kartuLive(g) + kartuFlash(); return h ? '<div class="ev-wrap">' + h + '</div>' : ''; };
  // hitung mundur habis → gambar ulang (status berganti: segera → live → selesai)
  setInterval(() => {
    document.querySelectorAll('[data-cdend]').forEach(e => { if (!e.dataset.done && +e.dataset.cdb - Date.now() <= 0) { e.dataset.done = 1; setTimeout(() => A.rerender(), 700); } });
  }, 1000);

  /* ======================= HALAMAN: LELANG LIVE ======================= */
  const back = (h, t) => '<a class="back" href="' + h + '">' + I('arrow_back') + esc(t) + '</a>';
  let tabAktif = 'live', poll = null, pollId = '';
  function stopPoll() { if (poll) clearInterval(poll); poll = null; pollId = ''; }

  A.page('lelang', {
    nav: 'lelang', title: () => T('bid_judul'),
    render(el, param) {
      if (!A.pub) { el.innerHTML = '<div class="col"><div class="skel" style="height:220px;margin-top:16px"></div></div>'; return; }
      if (param) return detail(el, param);
      stopPoll(); daftarPage(el);
    }
  });
  window.addEventListener('hashchange', () => { if (!/^#\/lelang\/.+/.test(location.hash)) stopPoll(); });

  function lotCard(b) {
    const s = stat(b), live = s === 'berlangsung', soon = s === 'terjadwal';
    const t = live ? ms(b.selesai) : soon ? ms(b.mulai) : 0;
    return '<a class="lot" href="#/lelang/' + encodeURIComponent(b.id) + '"><div class="lot-img">' + foto(b, 500) + badge(b) + (live && b.jumlah ? '<span class="lot-n">' + I('gavel') + b.jumlah + '</span>' : '') + '</div>' +
      '<div class="lot-b"><div class="pmeta ell">' + esc(cabNama(b.cabang)) + '</div><h3 class="pname">' + esc(b.nama) + '</h3>' +
      '<div class="lot-spec">' + (b.kadar ? '<span>' + esc(b.kadar) + '</span>' : '') + (Number(b.berat) ? '<span>' + gram(b.berat) + ' gr</span>' : '') + '</div>' +
      '<div class="lot-p"><small>' + (FINAL.indexOf(s) > -1 && b.pemenang ? 'Harga akhir' : live && b.jumlah ? 'Tertinggi' : 'Harga awal') + '</small><b>' + rp(FINAL.indexOf(s) > -1 && b.harga_final ? b.harga_final : harga(b)) + '</b>' +
      (live && b.pemimpin ? '<em>' + esc(b.pemimpin) + '</em>' : b.pemenang ? '<em>' + I('emoji_events') + esc(b.pemenang) + '</em>' : '') + '</div>' +
      (t ? '<div class="lot-cd"><small>' + (live ? 'Sisa' : 'Mulai') + '</small><span class="cdbox sm" data-cdb="' + (t - offset) + '" data-cdend="1">' + kotak(t - now()) + '</span></div>' : '') +
      '<span class="btn ' + (live ? 'btn-amber' : 'btn-soft') + ' btn-sm btn-block">' + I(live ? 'gavel' : soon ? 'notifications' : 'visibility') + (live ? 'Tawar Sekarang' : soon ? 'Lihat Lot' : 'Lihat Hasil') + '</span></div></a>';
  }
  function daftarPage(el) {
    const g = grup(), L = A.lelangState ? A.lelangState() : {};
    if (!g.live.length && tabAktif === 'live') tabAktif = g.soon.length ? 'soon' : 'live';
    const list = g[tabAktif] || [];
    const kosong = { live: ['Belum ada lelang yang berlangsung', 'Pantau jadwal di tab "Akan Datang" — lelang dibuka saat event spesial seperti Jumat Berkah.'], soon: ['Belum ada jadwal', 'Jadwal lelang berikutnya akan diumumkan di sini & di WhatsApp member.'], done: ['Belum ada riwayat', 'Hasil lelang yang sudah ditutup akan tampil di sini.'] }[tabAktif];
    el.innerHTML = '<div class="col emas-pg">' + back('#/', 'Kembali ke Beranda') +
      '<div class="bid-hero"><span class="lbl">' + (g.live.length ? '<i class="dot"></i>' + g.live.length + ' lot sedang LIVE' : I('gavel') + 'Lelang Live') + '</span><h1>' + esc(T('bid_judul')) + '</h1><p>' + esc(T('bid_sub')) + '</p>' +
      '<ol class="bid-steps"><li><b>1</b>Daftar & verifikasi member</li><li><b>2</b>Centang komitmen</li><li><b>3</b>Tawar naik per kelipatan</li><li><b>4</b>Menang → tukar kode di toko</li></ol></div>' +
      '<div class="ul-tabs mt16 bid-tabs" role="tablist">' + [['live', 'Berlangsung', g.live.length], ['soon', 'Akan Datang', g.soon.length], ['done', 'Selesai', g.done.length]].map(t => '<button data-t="' + t[0] + '"' + (t[0] === tabAktif ? ' class="on"' : '') + '>' + t[1] + (t[2] ? ' <span class="n">' + t[2] + '</span>' : '') + '</button>').join('') + '</div>' +
      (list.length ? '<div class="lot-grid mt12">' + list.map(lotCard).join('') + '</div>' : '<div class="empty lelang-empty mt12"><span class="big">' + I('gavel') + '</span><h3>' + esc(kosong[0]) + '</h3><p>' + esc(kosong[1]) + '</p>' + (Mem().tok() ? '' : '<a class="btn btn-amber mt12" href="#/akun">' + I('account_circle') + 'Daftar member sekarang</a>') + '</div>') +
      (L.nyala && (L.aktif || L.akanDatang) ? '<a class="lelang-strip mt16" href="#/flash-sale">' + I('bolt') + '<span class="grow"><b>' + esc(L.judul) + '</b><small>Harga spesial langsung ambil — tanpa tawar</small></span>' + I('arrow_forward') + '</a>' : '') +
      syaratBox() + '</div>';
    el.querySelector('.bid-tabs').onclick = e => { const b = e.target.closest('[data-t]'); if (!b) return; tabAktif = b.dataset.t; daftarPage(el); };
  }
  const syaratBox = () => { const s = String(T('bid_syarat') || '').split('\n').map(x => x.trim()).filter(Boolean); return s.length ? '<div class="card pad mt12"><h3 class="h3">' + I('rule') + 'Ketentuan Lelang Live</h3><ol class="ol">' + s.map(x => '<li>' + esc(x) + '</li>').join('') + '</ol></div>' : ''; };

  /* ---------- detail lot + live bidding ---------- */
  const st = {};                                         // state terbaru per lot (dari polling)
  const ssKey = id => 'bid_ok_' + id;
  function detail(el, id) {
    const b0 = daftar().find(x => x.id === id);
    if (!b0 && !st[id]) { el.innerHTML = '<div class="col emas-pg">' + back('#/lelang', 'Semua lelang') + '<div class="empty mt16">' + I('search_off') + '<p>Lot lelang tidak ditemukan atau sudah dihapus.</p></div></div>'; return; }
    const b = Object.assign({}, b0 || {}, st[id] || {});
    const s = stat(b), live = s === 'berlangsung', soon = s === 'terjadwal', fin = FINAL.indexOf(s) > -1 || s === 'tutup';
    const me = Mem().me(), m = me && me.member, win = ((me && me.menang) || []).find(w => w.id === id);
    const kel = Math.max(1000, Number(b.kelipatan) || 50000), min = b.jumlah ? harga(b) + kel : (Number(b.harga_awal) || 0);
    const target = live ? ms(b.selesai) : soon ? ms(b.mulai) : 0, ext = Number(b.extend || T('bid_extend_menit')) || 2;
    const leader = !!b.pemimpin && ((m && b._saya) || (A.demo && b.pemimpin === 'Anda'));
    el.innerHTML = '<div class="col emas-pg bid-pg">' + back('#/lelang', 'Semua lelang') +
      '<div class="bid-top"><div class="bid-img">' + foto(b, 900) + badge(b) + '</div>' +
      '<div class="bid-head"><div class="pmeta">' + esc(cabNama(b.cabang)) + '</div><h1>' + esc(b.nama) + '</h1><div class="lot-spec">' + (b.kadar ? '<span>' + esc(b.kadar) + '</span>' : '') + (Number(b.berat) ? '<span>' + gram(b.berat) + ' gram</span>' : '') + '<span>Kelipatan ' + rp(kel) + '</span></div>' +
      '<div class="bid-price' + (leader ? ' me' : '') + '"><small>' + (fin && b.pemenang ? 'Harga akhir' : b.jumlah ? 'Tawaran tertinggi' : 'Harga awal') + '</small><b data-hp>' + rp(fin && b.harga_final ? b.harga_final : harga(b)) + '</b>' +
      '<div class="bp-meta">' + (fin && b.pemenang ? I('emoji_events', 'fill') + 'Pemenang: <b>' + esc(b.pemenang) + '</b>' : b.pemimpin ? I('person') + (leader ? '<b>Anda</b> penawar tertinggi' : 'oleh <b>' + esc(b.pemimpin) + '</b>') : I('hourglass_empty') + 'Belum ada penawaran') +
      ' · ' + (b.jumlah || 0) + ' tawaran</div></div>' +
      (target ? '<div class="bid-cd"><small>' + (live ? 'Lelang berakhir dalam' : 'Lelang dimulai dalam') + '</small><div class="cdbox lg" data-cdb="' + (target - offset) + '" data-cdend="1">' + kotak(target - now()) + '</div>' +
        (live ? '<p class="ext">' + I('more_time') + 'Ada tawaran di ' + ext + ' menit terakhir? Waktu otomatis +' + ext + ' menit (anti "tawar detik terakhir").</p>' : '<p class="ext">' + I('event') + esc(tgl(b.mulai)) + ' — ' + esc(tgl(b.selesai)) + '</p>') + '</div>' : '') +
      '</div></div>' + zona(b, s, me, m, win, min, kel, id) +
      '<div class="card pad mt12"><h3 class="h3">' + I('history') + 'Riwayat Tawaran</h3><div data-riw>' + riwayatHtml(b) + '</div></div>' + syaratBox() + '</div>';
    bindZona(el, b, id, min, kel);
    if (live) mulaiPoll(el, id); else if (s === 'tutup' && !A.demo) mulaiPoll(el, id, 8000); else stopPoll();
    if (Mem().tok() && !el.dataset.ref && A.Member && A.Member.refresh) { el.dataset.ref = 1; A.Member.refresh().then(x => { if (x && A.cur === 'lelang' && A.param === id && JSON.stringify(x) !== JSON.stringify(me)) detail(el, id); setTimeout(() => delete el.dataset.ref, 30000); }); }
  }
  function riwayatHtml(b) {
    const r = b.riwayat || [];
    if (!r.length) return '<p class="muted small">' + (stat(b) === 'terjadwal' ? 'Penawaran dibuka saat lelang dimulai.' : 'Belum ada penawaran — jadilah yang pertama!') + '</p>';
    return '<ul class="riw">' + r.map((x, i) => '<li' + (i === 0 ? ' class="top"' : '') + '><span class="av">' + esc(String(x.nama || '?')[0]) + '</span><span class="grow"><b>' + esc(x.nama) + '</b><small>' + esc(lalu(x.waktu)) + '</small></span><b class="rp">' + rp(x.harga) + '</b>' + (i === 0 ? '<span class="chip chip-gold">' + I('workspace_premium') + 'Tertinggi</span>' : '') + '</li>').join('') + '</ul>';
  }
  function lalu(iso) { const d = (now() - ms(iso)) / 1000; if (!(d >= 0)) return ''; return d < 60 ? 'baru saja' : d < 3600 ? Math.floor(d / 60) + ' menit lalu' : d < 86400 ? Math.floor(d / 3600) + ' jam lalu' : tgl(iso); }

  function zona(b, s, me, m, win, min, kel, id) {
    if (win) {                                           // tiket pemenang
      const q = window.QR ? QR.svg(win.kode, { ecl: 'M' }) : '';
      return '<div class="card pad mt12 win-ticket"><div class="wt-h">' + I('emoji_events', 'fill') + '<div><b>' + (win.status === 'dibayar' ? 'Lunas — terima kasih!' : 'Selamat, Anda pemenang!') + '</b><small>Harga final ' + rp(win.harga) + '</small></div></div>' +
        (win.status === 'menunggu_bayar' ? '<div class="qr-big">' + q + '</div><div class="kode">' + esc(win.kode) + '</div><p class="small center">Datang ke <b>' + esc(cabNama(win.cabang)) + '</b> sebelum <b>' + esc(tgl(win.batas_bayar)) + '</b>. Tunjukkan kode ini + KTP ke kasir & lunasi.</p>' +
          '<div class="note amber mt8">' + I('warning') + '<div>Tidak datang sampai batas waktu → kode hangus, lot dialihkan ke penawar cadangan & akun masuk daftar hitam lelang.</div></div><button class="btn btn-amber btn-block mt8" data-unduh>' + I('download') + 'Unduh tiket pemenang</button><button class="btn btn-ghost btn-block mt8" data-copy="' + esc(win.kode) + '">' + I('content_copy') + 'Salin kode</button>'
          : '<p class="center"><span class="chip ' + (win.status === 'dibayar' ? 'chip-ok' : 'chip-no') + '">' + esc(win.status === 'dibayar' ? 'Sudah lunas' : 'Kode hangus') + '</span></p>') + '</div>';
    }
    if (s === 'tutup') return '<div class="note mt12">' + I('hourglass_top') + '<div><b>Lelang ditutup.</b> Sistem sedang menentukan pemenang — kode dikirim ke WhatsApp pemenang.</div></div>';
    if (FINAL.indexOf(s) > -1) return '<div class="note mt12">' + I('flag') + '<div>' + (s === 'tidak_laku' ? 'Lelang ditutup tanpa penawar.' : s === 'batal' ? 'Lelang dibatalkan toko.' : 'Lelang selesai. Pemenang dihubungi lewat WhatsApp untuk menukar kode di toko.') + '</div></div>';
    const L = A.lelangState ? A.lelangState() : {};
    if (!A.demo && !Mem().tok()) return '<div class="bid-zone mt12"><div class="note amber">' + I('lock') + '<div><b>Khusus member.</b> Masuk atau daftar dengan nomor HP untuk ikut menawar.</div></div><button class="btn btn-amber btn-block mt8" data-login>' + I('login') + 'Masuk / Daftar Member</button></div>';
    if (!A.demo && m && m.blacklist) return '<div class="note red mt12">' + I('block') + '<div><b>Akun diblokir dari lelang.</b> Anda tidak menebus kemenangan sebelumnya. Hubungi admin toko untuk membuka blokir.</div></div>';
    if (!A.demo && m && A.bolehLelang && !A.bolehLelang(me, L)) return '<div class="card pad mt12"><h3 class="h3">' + I('verified_user') + 'Lengkapi syarat dulu</h3>' + (A.syaratMember ? A.syaratMember(me, L) : '') + '<a class="btn btn-ink btn-block mt8" href="#/akun">' + I('upload') + 'Lengkapi di halaman Akun</a></div>';
    const setuju = A.Store.ss(ssKey(id)) === '1', soon = s === 'terjadwal';
    const opsi = [1, 2, 5].map((x, i) => '<button type="button" class="bz-opt' + (i === 0 ? ' on' : '') + '" data-step="' + x + '"><small>+' + singkat(kel * x) + '</small><b>' + rp(min + kel * (x - 1)) + '</b></button>').join('');
    return '<div class="bid-zone mt12' + (setuju ? ' ok' : '') + '">' + (A.demo ? '<div class="note mb8">' + I('science') + '<div><b>Mode demo:</b> tawaran disimulasikan di perangkat ini.</div></div>' : '') +
      '<label class="komit"><input type="checkbox" data-setuju' + (setuju ? ' checked' : '') + '><span>Saya <b>bersedia datang ke toko & melunasi</b> maksimal ' + esc(T('bid_batas_jam')) + ' jam setelah lelang ditutup bila menang. Bila tidak datang, kode hangus & akun masuk daftar hitam.</span></label>' +
      '<div class="bz-lbl">Pilih tawaran Anda <small>(minimal ' + rp(min) + ')</small></div><div class="bz-opts">' + opsi + '</div>' +
      '<button class="btn btn-amber btn-block btn-lg mt8" data-tawar' + (setuju && !soon ? '' : ' disabled') + '>' + I('gavel') + (soon ? 'Lelang belum dimulai' : 'Tawar <span data-nilai>' + rp(min) + '</span>') + '</button>' +
      '<p class="muted small center mt8">' + (setuju ? I('lock_open') + 'Tombol tawar aktif' : I('lock') + 'Centang persetujuan untuk mengaktifkan tombol tawar') + '</p></div>';
  }
  function bindZona(el, b, id, min, kel) {
    const lg = el.querySelector('[data-login]'); if (lg) lg.onclick = () => { if (A.needLogin) A.needLogin('lelang/' + id); else A.go('akun'); };
    const cp = el.querySelector('.win-ticket [data-copy]'); if (cp) cp.onclick = () => Promise.resolve().then(() => navigator.clipboard.writeText(cp.dataset.copy)).then(() => A.toast('Kode disalin'), () => A.toast('Salin manual: ' + cp.dataset.copy, 'info'));
    const ud = el.querySelector('.win-ticket [data-unduh]'); if (ud) { const me = Mem().me(), w = ((me && me.menang) || []).find(z => z.id === id); if (w) ud.onclick = () => A.unduhTiket({ jenis: 'PEMENANG LELANG', judul: w.produk_nama, kode: w.kode, baris: [['Harga final', rp(w.harga)], ['Lunasi di', cabNama(w.cabang)], ['Batas datang', tgl(w.batas_bayar)], ['Atas nama', (me.member && me.member.nama) || '']] }, ud); }
    const cb = el.querySelector('[data-setuju]'), btn = el.querySelector('[data-tawar]'); if (!cb || !btn) return;
    let step = 1;
    cb.onchange = () => { A.Store.ss(ssKey(id), cb.checked ? '1' : ''); detail(el, id); };
    el.querySelectorAll('[data-step]').forEach(o => o.onclick = () => { step = +o.dataset.step; el.querySelectorAll('[data-step]').forEach(x => x.classList.toggle('on', x === o)); const n = el.querySelector('[data-nilai]'); if (n) n.textContent = rp(min + kel * (step - 1)); });
    btn.onclick = () => tawar(el, id, min + kel * (step - 1), btn);
  }
  async function tawar(el, id, nilai, btn) {
    if (A.demo) return tawarDemo(el, id, nilai);
    const r = await A.mapi('m.bid', { id, harga: nilai, setuju: true }, btn);
    if (!r.success) {
      const c = r.data && r.data.code;
      if (c === 'KALAH' && r.data.state) { st[id] = Object.assign(st[id] || {}, r.data.state); }
      if (c === 'AUTH') return A.needLogin ? A.needLogin('lelang/' + id) : A.go('akun');
      A.toast(r.message, c === 'PEMIMPIN' ? 'info' : 'err'); return segarkan(el, id);
    }
    st[id] = Object.assign(r.data, { _saya: true }); offsetDari(r.data.server);
    A.toast(r.message, 'ok'); if (A.sound) try { A.sound('ok'); } catch (e) { }
    detail(el, id); flashHarga(el);
  }
  function tawarDemo(el, id, nilai) {
    const b = daftar().find(x => x.id === id); if (!b) return;
    const ext = (Number(T('bid_extend_menit')) || 2) * 6e4, sisa = ms(b.selesai) - now();
    b.harga = nilai; b.pemimpin = 'Anda'; b.jumlah = (b.jumlah || 0) + 1;
    b.riwayat = [{ nama: 'Anda', harga: nilai, waktu: new Date().toISOString() }].concat(b.riwayat || []).slice(0, 12);
    if (sisa < ext) { b.selesai = new Date(now() + ext).toISOString(); A.toast('Tawaran tertinggi! Waktu diperpanjang ' + (ext / 6e4) + ' menit.', 'ok'); } else A.toast('Anda penawar tertinggi saat ini (demo).', 'ok');
    detail(el, id); flashHarga(el);
    clearTimeout(tawarDemo._t);
    tawarDemo._t = setTimeout(() => {                  // pesaing simulasi menyalip
      if (b.pemimpin !== 'Anda' || stat(b) !== 'berlangsung' || Math.random() < .35) return;
      const kel = Number(b.kelipatan) || 50000, nm = ['Rina P.', 'Dewi A.', 'Made S.', 'Komang W.'][Math.floor(Math.random() * 4)];
      b.harga = nilai + kel; b.pemimpin = nm; b.jumlah++; b.riwayat = [{ nama: nm, harga: b.harga, waktu: new Date().toISOString() }].concat(b.riwayat).slice(0, 12);
      if (A.cur === 'lelang' && A.param === id) { detail(el, id); flashHarga(el); A.toast(nm + ' menyalip tawaran Anda!', 'info'); }
    }, 5000 + Math.random() * 4000);
  }
  function flashHarga(el) { const h = el.querySelector('[data-hp]'); if (h) { h.classList.remove('bump'); void h.offsetWidth; h.classList.add('bump'); } }
  function offsetDari(server) { const t = ms(server); if (t) offset = t - Date.now(); }
  async function segarkan(el, id) {
    if (A.demo || !A.gas) return;
    try {
      const res = await fetch(A.gas + (A.gas.indexOf('?') > -1 ? '&' : '?') + 'action=bid&id=' + encodeURIComponent(id), { cache: 'no-store', redirect: 'follow' });
      const j = await res.json(); if (!j.success) return;
      const lama = st[id] || daftar().find(x => x.id === id) || {};
      offsetDari(j.data.server);
      const saya = lama._saya && lama.pemimpin === j.data.pemimpin && lama.harga === j.data.harga;
      st[id] = Object.assign(j.data, { _saya: saya });
      const p = daftar().find(x => x.id === id); if (p) Object.assign(p, j.data);
      if (A.cur !== 'lelang' || A.param !== id) return;
      if (j.data.harga !== lama.harga || j.data.status !== lama.status || j.data.selesai !== lama.selesai || (j.data.riwayat || []).length !== (lama.riwayat || []).length) {
        const ditikung = lama._saya && !saya && j.data.harga > (lama.harga || 0);
        detail(el, id); if (j.data.harga !== lama.harga) flashHarga(el);
        if (ditikung) { A.toast('Tawaran Anda disalip! Tawar lagi sebelum waktu habis.', 'info'); if (A.sound) try { A.sound('notif'); } catch (e) { } }
        if (FINAL.indexOf(j.data.status) > -1 && A.Member && A.Member.refresh) A.Member.refresh().then(() => { if (A.cur === 'lelang' && A.param === id) detail(el, id); });
      }
    } catch (e) { /* jaringan putus: coba lagi pada putaran berikutnya */ }
  }
  function mulaiPoll(el, id, every) {
    if (pollId === id && poll) return;
    stopPoll(); pollId = id;
    segarkan(el, id);
    poll = setInterval(() => { if (document.hidden) return; if (A.cur !== 'lelang' || A.param !== id) return stopPoll(); segarkan(el, id); }, every || 4000);
  }
  document.addEventListener('visibilitychange', () => { if (!document.hidden && pollId && A.cur === 'lelang') segarkan(document.querySelector('.page[data-page="lelang"]'), pollId); });
})();
