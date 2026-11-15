/* ==========================================================================
 *  Toko Emas — halaman publik: Harga Emas Hari Ini, Jual Emas (buyback +
 *  kalkulator), Lelang member, Akun member (login nomor HP), Sewa perhiasan.
 *  Juga: harga produk otomatis mengikuti harga emas, kartu kadar & berat.
 *  © Nabire Kreatif — template berlisensi
 * ========================================================================== */
(function () {
  'use strict';
  const A = window.App, { esc, I, rp, img, cabNama } = A;
  const T = A.T;
  const S = () => (A.pub && A.pub.settings) || {};
  const EM = () => (A.pub && A.pub.emas) || { kadar: [], spot_emas: 0, spot_perak: 0, sebelum: 0, update: '' };
  const KADAR = () => EM().kadar.filter(k => k.tampil !== false);
  const kadarOf = kode => EM().kadar.find(k => k.kode === String(kode || ''));
  const gram = n => String(Math.round((Number(n) || 0) * 1000) / 1000).replace('.', ',');
  const toko = () => S().nama_toko || 'Toko Emas';
  const lines = k => String(T(k) || '').split('\n').map(x => x.trim()).filter(Boolean);
  const tgl = iso => { if (!iso) return ''; const d = new Date(iso); if (isNaN(d)) return ''; return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) + ', ' + d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }); };
  const tglPendek = iso => { const d = new Date(iso); return isNaN(d) ? '' : d.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' }) + ' pukul ' + d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }); };
  const goBack = (href, t) => '<a class="back" href="' + href + '">' + I('arrow_back') + esc(t || 'Kembali ke Beranda') + '</a>';

  /* ======================= HARGA PRODUK & KARTU ======================= */
  A.emasChip = function (p) {
    if (p.tipe === 'sewa') return '<span class="chip chip-gold">' + I('event_available') + 'Sewa' + (p.deposit ? ' · deposit' : '') + '</span>';
    if (!p.kadar) return '';
    const k = kadarOf(p.kadar), perak = p.jenis_logam === 'perak' || (k && k.logam === 'perak');
    return '<span class="chip chip-gold">' + I(perak ? 'auto_awesome' : 'diamond') + esc(perak ? (k ? k.nama.replace(/\s*\(.*\)/, '') : p.kadar) : p.kadar) + (Number(p.berat) ? ' · ' + gram(p.berat) + ' gr' : '') + '</span>';
  };
  A.hargaSuffix = function (p, big) {
    if (p.tipe === 'sewa') return '<small class="per">/' + (p.satuan_sewa === 'paket' ? 'paket' : 'hari') + '</small>';
    if (p.harga_auto) return '<span class="live-ic" title="Mengikuti harga emas hari ini">' + I('trending_up') + (big ? '<em>Mengikuti harga emas hari ini</em>' : '') + '</span>';
    return '';
  };
  A.emasDetail = function (p) {
    let h = '';
    if (p.tipe === 'sewa') {
      h += '<div class="emas-break"><div><span>Tarif sewa</span><b>' + rp(p.harga) + ' / ' + (p.satuan_sewa === 'paket' ? 'paket' : 'hari') + '</b></div>' +
        (p.deposit ? '<div><span>Deposit (dikembalikan)</span><b>' + rp(p.deposit) + '</b></div>' : '') + '<p class="muted small mt8">' + I('info') + esc(T('sewa_catatan')) + '</p></div>';
    } else if (p.kadar) {
      const k = kadarOf(p.kadar);
      h += '<div class="emas-break">' + (k ? '<div><span>Kadar</span><b>' + esc(k.nama) + ' (' + String(Math.round(k.kemurnian * 1000) / 10).replace('.', ',') + '%)</b></div>' : '') +
        (Number(p.berat) ? '<div><span>Berat</span><b>' + gram(p.berat) + ' gram</b></div>' : '') +
        (p.harga_auto && k ? '<div><span>Harga emas ' + esc(k.kode) + ' / gram</span><b>' + rp(k.jual) + '</b></div>' + (Number(p.ongkos) ? '<div><span>Ongkos pembuatan</span><b>' + rp(p.ongkos) + '</b></div>' : '') +
          '<div class="tot"><span>' + gram(p.berat) + ' gr × ' + rp(k.jual) + (Number(p.ongkos) ? ' + ongkos' : '') + '</span><b>' + rp(p.harga) + '</b></div>' +
          '<p class="muted small mt8">' + I('update') + 'Harga mengikuti harga emas hari ini' + (EM().update ? ' · update ' + esc(tgl(EM().update)) : '') + '</p>' : '') +
        (k ? '<div><span>Estimasi buyback hari ini</span><b>' + rp(Math.round(k.buyback * (Number(p.berat) || 0) / 1000) * 1000) + '</b></div>' : '') + '</div>';
    }
    const L = lelangState();
    if (p.lelang && L.aktif && p.harga_lelang) h += '<a class="lelang-strip mt12" href="#/flash-sale">' + I('bolt') + '<span class="grow"><b>Ikut ' + esc(L.judul) + '</b><small>Harga Flash Sale ' + rp(p.harga_lelang) + ' · sisa ' + (p.lelang_sisa || 0) + '</small></span>' + I('arrow_forward') + '</a>';
    return h;
  };

  /* ======================= MEMBER (login nomor HP) ======================= */
  const MK = 'member';
  const Mem = A.Member = {
    get() { return A.Store.get(MK, null); },
    tok() { const m = this.get(); return (m && m.token) || ''; },
    me() { const m = this.get(); return (m && m.me) || null; },
    set(v) { A.Store.set(MK, Object.assign({}, this.get() || {}, v)); },
    clear() { A.Store.del(MK); },
    async refresh() {
      if (!this.tok() || !A.cfg.GAS_URL) return null;
      const r = await mapi('m.saya');
      if (r.success) { this.set({ me: r.data }); return r.data; }
      if (r.data && r.data.code === 'AUTH') { this.clear(); }
      return null;
    }
  };
  async function mapi(action, data, btn) {
    if (!A.cfg.GAS_URL) return { success: false, message: 'Mode demo: fitur member aktif setelah backend terhubung.' };
    if (btn) { btn.disabled = true; btn.dataset.t = btn.innerHTML; btn.innerHTML = '<span class="spin"></span>Memproses…'; }
    try {
      const r = await A.api(action, data || {}, { token: Mem.tok() });
      if (!r.success && r.data && r.data.code === 'AUTH' && action !== 'm.masuk') { Mem.clear(); }
      return r;
    } finally { if (btn) { btn.disabled = false; btn.innerHTML = btn.dataset.t; } }
  }
  A.mapi = mapi;
  function compress(file, max) {
    return new Promise((res, rej) => {
      const fr = new FileReader();
      fr.onload = () => { const im = new Image(); im.onload = () => { const s = Math.min(1, max / Math.max(im.width, im.height)), c = document.createElement('canvas'); c.width = Math.round(im.width * s); c.height = Math.round(im.height * s); c.getContext('2d').drawImage(im, 0, 0, c.width, c.height); res(c.toDataURL('image/jpeg', .82)); }; im.onerror = () => rej(new Error('Berkas bukan gambar')); im.src = fr.result; };
      fr.onerror = () => rej(new Error('Gagal membaca berkas')); fr.readAsDataURL(file);
    });
  }
  const STATUS = { belum: ['Belum', 'chip-no'], menunggu: ['Menunggu verifikasi', 'chip-amber'], terverifikasi: ['Terverifikasi', 'chip-ok'], disetujui: ['Disetujui', 'chip-ok'], ditolak: ['Ditolak', 'chip-no'] };
  const stChip = s => { const x = STATUS[s] || STATUS.belum; return '<span class="chip ' + x[1] + '">' + esc(x[0]) + '</span>'; };
  function needLogin(next) { A.Store.ss('next', next || ''); A.go('akun'); A.toast('Masuk atau daftar member dulu', 'info'); }

  /* ======================= LELANG — status waktu (dihitung di perangkat) ======================= */
  function lelangState() {
    const L = (A.pub && A.pub.lelang) || {}, now = Date.now();
    const mulai = L.mulai ? new Date(L.mulai).getTime() : 0, selesai = L.selesai ? new Date(L.selesai).getTime() : 0;
    return Object.assign({}, L, { aktif: !!L.nyala && (!mulai || now >= mulai) && (!selesai || now < selesai), akanDatang: !!L.nyala && mulai > now, mulaiMs: mulai, selesaiMs: selesai });
  }
  A.lelangState = lelangState;
  const bidAda = () => ((A.pub && A.pub.bid) || []).some(b => ['terjadwal', 'berlangsung', 'tutup'].indexOf(b.status) > -1 || (b.status === 'menunggu_bayar'));
  A.menuOk = m => (m.id === 'lelang' || m.link === '#/lelang') ? bidAda() : (m.id === 'flash' || m.link === '#/flash-sale') ? !!(A.pub && A.pub.lelang && A.pub.lelang.nyala && (!A.pub.lelang.selesai || new Date(A.pub.lelang.selesai).getTime() > Date.now())) : true;
  function sisaWaktu(ms) {
    if (ms <= 0) return '0d';
    const d = Math.floor(ms / 864e5), h = Math.floor(ms % 864e5 / 36e5), m = Math.floor(ms % 36e5 / 6e4), s = Math.floor(ms % 6e4 / 1e3);
    return (d ? '<b>' + d + '</b>h ' : '') + '<b>' + String(h).padStart(2, '0') + '</b>j <b>' + String(m).padStart(2, '0') + '</b>m <b>' + String(s).padStart(2, '0') + '</b>d';
  }
  const cd = (target, label) => '<span class="cd" data-cd="' + target + '">' + (label ? '<small>' + esc(label) + '</small>' : '') + '<span>' + sisaWaktu(target - Date.now()) + '</span></span>';
  function kotakWaktu(ms) {
    ms = Math.max(0, ms); const d = Math.floor(ms / 864e5), h = Math.floor(ms % 864e5 / 36e5), m = Math.floor(ms % 36e5 / 6e4), sd = Math.floor(ms % 6e4 / 1e3), z = n => String(n).padStart(2, '0');
    return (d ? '<span><b>' + d + '</b><i>hari</i></span>' : '') + '<span><b>' + z(h) + '</b><i>jam</i></span><span><b>' + z(m) + '</b><i>mnt</i></span>' + (d ? '' : '<span class="dt"><b>' + z(sd) + '</b><i>dtk</i></span>');
  }
  setInterval(() => { document.querySelectorAll('[data-cdb]').forEach(e => { e.innerHTML = kotakWaktu(+e.dataset.cdb - Date.now()); }); }, 1000);
  setInterval(() => {
    document.querySelectorAll('[data-cd]').forEach(e => { const ms = +e.dataset.cd - Date.now(); const s = e.querySelector('span'); if (s) s.innerHTML = sisaWaktu(ms); if (ms <= 0 && !e.dataset.done) { e.dataset.done = 1; setTimeout(() => A.rerender(), 600); } });
  }, 1000);

  /* ======================= BAGIAN LINK BIO ======================= */
  const naik = () => { const e = EM(), d = (e.spot_emas || 0) - (e.sebelum || e.spot_emas || 0); return { d, pct: e.sebelum ? d / e.sebelum * 100 : 0 }; };
  function trendChip() {
    const n = naik(); if (!n.d) return '<span class="trend flat">' + I('remove') + 'Stabil</span>';
    return '<span class="trend ' + (n.d > 0 ? 'up' : 'down') + '">' + I(n.d > 0 ? 'arrow_upward' : 'arrow_downward') + rp(Math.abs(n.d)) + ' (' + Math.abs(n.pct).toFixed(2).replace('.', ',') + '%)</span>';
  }
  if (A.SECTIONS) {
    A.SECTIONS.harga_emas = () => {
      const e = EM(); if (!e.kadar.length) return '';
      const pilih = String(T('harga_bio_kadar')).split(',').map(x => x.trim().toUpperCase()).filter(Boolean);
      const ks = (pilih.length ? pilih.map(kadarOf).filter(Boolean) : KADAR()).filter(k => k.tampil !== false).slice(0, 4);
      return '<a class="gold-card" href="#/harga-emas"><div class="gc-top"><span class="gc-live"><i></i>' + esc(T('harga_judul')) + '</span><span class="gc-up">' + esc(tgl(e.update)) + '</span></div>' +
        '<div class="gc-main"><div><small>Emas murni / gram</small><b>' + rp(e.spot_emas) + '</b></div>' + trendChip() + '</div>' +
        '<div class="gc-grid">' + ks.map(k => '<div><span>' + esc(k.kode) + '</span><b>' + rp(k.jual) + '</b><small>Buyback ' + rp(k.buyback) + '</small></div>').join('') + '</div>' +
        '<div class="gc-cta"><span>' + I('table_chart') + 'Semua kadar</span><span data-href="#/jual-emas">' + I('currency_exchange') + 'Jual emas</span></div></a>';
    };
  }
  /* ---------- slot: widget harga emas di katalog ---------- */
  A.slots.push(function kgold(name) {
    if (name !== 'katalog' || String(T('kat_harga_tampil')).toUpperCase() === 'TIDAK') return null;
    const e = EM(); if (!e.kadar.length) return null;
    const pilih = String(T('kat_harga_kadar') || '').split(',').map(x => x.trim().toUpperCase()).filter(Boolean);
    const ks = (pilih.length ? pilih.map(kadarOf).filter(Boolean) : KADAR()).filter(k => k.tampil !== false).slice(0, 6);
    if (!ks.length) return null;
    return { key: 'kgold', after: '.kat-title + p', html: '<a class="kat-gold" href="#/harga-emas"><div class="kgd-h"><span class="gc-live"><i></i>' + esc(T('harga_judul')) + '</span><span class="kgd-go">Semua kadar' + I('chevron_right') + '</span></div>' +
      '<div class="kgd-row">' + ks.map(k => '<div><span>' + esc(k.kode) + '</span><b>' + rp(k.jual) + '</b><small>/gram</small></div>').join('') + '</div>' +
      '<div class="kgd-f">' + I('update') + 'Diperbarui ' + esc(tgl(e.update)) + ' · harga acuan, produk menyesuaikan otomatis</div></a>' };
  });
  /* ---------- slot: poster per halaman fitur (Dasbor → Poster & Widget) ---------- */
  A.slots.push(function poster(name, param) {
    if (!A.POSTER_PAGES.some(p => p[0] === name) || (name === 'lelang' && param)) return null;
    const k = 'poster_' + name.replace(/-/g, '_'), set = (A.pub && A.pub.settings) || {};
    if (String(set[k + '_on']).toUpperCase() !== 'YA' || !set[k + '_img']) return null;
    const ln = String(set[k + '_link'] || '').trim(), ext = /^https?:/i.test(ln);
    const pic = '<img src="' + esc(img(set[k + '_img'], 1200)) + '" alt="' + esc(set[k + '_alt'] || 'Poster') + '" loading="lazy">';
    return { key: 'poster', html: ln ? '<a class="pg-poster" href="' + esc(ln) + '"' + (ext ? ' target="_blank" rel="noopener"' : '') + '>' + pic + '</a>' : '<div class="pg-poster">' + pic + '</div>' };
  });
  document.addEventListener('click', e => { const h = e.target.closest('.gold-card [data-href]'); if (h) { e.preventDefault(); e.stopPropagation(); location.hash = h.dataset.href; } }, true);

  /* ======================= TABEL & KALKULATOR ======================= */
  function tabelHarga(mode) {
    const ks = KADAR();
    if (!ks.length) return '<div class="empty">' + I('monitoring') + '<p>Harga emas belum diatur.</p></div>';
    const grp = [['emas', 'Emas'], ['perak', 'Perak']].map(g => [g, ks.filter(k => k.logam === g[0])]).filter(x => x[1].length);
    return grp.map(([g, list]) => '<div class="ptable"><div class="pt-h"><span>' + (mode === 'buyback' ? 'Kategori / Kadar' : 'Kadar ' + g[1]) + '</span>' + (mode === 'both' ? '<span>Jual</span><span>Buyback</span>' : '<span>Harga / gram</span>') + '</div>' +
      list.map(k => '<div class="pt-r"><span><b>' + esc(k.kode) + '</b><small>' + esc(k.nama) + '</small></span>' + (mode === 'both' ? '<b>' + rp(k.jual) + '</b><b class="bb">' + rp(k.buyback) + '</b>' : '<b>' + rp(mode === 'buyback' ? k.buyback : k.jual) + '</b>') + '</div>').join('') + '</div>').join('');
  }
  function kalkulator(mode) {
    const ks = KADAR();
    return '<div class="calc" data-calc="' + mode + '"><label class="fld"><span>Pilih kategori ' + (mode === 'buyback' ? 'emas' : 'kadar') + '</span><select class="inp" data-ck>' + ks.map(k => '<option value="' + esc(k.kode) + '">' + esc(k.kode + ' — ' + k.nama + ' · ' + rp(mode === 'buyback' ? k.buyback : k.jual) + '/gr') + '</option>').join('') + '</select></label>' +
      '<div class="f2"><label class="fld"><span>Berat (gram)</span><input class="inp" data-cb inputmode="decimal" placeholder="Contoh: 2,5"></label>' + (mode === 'buyback' ? '' : '<label class="fld"><span>Ongkos (opsional)</span><input class="inp" data-co inputmode="numeric" placeholder="0"></label>') + '</div>' +
      '<div class="calc-out"><span>' + (mode === 'buyback' ? 'Estimasi yang Anda terima' : 'Estimasi harga perhiasan') + '</span><b data-cr>Rp 0</b></div></div>';
  }
  function bindCalc(root) {
    root.querySelectorAll('[data-calc]').forEach(c => {
      const mode = c.dataset.calc, f = () => {
        const k = kadarOf(c.querySelector('[data-ck]').value), b = Number(String(c.querySelector('[data-cb]').value).replace(',', '.')) || 0, o = Number(String((c.querySelector('[data-co]') || {}).value || '').replace(/[^\d]/g, '')) || 0;
        const v = k ? Math.round(((mode === 'buyback' ? k.buyback : k.jual) * b + (mode === 'buyback' ? 0 : o)) / 1000) * 1000 : 0;
        c.querySelector('[data-cr]').textContent = rp(v); c.dataset.val = v; c.dataset.k = k ? k.kode : ''; c.dataset.b = b;
      };
      c.addEventListener('input', f); c.addEventListener('change', f); f();
    });
  }
  function riwayat() {
    const r = (EM().riwayat || []).map(x => Number(x.spot_emas)).filter(Boolean); if (r.length < 2) return '';
    const mn = Math.min(...r), mx = Math.max(...r), W = 300, H = 60, sx = W / (r.length - 1), y = v => mx === mn ? H / 2 : H - 6 - (v - mn) / (mx - mn) * (H - 12);
    const pts = r.map((v, i) => (i * sx).toFixed(1) + ',' + y(v).toFixed(1)).join(' ');
    return '<div class="spark"><svg viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="none" aria-hidden="true"><polyline points="' + pts + '" fill="none" stroke="var(--amber)" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/><polyline points="0,' + H + ' ' + pts + ' ' + W + ',' + H + '" fill="var(--amber)" opacity=".12"/></svg><small>Pergerakan ' + r.length + ' pembaruan terakhir · terendah ' + rp(mn) + ' · tertinggi ' + rp(mx) + '</small></div>';
  }

  /* ======================= HALAMAN: HARGA EMAS HARI INI ======================= */
  A.page('harga-emas', {
    nav: 'harga', title: () => T('harga_judul'),
    render(el) {
      if (!A.pub) { el.innerHTML = '<div class="col"><div class="skel" style="height:220px;margin-top:16px"></div></div>'; return; }
      const e = EM(), auto = e.sumber === 'goldapi';
      el.innerHTML = '<div class="col emas-pg">' + goBack('#/') +
        '<div class="gold-hero"><span class="gc-live"><i></i>' + (auto ? 'Harga otomatis' : 'Harga acuan hari ini') + '</span><h1>' + esc(T('harga_judul')) + '</h1><p>' + esc(String(T('harga_sub') || '').replace(/\s+di\s+[^—\-]+$/i, '').replace(new RegExp('\\s+di\\s+' + (toko() || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'), '')) + '</p>' +
        '<div class="gh-main"><div><small>Emas murni (24K) / gram</small><b>' + rp(e.spot_emas) + '</b></div>' + trendChip() + '</div>' +
        '<div class="gh-meta">' + I('schedule') + 'Update: ' + esc(tgl(e.update) || 'hari ini') + (e.spot_perak ? ' · Perak murni ' + rp(e.spot_perak) + '/gr' : '') + '</div>' + riwayat() + '</div>' +
        '<div class="seg mt16" role="tablist"><button class="on" data-t="both">Jual & Buyback</button><button data-t="calc">Kalkulator</button></div>' +
        '<div data-tb class="mt12"></div>' +
        '<div class="row mt16 wrap"><a class="btn btn-amber grow" href="#/katalog">' + I('diamond') + 'Lihat Katalog</a><a class="btn btn-ghost grow" href="#/jual-emas">' + I('currency_exchange') + 'Jual Emas</a></div>' +
        '<p class="muted small mt12">' + I('info') + 'Harga jual = harga perhiasan/emas yang Anda beli di toko. Harga buyback = harga yang kami bayar saat Anda menjual emas. Harga dapat berubah sewaktu-waktu.</p></div>';
      const tb = el.querySelector('[data-tb]');
      const draw = t => { tb.innerHTML = t === 'calc' ? '<div class="card pad">' + kalkulator('jual') + '</div><div class="card pad mt12">' + kalkulator('buyback') + '</div>' : tabelHarga('both'); bindCalc(tb); };
      el.querySelector('.seg').onclick = ev => { const b = ev.target.closest('[data-t]'); if (!b) return; el.querySelectorAll('.seg button').forEach(x => x.classList.toggle('on', x === b)); draw(b.dataset.t); };
      draw('both');
    }
  });

  /* ======================= HALAMAN: JUAL EMAS (BUYBACK) ======================= */
  A.page('jual-emas', {
    nav: 'jualemas', title: () => 'Jual Emas',
    render(el) {
      if (!A.pub) { el.innerHTML = '<div class="col"><div class="skel" style="height:220px;margin-top:16px"></div></div>'; return; }
      const e = EM();
      el.innerHTML = '<div class="col emas-pg">' + goBack('#/') +
        '<div class="jual-hero"><span class="chip chip-gold">' + I('currency_exchange') + 'Buyback Tertinggi</span><h1>' + esc(T('jual_judul')) + '</h1><p>' + esc(T('jual_sub')) + '</p>' +
        '<ul class="checks">' + lines('jual_poin').map(x => '<li>' + I('check_circle') + esc(x) + '</li>').join('') + '</ul></div>' +
        '<div class="ul-tabs mt16" role="tablist"><button class="on" data-t="tabel">Harga Buyback</button><button data-t="calc">Kalkulator Buyback</button></div>' +
        '<div class="card pad mt12" data-tb></div>' +
        '<div class="note mt12">' + I('info') + '<div>' + esc(T('jual_catatan')) + '</div></div>' +
        '<div class="row mt16 wrap"><button class="btn btn-wa grow" data-jual>' + I('chat', 'fill') + 'Jual Emas via WhatsApp</button><a class="btn btn-ghost grow" href="#/lokasi">' + I('storefront') + 'Lokasi Toko</a></div></div>';
      const tb = el.querySelector('[data-tb]');
      const draw = t => {
        tb.innerHTML = t === 'calc' ? kalkulator('buyback') : '<div class="tb-head"><h3>Harga Buyback Emas</h3><p class="muted small">Update: ' + esc(tgl(e.update) || 'hari ini') + '</p></div>' + tabelHarga('buyback');
        bindCalc(tb);
      };
      el.querySelector('.ul-tabs').onclick = ev => { const b = ev.target.closest('[data-t]'); if (!b) return; el.querySelectorAll('.ul-tabs button').forEach(x => x.classList.toggle('on', x === b)); draw(b.dataset.t); };
      draw('tabel');
      el.querySelector('[data-jual]').onclick = () => {
        const c = el.querySelector('[data-calc]'), k = c && c.dataset.k, b = c && Number(c.dataset.b);
        A.pickBranch(A.isiPesan(T('teks_pesan_jual'), { toko: toko(), cabang: '', kadar: k || '-', berat: b ? gram(b) : '-', estimasi: c && Number(c.dataset.val) ? rp(c.dataset.val) : '-' }).replace(/ {2,}/g, ' ').replace(' ,', ','), { title: 'Jual Emas — pilih toko', track: 'jual' });
      };
    }
  });
  A.isiPesan = (tpl, v) => String(tpl || '').replace(/\{(\w+)\}/g, (m, k) => v[k] == null ? '' : String(v[k]));

  /* ======================= HALAMAN: LELANG ======================= */
  function syaratMember(me, L) {
    const m = me && me.member, ok = (b, t, extra) => '<li class="' + (b ? 'ok' : '') + '">' + I(b ? 'check_circle' : 'radio_button_unchecked') + '<span>' + esc(t) + (extra || '') + '</span></li>';
    if (!m) return '';
    return '<ul class="syarat">' + ok(true, 'Terdaftar sebagai member') +
      (L.wajib_ktp ? ok(m.ktp !== 'belum' && m.ktp !== 'ditolak', 'Foto KTP', ' ' + stChip(m.ktp)) : '') +
      (L.wajib_nota ? ok(m.nota !== 'belum' && m.nota !== 'ditolak', 'Bukti nota pembelian', ' ' + stChip(m.nota)) : '') +
      (L.wajib_sosmed ? ok(m.ikut_sosmed && m.ig, 'Mengikuti media sosial toko') : '') +
      (L.wajib_verif ? ok(m.lelang === 'disetujui', 'Disetujui admin', ' ' + stChip(m.lelang)) : '') + '</ul>';
  }
  const bolehLelang = (me, L) => { const m = me && me.member; if (!m) return false; return (!L.wajib_verif || m.lelang === 'disetujui') && (!L.wajib_ktp || (m.ktp !== 'belum' && m.ktp !== 'ditolak')) && (!L.wajib_nota || (m.nota !== 'belum' && m.nota !== 'ditolak')) && (!L.wajib_sosmed || (m.ikut_sosmed && m.ig)); };
  A.page('flash-sale', {
    nav: 'flash', title: () => lelangState().judul || 'Flash Sale',
    render(el) {
      if (!A.pub) { el.innerHTML = '<div class="col"><div class="skel" style="height:220px;margin-top:16px"></div></div>'; return; }
      const L = lelangState(), me = Mem.me();
      const items = ((A.pub.products) || []).filter(p => p.lelang);
      const syaratUmum = (L.syarat || []).length ? '<div class="card pad mt12"><h3 class="h3">' + I('rule') + 'Syarat Ikut Flash Sale & Lelang</h3><ol class="ol">' + L.syarat.map(x => '<li>' + esc(x) + '</li>').join('') + '</ol></div>' : '';
      if (!L.aktif) {
        el.innerHTML = '<div class="col emas-pg">' + goBack('#/') + '<div class="empty lelang-empty"><span class="big">' + I('bolt') + '</span><h3>' + esc(L.akanDatang ? L.judul : T('flash_kosong_judul')) + '</h3><p>' + esc(L.akanDatang ? (L.sub || '') : T('flash_kosong_teks')) + '</p>' +
          (L.akanDatang ? '<div class="mt12">' + cd(L.mulaiMs, 'Dibuka dalam') + '</div><p class="muted small mt8">Dibuka ' + esc(tglPendek(L.mulai)) + '</p>' : '') +
          '<a class="btn btn-amber mt16" href="#/akun">' + I('account_circle') + (me ? 'Lengkapi syarat member' : 'Daftar member sekarang') + '</a></div>' + syaratUmum + '</div>';
        return;
      }
      const boleh = bolehLelang(me, L);
      el.innerHTML = '<div class="col emas-pg">' + goBack('#/') +
        '<div class="lelang-hero"><span class="lbl">' + I('bolt') + 'Flash Sale berlangsung</span><h1>' + esc(L.judul) + '</h1>' + (L.sub ? '<p>' + esc(L.sub) + '</p>' : '') +
        (L.selesaiMs ? cd(L.selesaiMs, 'Berakhir dalam') : '<p class="small">Selama persediaan masih ada</p>') + '</div>' +
        (me ? '<div class="card pad mt12"><div class="row" style="justify-content:space-between"><h3 class="h3" style="margin:0">' + I('verified_user') + 'Status Anda</h3><a class="see-all" href="#/akun">Kelola' + I('arrow_forward') + '</a></div>' + syaratMember(me, L) +
          (boleh ? '<div class="note ok mt8">' + I('check_circle') + '<div>Anda memenuhi syarat. Pilih produk lalu tekan <b>Ambil</b>. Maksimal ' + L.maks + ' produk per member.</div></div>' : '<a class="btn btn-ink btn-block mt8" href="#/akun">' + I('upload') + 'Lengkapi syarat di halaman Akun</a>') + '</div>'
          : '<div class="note amber mt12">' + I('lock') + '<div><b>Khusus member.</b> Masuk atau daftar dengan nomor HP untuk ambil promo Flash Sale. <a href="#/akun" data-login style="font-weight:700">Masuk / Daftar</a></div></div>') +
        '<div class="sec-head mt16"><h2 class="sec-title">Produk Flash Sale</h2><span class="muted small">' + items.length + ' produk</span></div>' +
        (items.length ? '<div class="pgrid">' + items.map(p => {
          const habis = !(p.lelang_sisa > 0) || p.status === 'Habis', booked = habis && p.lelang_booked > 0 && p.status !== 'Habis', f = (p.foto || [])[0];
          return '<article class="pcard lcard' + (habis ? ' sold' : '') + '"><a class="pimg" href="#/produk/' + encodeURIComponent(p.id) + '">' + (f ? '<img src="' + esc(img(f, 500)) + '" alt="' + esc(p.nama) + '" loading="lazy">' : '') +
            '<span class="chip c-tl ' + (booked ? 'lbl-booked' : 'lbl-hot') + '">' + I(booked ? 'lock_clock' : 'bolt') + (booked ? 'Dipesan (Booked)' : habis ? 'Habis' : 'Sisa ' + p.lelang_sisa) + '</span></a><div class="pbody"><div class="pmeta ell">' + esc(cabNama(p.cabang)) + '</div><h3 class="pname">' + esc(p.nama) + '</h3>' + A.emasChip(p) +
            '<div class="spacer"></div><div class="strike">' + rp(p.harga) + '</div><div class="price">' + rp(p.harga_lelang || p.harga) + '</div>' +
            '<button class="btn ' + (habis ? 'btn-soft' : 'btn-amber') + '" data-ambil="' + esc(p.id) + '"' + (habis ? ' disabled' : '') + '>' + I(habis ? (booked ? 'lock_clock' : 'block') : 'bolt') + (booked ? 'Sedang dipesan' : habis ? 'Sudah habis' : 'Ambil Promo') + '</button></div></article>';
        }).join('') + '</div>' : '<div class="empty">' + I('inventory_2') + '<p>Produk Flash Sale segera ditambahkan.</p></div>') + syaratUmum + '</div>';
      const lg = el.querySelector('[data-login]'); if (lg) lg.onclick = e => { e.preventDefault(); needLogin('flash-sale'); };
      el.querySelectorAll('[data-ambil]').forEach(b => b.onclick = () => ambil(b.dataset.ambil));
      if (Mem.tok() && !el.dataset.ref) { el.dataset.ref = 1; Mem.refresh().then(x => { delete el.dataset.ref; if (x && A.cur === 'flash-sale' && JSON.stringify(x) !== JSON.stringify(me)) A.rerender(); }); }
    }
  });
  Object.assign(A, { syaratMember, bolehLelang, needLogin, kotakWaktu, tglEmas: tgl, gramEmas: gram, stChip });
  async function ambil(id) {
    const p = (A.pub.products || []).find(x => x.id === id); if (!p) return;
    if (!Mem.tok()) return needLogin('flash-sale');
    const L = lelangState();
    if (!bolehLelang(Mem.me(), L)) { A.toast('Lengkapi syarat member dulu di halaman Akun', 'info'); return A.go('akun'); }
    if (!await A.confirm('Ambil "' + p.nama + '" seharga ' + rp(p.harga_lelang || p.harga) + '? Produk langsung berstatus Dipesan (Booked) untuk Anda. Tukarkan kode di ' + cabNama(p.cabang) + ' sebelum batas waktu.', 'Ambil Sekarang')) return;
    const r = await mapi('m.lelang', { produk: id });
    if (!r.success) { A.toast(r.message, 'err'); if (r.data && r.data.code === 'HABIS') A.loadPublic(true); return; }
    kodeSheet(r.data, true); Mem.refresh(); A.loadPublic(true);
  }
  function kodeSheet(k, baru) {
    const q = window.QR ? QR.svg(k.kode, { ecl: 'M' }) : '';
    A.sheet('<div class="center kode-box">' + (baru ? '<span class="big ok">' + I('celebration', 'fill') + '</span><h3>Selamat! Produk berhasil diambil</h3>' : '<h3>' + esc(k.produk_nama) + '</h3>') +
      '<p class="muted">' + esc(k.produk_nama) + ' · <b>' + rp(k.harga) + '</b></p><div class="qr-big">' + q + '</div><div class="kode">' + esc(k.kode) + '</div>' +
      '<p class="small">Tunjukkan kode ini + KTP di <b>' + esc(cabNama(k.cabang)) + '</b>' + (k.batas_tukar ? ' sebelum ' + esc(tgl(k.batas_tukar)) : '') + '.</p>' +
      '<span class="chip ' + (k.status === 'Ditukar' ? 'chip-ok' : k.status === 'Batal' ? 'chip-no' : 'chip-amber') + '">' + esc(k.status) + '</span>' +
      '<button class="btn btn-ghost btn-block mt12" data-copy="' + esc(k.kode) + '">' + I('content_copy') + 'Salin kode</button></div>', { title: 'Kode Flash Sale', center: true });
  }
  document.addEventListener('click', e => { const c = e.target.closest('.kode-box [data-copy]'); if (!c) return; Promise.resolve().then(() => navigator.clipboard.writeText(c.dataset.copy)).then(() => A.toast('Kode disalin'), () => A.toast('Salin manual: ' + c.dataset.copy, 'info')); });

  /* ======================= HALAMAN: AKUN MEMBER ======================= */
  A.page('akun', {
    nav: 'akun', title: () => T('member_judul'),
    render(el) {
      if (!Mem.tok()) return formAkun(el, 'masuk');
      const me = Mem.me();
      if (!me) { el.innerHTML = '<div class="col emas-pg"><div class="skel" style="height:140px;margin-top:16px"></div><div class="skel" style="height:240px;margin-top:12px"></div></div>'; Mem.refresh().then(x => { if (A.cur === 'akun') x ? A.rerender() : formAkun(el, 'masuk'); }); return; }
      profil(el, me);
      if (!el.dataset.ref) { el.dataset.ref = 1; Mem.refresh().then(x => { delete el.dataset.ref; if (x && A.cur === 'akun' && JSON.stringify(x) !== JSON.stringify(me)) profil(el, x); }); }
    }
  });
  function formAkun(el, tab) {
    el.innerHTML = '<div class="col emas-pg">' + goBack('#/') + '<div class="member-hero"><span class="mh-ic">' + I('account_circle') + '</span><h1>' + esc(T('member_judul')) + '</h1><p>' + esc(T('member_sub')) + '</p>' +
      '<div class="mh-perks"><span>' + I('gavel') + 'Lelang & Flash Sale</span><span>' + I('event_available') + 'Sewa perhiasan</span><span>' + I('confirmation_number') + 'Kode & riwayat</span></div></div>' +
      '<div class="ul-tabs mt16"><button data-t="masuk"' + (tab === 'masuk' ? ' class="on"' : '') + '>Masuk</button><button data-t="daftar"' + (tab === 'daftar' ? ' class="on"' : '') + '>Daftar</button></div><div class="card pad mt12" data-f></div></div>';
    const box = el.querySelector('[data-f]');
    const draw = t => {
      box.innerHTML = t === 'masuk'
        ? '<form class="f" data-masuk novalidate><label class="fld"><span>Nomor HP / WhatsApp</span><input class="inp" name="hp" inputmode="tel" autocomplete="tel" placeholder="08xxxxxxxxxx" required></label>' +
          '<label class="fld"><span>Sandi</span><input class="inp" name="password" type="password" autocomplete="current-password" required></label>' +
          '<button class="btn btn-amber btn-block" data-go>' + I('login') + 'Masuk</button><button type="button" class="btn btn-link btn-block mt8" data-lupa>Lupa sandi? Kirim ke WhatsApp</button></form>'
        : '<form class="f" data-daftar novalidate><label class="fld"><span>Nama lengkap (sesuai KTP)</span><input class="inp" name="nama" autocomplete="name" required></label>' +
          '<label class="fld"><span>Nomor HP / WhatsApp</span><input class="inp" name="hp" inputmode="tel" autocomplete="tel" placeholder="08xxxxxxxxxx" required></label>' +
          '<label class="fld"><span>Buat sandi (min. 6 karakter)</span><input class="inp" name="password" type="password" autocomplete="new-password" required></label>' +
          '<label class="fld"><span>Username Instagram (opsional)</span><input class="inp" name="ig" placeholder="@username"></label>' +
          '<label class="pick"><input type="checkbox" name="ikut_sosmed"><span>Saya sudah mengikuti media sosial ' + esc(toko()) + '</span></label>' +
          '<div class="socs-mini">' + ((A.pub && A.pub.socials) || []).filter(s => !/^#/.test(s.url)).map(s => '<a href="' + esc(s.url) + '" target="_blank" rel="noopener">' + A.socIcon(String(s.platform).toLowerCase()) + esc(s.platform) + '</a>').join('') + '</div>' +
          '<button class="btn btn-amber btn-block mt12" data-go>' + I('person_add') + 'Daftar Member</button><p class="muted small mt8 center">Nomor HP dipakai untuk masuk & menerima sandi bila lupa.</p></form>';
      const f = box.querySelector('form');
      f.onsubmit = async ev => {
        ev.preventDefault(); const d = Object.fromEntries(new FormData(f)); d.ikut_sosmed = !!f.querySelector('[name=ikut_sosmed]') && f.querySelector('[name=ikut_sosmed]').checked;
        const r = await mapi(t === 'masuk' ? 'm.masuk' : 'm.daftar', d, f.querySelector('[data-go]'));
        if (!r.success) return A.toast(r.message, 'err');
        Mem.set({ token: r.data.token, me: { member: r.data.member, sewa: [], klaim: [] } }); A.toast(t === 'masuk' ? 'Selamat datang, ' + r.data.member.nama : 'Akun member dibuat 🎉');
        const next = A.Store.ss('next'); A.Store.ss('next', '');
        if (r.data.wajib_ganti) gantiSandi(true);
        if (next) A.go(next); else A.rerender();
      };
      const lp = box.querySelector('[data-lupa]'); if (lp) lp.onclick = lupa;
    };
    el.querySelector('.ul-tabs').onclick = ev => { const b = ev.target.closest('[data-t]'); if (!b) return; el.querySelectorAll('.ul-tabs button').forEach(x => x.classList.toggle('on', x === b)); draw(b.dataset.t); };
    draw(tab);
  }
  function lupa() {
    const o = A.sheet('<form class="f" novalidate><p class="muted">Masukkan nomor HP yang terdaftar. Sandi sementara akan dikirim ke WhatsApp nomor tersebut.</p><label class="fld"><span>Nomor HP / WhatsApp</span><input class="inp" name="hp" inputmode="tel" required></label>' +
      '<div class="row mt8"><button type="button" class="btn btn-ghost" data-x>Batal</button><button class="btn btn-amber grow" data-go>' + I('send') + 'Kirim ke WhatsApp</button></div></form>', { title: 'Lupa Sandi' });
    const f = o.querySelector('form');
    f.onsubmit = async e => { e.preventDefault(); const r = await mapi('m.lupa', { hp: f.hp.value }, f.querySelector('[data-go]')); A.toast(r.message, r.success ? 'ok' : 'err'); if (r.success) o.close(); };
  }
  function gantiSandi(wajib) {
    const o = A.sheet('<form class="f" novalidate>' + (wajib ? '<div class="note amber">' + I('key') + '<div>Anda masuk dengan sandi sementara. Buat sandi baru sekarang.</div></div>' : '') +
      '<label class="fld"><span>Sandi ' + (wajib ? 'sementara' : 'lama') + '</span><input class="inp" type="password" name="lama" required></label><label class="fld"><span>Sandi baru (min. 6)</span><input class="inp" type="password" name="baru" required></label>' +
      '<div class="row mt8"><button type="button" class="btn btn-ghost" data-x>Nanti</button><button class="btn btn-amber grow" data-go>' + I('save') + 'Simpan Sandi</button></div></form>', { title: 'Ganti Sandi' });
    const f = o.querySelector('form');
    f.onsubmit = async e => { e.preventDefault(); const r = await mapi('m.sandi', { lama: f.lama.value, baru: f.baru.value }, f.querySelector('[data-go]')); if (!r.success) return A.toast(r.message, 'err'); Mem.set({ token: r.data.token }); A.toast('Sandi diganti'); o.close(); };
  }
  function profil(el, me) {
    const m = me.member, L = lelangState();
    const doc = (j, judul, sub) => '<div class="doc-row"><span class="ic">' + I(j === 'ktp' ? 'badge' : 'receipt_long') + '</span><div class="grow"><b>' + judul + '</b><small>' + sub + '</small></div>' + stChip(m[j]) +
      '<label class="btn btn-ghost btn-sm">' + I('photo_camera') + (m[j] === 'belum' ? 'Unggah' : 'Ganti') + '<input type="file" accept="image/*" hidden data-up="' + j + '"></label></div>';
    el.innerHTML = '<div class="col emas-pg">' + goBack('#/') +
      '<div class="member-card"><span class="avatar-i">' + esc((m.nama || 'M').slice(0, 1).toUpperCase()) + '</span><div class="grow"><b>' + esc(m.nama) + '</b><small>' + esc(m.hp) + ' · Member ' + esc(toko()) + '</small></div><button class="icon-btn" data-edit aria-label="Ubah profil">' + I('edit') + '</button></div>' +
      '<div class="card pad mt12"><h3 class="h3">' + I('verified_user') + 'Verifikasi Member</h3><p class="muted small">Dokumen disimpan privat & hanya dilihat admin toko. Wajib untuk sewa (KTP) dan lelang.</p>' +
      doc('ktp', 'Foto KTP', 'Wajib untuk sewa & lelang') + doc('nota', 'Bukti nota pembelian', 'Foto nota belanja di toko kami') +
      '<div class="doc-row"><span class="ic">' + I('group') + '</span><div class="grow"><b>Media sosial toko</b><small>' + (m.ig ? 'IG: ' + esc(m.ig) : 'Isi username Instagram Anda') + '</small></div>' + (m.ikut_sosmed && m.ig ? '<span class="chip chip-ok">Sudah</span>' : '<span class="chip chip-no">Belum</span>') + '<button class="btn btn-ghost btn-sm" data-sos>' + I('edit') + 'Atur</button></div>' +
      '<div class="doc-row"><span class="ic">' + I('gavel') + '</span><div class="grow"><b>Status lelang</b><small>' + esc(m.catatan || (m.lelang === 'disetujui' ? 'Anda bisa ikut lelang' : 'Diverifikasi admin setelah dokumen lengkap')) + '</small></div>' + stChip(m.lelang) + '</div></div>' +
      ((me.menang || []).length ? '<div class="card pad mt12 win-card"><h3 class="h3">' + I('emoji_events') + 'Kemenangan Lelang Live</h3><div class="list mt8">' + me.menang.map(w => '<a class="li" href="#/lelang/' + encodeURIComponent(w.id) + '"><span class="avatar-i">' + I('emoji_events', 'fill') + '</span><div class="grow"><b class="ell">' + esc(w.produk_nama) + '</b><small class="mono">' + esc(w.kode) + ' · ' + rp(w.harga) + (w.status === 'menunggu_bayar' ? ' · lunasi sebelum ' + esc(tgl(w.batas_bayar)) : '') + '</small></div><span class="chip ' + (w.status === 'dibayar' ? 'chip-ok' : w.status === 'menunggu_bayar' ? 'chip-amber' : 'chip-no') + '">' + esc({ menunggu_bayar: 'Belum lunas', dibayar: 'Lunas', hangus: 'Hangus' }[w.status] || w.status) + '</span></a>').join('') + '</div></div>' : '') +
      '<div class="card pad mt12"><div class="row" style="justify-content:space-between"><h3 class="h3" style="margin:0">' + I('confirmation_number') + 'Kode Flash Sale Saya</h3>' + (L.aktif ? '<a class="see-all" href="#/flash-sale">Flash Sale' + I('arrow_forward') + '</a>' : '') + '</div>' +
      ((me.klaim || []).length ? '<div class="list mt8">' + me.klaim.map((k, i) => '<button class="li" data-k="' + i + '" style="width:100%;text-align:left"><span class="avatar-i">' + I('qr_code_2') + '</span><div class="grow"><b class="ell">' + esc(k.produk_nama) + '</b><small class="mono">' + esc(k.kode) + ' · ' + rp(k.harga) + '</small></div><span class="chip ' + (k.status === 'Ditukar' ? 'chip-ok' : k.status === 'Batal' ? 'chip-no' : 'chip-amber') + '">' + esc(k.status) + '</span></button>').join('') + '</div>' : '<p class="muted small mt8">Belum ada. Ikuti Flash Sale saat event berlangsung.</p>') + '</div>' +
      '<div class="card pad mt12"><h3 class="h3">' + I('event_available') + 'Sewa Saya</h3>' +
      ((me.sewa || []).length ? '<div class="list mt8">' + me.sewa.map(s => '<div class="li"><span class="avatar-i">' + I('favorite') + '</span><div class="grow"><b class="ell">' + esc(s.produk_nama) + '</b><small>' + esc(s.kode) + ' · mulai ' + esc(s.mulai) + ' · ' + rp(s.total) + '</small></div><span class="chip ' + ({ Disetujui: 'chip-ok', Berjalan: 'chip-ok', Selesai: '', Batal: 'chip-no' }[s.status] || 'chip-amber') + '">' + esc(s.status) + '</span></div>').join('') + '</div>' : '<p class="muted small mt8">Belum ada sewa. <a href="#/katalog/' + encodeURIComponent('k:Sewa Pengantin') + '">Lihat produk sewa</a></p>') + '</div>' +
      '<div class="row mt16"><button class="btn btn-ghost grow" data-pw>' + I('key') + 'Ganti sandi</button><button class="btn btn-ghost grow" data-out style="color:var(--danger)">' + I('logout') + 'Keluar</button></div></div>';
    el.querySelectorAll('[data-up]').forEach(inp => inp.onchange = async () => {
      const file = inp.files[0]; if (!file) return; const lab = inp.closest('label'); lab.classList.add('loading');
      try { const b64 = await compress(file, 1400); const r = await mapi('m.unggah', { jenis: inp.dataset.up, base64: b64, mime: 'image/jpeg' }, null); if (!r.success) throw new Error(r.message); Mem.set({ me: r.data }); A.toast('Terunggah — menunggu verifikasi admin'); profil(el, r.data); }
      catch (e) { A.toast(e.message || 'Gagal mengunggah', 'err'); lab.classList.remove('loading'); }
    });
    el.querySelector('[data-sos]').onclick = el.querySelector('[data-edit]').onclick = () => {
      const o = A.sheet('<form class="f" novalidate><label class="fld"><span>Nama lengkap</span><input class="inp" name="nama" value="' + esc(m.nama) + '"></label><label class="fld"><span>Username Instagram</span><input class="inp" name="ig" value="' + esc(m.ig || '') + '" placeholder="@username"></label>' +
        '<div class="socs-mini">' + ((A.pub && A.pub.socials) || []).filter(s => !/^#/.test(s.url)).map(s => '<a href="' + esc(s.url) + '" target="_blank" rel="noopener">' + A.socIcon(String(s.platform).toLowerCase()) + 'Ikuti ' + esc(s.platform) + '</a>').join('') + '</div>' +
        '<label class="pick"><input type="checkbox" name="ikut_sosmed"' + (m.ikut_sosmed ? ' checked' : '') + '><span>Saya sudah mengikuti media sosial toko</span></label>' +
        '<div class="row mt8"><button type="button" class="btn btn-ghost" data-x>Batal</button><button class="btn btn-amber grow" data-go>' + I('save') + 'Simpan</button></div></form>', { title: 'Profil & Media Sosial' });
      const f = o.querySelector('form');
      f.onsubmit = async e => { e.preventDefault(); const r = await mapi('m.profil', { nama: f.nama.value, ig: f.ig.value, ikut_sosmed: f.ikut_sosmed.checked }, f.querySelector('[data-go]')); if (!r.success) return A.toast(r.message, 'err'); Mem.set({ me: r.data }); o.close(); profil(el, r.data); A.toast('Profil disimpan'); };
    };
    el.querySelectorAll('[data-k]').forEach(b => b.onclick = () => kodeSheet(me.klaim[+b.dataset.k]));
    el.querySelector('[data-pw]').onclick = () => gantiSandi(false);
    el.querySelector('[data-out]').onclick = async () => { if (!await A.confirm('Keluar dari akun member?', 'Keluar')) return; Mem.clear(); A.rerender(); };
    if (me.wajib_ganti && !A.Store.ss('pwAsk')) { A.Store.ss('pwAsk', '1'); gantiSandi(true); }
  }

  /* ======================= SEWA ======================= */
  document.addEventListener('click', e => { const b = e.target.closest('[data-sewa]'); if (!b) return; e.preventDefault(); sewa((A.pub.products || []).find(p => p.id === b.dataset.sewa)); });
  async function sewa(p) {
    if (!p) return;
    if (!Mem.tok()) return needLogin('produk/' + encodeURIComponent(p.id));
    const me = Mem.me() || await Mem.refresh(), m = me && me.member;
    const adaKtp = m && m.ktp !== 'belum' && m.ktp !== 'ditolak', paket = p.satuan_sewa === 'paket';
    const today = new Date(Date.now() - new Date().getTimezoneOffset() * 6e4).toISOString().slice(0, 10);
    const o = A.sheet('<form class="f" novalidate><div class="row" style="gap:12px"><div class="th" style="width:64px;height:64px;border-radius:14px;background:center/cover url(\'' + esc(img((p.foto || [])[0], 200)) + '\')"></div><div class="grow"><b>' + esc(p.nama) + '</b><div class="muted small">' + rp(p.harga) + ' / ' + (paket ? 'paket' : 'hari') + (p.deposit ? ' · deposit ' + rp(p.deposit) : '') + '</div></div></div>' +
      (adaKtp ? '' : '<div class="note amber mt12">' + I('badge') + '<div>Sewa wajib unggah foto KTP. <a href="#/akun" data-ktp style="font-weight:700">Unggah KTP sekarang</a></div></div>') +
      '<div class="f2 mt12"><label class="fld"><span>Tanggal mulai</span><input class="inp" type="date" name="mulai" min="' + today + '" value="' + today + '" required></label>' +
      (paket ? '<label class="fld"><span>Lama sewa</span><input class="inp" value="1 paket (± 3 hari)" disabled></label>' : '<label class="fld"><span>Lama sewa (hari)</span><input class="inp" type="number" name="durasi" min="1" max="30" value="1"></label>') + '</div>' +
      '<label class="fld"><span>Catatan (acara, ukuran, dll.)</span><textarea class="inp" name="catatan" rows="2" maxlength="300" placeholder="Contoh: untuk lamaran tanggal 20, warna gold"></textarea></label>' +
      '<div class="calc-out"><span>Total sewa</span><b data-tot>' + rp(p.harga) + '</b></div>' + (p.deposit ? '<p class="muted small mt8">+ deposit ' + rp(p.deposit) + ' (dikembalikan setelah barang kembali)</p>' : '') +
      '<p class="muted small mt8">' + esc(T('sewa_catatan')) + '</p>' +
      '<div class="row mt8"><button type="button" class="btn btn-ghost" data-x>Batal</button><button class="btn btn-amber grow" data-go' + (adaKtp ? '' : ' disabled') + '>' + I('event_available') + 'Ajukan Sewa</button></div></form>', { title: 'Sewa ' + (p.kategori || '') });
    const f = o.querySelector('form'), tot = () => { o.querySelector('[data-tot]').textContent = rp(paket ? p.harga : p.harga * Math.max(1, Math.min(30, Number((f.durasi || {}).value) || 1))); };
    f.addEventListener('input', tot);
    const k = o.querySelector('[data-ktp]'); if (k) k.onclick = () => o.close();
    f.onsubmit = async e => {
      e.preventDefault();
      const r = await mapi('m.sewa', { produk: p.id, mulai: f.mulai.value, durasi: paket ? 1 : f.durasi.value, catatan: f.catatan.value }, f.querySelector('[data-go]'));
      if (!r.success) { A.toast(r.message, 'err'); if (r.data && r.data.code === 'KTP') { o.close(); A.go('akun'); } return; }
      o.close(); Mem.refresh();
      const s = r.data;
      const ok = A.sheet('<div class="center kode-box"><span class="big ok">' + I('check_circle', 'fill') + '</span><h3>Pengajuan sewa terkirim</h3><p class="muted">' + esc(p.nama) + '<br>Mulai ' + esc(s.mulai) + ' · total ' + rp(s.total) + '</p><div class="kode">' + esc(s.kode) + '</div>' +
        '<p class="small">Admin akan menghubungi Anda untuk konfirmasi. Anda juga bisa langsung chat admin toko.</p><button class="btn btn-wa btn-block mt12" data-wa>' + I('chat', 'fill') + 'Konfirmasi via WhatsApp</button></div>', { title: 'Sewa', center: true });
      ok.querySelector('[data-wa]').onclick = () => A.openWa(s.cabang, 'Halo ' + toko() + ' ' + cabNama(s.cabang) + ', saya mengajukan sewa *' + p.nama + '* mulai ' + s.mulai + ' (kode ' + s.kode + '). Mohon konfirmasinya. Terima kasih.', { p: p.id });
    };
  }

  /* ======================= HARGA REALTIME — cek versi data tiap 2 menit ======================= */
  let lastCek = 0;
  async function cekHarga() {
    if (!A.cfg.GAS_URL || !A.pub || document.hidden || Date.now() - lastCek < 100000) return;
    lastCek = Date.now();
    try {
      const u = A.cfg.GAS_URL + (A.cfg.GAS_URL.indexOf('?') > -1 ? '&' : '?') + 'action=harga';
      const r = await (await fetch(u, { cache: 'no-store', redirect: 'follow' })).json();
      if (r && r.success && r.data && r.data.ver && A.pub.ver && r.data.ver !== A.pub.ver) A.loadPublic(true);
    } catch (e) { }
  }
  setInterval(cekHarga, 30000);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) cekHarga(); });
})();
