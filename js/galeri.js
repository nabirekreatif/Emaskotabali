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
  const GD = () => A.galeriDaftar();
  const gInfo = id => { const g = A.galeriDaftar(true).find(x => x.id === id) || { id, nama: id, judul: 'Galeri ' + id, sub: '', icon: 'photo_library' }; return g; };
  const LBL = id => ({ custom: 'pesanan custom', po: 'pre-order' }[id] || String(gInfo(id).nama || id).toLowerCase());
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
    const L = A.menuLink(m), lelangOff = ((m.link === '#/lelang' || m.link === '#/flash-sale') && A.menuOk && !A.menuOk({ id: m.link === '#/lelang' ? 'lelang' : 'flash', link: m.link }));
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

  /* ======================= BAGIAN GALERI di beranda (acak + efek berjalan) ======================= */
  const acak = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  function galeriSection() {
    const aktif = GD().map(g => g.id), all = items().filter(g => aktif.indexOf(g.jenis) > -1); if (!all.length) return '';
    const n = Math.max(4, Math.min(16, +T('galeri_bio_jumlah') || 8)), efek = T('galeri_bio_efek') || 'jalan';
    const pick = (T('galeri_bio_acak') === 'TIDAK' ? all : acak(all)).slice(0, efek === 'jalan' ? Math.max(n, 10) : n);
    const tile = g => '<a href="#/galeri/' + esc(g.jenis) + '/' + encodeURIComponent(g.id) + '" class="gb-it" aria-label="' + esc(gInfo(g.jenis).nama + ' ' + g.kategori) + '"><img src="' + esc(img(g.foto, 300)) + '" alt="' + esc(g.kategori) + '" loading="lazy" decoding="async">' + (A.favBtn ? A.favBtn('g', g.id) : '') + '</a>';
    let body;
    if (efek === 'jalan') {
      const h = Math.ceil(pick.length / 2), r1 = pick.slice(0, h), r2 = pick.slice(h).concat(pick.slice(0, Math.max(0, h - (pick.length - h))));
      const row = (r, rev) => '<div class="gb-row' + (rev ? ' rev' : '') + '" style="--dur:' + Math.max(18, r.length * 4.5) + 's"><div class="gb-track">' + r.map(tile).join('') + r.map(tile).join('').replace(/<a /g, '<a tabindex="-1" aria-hidden="true" ') + '</div></div>';
      body = '<div class="gb-marquee">' + row(r1) + row(r2, 1) + '</div>';
    } else body = '<div class="gal-bio-grid' + (efek === 'muncul' ? ' gb-pop' : '') + '">' + pick.map(tile).join('') + '</div>';
    const pertama = (GD().find(g => all.some(x => x.jenis === g.id)) || GD()[0] || {}).id || 'custom';
    return '<section class="gal-bio"><div class="sec-head"><h2 class="sec-title">' + esc(T('galeri_bio_judul')) + '</h2>' +
      '<a class="gb-lay" href="#/galeri/' + esc(pertama) + '" aria-label="Lihat semua galeri">' + I('grid_view') + '</a></div>' + body +
      '<a class="btn btn-ghost btn-block gb-all" href="#/galeri/' + esc(pertama) + '">Lihat semua ' + I('chevron_right') + '</a></section>';
  }
  if (A.SECTIONS) { A.SECTIONS.kategori_grid = kgSection; A.SECTIONS.galeri = galeriSection; }

  /* ======================= HALAMAN GALERI ======================= */
  const GS = { jenis: 'custom', kat: '', q: '', n: 24, urut: 'baru' };
  const URUT = { baru: ['schedule', 'Terbaru'], lama: ['history', 'Terlama'], acak: ['shuffle', 'Acak'] };
  let acakSeed = Math.random();
  A.page('galeri', {
    nav: 'galeri', title: () => gInfo(GS.jenis).judul,
    render(el, param, re, changed) {
      const [j, id] = String(param || '').split('/');
      const jenis = j && /^[a-z0-9-]{2,24}$/.test(j) ? j : ((GD()[0] || {}).id || 'custom');
      if (changed !== false && jenis !== GS.jenis) { GS.kat = ''; GS.q = ''; GS.n = 24; GS.urut = 'baru'; }
      GS.jenis = jenis;
      const nv = jenis === 'po' ? 'galeripo' : jenis === 'custom' ? 'galeri' : 'galeri-' + jenis;
      document.querySelectorAll('[data-nav]').forEach(a => { if (/^galeri/.test(a.dataset.nav)) a.classList.toggle('on', a.dataset.nav === nv); });
      if (!A.pub) { el.innerHTML = '<div class="col"><div class="skel" style="height:120px;margin-top:16px"></div><div class="skel" style="height:320px;margin-top:12px"></div></div>'; return; }
      draw(el);
      if (id) { const list = filtered(), i = list.findIndex(g => g.id === id); const all = items(jenis); const k = i > -1 ? i : all.findIndex(g => g.id === id); if (k > -1) lightbox(i > -1 ? list : all, k, true); }
    }
  });
  function filtered() {
    const q = GS.q.trim().toLowerCase(), words = q.split(/\s+/).filter(Boolean);
    let L = items(GS.jenis).filter(g => (!GS.kat || g.kategori === GS.kat) && (!words.length || words.every(w => (g.kategori + ' ' + g.tag + ' ' + (g.jenis === 'po' ? 'po pre order preorder' : 'custom pesanan')).toLowerCase().indexOf(w) > -1)));
    if (GS.urut === 'lama') L = L.slice().reverse();
    else if (GS.urut === 'acak') { const h = id => { let x = Math.floor(acakSeed * 1e9); for (let i = 0; i < id.length; i++) x = (x * 31 + id.charCodeAt(i)) | 0; return x; }; L = L.slice().sort((a, b) => h(a.id) - h(b.id)); }
    return L;
  }
  function draw(el) {
    const J = gInfo(GS.jenis), all = items(GS.jenis), cats = {};
    all.forEach(g => { cats[g.kategori] = (cats[g.kategori] || 0) + 1; });
    const urut = String(T('galeri_kategori') || '').split(',').map(x => x.trim()).filter(Boolean);
    const catList = Object.keys(cats).sort((a, b) => { const ia = urut.indexOf(a), ib = urut.indexOf(b); return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib) || a.localeCompare(b); });
    const lay = layoutNow(), oks = layoutsOk(), nF = (GS.kat ? 1 : 0) + (GS.urut !== 'baru' ? 1 : 0);
    el.innerHTML = '<div class="wide gal-pg"><div class="gal-hero"><div class="gal-sw" role="tablist" aria-label="Pilih galeri">' + GD().map(g => '<a href="#/galeri/' + esc(g.id) + '" role="tab" aria-selected="' + (g.id === GS.jenis) + '" class="' + (g.id === GS.jenis ? 'on' : '') + '">' + I(g.icon || 'photo_library') + '<span>' + esc(g.nama) + '</span><small>' + items(g.id).length + '</small></a>').join('') + '</div>' +
      '<h1>' + esc(J.judul) + '</h1><p>' + esc(J.sub || '') + '</p><div class="gal-stat"><span>' + I('photo_library') + all.length + ' foto</span><span>' + I('category') + catList.length + ' kategori</span></div></div>' +
      '<div class="gal-bar"><div class="search">' + I('search') + '<input type="search" placeholder="Cari model, mis. cincin nama…" value="' + esc(GS.q) + '" data-gq aria-label="Cari foto"></div>' +
      '<button type="button" class="gal-tb' + (nF ? ' act' : '') + '" data-gf aria-label="Filter & urutkan">' + I('tune') + '<span>Filter</span>' + (nF ? '<b>' + nF + '</b>' : '') + '</button>' +
      (oks.length > 1 ? '<div class="gal-lw"><button type="button" class="gal-tb" data-gl aria-haspopup="true" aria-expanded="false" aria-label="Tampilan: ' + LAYOUT[lay][1] + '">' + I(LAYOUT[lay][0]) + '<span>' + LAYOUT[lay][1] + '</span>' + I('expand_more') + '</button>' +
        '<div class="gal-pop" data-gp hidden role="menu"><div class="gp-h">Tampilan galeri</div>' + oks.map(k => '<button type="button" role="menuitemradio" aria-checked="' + (k === lay) + '" data-lay="' + k + '" class="' + (k === lay ? 'on' : '') + '">' + I(LAYOUT[k][0]) + '<span>' + LAYOUT[k][1] + '</span>' + (k === lay ? I('check') : '') + '</button>').join('') + '</div></div>' : '') + '</div>' +
      '<div class="pills gal-chips" data-gk><button class="pill' + (GS.kat ? '' : ' on') + '" data-k="">Semua <small>' + all.length + '</small></button>' + catList.map(c => '<button class="pill' + (c === GS.kat ? ' on' : '') + '" data-k="' + esc(c) + '">' + esc(c) + ' <small>' + cats[c] + '</small></button>').join('') + '</div>' +
      (nF ? '<div class="gal-act">' + (GS.kat ? '<button data-clr="kat">' + esc(GS.kat) + I('close') + '</button>' : '') + (GS.urut !== 'baru' ? '<button data-clr="urut">' + I(URUT[GS.urut][0]) + esc(URUT[GS.urut][1]) + I('close') + '</button>' : '') + '<button data-clr="all" class="lnk">Hapus filter</button></div>' : '') +
      '<div data-gg></div><div class="gal-more" data-gm></div>' +
      '<div class="gal-foot"><span>' + I('info') + 'Ketuk foto untuk melihat besar & menanyakannya lewat WhatsApp.</span></div></div>';
    const q = el.querySelector('[data-gq]');
    q.addEventListener('input', A.debounce(() => { GS.q = q.value; GS.n = 24; grid(el, true); }, 220));
    el.querySelector('[data-gk]').onclick = e => { const b = e.target.closest('[data-k]'); if (!b) return; GS.kat = b.dataset.k; GS.n = 24; draw(el); };
    const act = el.querySelector('.gal-act'); if (act) act.onclick = e => { const b = e.target.closest('[data-clr]'); if (!b) return; const c = b.dataset.clr; if (c !== 'urut') GS.kat = ''; if (c !== 'kat') GS.urut = 'baru'; GS.n = 24; draw(el); };
    el.querySelector('[data-gf]').onclick = () => filterSheet(el, catList, cats, all.length);
    const gl = el.querySelector('[data-gl]'), gp = el.querySelector('[data-gp]');
    if (gl) {
      const tutup = () => { gp.hidden = true; gl.setAttribute('aria-expanded', 'false'); document.removeEventListener('click', luar, true); };
      const luar = e => { if (!e.target.closest('.gal-lw')) tutup(); };
      gl.onclick = () => { const buka = gp.hidden; gp.hidden = !buka; gl.setAttribute('aria-expanded', String(buka)); if (buka) document.addEventListener('click', luar, true); else tutup(); };
      gp.onclick = e => { const b = e.target.closest('[data-lay]'); if (!b) return; A.Store.set('gal_' + (isPC() ? 'pc' : 'hp'), b.dataset.lay); tutup(); draw(el); };
    }
    const on = el.querySelector('.gal-sw a.on'); if (on && on.scrollIntoView) { const sw = on.parentNode; sw.scrollLeft = Math.max(0, on.offsetLeft - (sw.clientWidth - on.offsetWidth) / 2); }
    const ch = el.querySelector('.gal-chips .pill.on'); if (ch) { const p = ch.parentNode; p.scrollLeft = Math.max(0, ch.offsetLeft - 16); }
    grid(el, true);
  }
  function filterSheet(el, catList, cats, total) {
    let k = GS.kat, u = GS.urut;
    const o = A.sheet('<div class="gf"><div class="gf-h">Kategori</div><div class="gf-chips" data-fk><button class="' + (k ? '' : 'on') + '" data-k="">Semua <small>' + total + '</small></button>' + catList.map(c => '<button class="' + (c === k ? 'on' : '') + '" data-k="' + esc(c) + '">' + esc(c) + ' <small>' + cats[c] + '</small></button>').join('') + '</div>' +
      '<div class="gf-h mt16">Urutkan</div><div class="gf-seg" data-fu>' + Object.keys(URUT).map(x => '<button class="' + (x === u ? 'on' : '') + '" data-u="' + x + '">' + I(URUT[x][0]) + URUT[x][1] + '</button>').join('') + '</div>' +
      '<div class="row mt16" style="gap:8px"><button class="btn btn-ghost" data-rs>' + I('restart_alt') + 'Reset</button><button class="btn btn-amber grow" data-ap>' + I('check') + 'Terapkan <span data-cnt></span></button></div></div>', { title: 'Filter & Urutkan' });
    const cnt = () => { const n = items(GS.jenis).filter(g => !k || g.kategori === k).length; o.querySelector('[data-cnt]').textContent = '(' + n + ' foto)'; };
    o.querySelector('[data-fk]').onclick = e => { const b = e.target.closest('[data-k]'); if (!b) return; k = b.dataset.k; o.querySelectorAll('[data-fk] button').forEach(x => x.classList.toggle('on', x === b)); cnt(); };
    o.querySelector('[data-fu]').onclick = e => { const b = e.target.closest('[data-u]'); if (!b) return; u = b.dataset.u; o.querySelectorAll('[data-fu] button').forEach(x => x.classList.toggle('on', x === b)); };
    o.querySelector('[data-rs]').onclick = () => { k = ''; u = 'baru'; o.querySelectorAll('[data-fk] button').forEach(x => x.classList.toggle('on', !x.dataset.k)); o.querySelectorAll('[data-fu] button').forEach(x => x.classList.toggle('on', x.dataset.u === 'baru')); cnt(); };
    o.querySelector('[data-ap]').onclick = () => { if (u === 'acak' && GS.urut !== 'acak') acakSeed = Math.random(); GS.kat = k; GS.urut = u; GS.n = 24; o.close(); draw(el); };
    cnt();
  }
  let io = null;
  function grid(el, anim) {
    const box = el.querySelector('[data-gg]'), more = el.querySelector('[data-gm]'), list = filtered(), lay = layoutNow();
    const w = { grid: 360, mosaik: 420, masonry: 420, besar: 900, rapat: 240 }[lay] || 400;
    box.className = 'gal gal-' + lay + ' gj-' + esc(T('galeri_jarak') || 'normal') + ' gs-' + esc(T('galeri_sudut') || 'bulat') + (T('galeri_label') === 'TIDAK' || lay === 'rapat' ? ' no-lbl' : '') + (anim ? ' anim' : '');
    box.innerHTML = list.length ? list.slice(0, GS.n).map((g, i) => '<div class="gi" role="button" tabindex="0" data-gi="' + i + '" aria-label="Lihat foto ' + esc(g.kategori) + '"><img src="' + esc(img(g.foto, w)) + '" alt="' + esc(g.kategori + (g.tag ? ' — ' + g.tag : '')) + '" loading="' + (i < 6 ? 'eager' : 'lazy') + '" decoding="async"><span class="gl">' + esc(g.kategori) + '</span>' + (A.favBtn ? A.favBtn('g', g.id) : '') + '</div>').join('')
      : '<div class="empty" style="grid-column:1/-1">' + I('search_off') + '<p>Belum ada foto untuk pencarian ini.</p>' + (GS.q || GS.kat ? '<button class="btn btn-ghost btn-sm" data-reset>Tampilkan semua</button>' : '') + '</div>';
    box.onkeydown = e => { const b = e.target.closest('[data-gi]'); if (b && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); b.click(); } };
    box.onclick = e => { if (e.target.closest('[data-fav]')) return; const b = e.target.closest('[data-gi]'); if (b) lightbox(list, +b.dataset.gi); const r = e.target.closest('[data-reset]'); if (r) { GS.q = ''; GS.kat = ''; draw(el); } };
    more.innerHTML = list.length > GS.n ? '<button class="btn btn-ghost" data-mm>' + I('expand_more') + 'Muat lebih banyak (' + (list.length - GS.n) + ')</button>' : (list.length ? '<span class="muted small">' + list.length + ' foto</span>' : '');
    const mm = more.querySelector('[data-mm]');
    if (io) io.disconnect();
    if (mm) { mm.onclick = () => { GS.n += 24; grid(el); }; if ('IntersectionObserver' in window) { io = new IntersectionObserver(en => { if (en[0].isIntersecting) { io.disconnect(); GS.n += 24; grid(el); } }, { rootMargin: '600px' }); io.observe(mm); } }
  }

  /* ======================= LIGHTBOX + WhatsApp ======================= */
  function lightbox(list, i, dariLink) {
    if (!list.length) return;
    const o = document.createElement('div'); o.className = 'glb'; o.setAttribute('role', 'dialog'); o.setAttribute('aria-modal', 'true');
    o.innerHTML = '<div class="glb-top"><span class="row" style="gap:8px"><button class="glb-b" data-sh aria-label="Bagikan">' + I('share') + '</button><span data-fv></span></span><span class="glb-n" data-n></span><button class="glb-b" data-x aria-label="Tutup">' + I('close') + '</button></div>' +
      '<div class="glb-st" data-st><img alt="" data-im></div><button class="glb-nav prev" data-pv aria-label="Sebelumnya">' + I('chevron_left') + '</button><button class="glb-nav next" data-nx aria-label="Berikutnya">' + I('chevron_right') + '</button>' +
      '<div class="glb-bot"><div class="glb-meta" data-m></div><button class="btn btn-wa glb-wa" data-wa>' + I('chat', 'fill') + 'Tanyakan model ini</button></div>';
    document.body.appendChild(o); document.documentElement.classList.add('glb-open');
    const im = o.querySelector('[data-im]');
    const show = () => {
      const g = list[i]; im.classList.add('ld'); im.onload = () => im.classList.remove('ld'); im.src = img(g.foto, 1200); im.alt = g.kategori;
      o.querySelector('[data-n]').textContent = (i + 1) + ' / ' + list.length;
      o.querySelector('[data-fv]').innerHTML = A.favBtn ? A.favBtn('g', g.id, 2) : '';
      o.querySelector('[data-m]').innerHTML = '<span class="chip chip-gold">' + I(gInfo(g.jenis).icon || 'photo_library') + esc(gInfo(g.jenis).nama) + '</span><span class="chip">' + esc(g.kategori) + '</span>' + (g.tag ? '<span class="glb-tag">' + esc(g.tag) + '</span>' : '');
      o.querySelector('[data-pv]').hidden = i <= 0; o.querySelector('[data-nx]').hidden = i >= list.length - 1;
      [list[i + 1], list[i - 1]].forEach(n => { if (n) { const p = new Image(); p.src = img(n.foto, 1200); } });
      try { history.replaceState(null, '', '#/galeri/' + g.jenis + '/' + encodeURIComponent(g.id)); } catch (e) { }
    };
    const close = () => { o.remove(); document.documentElement.classList.remove('glb-open'); document.removeEventListener('keydown', key); try { history.replaceState(null, '', '#/galeri/' + GS.jenis); } catch (e) { } if (A.cur === 'favorit') A.rerender(); };
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
      const msg = isiPesan(T('teks_pesan_galeri'), { toko: toko(), cabang: '', jenis: LBL(g.jenis), kategori: g.kategori + (g.tag ? ' — ' + g.tag : ''), foto: abs(g.foto), link: link(g) });
      A.track && A.track('wa', g.id);
      A.pickBranch(msg, { title: 'Tanya model ini — pilih toko' });
    };
    o.querySelector('[data-sh]').onclick = e => { const g = list[i]; A.shareFoto(g.foto, 'Contoh ' + LBL(g.jenis) + ' ' + g.kategori + ' di ' + toko(), link(g), e.currentTarget); };
    show();
  }

  /* ======================= FAVORIT ❤️ (wishlist di perangkat pelanggan) ======================= */
  const FK = 'favorit';
  const Fav = A.Fav = {
    all() { const a = A.Store.get(FK, []); return Array.isArray(a) ? a : []; },
    has(t, id) { return this.all().some(x => x.t === t && x.id === id); },
    toggle(t, id) { let a = this.all(); const on = !a.some(x => x.t === t && x.id === id); a = on ? [{ t, id, at: Date.now() }].concat(a) : a.filter(x => !(x.t === t && x.id === id)); A.Store.set(FK, a.slice(0, 300)); return on; },
    del(t, id) { A.Store.set(FK, this.all().filter(x => !(x.t === t && x.id === id))); },
    clear() { A.Store.set(FK, []); }
  };
  A.favBtn = (t, id, v) => { const on = Fav.has(t, id); return '<button type="button" class="fav-b' + (v ? ' v' + v : '') + (on ? ' on' : '') + '" data-fav="' + t + ':' + esc(id) + '" aria-pressed="' + on + '" aria-label="' + (on ? 'Hapus dari Favorit' : 'Simpan ke Favorit') + '">' + I('favorite', on ? 'fill' : '') + '</button>'; };
  function favBadge() { const n = Fav.all().length; document.querySelectorAll('[data-nav="favorit"]').forEach(a => { let b = a.querySelector('.fav-n'); if (!n) { if (b) b.remove(); return; } if (!b) { b = document.createElement('span'); b.className = 'fav-n'; a.appendChild(b); } b.textContent = n > 99 ? '99+' : n; }); }
  A.favBadge = favBadge;
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-fav]'); if (!b) return;
    e.preventDefault(); e.stopPropagation();
    const [t, id] = [b.dataset.fav.slice(0, 1), b.dataset.fav.slice(2)], on = Fav.toggle(t, id);
    document.querySelectorAll('[data-fav="' + CSS.escape(b.dataset.fav) + '"]').forEach(x => { x.classList.toggle('on', on); x.setAttribute('aria-pressed', on); x.innerHTML = I('favorite', on ? 'fill' : ''); if (on) { x.classList.remove('pop'); void x.offsetWidth; x.classList.add('pop'); } });
    if (navigator.vibrate && on) try { navigator.vibrate(18); } catch (er) { }
    A.toast(on ? '❤️ Disimpan ke Favorit' : 'Dihapus dari Favorit');
    A.track && A.track('fav', id); favBadge();
  }, true);
  document.addEventListener('DOMContentLoaded', () => setTimeout(favBadge, 800));
  A.on && A.on('pub', () => setTimeout(favBadge, 50));

  A.page('favorit', {
    nav: 'favorit', title: () => 'Favorit Saya',
    render(el) {
      if (!A.pub) { el.innerHTML = '<div class="col"><div class="skel" style="height:220px;margin-top:16px"></div></div>'; return; }
      const P = A.pub.products || [], G = A.pub.galeri || [], tab = A.Store.ss('favTab') || 'semua';
      const list = Fav.all().map(f => f.t === 'p' ? { f, p: P.find(x => x.id === f.id) } : { f, g: G.find(x => x.id === f.id) }).filter(x => x.p || x.g);
      const np = list.filter(x => x.p).length, ng = list.length - np, V = list.filter(x => tab === 'semua' || (tab === 'produk' ? x.p : x.g));
      favBadge();
      if (!list.length) { el.innerHTML = '<div class="col emas-pg"><div class="empty fav-empty"><span class="big">' + I('favorite', 'fill') + '</span><h3>Belum ada favorit</h3><p>Tekan ikon ❤️ pada produk atau foto galeri untuk menyimpannya di sini.</p><div class="row wrap" style="justify-content:center;gap:8px"><a class="btn btn-amber" href="#/katalog">' + I('diamond') + 'Lihat Katalog</a><a class="btn btn-ghost" href="#/galeri/' + esc((GD()[0] || {}).id || 'custom') + '">' + I('photo_library') + 'Lihat Galeri</a></div></div></div>'; return; }
      el.innerHTML = '<div class="wide fav-pg"><div class="fav-hero"><span>' + I('favorite', 'fill') + '</span><div class="grow"><h1>Favorit Saya</h1><p>' + list.length + ' tersimpan di perangkat ini</p></div></div>' +
        '<div class="pills" data-ft>' + [['semua', 'Semua', list.length], ['produk', 'Produk', np], ['foto', 'Foto Galeri', ng]].map(x => '<button class="pill' + (x[0] === tab ? ' on' : '') + '" data-v="' + x[0] + '">' + x[1] + ' <small>' + x[2] + '</small></button>').join('') + '</div>' +
        '<div class="fav-grid">' + V.map(x => x.p
          ? '<div class="fav-it"><a class="fav-th" href="#/produk/' + encodeURIComponent(x.p.id) + '"><img src="' + esc(img((x.p.foto || [])[0], 400)) + '" alt="" loading="lazy"></a><div class="fav-b2"><b class="ell2">' + esc(x.p.nama) + '</b><span class="price">' + A.rp(x.p.harga) + (A.hargaSuffix ? A.hargaSuffix(x.p) : '') + '</span>' +
            '<div class="fav-acts"><button class="btn btn-wa btn-sm" data-ask="p:' + esc(x.p.id) + '">' + I('chat', 'fill') + 'Tanya</button><button class="icon-btn danger" data-rm="p:' + esc(x.p.id) + '" aria-label="Hapus">' + I('delete') + '</button></div></div></div>'
          : '<div class="fav-it"><button class="fav-th" data-op="' + esc(x.g.id) + '"><img src="' + esc(img(x.g.foto, 400)) + '" alt="" loading="lazy"><span class="gl">' + esc(gInfo(x.g.jenis).nama) + ' · ' + esc(x.g.kategori) + '</span></button><div class="fav-b2"><b class="ell2">Foto ' + esc(gInfo(x.g.jenis).nama) + '</b><span class="muted small">' + esc(x.g.kategori) + '</span>' +
            '<div class="fav-acts"><button class="btn btn-wa btn-sm" data-ask="g:' + esc(x.g.id) + '">' + I('chat', 'fill') + 'Tanya</button><button class="icon-btn danger" data-rm="g:' + esc(x.g.id) + '" aria-label="Hapus">' + I('delete') + '</button></div></div></div>').join('') + '</div>' +
        '<div class="fav-bar"><button class="btn btn-ghost" data-clr>' + I('delete_sweep') + 'Kosongkan</button><button class="btn btn-wa grow" data-all>' + I('chat', 'fill') + 'Tanyakan semua (' + V.length + ')</button></div></div>';
      el.querySelector('[data-ft]').onclick = e => { const b = e.target.closest('[data-v]'); if (!b) return; A.Store.ss('favTab', b.dataset.v); A.rerender(); };
      const baris = x => x.p ? '• ' + x.p.nama + ' — ' + A.rp(x.p.harga) + '\n  ' + siteUrl() + '#/produk/' + encodeURIComponent(x.p.id) : '• Foto ' + LBL(x.g.jenis) + ' (' + x.g.kategori + ')\n  ' + abs(x.g.foto);
      const tanya = arr => A.pickBranch('Halo ' + toko() + ', saya tertarik dengan ' + (arr.length > 1 ? 'beberapa pilihan favorit saya' : 'pilihan ini') + ':\n' + arr.map(baris).join('\n') + '\nMohon info ketersediaan, ukuran & harganya. Terima kasih.', { title: 'Tanyakan — pilih toko' });
      el.onclick = async e => {
        const rm = e.target.closest('[data-rm]'), ask = e.target.closest('[data-ask]'), op = e.target.closest('[data-op]');
        if (rm) { Fav.del(rm.dataset.rm.slice(0, 1), rm.dataset.rm.slice(2)); A.toast('Dihapus dari Favorit'); A.rerender(); }
        if (ask) { const x = list.find(y => (y.p ? 'p:' + y.p.id : 'g:' + y.g.id) === ask.dataset.ask); if (x) tanya([x]); }
        if (op) { const gl = V.filter(x => x.g).map(x => x.g), i = gl.findIndex(g => g.id === op.dataset.op); if (i > -1) lightbox(gl, i); }
        if (e.target.closest('[data-all]')) tanya(V);
        if (e.target.closest('[data-clr]') && await A.confirm('Kosongkan semua favorit?', 'Kosongkan', true)) { Fav.clear(); A.rerender(); }
      };
    }
  });
})();
