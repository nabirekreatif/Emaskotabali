/* ==========================================================================
 *  KONFIGURASI BIO LINK WEBAPP — berkas ini BEBAS DIEDIT (tidak disegel lisensi)
 * --------------------------------------------------------------------------
 *  1. Deploy backend Apps Script (Deploy → New deployment → Web app,
 *     Execute as: Me, Who has access: Anyone) lalu salin URL yang berakhiran /exec.
 *  2. Tempel URL itu di GAS_URL di bawah (di antara tanda kutip).
 *  3. Simpan, lalu git add . → git commit → git push.
 *
 *  Bila GAS_URL kosong, halaman tampil dalam MODE DEMO memakai data contoh bawaan.
 * ========================================================================== */
window.ACC_CONFIG = {
  GAS_URL: 'https://script.google.com/macros/s/AKfycbwXPoItJcILOzVULg4YhJXJMQEnyQQMTdDL8WNFv4i_j246pP91wqa8f4Doyylz2BSSxw/exec',                       // contoh: 'https://script.google.com/macros/s/AKfycb.../exec'
  NAMA_USAHA: 'Emas Kota Bali',        // tampil di hak cipta saat template berlisensi
  FRESH_DETIK: 60,                   // data publik dianggap segar selama 60 detik (tanpa panggil server)
  CACHE_SEGAR_DETIK: 120             // kunjungan ulang < 120 dtk tampil seketika dari cache; lebih lama → tunggu data terbaru. 0 = selalu tunggu data terbaru
};
