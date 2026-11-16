/* ==========================================================================
 *  Toko Emas — Halaman "Ukur Cincin" (#/ukur-cincin)
 *  3 cara: lingkar jari · diameter cincin lama · ukur langsung di layar (kalibrasi kartu ATM)
 *  © Nabire Kreatif — template berlisensi
 * ========================================================================== */
(function () {
  'use strict';
  const A = window.App, { esc, I } = A, T = A.T;
  // tabel perkiraan: diameter dalam (mm) → lingkar (mm); nomor EU = lingkar dibulatkan
  const SIZES = [[12.0, 37.7], [12.4, 38.9], [12.7, 39.9], [13.0, 40.8], [13.3, 41.8], [13.7, 43.0], [14.0, 44.0], [14.3, 44.9], [14.6, 45.9], [15.0, 47.1], [15.3, 48.1], [15.6, 49.0], [15.9, 50.0], [16.2, 50.9], [16.6, 52.1], [16.9, 53.1], [17.2, 54.0], [17.5, 55.0], [17.8, 55.9], [18.1, 56.9], [18.5, 58.1], [18.8, 59.1], [19.1, 60.0], [19.4, 61.0], [19.7, 61.9], [20.1, 63.1], [20.4, 64.1], [20.7, 65.0], [21.0, 66.0], [21.3, 67.0], [21.7, 68.1], [22.0, 69.1], [22.3, 70.1], [22.6, 71.0], [22.9, 72.0], [23.2, 72.9], [23.6, 74.0], [23.9, 75.1], [24.2, 76.0]];
  const koma = (n, d) => Number(n).toFixed(d == null ? 1 : d).replace('.', ',');
  const us = dia => Math.max(0, Math.round(((dia - 11.63) / 0.8128) * 2) / 2);   // perkiraan ukuran US
  let tab = 'jari', hasil = null;
  const cal = () => Number(A.Store.get('cincin_px', 0)) || 0;

  A.page('ukur-cincin', {
    nav: 'katalog', title: () => 'Ukur Cincin',
    render(el) {
      el.innerHTML = '<div class="col ring-pg">' +
        '<div class="ring-hero"><span class="gc-live"><i></i>Panduan ukuran</span><h1>Temukan <span>Ukuran Cincin</span> yang Tepat</h1><p>Cari tahu perkiraan ukuran cincin Anda sebelum memesan di ' + esc(T('nama_toko')) + '.</p>' +
        '<div class="rh-pills"><span>' + I('check') + 'Mudah</span><span>' + I('check') + 'Gratis</span><span>' + I('check') + 'Konsultasi langsung</span></div></div>' +
        '<div class="ring-grid"><div class="ring-main">' +
        '<div class="card pad rg-tool"><div class="rg-h"><div><h2>Alat Ukur Cincin</h2><p class="muted small">Pilih cara yang paling mudah untuk Anda.</p></div><span class="rg-step">Langkah 1</span></div>' +
        '<div class="rg-tabs" role="tablist">' + [['jari', 'gesture', 'Lingkar Jari'], ['diameter', 'radio_button_unchecked', 'Diameter Cincin'], ['layar', 'smartphone', 'Ukur di Layar']].map(t => '<button role="tab" data-rt="' + t[0] + '" aria-selected="' + (t[0] === tab) + '" class="' + (t[0] === tab ? 'on' : '') + '">' + I(t[1]) + '<span>' + t[2] + '</span></button>').join('') + '</div>' +
        '<div data-rm></div><div class="rg-res" data-rr hidden></div></div>' +
        '<div class="card pad mt12"><div class="rg-h"><div><h2>Tabel Referensi</h2><p class="muted small">Perkiraan konversi diameter, lingkar & nomor.</p></div></div><div class="rg-table"><table><thead><tr><th>Diameter</th><th>Lingkar</th><th>EU</th><th>US</th></tr></thead><tbody data-rt-body>' +
        SIZES.map(s => '<tr data-d="' + s[0] + '"><td>' + koma(s[0]) + ' mm</td><td>' + koma(s[1]) + ' mm</td><td>' + Math.round(s[1]) + '</td><td>' + koma(us(s[0]), us(s[0]) % 1 ? 1 : 0) + '</td></tr>').join('') +
        '</tbody></table></div><p class="muted small mt8">Sistem nomor tiap toko/negara bisa berbeda. Jadikan acuan awal, lalu konfirmasi ke admin.</p></div></div>' +
        '<aside class="ring-side"><div class="card pad"><h2 class="rg-st">Cara Mengukur</h2><ol class="rg-steps">' +
        [['straighten', 'Siapkan kertas / benang', 'Pakai strip tipis yang tidak melar.'], ['gesture', 'Lingkarkan di pangkal jari', 'Pastikan nyaman & bisa melewati buku jari.'], ['edit', 'Tandai & ukur', 'Tandai titik pertemuan, ukur panjangnya (mm).'], ['calculate', 'Masukkan hasilnya', 'Isi angka di alat ukur, lalu konsultasikan.']].map((s, i) => '<li><span>' + I(s[0]) + '</span><div><b>' + (i + 1) + '. ' + s[1] + '</b><p>' + s[2] + '</p></div></li>').join('') +
        '</ol><div class="note mt12">' + I('favorite') + '<div>Ukur 2–3 kali pada sore hari saat suhu jari normal untuk hasil terbaik.</div></div></div>' +
        '<div class="card pad mt12 rg-faq"><h2 class="rg-st">Pertanyaan Umum</h2>' +
        [['Kapan waktu terbaik mengukur?', 'Saat suhu tubuh normal. Hindari ketika jari sangat dingin, panas, atau habis beraktivitas berat.'], ['Ukuran saya di antara dua angka?', 'Jangan memilih sendiri dulu — lebar cincin & bentuk jari memengaruhi kenyamanan. Konsultasikan dengan pengrajin kami.'], ['Apakah semua jari sama ukurannya?', 'Tidak. Jari kiri & kanan, bahkan jari yang sama, bisa berbeda.'], ['Apakah hasil ini pasti akurat?', 'Hasil online adalah perkiraan awal. Untuk cincin custom, kami sarankan ukur langsung di toko.']].map(f => '<details><summary>' + esc(f[0]) + '</summary><p>' + esc(f[1]) + '</p></details>').join('') + '</div>' +
        '<div class="rg-cta mt12"><div><h3>Masih ragu?</h3><p>Tim kami siap membantu memastikan ukuran cincin Anda.</p></div><button class="btn btn-amber" data-wa>' + I('chat') + 'Hubungi Admin</button></div></aside></div></div>';
      metode(el);
      el.querySelector('.rg-tabs').onclick = e => { const b = e.target.closest('[data-rt]'); if (!b) return; tab = b.dataset.rt; el.querySelectorAll('.rg-tabs button').forEach(x => { x.classList.toggle('on', x === b); x.setAttribute('aria-selected', x === b); }); metode(el); };
      el.querySelector('[data-wa]').onclick = () => A.pickBranch(() => 'Halo ' + T('nama_toko') + ', saya ingin konsultasi ukuran cincin.' + (hasil ? '\nHasil ukur saya: diameter ' + koma(hasil.dia, 2) + ' mm, lingkar ' + koma(hasil.lingkar) + ' mm (perkiraan EU ' + hasil.eu + ', US ' + hasil.us + ').' : ''));
      if (hasil) tampil(el, false);
    }
  });

  function metode(el) {
    const box = el.querySelector('[data-rm]');
    if (tab === 'jari') box.innerHTML = '<label class="rg-lbl" for="rgJ">Hasil lingkar jari</label><p class="muted small">Lingkarkan kertas/benang di pangkal jari, tandai, lalu ukur panjangnya.</p><div class="rg-in"><input id="rgJ" type="number" inputmode="decimal" min="35" max="80" step=".1" placeholder="Contoh: 54"><span>mm</span></div><button class="btn btn-amber btn-block mt12" data-hit>' + I('calculate') + 'Hitung ukuran cincin</button><div class="note mt12">' + I('tips_and_updates') + '<div><b>Tips:</b> ukur bagian jari yang paling besar termasuk buku jari, jangan menarik terlalu kencang.</div></div>';
    if (tab === 'diameter') box.innerHTML = '<label class="rg-lbl" for="rgD">Diameter bagian dalam cincin</label><p class="muted small">Letakkan cincin lama yang pas di permukaan datar, ukur garis tengah bagian dalamnya.</p><div class="rg-in"><input id="rgD" type="number" inputmode="decimal" min="11" max="25" step=".1" placeholder="Contoh: 17,2"><span>mm</span></div><button class="btn btn-amber btn-block mt12" data-hit>' + I('calculate') + 'Hitung ukuran cincin</button><div class="note mt12">' + I('info') + '<div><b>Perhatian:</b> ukur diameter bagian dalam saja, tanpa ketebalan badan cincin.</div></div>';
    if (tab === 'layar') {
      box.innerHTML = '<label class="rg-lbl">1 · Kalibrasi layar</label><p class="muted small">Tempelkan kartu ATM/debit di layar. Geser sampai panjang kotak sama dengan sisi panjang kartu (85,60 mm).</p>' +
        '<div class="rg-cal"><div class="rg-card" data-card><span>85,60 mm · sisi panjang kartu</span></div><div class="rg-sl"><input type="range" min="160" max="560" step="1" data-sc aria-label="Kalibrasi"><output data-so></output></div></div>' +
        '<label class="rg-lbl mt16">2 · Cocokkan dengan cincin</label><p class="muted small">Letakkan cincin di atas lingkaran, geser sampai lingkaran pas dengan bagian dalam cincin.</p>' +
        '<div class="rg-stage"><div class="rg-ring" data-ring></div></div><div class="rg-sl"><input type="range" min="12" max="24" step=".1" value="' + (hasil ? Math.min(24, Math.max(12, hasil.dia)).toFixed(1) : '17') + '" data-rs aria-label="Diameter"><output data-ro></output></div>' +
        '<button class="btn btn-amber btn-block mt12" data-hit>' + I('check_circle') + 'Gunakan diameter ini</button><div class="note mt12">' + I('info') + '<div>Pengukuran layar hanya perkiraan (dipengaruhi layar, browser & zoom — pastikan zoom 100%). Verifikasi dengan penggaris sebelum memesan.</div></div>';
      const sc = box.querySelector('[data-sc]'), rs = box.querySelector('[data-rs]'), wrap = box.querySelector('.rg-cal');
      const maks = () => Math.max(160, wrap.clientWidth - 24);
      sc.max = String(Math.min(560, maks())); sc.value = String(Math.min(cal() || Math.round(85.6 * 96 / 25.4), Number(sc.max)));
      const upd = () => {
        const px = Number(sc.value), mm = Number(rs.value);
        box.querySelector('[data-card]').style.width = px + 'px'; box.querySelector('[data-so]').textContent = px + ' px';
        box.querySelector('[data-ring]').style.width = box.querySelector('[data-ring]').style.height = (mm * px / 85.6) + 'px';
        box.querySelector('[data-ro]').textContent = koma(mm) + ' mm';
      };
      sc.oninput = () => { A.Store.set('cincin_px', Number(sc.value)); upd(); }; rs.oninput = upd; upd();
    }
    box.querySelector('[data-hit]').onclick = () => {
      let dia;
      if (tab === 'jari') { const c = parseFloat(String(box.querySelector('#rgJ').value).replace(',', '.')); if (!(c >= 35 && c <= 80)) return A.toast('Masukkan lingkar jari antara 35–80 mm', 'err'); dia = c / Math.PI; }
      else if (tab === 'diameter') { dia = parseFloat(String(box.querySelector('#rgD').value).replace(',', '.')); if (!(dia >= 11 && dia <= 25)) return A.toast('Masukkan diameter antara 11–25 mm', 'err'); }
      else dia = Number(box.querySelector('[data-rs]').value);
      const lingkar = Math.PI * dia;
      hasil = { dia, lingkar, eu: Math.round(lingkar), us: koma(us(dia), us(dia) % 1 ? 1 : 0), cara: { jari: 'Lingkar jari', diameter: 'Diameter cincin', layar: 'Ukur di layar' }[tab] };
      tampil(el, true);
    };
  }
  function tampil(el, gulir) {
    const r = el.querySelector('[data-rr]'); if (!hasil) return;
    r.hidden = false;
    r.innerHTML = '<div class="rr-top"><div><small>Perkiraan ukuran cincin</small><b class="rr-big">EU ' + hasil.eu + '</b><span class="rr-us">± US ' + hasil.us + '</span></div><span class="chip chip-ok">' + I('check') + esc(hasil.cara) + '</span></div>' +
      '<div class="rr-grid"><div><small>Lingkar jari</small><b>' + koma(hasil.lingkar) + ' mm</b></div><div><small>Diameter dalam</small><b>' + koma(hasil.dia, 2) + ' mm</b></div></div>' +
      '<p class="muted small">Nomor adalah perkiraan konversi, bukan jaminan standar semua toko. Konfirmasikan ke admin sebelum produksi.</p>' +
      '<div class="row wrap" style="gap:8px"><button class="btn btn-wa grow" data-kirim>' + I('chat') + 'Kirim hasil ke WhatsApp</button><a class="btn btn-ghost grow" href="#/katalog">' + I('diamond') + 'Lihat cincin</a></div>';
    r.querySelector('[data-kirim]').onclick = () => A.pickBranch(() => 'Halo ' + T('nama_toko') + ', saya ingin konfirmasi ukuran cincin.\nCara ukur: ' + hasil.cara + '\nDiameter dalam: ' + koma(hasil.dia, 2) + ' mm\nLingkar: ' + koma(hasil.lingkar) + ' mm\nPerkiraan ukuran: EU ' + hasil.eu + ' / US ' + hasil.us + '\nMohon bantu cek ukuran yang sesuai.');
    el.querySelectorAll('[data-rt-body] tr').forEach(tr => tr.classList.toggle('hl', Math.abs(Number(tr.dataset.d) - hasil.dia) === Math.min.apply(null, SIZES.map(s => Math.abs(s[0] - hasil.dia)))));
    if (gulir) r.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
})();
