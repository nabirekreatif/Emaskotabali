/* ==========================================================================
 *  Toko Emas — Galeri Pesanan Custom & Galeri Pre-Order (foto saja: cari, filter
 *  kategori, ganti tampilan), Menu Kategori ala aplikasi (grid 4×2), dan
 *  berbagi foto + link produk langsung ke WhatsApp.
 *  © Nabire Kreatif — template berlisensi
 * ========================================================================== */
(function () {
  'use strict';
  const A = window.App, { esc, I, img } = A, T = A.T;
  const S = () => (A.pub && A.pub.settings) || {};
  const toko = () => S().nama_toko || 'Toko Emas';
  const isPC = () => !!(window.matchMedia && matchMedia('(min-width: 900px)').matches);
  const abs = u => { u = img(u, 1200); try { return new URL(u, location.href).href; } catch (e) { return u; } };
  const siteUrl = () => location.href.split('#')[0];
  const JENIS = { custom: { t: () => T('galeri_custom_judul'), s: () => T('galeri_custom_sub'), lbl: 'pesanan custom', ic: 'photo_library' }, po: { t: () => T('galeri_po_judul'), s: () => T('galeri_po_sub'), lbl: 'pre-order', ic: 'collections' } };
  const LAYOUT = { grid: ['grid_view', 'Grid'], mosaik: ['auto_awesome_mosaic', 'Mosaik'], masonry: ['view_quilt', 'Masonry'], besar: ['view_day', 'Besar'], rapat: ['apps', 'Rapat'] };
  const layoutsOk = () => String(T('galeri_layouts') || 'grid').split(',').map(x => x.trim()).filter(x => LAYOUT[x]);
  const layoutNow = () => { const ok = layoutsOk(), k = 'gal_' + (isPC() ? 'pc' : 'hp'), u = A.Store.get(k, ''), d = T(isPC() ? 'galeri_layout_pc' : 'galeri_layout_hp'); return ok.indexOf(u) > -1 ? u : ok.indexOf(d) > -1 ? d : ok[0] || 'grid'; };
  const items = j => ((A.pub && A.pub.galeri) || []).filter(g => !j || g.jenis === j);
  const isiPesan = (tpl, v) => String(tpl || '').replace(/\{(\w+)\}/g, (m, k) => v[k] == null ? '' : String(v[k])).replace(/ {2,}/g, ' ').replace(/ ,/g, ',');

  /* ======================= BERBAGI FOTO (+ link) KE WHATSAPP DLL ======================= */
  const driveId = u => (String(u || '').match(/lh3\.googleusercontent\.com\/d\/([\w-]{20,})/) || [])[1];
  async function fotoFile(u, nama) {
    let blob = null;
    try { const r = await fetch(img(u, 1080), { mode: 'cors' }); if (r.ok) blob = await r.blob(); } catch (e) { }
    if ((!blob || !/^image\//.test(blob.type)) && driveId(u) && A.cfg.GAS_URL) {
      try {
        const r = await (await fetch(A.cfg.GAS_URL + (A.cfg.GAS_URL.indexOf('?') > -1 ? '&' : '?') + 'action=foto&id=' + driveId(u), { redirect: 'follow' })).json();
        if (r.success) { const b = atob(r.data.base64), a = new Uint8Array(b.length); for (let i = 0; i < b.length; i++) a[i] = b.charCodeAt(i); blob = new Blob([a], { type: r.data.mime }); }
      } catch (e) { }
    }
    if (!blob) return null;
    const ext = /png/.test(blob.type) ? 'png' : /webp/.test(blob.type) ? 'webp' : 'jpg';
    return new File([blob], (String(nama || 'foto').replace(/[^\w-]+/g, '-').slice(0, 40) || 'foto') + '.' + ext, { type: blob.type });
  }
  /** Kirim foto + teks + link lewat lembar berbagi bawaan HP (WhatsApp, IG, Telegram…). Cadangan: WhatsApp teks + link. */
  A.shareFoto = async function (foto, teks, url, btn) {
    const canFiles = !!(navigator.canShare && navigator.share);
    if (btn) { btn.disabled = true; btn.dataset.t = btn.innerHTML; btn.innerHTML = '<span class="spin"></span>Menyiapkan foto…'; }
    try {
      if (canFiles && foto) {
        const f = await fotoFile(foto, teks.split('\n')[0]);
        if (f && navigator.canShare({ files: [f] })) { await navigator.share({ files: [f], text: teks + '\n' + url }); return true; }
      }
      window.open('https://wa.me/?text=' + encodeURIComponent(teks + '\n' + url), '_blank', 'noopener');
      return false;
    } catch (e) { return false; }
    finally { if (btn) { btn.disabled = false; btn.innerHTML = btn.dataset.t; } }
  };
  const canShareFiles = () => { try { return !!(navigator.canShare && navigator.canShare({ files: [new File(['x'], 'x.jpg', { type: 'image/jpeg' })] })); } catch (e) { return false; } };
  A.canShareFiles = canShareFiles;

  /* ======================= MENU KATEGORI ala aplikasi (grid 4 kolom × 2 baris, geser untuk lainnya) ======================= */
  const kgTile = m => {
    const L = A.menuLink(m), lelangOff = (m.link === '#/lelang' && A.menuOk && !A.menuOk({ id: 'lelang', link: '#/lelang' }));
    if (lelangOff) return '';
    return '<a class="kg-it" href="' + esc(L.href) + '"' + L.attr + '><span class="kg-ic">' + (m.img ? '<img src="' + esc(img(m.img, 160)) + '" alt="" loading="lazy" decoding="async" width="56" height="56">' : I(m.icon || 'apps', 'fill')) + '</span><span class="kg-l">' + esc(m.label) + '</span></a>';
  };
  function kgSection() {
    const list = A.kgItems().filter(m => m.tampil !== false).map(kgTile).filter(Boolean);
    if (!list.length) return '';
    const pages = []; for (let i = 0; i < list.length; i += 8) pages.push(list.slice(i, i + 8));
    return '<section class="kg kg-' + esc(T('kg_gaya') || 'kartu') + '">' + (T('kg_judul') ? '<div class="sec-head"><h2 class="sec-title">' + esc(T('kg_judul')) + '</h2></div>' : '') +
      '<div class="kg-pages" data-kg>' + pages.map(p => '<div class="kg-page">' + p.join('') + '</div>').join('') + '</div>' +
      (pages.length > 1 ? '<div class="kg-dots">' + pages.map((p, i) => '<i' + (i ? '' : ' class="on"') + '></i>').join('') + '</div>' : '') +
      '<div class="kg-all">' + list.join('') + '</div></section>';
  }
  document.addEventListener('scroll', e => {
    const t = e.target; if (!t || !t.matches || !t.matches('[data-kg]')) return;
    const i = Math.round(t.scrollLeft / t.clientWidth); t.parentNode.querySelectorAll('.kg-dots i').forEach((d, k) => d.classList.toggle('on', k === i));
  }, true);

  /* ======================= BAGIAN GALERI di beranda ======================= */
  function galeriSection() {
    const all = items(); if (!all.length) return '';
    const n = Math.max(4, Math.min(12, +T('galeri_bio_jumlah') || 8)), cu = items('custom').length, po = items('po').length;
    const pick = all.slice(0, n);
    return '<section class="gal-bio"><div class="sec-head"><h2 class="sec-title">' + esc(T('galeri_bio_judul')) + '</h2><a class="see-all" href="#/galeri/' + (cu ? 'custom' : 'po') + '">Lihat semua' + I('arrow_forward') + '</a></div>' +
      '<div class="gal-bio-grid">' + pick.map(g => '<a href="#/galeri/' + g.jenis + '/' + encodeURIComponent(g.id) + '" aria-label="' + esc(g.kategori) + '"><img src="' + esc(img(g.foto, 300)) + '" alt="' + esc(g.kategori) + '" loading="lazy" decoding="async"><span class="gb-j ' + g.jenis + '">' + (g.jenis === 'po' ? 'PO' : 'Custom') + '</span></a>').join('') + '</div>' +
      '<div class="gal-bio-cta">' + (cu ? '<a class="btn btn-ghost" href="#/galeri/custom" data-nav="galeri">' + I('photo_library') + 'Galeri Custom <small>' + cu + '</small></a>' : '') + (po ? '<a class="btn btn-ghost" href="#/galeri/po" data-nav="galeripo">' + I('collections') + 'Galeri Pre-Order <small>' + po + '</small></a>' : '') + '</div></section>';
  }
  if (A.SECTIONS) { A.SECTIONS.kategori_grid = kgSection; A.SECTIONS.galeri = galeriSection; }

  /* ======================= HALAMAN GALERI ======================= */
  const GS = { jenis: 'custom', kat: '', q: '', n: 24 };
  A.page('galeri', {
    nav: 'galeri', title: () => JENIS[GS.jenis].t(),
    render(el, param, re, changed) {
      const [j, id] = String(param || '').split('/');
      const jenis = j === 'po' ? 'po' : 'custom';
      if (changed !== false && jenis !== GS.jenis) { GS.kat = ''; GS.q = ''; GS.n = 24; }
      GS.jenis = jenis;
      document.querySelectorAll('[data-nav]').forEach(a => { if (a.dataset.nav === 'galeri' || a.dataset.nav === 'galeripo') a.classList.toggle('on', a.dataset.nav === (jenis === 'po' ? 'galeripo' : 'galeri')); });
      if (!A.pub) { el.innerHTML = '<div class="col"><div class="skel" style="height:120px;margin-top:16px"></div><div class="skel" style="height:320px;margin-top:12px"></div></div>'; return; }
      draw(el);
      if (id) { const list = filtered(), i = list.findIndex(g => g.id === id); const all = items(jenis); const k = i > -1 ? i : all.findIndex(g => g.id === id); if (k > -1) lightbox(i > -1 ? list : all, k, true); }
    }
  });
  function filtered() {
    const q = GS.q.trim().toLowerCase(), words = q.split(/\s+/).filter(Boolean);
    return items(GS.jenis).filter(g => (!GS.kat || g.kategori === GS.kat) && (!words.length || words.every(w => (g.kategori + ' ' + g.tag + ' ' + (g.jenis === 'po' ? 'po pre order preorder' : 'custom pesanan')).toLowerCase().indexOf(w) > -1)));
  }
  function draw(el) {
    const J = JENIS[GS.jenis], all = items(GS.jenis), cats = {};
    all.forEach(g => { cats[g.kategori] = (cats[g.kategori] || 0) + 1; });
    const urut = String(T('galeri_kategori') || '').split(',').map(x => x.trim()).filter(Boolean);
    const catList = Object.keys(cats).sort((a, b) => { const ia = urut.indexOf(a), ib = urut.indexOf(b); return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib) || a.localeCompare(b); });
    const lay = layoutNow(), oks = layoutsOk();
    el.innerHTML = '<div class="wide gal-pg"><div class="gal-hero"><div class="gal-sw" role="tablist">' + ['custom', 'po'].map(k => '<a href="#/galeri/' + k + '" class="' + (k === GS.jenis ? 'on' : '') + '">' + I(JENIS[k].ic) + esc(k === 'po' ? 'Pre-Order' : 'Custom') + '<small>' + items(k).length + '</small></a>').join('') + '</div>' +
      '<h1>' + esc(J.t()) + '</h1><p>' + esc(J.s()) + '</p></div>' +
      '<div class="gal-bar"><div class="search">' + I('search') + '<input type="search" placeholder="Cari model, kategori, mis. cincin nama…" value="' + esc(GS.q) + '" data-gq aria-label="Cari foto"></div>' +
      (oks.length > 1 ? '<div class="gal-lay" role="group" aria-label="Tampilan galeri">' + oks.map(k => '<button type="button" data-lay="' + k + '" class="' + (k === lay ? 'on' : '') + '" title="' + LAYOUT[k][1] + '" aria-label="Tampilan ' + LAYOUT[k][1] + '">' + I(LAYOUT[k][0]) + '</button>').join('') + '</div>' : '') + '</div>' +
      '<div class="pills gal-chips" data-gk><button class="pill' + (GS.kat ? '' : ' on') + '" data-k="">Semua <small>' + all.length + '</small></button>' + catList.map(c => '<button class="pill' + (c === GS.kat ? ' on' : '') + '" data-k="' + esc(c) + '">' + esc(c) + ' <small>' + cats[c] + '</small></button>').join('') + '</div>' +
      '<div data-gg></div><div class="gal-more" data-gm></div>' +
      '<div class="gal-foot"><span>' + I('info') + 'Ketuk foto untuk melihat besar & menanyakannya lewat WhatsApp.</span></div></div>';
    const q = el.querySelector('[data-gq]');
    q.addEventListener('input', A.debounce(() => { GS.q = q.value; GS.n = 24; grid(el); }, 220));
    el.querySelector('[data-gk]').onclick = e => { const b = e.target.closest('[data-k]'); if (!b) return; GS.kat = b.dataset.k; GS.n = 24; el.querySelectorAll('[data-gk] .pill').forEach(x => x.classList.toggle('on', x === b)); grid(el); };
    const lb = el.querySelector('.gal-lay'); if (lb) lb.onclick = e => { const b = e.target.closest('[data-lay]'); if (!b) return; A.Store.set('gal_' + (isPC() ? 'pc' : 'hp'), b.dataset.lay); lb.querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b)); grid(el); };
    grid(el);
  }
  let io = null;
  function grid(el) {
    const box = el.querySelector('[data-gg]'), more = el.querySelector('[data-gm]'), list = filtered(), lay = layoutNow();
    const w = { grid: 360, mosaik: 420, masonry: 420, besar: 900, rapat: 240 }[lay] || 400;
    box.className = 'gal gal-' + lay + ' gj-' + esc(T('galeri_jarak') || 'normal') + ' gs-' + esc(T('galeri_sudut') || 'bulat') + (T('galeri_label') === 'TIDAK' || lay === 'rapat' ? ' no-lbl' : '');
    box.innerHTML = list.length ? list.slice(0, GS.n).map((g, i) => '<button type="button" class="gi" data-gi="' + i + '" aria-label="Lihat foto ' + esc(g.kategori) + '"><img src="' + esc(img(g.foto, w)) + '" alt="' + esc(g.kategori + (g.tag ? ' — ' + g.tag : '')) + '" loading="' + (i < 6 ? 'eager' : 'lazy') + '" decoding="async"><span class="gl">' + esc(g.kategori) + '</span></button>').join('')
      : '<div class="empty" style="grid-column:1/-1">' + I('search_off') + '<p>Belum ada foto untuk pencarian ini.</p>' + (GS.q || GS.kat ? '<button class="btn btn-ghost btn-sm" data-reset>Tampilkan semua</button>' : '') + '</div>';
    box.onclick = e => { const b = e.target.closest('[data-gi]'); if (b) lightbox(list, +b.dataset.gi); const r = e.target.closest('[data-reset]'); if (r) { GS.q = ''; GS.kat = ''; draw(el); } };
    more.innerHTML = list.length > GS.n ? '<button class="btn btn-ghost" data-mm>' + I('expand_more') + 'Muat lebih banyak (' + (list.length - GS.n) + ')</button>' : (list.length ? '<span class="muted small">' + list.length + ' foto</span>' : '');
    const mm = more.querySelector('[data-mm]');
    if (io) io.disconnect();
    if (mm) { mm.onclick = () => { GS.n += 24; grid(el); }; if ('IntersectionObserver' in window) { io = new IntersectionObserver(en => { if (en[0].isIntersecting) { io.disconnect(); GS.n += 24; grid(el); } }, { rootMargin: '600px' }); io.observe(mm); } }
  }

  /* ======================= LIGHTBOX + WhatsApp ======================= */
  function lightbox(list, i, dariLink) {
    if (!list.length) return;
    const o = document.createElement('div'); o.className = 'glb'; o.setAttribute('role', 'dialog'); o.setAttribute('aria-modal', 'true');
    o.innerHTML = '<div class="glb-top"><button class="glb-b" data-sh aria-label="Bagikan">' + I('share') + '</button><span class="glb-n" data-n></span><button class="glb-b" data-x aria-label="Tutup">' + I('close') + '</button></div>' +
      '<div class="glb-st" data-st><img alt="" data-im></div><button class="glb-nav prev" data-pv aria-label="Sebelumnya">' + I('chevron_left') + '</button><button class="glb-nav next" data-nx aria-label="Berikutnya">' + I('chevron_right') + '</button>' +
      '<div class="glb-bot"><div class="glb-meta" data-m></div><button class="btn btn-wa glb-wa" data-wa>' + I('chat', 'fill') + 'Tanyakan model ini</button></div>';
    document.body.appendChild(o); document.documentElement.classList.add('glb-open');
    const im = o.querySelector('[data-im]');
    const show = () => {
      const g = list[i]; im.classList.add('ld'); im.onload = () => im.classList.remove('ld'); im.src = img(g.foto, 1200); im.alt = g.kategori;
      o.querySelector('[data-n]').textContent = (i + 1) + ' / ' + list.length;
      o.querySelector('[data-m]').innerHTML = '<span class="chip chip-gold">' + I(JENIS[g.jenis].ic) + (g.jenis === 'po' ? 'Pre-Order' : 'Custom') + '</span><span class="chip">' + esc(g.kategori) + '</span>' + (g.tag ? '<span class="glb-tag">' + esc(g.tag) + '</span>' : '');
      o.querySelector('[data-pv]').hidden = i <= 0; o.querySelector('[data-nx]').hidden = i >= list.length - 1;
      [list[i + 1], list[i - 1]].forEach(n => { if (n) { const p = new Image(); p.src = img(n.foto, 1200); } });
      try { history.replaceState(null, '', '#/galeri/' + g.jenis + '/' + encodeURIComponent(g.id)); } catch (e) { }
    };
    const close = () => { o.remove(); document.documentElement.classList.remove('glb-open'); document.removeEventListener('keydown', key); try { history.replaceState(null, '', '#/galeri/' + GS.jenis); } catch (e) { } };
    const go = d => { const n = i + d; if (n < 0 || n >= list.length) return; i = n; show(); };
    const key = e => { if (e.key === 'Escape') close(); if (e.key === 'ArrowRight') go(1); if (e.key === 'ArrowLeft') go(-1); };
    document.addEventListener('keydown', key);
    o.querySelector('[data-x]').onclick = close; o.querySelector('[data-pv]').onclick = () => go(-1); o.querySelector('[data-nx]').onclick = () => go(1);
    o.querySelector('[data-st]').onclick = e => { if (e.target === e.currentTarget) close(); };
    let x0 = null; const st = o.querySelector('[data-st]');
    st.addEventListener('touchstart', e => { x0 = e.touches[0].clientX; }, { passive: true });
    st.addEventListener('touchend', e => { if (x0 == null) return; const dx = e.changedTouches[0].clientX - x0; if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1); x0 = null; });
    const link = g => siteUrl() + '#/galeri/' + g.jenis + '/' + encodeURIComponent(g.id);
    o.querySelector('[data-wa]').onclick = () => {
      const g = list[i];
      const msg = isiPesan(T('teks_pesan_galeri'), { toko: toko(), cabang: '', jenis: JENIS[g.jenis].lbl, kategori: g.kategori + (g.tag ? ' — ' + g.tag : ''), foto: abs(g.foto), link: link(g) });
      A.track && A.track('wa', g.id);
      A.pickBranch(msg, { title: 'Tanya model ini — pilih toko' });
    };
    o.querySelector('[data-sh]').onclick = e => { const g = list[i]; A.shareFoto(g.foto, 'Contoh ' + JENIS[g.jenis].lbl + ' ' + g.kategori + ' di ' + toko(), link(g), e.currentTarget); };
    show();
  }
})();
