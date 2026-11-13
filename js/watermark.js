/* ==========================================================================
 *  Advanced Dynamic Watermark — watermark dibakar permanen ke file gambar (canvas)
 *  sebelum diunggah ke Google Drive. Profil: global → per brand (cabang) → per produk.
 *  © Nabire Kreatif — template berlisensi
 * ========================================================================== */
(function () {
  'use strict';
  const A = window.App;
  const POS = ['tl', 'tc', 'tr', 'ml', 'mc', 'mr', 'bl', 'bc', 'br'];
  const DEF = { aktif: true, mode: 'logo_teks', logo: '', teks: '', pos: 'br', ukuran: 22, opacity: 70, rotasi: 0, mx: 3, my: 3, warna: 'original', warnaCustom: '#FFFFFF', shadow: true, glow: false, outline: false, layer: 'depan', pola: 'tunggal' };
  const S = () => (A.admin && A.admin.settings) || (A.pub && A.pub.settings) || {};
  const clamp = (v, a, b, d) => { v = Number(v); return isNaN(v) ? d : Math.max(a, Math.min(b, v)); };

  function semua() { let w = null; try { w = JSON.parse(S().wm || 'null'); } catch (e) { } w = w && typeof w === 'object' ? w : {}; w.global = Object.assign({}, DEF, w.global || {}); w.brand = w.brand || {}; return w; }
  function norm(p) {
    p = Object.assign({}, DEF, p || {});
    p.ukuran = clamp(p.ukuran, 5, 100, 22); p.opacity = clamp(p.opacity, 0, 100, 70); p.rotasi = clamp(p.rotasi, -180, 180, 0);
    p.mx = clamp(p.mx, 0, 40, 3); p.my = clamp(p.my, 0, 40, 3); if (POS.indexOf(p.pos) < 0) p.pos = 'br';
    if (!p.teks) p.teks = S().nama_toko || '';
    return p;
  }
  /** Profil efektif untuk brand (id cabang) — brand "khusus" menimpa global. */
  function profil(brand) { const w = semua(), b = brand && w.brand[brand]; return norm(b && b.khusus ? Object.assign({}, w.global, b) : w.global); }
  /** Profil untuk produk: mode ikut / mati / khusus (posisi & ukuran sendiri). null = tanpa watermark. */
  function untukProduk(brand, wm) {
    const p = profil(brand === 'keduanya' ? '' : brand);
    if (!p.aktif) return wm && wm.mode === 'khusus' ? Object.assign(p, { aktif: true }, wm.pos ? { pos: wm.pos } : {}, Number(wm.ukuran) ? { ukuran: Number(wm.ukuran) } : {}) : null;
    if (wm && wm.mode === 'mati') return null;
    if (wm && wm.mode === 'khusus') { if (wm.pos) p.pos = wm.pos; if (Number(wm.ukuran)) p.ukuran = clamp(wm.ukuran, 5, 100, p.ukuran); }
    return p;
  }

  /* ---------- muat logo TANPA mengotori canvas (agar toDataURL tetap bisa) ---------- */
  const imgCache = {};
  function loadImg(src, aman) {
    return new Promise((res, rej) => { const im = new Image(); if (aman && /^https?:/.test(src) && src.indexOf(location.origin) !== 0) im.crossOrigin = 'anonymous'; im.onload = () => res(im); im.onerror = () => rej(new Error('Logo watermark tidak bisa dimuat')); im.src = src; });
  }
  async function logoImg(p, aman) {
    let u = p.logo || S().logo || 'assets/logo.png';
    if (!/^(data:|blob:|https?:)/.test(u)) u = A.img ? A.img(u, 600) : u;
    const key = u + (aman ? '#a' : '');
    if (imgCache[key]) return imgCache[key];
    const id = (String(u).match(/(?:lh3\.googleusercontent\.com\/d\/|[?&]id=|\/d\/)([\w-]{20,})/) || [])[1];
    let im;
    if (aman && id && A.cfg && A.cfg.GAS_URL) {
      // lewat Apps Script (base64) → blob lokal, sehingga canvas tidak "tainted"
      const r = await (await fetch(A.cfg.GAS_URL + (A.cfg.GAS_URL.indexOf('?') > -1 ? '&' : '?') + 'action=foto&id=' + id, { redirect: 'follow' })).json();
      if (!r.success) throw new Error('Logo watermark tidak bisa dimuat: ' + r.message);
      const b = atob(r.data.base64), a = new Uint8Array(b.length); for (let i = 0; i < b.length; i++) a[i] = b.charCodeAt(i);
      im = await loadImg(URL.createObjectURL(new Blob([a], { type: r.data.mime })));
    } else im = await loadImg(u, aman);
    imgCache[key] = im; return im;
  }

  /* ---------- gambar watermark ---------- */
  function warnai(src, w, h, col) { const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d'); x.drawImage(src, 0, 0, w, h); x.globalCompositeOperation = 'source-in'; x.fillStyle = col; x.fillRect(0, 0, w, h); return c; }
  /** Bangun kanvas tanda (logo/teks) selebar `lebar` px. */
  function tanda(p, logo, lebar) {
    const font = '"Poppins","Inter",system-ui,sans-serif', col = p.warna === 'custom' ? p.warnaCustom : '#FFFFFF';
    const pakaiLogo = p.mode !== 'teks' && logo, pakaiTeks = p.mode !== 'logo' && p.teks;
    const m = document.createElement('canvas').getContext('2d');
    let lw = 0, lh = 0, fs = 0, tw = 0, gap = 0;
    if (pakaiLogo && pakaiTeks) {
      lh = lebar * .26; lw = lh * (logo.naturalWidth || logo.width) / (logo.naturalHeight || logo.height); gap = lh * .22;
      fs = lh * .52; m.font = '700 ' + fs + 'px ' + font; tw = m.measureText(p.teks).width;
      const k = lebar / (lw + gap + tw); lw *= k; lh *= k; gap *= k; fs *= k; tw *= k;
    } else if (pakaiLogo) { lw = lebar; lh = lw * (logo.naturalHeight || logo.height) / (logo.naturalWidth || logo.width); }
    else if (pakaiTeks) { m.font = '700 100px ' + font; fs = 100 * lebar / Math.max(1, m.measureText(p.teks).width); tw = lebar; }
    else return null;
    const pad = Math.ceil(Math.max(lh, fs) * .5) + 4, W = Math.ceil(lw + gap + tw) + pad * 2, H = Math.ceil(Math.max(lh, fs * 1.25)) + pad * 2;
    const c = document.createElement('canvas'); c.width = Math.max(1, W); c.height = Math.max(1, H); const x = c.getContext('2d');
    const efek = () => {
      if (p.glow) { x.shadowColor = p.warna === 'custom' ? col : 'rgba(255,240,200,.95)'; x.shadowBlur = Math.max(6, H * .18); x.shadowOffsetX = x.shadowOffsetY = 0; }
      else if (p.shadow) { x.shadowColor = 'rgba(0,0,0,.55)'; x.shadowBlur = Math.max(3, H * .08); x.shadowOffsetX = x.shadowOffsetY = Math.max(1, H * .025); }
      else { x.shadowColor = 'transparent'; x.shadowBlur = 0; }
    };
    const cy = H / 2;
    if (pakaiLogo) {
      const src = p.warna === 'custom' ? warnai(logo, Math.max(1, Math.round(lw)), Math.max(1, Math.round(lh)), col) : logo, lx = pad, ly = cy - lh / 2;
      if (p.outline) { const o = warnai(logo, Math.max(1, Math.round(lw)), Math.max(1, Math.round(lh)), 'rgba(0,0,0,.75)'), t = Math.max(1, lh * .03); for (let a = 0; a < 8; a++) x.drawImage(o, lx + Math.cos(a * Math.PI / 4) * t, ly + Math.sin(a * Math.PI / 4) * t, lw, lh); }
      efek(); x.drawImage(src, lx, ly, lw, lh);
    }
    if (pakaiTeks) {
      x.font = '700 ' + fs + 'px ' + font; x.textBaseline = 'middle'; const tx = pad + (pakaiLogo ? lw + gap : 0);
      if (p.outline) { x.shadowColor = 'transparent'; x.lineJoin = 'round'; x.lineWidth = Math.max(2, fs * .12); x.strokeStyle = 'rgba(0,0,0,.7)'; x.strokeText(p.teks, tx, cy); }
      efek(); x.fillStyle = col; x.fillText(p.teks, tx, cy);
    }
    return { c, pad };
  }
  /** Bakar watermark ke kanvas foto (dipakai saat unggah & pratinjau). */
  async function bakar(canvas, p, opt) {
    opt = opt || {}; if (!p || !p.aktif) return canvas;
    let logo = null; if (p.mode !== 'teks') { try { logo = await logoImg(p, !opt.pratinjau); } catch (e) { if (p.mode === 'logo') throw e; } }
    const W = canvas.width, H = canvas.height, ctx = canvas.getContext('2d');
    const t = tanda(p, logo, W * p.ukuran / 100); if (!t) return canvas;
    const mw = t.c.width, mh = t.c.height, pad = t.pad;
    ctx.save(); ctx.globalAlpha = p.opacity / 100;
    if (p.layer === 'belakang') ctx.globalCompositeOperation = 'soft-light';
    const taruh = (cx, cy) => { ctx.save(); ctx.translate(cx, cy); ctx.rotate(p.rotasi * Math.PI / 180); ctx.drawImage(t.c, -mw / 2, -mh / 2); ctx.restore(); };
    if (p.pola === 'ulang') {
      const sx = mw * 1.25, sy = mh * 2.2;
      for (let y = -sy, r = 0; y < H + sy; y += sy, r++) for (let x = -sx + (r % 2) * sx / 2; x < W + sx; x += sx) taruh(x, y);
    } else {
      const vw = mw - pad * 2, vh = mh - pad * 2, mx = W * p.mx / 100, my = H * p.my / 100, c = p.pos[1], r = p.pos[0];
      const cx = c === 'l' ? mx + vw / 2 : c === 'r' ? W - mx - vw / 2 : W / 2;
      const cy = r === 't' ? my + vh / 2 : r === 'b' ? H - my - vh / 2 : H / 2;
      taruh(cx, cy);
    }
    ctx.restore(); return canvas;
  }
  window.WM = { POS, DEF, semua, profil, untukProduk, bakar, norm, logoImg };
})();
