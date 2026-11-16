/* ==========================================================================
 *  Toko Emas — Chat pelanggan (widget mengambang)
 *  Mode (Dasbor → Chat Pelanggan): bot otomatis dari data publik · AI (Gemini) · admin manual.
 *  Pelanggan bisa menekan "Bicara dengan admin" kapan saja (bila diizinkan).
 *  © Nabire Kreatif — template berlisensi
 * ========================================================================== */
(function () {
  'use strict';
  const A = window.App, { esc, I, rp, img } = A;
  const S = () => (A.pub && A.pub.settings) || {};
  const on = () => String(S().chat_aktif || '').toUpperCase() === 'YA';
  const mode = () => ['bot', 'ai', 'admin'].indexOf(S().chat_mode) > -1 ? S().chat_mode : 'bot';
  const bolehAdmin = () => mode() === 'admin' || String(S().chat_admin || 'YA').toUpperCase() !== 'TIDAK';
  const namaBot = () => S().chat_nama || ('Asisten ' + (S().nama_toko || 'Toko'));
  const KEY = 'chat_v1';
  let st = load(), root = null, polling = null, sibuk = false;

  function load() { const d = A.Store.get(KEY, null); return d && d.sesi ? d : { sesi: rid(), pesan: [], status: 'bot', sejak: '', baru: 0, nama: '', hp: '' }; }
  function save() { st.pesan = st.pesan.slice(-60); A.Store.set(KEY, st); }
  function rid() { let s = ''; const c = 'abcdefghijklmnopqrstuvwxyz0123456789'; for (let i = 0; i < 18; i++) s += c[Math.floor(Math.random() * c.length)]; return s; }

  /* ======================= BOT: jawaban dari data publik ======================= */
  const norm = s => String(s || '').toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
  const ada = (t, kata) => kata.some(k => (' ' + t + ' ').indexOf(' ' + k) > -1);
  const link = (h, t) => '[' + t + '](' + h + ')';
  function cariProduk(t) {
    const P = (A.pub.products || []).filter(p => p.tipe !== 'sewa' || /sewa/.test(t));
    const kata = t.split(' ').filter(w => w.length > 2 && ['ada', 'yang', 'mau', 'cari', 'harga', 'berapa', 'dong', 'kak', 'apa', 'untuk', 'gram', 'emas', 'dan'].indexOf(w) < 0);
    if (!kata.length) return [];
    return P.map(p => { const h = norm([p.nama, p.kategori, p.kadar, p.tag].join(' ')); return { p, n: kata.filter(k => h.indexOf(k) > -1).length }; })
      .filter(x => x.n > 0).sort((a, b) => b.n - a.n || (a.p.status === 'Habis') - (b.p.status === 'Habis')).slice(0, 3).map(x => x.p);
  }
  function hargaTeks(kode) {
    const K = ((A.pub.emas || {}).kadar || []).filter(k => k.tampil !== false);
    const f = kode ? K.filter(k => norm(k.kode).replace(/\s/g, '') === kode + 'k' || norm(k.kode) === kode) : [], L = f.length ? f : K.slice(0, 6);
    if (!L.length) return '';
    return L.map(k => '• *' + k.kode + '*: jual ' + rp(k.jual) + ' · buyback ' + rp(k.buyback) + ' /gram').join('\n');
  }
  function jawabBot(teks) {
    const t = norm(teks), p = A.pub || {}, toko = S().nama_toko || 'kami';
    const kadar = (t.match(/\b(\d{1,2}) ?k\b/) || [])[1];
    if (/^(halo|hai|hallo|hi|pagi|siang|sore|malam|assalam|permisi|p)\b/.test(t) && t.split(' ').length <= 4)
      return { teks: 'Halo! 👋 Selamat datang di *' + toko + '*. Saya ' + namaBot() + '. Mau tanya harga emas, cari perhiasan, ukur cincin, atau lokasi toko?' };
    if (ada(t, ['terima kasih', 'makasih', 'thanks', 'tq'])) return { teks: 'Sama-sama! 😊 Ada lagi yang bisa saya bantu?' };
    if (ada(t, ['ukur', 'ukuran', 'size', 'lingkar'])) return { teks: 'Cara mengukur cincin ada di halaman ' + link('#/ukur-cincin', 'Ukur Cincin') + ' — bisa pakai lingkar jari, diameter cincin lama, atau langsung di layar HP.' };
    if (ada(t, ['jual emas', 'buyback', 'jual kembali', 'tukar tambah', 'jual perhiasan']))
      return { teks: 'Kami membeli kembali emas Anda 💰\n' + (hargaTeks(kadar) || '') + '\nDetail & kalkulator ada di ' + link('#/jual-emas', 'Jual Emas') + '. Harga acuan dapat berubah.' };
    if (ada(t, ['harga emas', 'harga hari', 'emas hari', 'harga per gram', 'per gram', 'gram']) || (kadar && ada(t, ['harga', 'berapa'])))
      return { teks: 'Harga emas acuan hari ini:\n' + (hargaTeks(kadar) || 'belum tersedia') + '\nSelengkapnya: ' + link('#/harga-emas', 'Harga Emas') + '.' };
    if (ada(t, ['flash', 'promo', 'diskon', 'murah'])) { const L = p.lelang || {}; return { teks: L.aktif ? '⚡ *' + L.judul + '* sedang berlangsung! Harga spesial khusus member — lihat di ' + link('#/flash-sale', 'Flash Sale') + '.' : 'Belum ada Flash Sale saat ini. Daftar member di ' + link('#/akun', 'Akun') + ' agar tidak ketinggalan promo berikutnya.' }; }
    if (ada(t, ['lelang', 'tawar', 'bid'])) return { teks: 'Ikuti lelang perhiasan secara live — penawar tertinggi saat waktu habis jadi pemenang. Jadwal & lot ada di ' + link('#/lelang', 'Lelang Live') + '.' };
    if (ada(t, ['sewa', 'pengantin', 'mahkota'])) return { teks: 'Kami menyewakan perhiasan pengantin & set pesta. Lihat pilihannya di ' + link('#/katalog', 'Katalog') + ' (kategori Sewa) lalu ajukan dengan akun member.' };
    if (ada(t, ['custom', 'pesan khusus', 'po', 'pre order', 'preorder', 'galeri', 'contoh', 'model']))
      return { teks: 'Lihat contoh perhiasan custom, pre-order & ready stock di ' + link('#/galeri', 'Galeri') + '. Pilih modelnya lalu tanyakan lewat WhatsApp 😊' };
    if (ada(t, ['alamat', 'lokasi', 'dimana', 'di mana', 'cabang', 'jam buka', 'buka', 'tutup', 'maps', 'peta'])) {
      const B = p.branches || []; return { teks: (B.length ? B.map(b => '📍 *' + b.nama + '*' + (b.alamat ? '\n' + b.alamat : '') + (b.jam_buka ? '\n🕘 ' + b.jam_buka : '')).join('\n\n') : 'Info lokasi ada di halaman Lokasi.') + '\n' + link('#/lokasi', 'Buka peta lokasi') };
    }
    if (ada(t, ['bayar', 'transfer', 'rekening', 'qris', 'cicil'])) { const P = p.payments || []; return { teks: P.length ? 'Pembayaran bisa melalui: ' + P.map(x => x.nama_bank || x.jenis).join(', ') + '. Konfirmasi detailnya dengan admin ya.' : 'Info pembayaran silakan tanyakan ke admin.' }; }
    if (ada(t, ['member', 'daftar', 'akun', 'login', 'masuk'])) return { teks: 'Daftar member cukup dengan nomor HP di ' + link('#/akun', 'Akun Member') + '. Member bisa sewa perhiasan, ikut Flash Sale & Lelang Live.' };
    const svc = (p.services || []).filter(x => ada(t, norm(x.judul).split(' ').filter(w => w.length > 3)));
    if (svc.length || ada(t, ['layanan', 'service', 'servis', 'patri', 'cuci', 'sepuh', 'reparasi', 'perbaik']))
      return { teks: (svc.length ? svc : (p.services || []).slice(0, 4)).map(x => '🛠 *' + x.judul + '*' + (x.deskripsi ? ' — ' + String(x.deskripsi).slice(0, 120) : '')).join('\n') + '\nDetail di ' + link('#/layanan', 'Layanan') + '.' };
    const pr = cariProduk(t);
    if (pr.length) return { teks: 'Ini yang cocok dari katalog kami:', items: pr, tambah: 'Lihat semua di ' + link('#/katalog', 'Katalog') + '.' };
    return { teks: 'Maaf, saya belum menemukan jawabannya 🙏 Coba tanya soal harga emas, katalog (mis. "cincin 18K"), ukur cincin, atau lokasi.' + (bolehAdmin() ? ' Atau tekan *Bicara dengan admin*.' : ''), gagal: true };
  }

  /* ======================= Tampilan ======================= */
  const fmt = s => esc(s).replace(/\*([^*\n]+)\*/g, '<b>$1</b>').replace(/\[([^\]]+)\]\((#\/[^)\s]*)\)/g, '<a href="$2" data-cl>$1</a>').replace(/\n/g, '<br>');
  function bubble(m) {
    const me = m.dari === 'tamu', who = m.dari === 'admin' ? (m.admin || 'Admin') : m.dari === 'ai' ? namaBot() + ' · AI' : m.dari === 'bot' ? namaBot() : '';
    return '<div class="cm ' + (me ? 'me' : 'bt ' + m.dari) + '">' + (who ? '<small>' + esc(who) + '</small>' : '') + '<div class="cb">' + fmt(m.teks) +
      (m.items ? '<div class="cpr">' + m.items.map(p => '<a href="#/produk/' + encodeURIComponent(p.id) + '" data-cl><span style="background-image:url(\'' + esc(img((p.foto || [])[0] || '', 200)) + '\')"></span><b>' + esc(p.nama) + '</b><em>' + (p.harga ? rp(p.harga) : 'Tanya harga') + (p.status === 'Habis' ? ' · habis' : '') + '</em></a>').join('') + '</div>' : '') +
      (m.tambah ? '<div class="mt8">' + fmt(m.tambah) + '</div>' : '') + '</div></div>';
  }
  const CHIPS = () => [['Harga emas hari ini', 'harga emas hari ini'], ['Cari cincin', 'cincin'], ['Ukur cincin', 'cara ukur cincin'], ['Lokasi toko', 'alamat toko'], ['Promo', 'promo flash sale']];
  function build() {
    if (root) return;
    root = document.createElement('div'); root.className = 'chat-w'; root.hidden = true;
    root.innerHTML = '<div class="chat-bd" data-cbd></div><button class="chat-fab" type="button" aria-label="Chat dengan kami">' + I('forum', 'fill') + '<span class="cf-n" hidden></span></button>' +
      '<section class="chat-p" role="dialog" aria-modal="true" aria-label="Chat" hidden><i class="ch-grip" aria-hidden="true"></i><header><span class="ch-av">' + I('support_agent', 'fill') + '</span><div class="grow"><b data-cn></b><small data-cs></small></div><button class="icon-btn" data-cx aria-label="Tutup">' + I('close') + '</button></header>' +
      '<div class="ch-body" data-cbody></div><div class="ch-chips" data-chips></div>' +
      '<form class="ch-in" data-cf><input name="t" maxlength="600" autocomplete="off" placeholder="Tulis pertanyaan…" aria-label="Pesan"><button class="ch-send" aria-label="Kirim">' + I('send', 'fill') + '</button></form></section>';
    document.body.appendChild(root);
    const fab = root.querySelector('.chat-fab'), pnl = root.querySelector('.chat-p');
    fab.onclick = () => buka(!pnl.hidden ? false : true);
    root.querySelector('[data-cx]').onclick = () => buka(false);
    root.querySelector('[data-cbd]').onclick = () => buka(false);
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && terbuka()) buka(false); });
    window.addEventListener('popstate', () => { if (terbuka() && dorong) { dorong = false; buka(false, true); } });
    root.querySelector('[data-cf]').onsubmit = e => { e.preventDefault(); const i = e.target.t, v = i.value.trim(); if (!v || sibuk) return; i.value = ''; kirim(v); };
    root.addEventListener('click', e => {
      const c = e.target.closest('[data-q]'); if (c) { if (c.dataset.q === '__admin') return mintaAdmin(); return kirim(c.dataset.q); }
      if (e.target.closest('[data-cl]') && hp()) { const h = e.target.closest('[data-cl]').getAttribute('href'); e.preventDefault(); buka(false); setTimeout(() => { location.hash = h; }, 260); }
      const f = e.target.closest('[data-adm-go]'); if (f) { const fm = f.closest('form'); st.nama = fm.nm.value.trim(); st.hp = fm.hp.value.trim(); save(); fm.remove(); kirim(fm.dataset.t || 'Saya ingin bicara dengan admin.', true); }
    });
  }
  function header() {
    root.querySelector('[data-cn]').textContent = st.status === 'admin' ? 'Admin ' + (S().nama_toko || '') : namaBot();
    root.querySelector('[data-cs]').textContent = st.status === 'admin' ? 'Dibalas manual oleh admin' : mode() === 'ai' ? 'Asisten AI · balas instan' : 'Asisten otomatis · balas instan';
    root.querySelector('[data-chips]').innerHTML = (st.status === 'admin' ? [] : CHIPS()).map(c => '<button type="button" data-q="' + esc(c[1]) + '">' + esc(c[0]) + '</button>').join('') +
      (bolehAdmin() && st.status !== 'admin' ? '<button type="button" class="to-adm" data-q="__admin">' + I('support_agent') + 'Bicara dengan admin</button>' : '');
  }
  function render(scroll) {
    if (!root) return;
    const body = root.querySelector('[data-cbody]');
    const sapa = { dari: 'bot', teks: S().chat_sapa || ('Halo! 👋 Saya ' + namaBot() + '. Ada yang bisa dibantu? Pilih topik di bawah atau tulis pertanyaan Anda.') };
    body.innerHTML = [sapa].concat(st.pesan).map(bubble).join('') + (sibuk ? '<div class="cm bt"><div class="cb typing"><i></i><i></i><i></i></div></div>' : '');
    header();
    if (scroll !== false) body.scrollTop = body.scrollHeight;
  }
  let dorong = false;
  const hp = () => matchMedia('(max-width: 699px)').matches;
  function buka(v, dariBack) {
    build(); const pnl = root.querySelector('.chat-p');
    if (!v && pnl.hidden) return;
    pnl.hidden = !v; root.classList.toggle('open', v);
    document.body.classList.toggle('chat-open', v);
    // tombol kembali di HP menutup chat (bukan pindah halaman)
    if (v && hp() && !dorong) { try { history.pushState({ chat: 1 }, '', location.href); dorong = true; } catch (e) { } }
    if (!v && dorong && !dariBack) { dorong = false; try { history.back(); } catch (e) { } }
    if (v) { st.baru = 0; save(); badge(); render(); ambil(); setTimeout(() => { if (innerWidth >= 700) root.querySelector('[data-cf] input').focus(); }, 60); }
    atur();
  }
  function badge() { if (!root) return; const n = root.querySelector('.cf-n'); n.hidden = !st.baru; n.textContent = st.baru > 9 ? '9+' : st.baru; }
  function terbuka() { return root && !root.querySelector('.chat-p').hidden; }

  function mintaAdmin() {
    if (A.demo) { tambah({ dari: 'bot', teks: 'Mode demo: di toko asli, pesan ini diteruskan ke admin dan dibalas di sini.' }); return; }
    const body = root.querySelector('[data-cbody]');
    if (body.querySelector('.ch-adm')) return;
    const f = document.createElement('form'); f.className = 'ch-adm';
    f.innerHTML = '<b>' + I('support_agent') + 'Hubungkan ke admin</b><small>Isi agar admin mudah menghubungi Anda (opsional).</small><input name="nm" placeholder="Nama" value="' + esc(st.nama || '') + '" maxlength="60"><input name="hp" placeholder="No. WhatsApp" inputmode="tel" value="' + esc(st.hp || '') + '" maxlength="16"><button type="button" class="btn btn-amber btn-sm btn-block" data-adm-go>' + I('send') + 'Hubungkan</button>';
    body.appendChild(f); body.scrollTop = body.scrollHeight;
  }
  function tambah(m) { m.waktu = m.waktu || new Date().toISOString(); st.pesan.push(m); save(); render(); }

  async function kirim(teks, minta) {
    tambah({ dari: 'tamu', teks });
    const md = mode();
    if (A.demo || !A.gas) { setTimeout(() => tambah(Object.assign({ dari: 'bot' }, jawabBot(teks))), 350); return; }
    const lokal = st.status !== 'admin' && md === 'bot' && !minta ? jawabBot(teks) : null;
    if (lokal) tambah(Object.assign({ dari: 'bot' }, lokal));
    sibuk = !lokal; render();
    const r = await A.api('chat.kirim', { sesi: st.sesi, teks, minta_admin: !!minta, nama: st.nama, hp: st.hp, balasan_bot: lokal ? (lokal.teks + (lokal.items ? '\n' + lokal.items.map(p => '- ' + p.nama).join('\n') : '')) : '' }, { silent: true }).catch(() => ({ success: false }));
    sibuk = false;
    if (!r || !r.success) { if (!lokal) tambah(Object.assign({ dari: 'bot' }, jawabBot(teks))); if (r && r.message && r.data && r.data.code === 'BATAS') tambah({ dari: 'bot', teks: r.message }); render(); return; }
    st.status = r.data.status;
    const balas = (r.data.pesan || []).filter(m => m.dari !== 'tamu');
    balas.forEach(m => { if (!(lokal && m.dari === 'bot')) st.pesan.push(m); st.sejak = m.waktu; });
    (r.data.pesan || []).forEach(m => { if (m.waktu > (st.sejak || '')) st.sejak = m.waktu; });
    if (r.data.fallback) st.pesan.push(Object.assign({ dari: 'bot' }, jawabBot(teks)));
    save(); render(); atur();
  }
  async function ambil() {
    if (A.demo || !A.gas || st.status !== 'admin') return;
    try {
      const res = await fetch(A.gas + (A.gas.indexOf('?') > -1 ? '&' : '?') + 'action=chat&sesi=' + st.sesi + '&sejak=' + encodeURIComponent(st.sejak || ''), { cache: 'no-store' });
      const j = await res.json(); if (!j.success) return;
      const baru = (j.data.pesan || []).filter(m => m.dari !== 'tamu' && !st.pesan.some(x => x.id === m.id));
      st.status = j.data.status;
      (j.data.pesan || []).forEach(m => { if (m.waktu > (st.sejak || '')) st.sejak = m.waktu; });
      if (baru.length) { st.pesan.push.apply(st.pesan, baru); if (!terbuka()) st.baru += baru.length; save(); render(); badge(); if (!terbuka() && A.toast) A.toast('Admin membalas chat Anda', 'info'); }
      else if (terbuka()) header();
    } catch (e) { /* coba lagi nanti */ }
  }
  function atur() {
    clearInterval(polling); polling = null;
    if (st.status === 'admin' && !A.demo) polling = setInterval(() => { if (!document.hidden) ambil(); }, terbuka() ? 5000 : 20000);
  }
  /* tampil/sembunyi sesuai pengaturan & halaman */
  function sinkron() {
    if (!A.pub) return;
    if (!on()) { if (root) root.hidden = true; return; }
    build(); root.hidden = false; badge(); atur();
  }
  A.chat = { buka: () => { sinkron(); if (root && !root.hidden) buka(true); }, jawabBot };
  A.page('chat', { title: () => 'Chat', render(el) {
    el.innerHTML = '<div class="col"><div class="empty mt16"><span class="big">' + I('forum') + '</span><h3>Chat dengan kami</h3><p>' + (on() ? 'Tanya harga, katalog, ukuran cincin, atau bicara langsung dengan admin.' : 'Chat sedang tidak aktif. Hubungi kami lewat WhatsApp.') + '</p>' + (on() ? '<button class="btn btn-amber mt12" data-oc>' + I('forum') + 'Buka chat</button>' : '') + '</div></div>';
    const b = el.querySelector('[data-oc]'); if (b) b.onclick = () => A.chat.buka();
    setTimeout(() => A.chat.buka(), 150);
  } });
  const tunggu = setInterval(() => { if (A.pub) { clearInterval(tunggu); sinkron(); } }, 400);
  setInterval(() => { if (A.pub && (!root || root.hidden === on())) sinkron(); }, 3000);
})();
