# Panduan Instalasi — Emas Kota Bali (LinkBio Pro edisi Toko Emas & Perhiasan)

Link Bio + Katalog Perhiasan yang harganya mengikuti **Harga Emas Hari Ini** + Jual Emas (buyback) + Member nomor HP + Lelang + Sewa Perhiasan Pengantin
Frontend (GitHub Pages) ⇄ Google Apps Script (REST API) + Google Sheets + Google Drive

> © Nabire Kreatif — template berlisensi. Berkas `js/config.js` bebas diedit. Berkas lain **disegel**: bila diubah, halaman akan terkunci.

---

## Isi paket

| Berkas | Untuk apa |
|---|---|
| `tokoemas-frontend.zip` | Website (diunggah ke GitHub Pages). `index.html` ada langsung di dalam ZIP, berikut `nk-license.js` (GitHub Pages) dan `nk-license-blogger.js` (untuk tema Blogger). |
| `Kode.gs`, `Emas.gs`, `Notifikasi.gs`, `CRM.gs`, `Migrasi.gs` | Backend (5 berkas). Ditempel ke editor Google Apps Script. |
| `tema-tokoemas.xml` | Tema Blogger (opsional): beranda blog = Link Bio, `/p/admin.html` = dasbor. File aplikasi tetap dimuat dari GitHub Pages. |
| `PANDUAN-INSTALASI.md` | Panduan ini. |
| `nk-protect.js` | Khusus penjual (Nabire Kreatif), untuk menyegel ulang bila template diedit. Jangan diberikan ke pembeli. |

---

## 1. Pasang backend (Google Apps Script)

1. Buka **https://script.google.com** → **Proyek baru**. Beri nama, misalnya `Toko Emas Backend`.
2. Ganti isi `Code.gs` dengan seluruh isi **Kode.gs**. Ganti juga nama berkasnya menjadi `Kode`.
3. Klik **＋ → Skrip** empat kali untuk membuat `Emas`, `Notifikasi`, `CRM`, dan `Migrasi`. Tempel isi berkas yang sesuai ke masing-masing.
4. Buka **Setelan proyek** (ikon roda gigi) → centang **Tampilkan file manifes "appsscript.json"**. Kembali ke Editor, buka `appsscript.json`, lalu tempel isi **appsscript.json**.
5. Simpan dengan Ctrl+S.
6. Di dropdown fungsi, pilih **`setupAplikasi`** → klik **▶ Jalankan**.
   - Klik **Tinjau izin** → pilih akun Google Anda → **Lanjutan** → **Buka (tidak aman)** → **Izinkan**. Ini normal untuk skrip buatan sendiri.
   - Buka **Log eksekusi**. Di sana tercatat **username `superadmin` dan sandi awal**. Catat sandi itu. Sandi ini hanya muncul di log dan wajib diganti saat login pertama.
   - Setup otomatis membuat folder **📁 Toko Emas WebApp** di Drive (berisi database Sheets, folder gambar, dan folder **privat** KTP/nota member), mengisi **data contoh toko emas** (23 produk, 14 kadar, 4 slide, 2 toko, rekening & QRIS contoh), dan memasang pemicu otomatis tiap 1 menit.
   - `setupAplikasi()` aman dijalankan ulang. Fungsi ini hanya menambahkan yang belum ada, tanpa menggandakan data.
7. **Deploy** → **Deployment baru** → ikon roda gigi → **Aplikasi web**:
   - *Jalankan sebagai*: **Saya**
   - *Yang memiliki akses*: **Siapa saja**
   - Klik **Deploy**, lalu **salin URL yang berakhiran `/exec`**.

> ⚠️ Setiap kali kode backend diubah: **Deploy → Kelola deployment → ✏️ Edit → Versi: Versi baru → Deploy**. Jangan membuat "Deployment baru", karena URL-nya akan berubah dan website berhenti tersambung.

---

## 2. Hubungkan frontend

1. Ekstrak `tokoemas-frontend.zip`. **Folder hasil ekstrak itulah folder proyek**: di dalamnya langsung terlihat `index.html`, `css/`, `js/`, dan `assets/`.
2. Buka `js/config.js` dengan Notepad, lalu tempel URL `/exec` di antara tanda kutip:
   ```js
   GAS_URL: 'https://script.google.com/macros/s/AKfycb.../exec',
   NAMA_USAHA: 'Emas Kota Bali',
   ```
3. Simpan. Bila `GAS_URL` kosong, website tetap tampil dalam **mode demo** memakai data contoh bawaan.

---

## 3. Unggah ke GitHub Pages (lewat terminal)

> Jangan memakai tombol "Upload files" di web GitHub, karena struktur folder `css/` dan `js/` akan rusak.

1. Pasang Git: https://git-scm.com/download/win (pengaturan bawaan). Buka **PowerShell**.
2. Atur identitas Git (cukup sekali seumur komputer):
   ```bash
   git config --global user.name "Nama Anda"
   git config --global user.email "email-github@anda.com"
   ```
3. Di github.com: **＋ → New repository** → beri nama `acc-cell` → pilih **Public** → **jangan** centang README → **Create**.
4. Masuk ke folder hasil ekstrak (yang berisi `index.html`):
   ```bash
   cd "C:\Users\NamaAnda\Downloads\acc-cell-frontend"
   dir
   ```
   Pastikan `index.html` terlihat di daftar. Bila yang terlihat justru sebuah folder, masuk dulu ke folder itu dengan `cd`.
5. Kirim ke GitHub, satu perintah per baris:
   ```bash
   git init
   git add .
   git commit -m "Upload pertama Toko Emas"
   git branch -M main
   git remote add origin https://github.com/USERNAME/acc-cell.git
   git push -u origin main
   ```
   Saat diminta **Password**, tempel **Personal Access Token**, bukan sandi akun GitHub. Buat tokennya di https://github.com/settings/tokens → *Generate new token (classic)* → centang **repo**. Saat token ditempel, layar memang terlihat kosong; itu normal.
6. Di repo GitHub: **Settings → Pages → Deploy from a branch → main → / (root) → Save**. Centang **Enforce HTTPS**.
7. Tunggu 1–2 menit. Website tampil di `https://USERNAME.github.io/acc-cell/`.

**Update berikutnya:**
```bash
git add .
git commit -m "Perbarui"
git push
```
Bila yang tampil masih versi lama, tekan **Ctrl+Shift+R**.

---

## 4. Langkah pertama setelah online

1. Buka **halaman admin tersendiri**: `https://USERNAME.github.io/acc-cell/admin/`. Halaman ini tidak ditautkan dari halaman publik, jadi **simpan sebagai bookmark**. Login sebagai `superadmin` dengan sandi dari Log, lalu ganti sandi saat diminta.
2. **Rekening & QRIS** → ganti semua data **CONTOH** dengan rekening dan QRIS asli toko. Unggah gambar QRIS asli. Ini penting untuk mencegah penipuan.
3. **Cabang & Sosmed** → periksa alamat, nomor WA admin (Nabire 082197649558, Serui 081248245606), dan link Google Maps. Untuk peta mini: Google Maps → Bagikan → Sematkan peta → Salin HTML → tempel.
4. **Admin & Akses** → buat akun **admin_nabire** dan **admin_serui** (isi nomor WA agar ikut menerima notifikasi). Admin cabang hanya bisa mengelola produk cabangnya sendiri.
5. **Produk** → hapus produk contoh atau ganti dengan foto asli. Foto otomatis dikompres sebelum diunggah ke Drive.
6. **Tampilan & Teks → Bagian Link Bio** → setiap bagian link bio (Profil, Slide Hero, Kartu Promo, Tombol Menu, **Slide Produk Pilihan**, Sosial Media, Cabang) bisa digeser naik/turun dengan ▲▼, dinyalakan/dimatikan dengan saklar, dan diubah isinya lewat tombol **Atur**. Klik **Simpan Urutan** setelah mengubah urutan.
   - **Slide Produk Pilihan** menampilkan produk acak (yang tersedia) yang bisa digeser, plus tombol **Lihat semua**. Judul dan jumlahnya diatur lewat **Atur**.
   - **Sosial media** punya 2 gaya: **Tombol lebar** atau **Ikon bulat**. Pilih di **Cabang & Sosmed**, atau lewat **Atur** pada bagian Sosial Media.
   - Menambah sosial media dari HP: pilih platform, lalu cukup ketik **@username** (atau tekan **Tempel**). Tautan lengkap dibuat otomatis dan tampil sebelum disimpan.
7. **Pop-up Promo** dan **Slide Hero** → atur promo. Pop-up bisa dinyalakan atau dimatikan kapan saja.
8. Pasang link website di bio TikTok, Instagram, Facebook, dan WhatsApp Business.

> Di halaman publik, tombol **Menu** (navigasi bawah) membuka semua menu untuk pengunjung: Beranda, Semua Produk, HP Baru, HP Second, Aksesoris, Rekening & QRIS, Servis & Tukar Tambah, Chat Admin, Bagikan, dan sosial media. Katalog punya tombol **Filter** (lokasi toko, kategori, urutan harga/terbaru, sembunyikan stok habis).

---

## 4a. Memakai dasbor dari HP

Dasbor dibuat seperti aplikasi, jadi semua pengaturan bisa diubah lewat HP:
- **Navigasi bawah** (selalu tampil): **Beranda · Produk · Tampilan · Promo · Menu**. Admin outlet melihat Beranda · Produk · Akun · Menu.
- **Menu** membuka semua menu dasbor dalam bentuk kotak (Pop-up, Rekening & QRIS, Cabang & Sosmed, Layanan, WhatsApp, CRM, Admin, Migrasi, Log, Lisensi, Keluar).
- **Bilah atas** menampilkan judul halaman. Tombol **← (kembali)** muncul di setiap sub-halaman, dan ikon kanan atas membuka halaman utama Link Bio (di Blogger: domain blog Anda, `/`).
- **Tampilan** berisi 5 pilihan: Bagian Link Bio, Menu, Header & Navigasi, Warna & Tema, Teks & Label. Setelah selesai, ketuk ← untuk memilih pengaturan berikutnya.
- **Lembar edit** tampil layar penuh. Judul dan tombol **X** ada di atas, **Batal/Simpan** menempel di bawah. Setelah Simpan, lembar tertutup dan daftar di belakangnya langsung diperbarui, jadi Anda bisa langsung mengedit yang lain tanpa memuat ulang browser.
- Di komputer (layar ≥ 1024 px) dasbor tetap memakai menu samping.

## 4d. Layar pembuka & kecepatan

- **Pembukaan pertama** (atau data tersimpan sudah lebih dari 2 menit): layar pembuka penuh menampilkan logo usaha, bilah kemajuan, dan tulisan *Memuat data…*. Bilah bergerak sesuai tahapan yang benar-benar selesai: data dari server, lalu gambar di layar pertama dan huruf. Setelah semuanya siap, halaman tampil utuh dengan efek memudar, tanpa kedip dan tanpa data kosong.
- **Dibuka ulang dalam 2 menit**: langsung tampil dari data tersimpan, tanpa layar pembuka. Pindah halaman juga tidak memunculkan loading lagi.
- **Koneksi lambat**: setelah 6 detik muncul tulisan *Koneksi lambat, masih memuat data…*. Loading tidak berjalan tanpa batas: bila ada data tersimpan, data itu ditampilkan setelah ±10 detik, dan bila tidak ada, setelah ±25 detik muncul *Gagal memuat data* dengan tombol **Coba Lagi**.
- **Dasbor**: layar pembuka tampil sampai sesi login diperiksa dan data dasbor siap. Bila belum login, langsung ke halaman masuk.
- Logo dan warna di layar pembuka mengikuti pengaturan dasbor (setelah kunjungan pertama).
- Lama data dianggap segar diatur lewat `CACHE_SEGAR_DETIK` (bawaan 120 detik).

## 4b. Atur SEMUA tampilan link bio (menu **Tampilan & Teks**)

Template ini bisa dipakai untuk jenis usaha apa pun (toko HP, kuliner, fesyen, jasa, dll). Menu **Tampilan & Teks** punya 5 tab. Setiap tab punya tombol **Simpan**, dan perubahan langsung tampil di link bio. Pengunjung yang sedang membuka situs akan melihatnya paling lambat ±1 menit kemudian.

| Tab | Yang bisa diatur |
|---|---|
| **Bagian Link Bio** | Urutan bagian (▲▼), saklar on/off, dan isi tiap bagian lewat **Atur**: profil, slide promo, kartu promo, tombol menu, slide produk, sosial media, lokasi toko, dan **FAQ (Tanya Jawab)**. |
| **Menu** | Semua menu link bio, yang aktif maupun yang mati. Saklar = tampil/sembunyi di link bio dan lembar Menu. Menu bisa diubah nama, keterangan, dan ikonnya, serta diurutkan. **Tambah Menu** untuk membuat menu sendiri: isi nama, pilih ikon, lalu pilih tujuannya (lihat di bawah). Perubahan langsung tersimpan. |
| **Header & Navigasi** | Saklar header on/off, logo header, dan nama di header. **Tombol di header: maksimal 2 aktif**, dipilih dari semua menu (CS, Install, Mode gelap, Bagikan, Menu, atau menu buatan sendiri). **Tombol navigasi bawah: maksimal 5 aktif**, juga dipilih dari semua menu. Nama dan ikon tiap tombol bisa diganti, ada pratinjau langsung. |
| **Warna & Tema** | 8 pilihan warna cepat, atau atur sendiri 11 warna (tombol utama, teks, latar, kartu, garis, header, harga, tombol WA, tombol sosmed). Ada tombol **Kembalikan bawaan** dan pilihan tema bawaan untuk pengunjung (terang / gelap / ikuti HP). Tombol mode gelap dipasang lewat tab Header & Navigasi dan selalu tersedia di lembar Menu. |
| **Teks & Label** | Semua tulisan katalog dan detail produk: **daftar kategori** (dipisahkan koma), sebutan barang, label spesifikasi (Merek, RAM, Memori, …), tombol pesan, label tersedia/habis, kartu jaminan, dan **pesan WhatsApp otomatis**. Juga teks halaman Rekening, Layanan, Lokasi, footer, dan deskripsi SEO. |

Tips:
- Isi tanda **-** (minus) pada kolom yang punya keterangan "untuk menyembunyikan" bila tulisan itu tidak perlu. Contoh: usaha kuliner bisa menyembunyikan label "RAM" dan "Memori".
- Kosongkan kolom teks untuk kembali ke tulisan bawaan.
- Pengunjung bisa memilih mode gelap/terang sendiri (tombol header/navigasi bila dipasang, atau lewat lembar **Menu**). Pilihannya tersimpan di HP mereka.
- Semua pop-up dan lembar (menu, bagikan, form dasbor) **hanya tertutup lewat tombol X / Batal**. Klik di luar tidak menutupnya, jadi isian tidak hilang tanpa sengaja.

### Menu buatan sendiri (contoh: menu "iPhone")
Buka **Tampilan & Teks → Menu → Tambah Menu**, isi **Nama menu** `iPhone`, pilih ikon, lalu pilih **Tujuan saat diklik**:

| Tujuan | Contoh isian | Hasil |
|---|---|---|
| Halaman di situs | Katalog / Rekening / Layanan / Lokasi / Beranda | Membuka halaman itu |
| Kategori katalog | `HP Baru` | Katalog langsung tersaring kategori itu |
| Cari kata di katalog | `iphone` | Katalog menampilkan hasil pencarian "iphone" |
| Link custom | `#iphone` | Sama dengan mencari "iphone" di katalog |
| Link custom | `contohdomain.com/iphone` | Membuka situs itu di tab baru |

Setelah dibuat, menu tampil di link bio dan lembar Menu, dan bisa dipasang di **navigasi bawah** atau **tombol header** lewat tab Header & Navigasi.

### FAQ (Tanya Jawab)
**Bagian Link Bio → FAQ → Atur**: ubah judul, tambah/hapus/urutkan pertanyaan dan jawaban. Gunakan saklar di daftar bagian untuk menyalakan/mematikan FAQ.

### Lokasi toko lebih dari 2 cabang
Buka **Cabang & Sosmed** → **Tambah**. Nama dan nomor WA wajib diisi; alamat, jam buka, link Maps, dan peta mini boleh diisi menyusul. Cabang baru otomatis muncul di halaman **Lokasi**, filter katalog, pilihan cabang produk, akun admin cabang, dan pilihan "chat cabang". Cabang tidak bisa dihapus bila masih dipakai produk atau akun admin; pindahkan dulu ke cabang lain.

Di link bio, bagian Lokasi menampilkan beberapa cabang beserta tombol **Lihat semua**. Tombol ini membuka halaman **Lokasi Toko** berisi semua cabang dan **kolom pencarian** (bisa mencari berdasarkan nama, kota, atau alamat).

### Halaman Layanan
Menu **Halaman Layanan** → **Tambah Layanan**: isi judul, pilih ikon, deskripsi, dan pesan WhatsApp otomatis (`{cabang}` diganti nama cabang). Layanan bisa diurutkan (▲), disembunyikan, atau dihapus. Judul, subjudul, dan kotak tips halaman diatur di bagian bawah menu yang sama.

### Slide Hero & Pop-up: dengan atau tanpa link
Saat mengedit slide, pilih **Tujuan saat diklik**: halaman di situs (Katalog / Rekening / Layanan / Lokasi), **Link manual (URL)** (misalnya `https://...`, terbuka di tab baru), atau **Tanpa link** (slide hanya gambar).

---

## 4c. Edisi Toko Emas: fitur khusus

**Data contoh (bawaan).** Setelah `setupAplikasi()`:
- 2 toko: **Emas Kota Bali** (Denpasar) dan cabang **Emas Putri Bali** (Ubud), jam 09.00–21.00 WITA. Nomor WA contoh `0812-0000-1111/2222` **bukan nomor asli**, jadi ganti di **Cabang & Sosmed**.
- 23 produk: perhiasan emas (cincin, kalung, gelang, anting, liontin, logam mulia), perak 925, non-logam (kotak perhiasan, gelang biji, cincin batu akik, kalung mutiara), dan produk **sewa** pengantin (set seserahan, mahkota payas, set perhiasan, kotak mahar).
- 14 kadar (ANTAM, LM, 24K–6K, perak 999 & 925), event **Lelang Jumat Berkah**, 5 layanan (service, patri, cuci & sepuh, custom, buyback).

### Harga Emas Hari Ini (dasbor → **Harga Emas**)
- **Harga murni 24K per gram** menjadi dasar. Tiap kadar punya *kemurnian*, *markup jual %* dan *potongan buyback %*:
  - harga jual / gram = harga murni × kemurnian × (1 + markup%)
  - harga buyback / gram = harga murni × kemurnian × (1 − potongan%)
  - Mode **Manual per gram** untuk mengisi sendiri harga jual & buyback kadar tertentu.
- **Sumber Manual**: ketik harga murni lalu **Simpan**. Semua produk yang harganya otomatis langsung ikut berubah.
- **Sumber Otomatis (GoldAPI.io)**:
  1. Tempel API key di kolom **API key GoldAPI.io**. Key disimpan di server (Script Properties `GOLDAPI_KEY`) dan hanya tampil tersamar.
  2. Pilih interval (1–24 jam), lalu tekan **Ambil harga sekarang** untuk uji.
  3. Setelah itu harga diperbarui otomatis oleh pemicu latar.
  4. ⚠️ Key yang pernah dibagikan di chat sebaiknya **dibuat ulang** di goldapi.io, lalu key baru ditempel di dasbor.
- Pengunjung yang membuka situs memeriksa versi harga tiap ±2 menit. Bila harga berubah, tampilan ikut diperbarui tanpa muat ulang.

### Harga produk mengikuti harga emas
Di **Produk → Tambah**, pilih **Kadar** dan isi **Berat (gram)**, lalu **kosongkan Harga**. Harga dihitung otomatis: berat × harga jual kadar + ongkos (bila diisi), dibulatkan ke ribuan.
- Contoh: harga 2.400.000/gram, cincin 2 gram, harga dikosongkan → **Rp 4.800.000**.
- Form menampilkan pratinjau perhitungannya. Daftar produk memberi tanda **Auto**.
- Isi Harga = harga tetap (tidak ikut harga emas). Produk non-logam wajib diisi harganya.

### Halaman publik baru
| Halaman | Isi |
|---|---|
| `#/harga-emas` | Harga emas murni, tren naik/turun, grafik riwayat, tabel jual & buyback semua kadar, kalkulator. |
| `#/jual-emas` | Halaman jual emas ala *jualemas.id*: tab **Harga Buyback** (Kategori/Kadar · Harga/gram) & **Kalkulator Buyback** ("Estimasi yang Anda terima"), tombol WA berisi kadar, berat & estimasi. |
| `#/lelang` | Katalog lelang dengan hitung mundur, syarat, status member, tombol **Ambil**, lalu kode **LLG-XXXX-XXXX** + QR. |
| `#/akun` | Daftar/masuk member hanya dengan **nomor HP + sandi**, unggah KTP & nota, kode lelang, riwayat sewa, ganti sandi. |

Semua halaman ini juga ada sebagai **menu** & **navigasi bawah** dan bisa dipindah, diganti teks/ikon, atau disembunyikan di **Tampilan & Teks**. Kartu **Harga Emas** dan **Lelang** di beranda adalah *bagian* link bio (urutan & saklar di tab Bagian).

### Member
- Lupa sandi → sandi sementara dikirim ke **WhatsApp** nomor member. Syaratnya: notifikasi WA (Fonnte) aktif. Bila belum, member diminta menghubungi admin, lalu superadmin memakai **Member → Reset sandi**.
- Foto KTP & nota disimpan **privat** di Drive (tidak dibagikan publik). Hanya superadmin yang bisa melihatnya lewat **Member**.
- **Member → Setujui semua** memverifikasi KTP, nota & izin lelang sekaligus.

### Flash Sale (dasbor → **Flash Sale**)
Fitur "lelang" lama kini bernama **Flash Sale** (halaman `#/flash-sale`): harga spesial langsung ambil, tanpa tawar.
1. Atur judul, mulai/selesai (tombol cepat **Jumat Berkah**, **Buka 24 jam**, **Tutup**), maks. produk per member, **masa booking (jam, bawaan 3)**, syarat, serta syarat wajib yang dicek sistem: KTP, nota, sosmed, persetujuan admin.
2. Produk ikut lewat form produk: **Tampilkan di halaman Flash Sale**, isi **harga promo** dan **kuota**.
3. **Penguncian stok otomatis:** begitu member menekan **Ambil Promo**, stok langsung berstatus **Dipesan (Booked)** dan tidak bisa diambil orang lain selama masa booking. Kode tidak ditukar sampai batas → otomatis **Hangus** dan stok kembali tersedia.
4. Di toko, ketik kode di **Tukar kode Flash Sale** (cocokkan KTP). **Batalkan** mengembalikan kuota.

### Lelang Live / tawar langsung (dasbor → **Lelang Live**)
**A. Persiapan** — tekan **Buat Sesi**, pilih produk dari katalog (boleh produk khusus lelang), isi **harga awal** & **kelipatan tawaran**, atur waktu (tombol cepat **Jumat Berkah 19:00–21:00**, **Mulai sekarang · 1 jam**). Superadmin mengatur judul/deskripsi banner, **auto-extend** (menit), **batas pelunasan** (jam), **jam toko tutup**, dan ketentuan.
**B. Pendaftaran & verifikasi** — penawar wajib member yang memenuhi syarat (sama dengan Flash Sale). Tombol tawar baru aktif setelah member mencentang **persetujuan komitmen** (bersedia datang & melunasi).
**C. Live bidding** — member memilih tawaran (+1×, +2×, +5× kelipatan). Halaman memperbarui harga tertinggi tiap ±4 detik dan menampilkan nama tersamar (mis. *Rina P. – Rp7.250.000*). Tawaran di menit-menit terakhir **memperpanjang waktu** (anti tawar detik terakhir). Penawar yang disalip mendapat pemberitahuan di layar.
**D. Pemenang & kode** — saat waktu habis sistem menutup otomatis (pemicu `pekerjaLatar` tiap 1 menit — jalankan **`pasangTrigger()`** sekali), menetapkan **Peringkat 1** + **cadangan Peringkat 2**, membuat kode unik `LLG-XXXX-1`, dan mengirimnya lewat WhatsApp (bila Fonnte aktif) + tampil di halaman lot & menu Akun (dengan QR) beserta harga final & batas kedatangan.
**E. Pelunasan di toko** — batas = *sekarang + batas pelunasan*, maksimal 1 jam sebelum toko tutup. Kasir: dasbor → Lelang Live → **Kasir: verifikasi kode pemenang** → cek nama/WA/KTP → **Tandai Lunas** (produk otomatis Habis). Pemenang tidak datang (lewat batas, atau admin menekan **Tidak datang**) → kode hangus, akun masuk **daftar hitam lelang**, dan lot otomatis ditawarkan ke **Peringkat 2** dengan kode baru (`-2`) via WhatsApp. Daftar hitam bisa dibuka lagi di dasbor → Member.

Banner **Lelang / Event** di beranda menampilkan kartu Lelang Live (LIVE/segera, foto, harga tertinggi, hitung mundur, tombol **Ikut Tawar**) dan kartu Flash Sale (foto produk, sisa stok, hemat, hitung mundur, tombol **Ambil Promo**) — masing-masing hanya tampil saat ada event.

### Sewa perhiasan pengantin
Produk dengan **Jenis produk = Disewakan** menampilkan tombol **Sewa Sekarang**:
- Member memilih tanggal & lama sewa, total dihitung otomatis.
- Sewa wajib KTP. Jadwal yang bentrok ditolak.
- Admin mengubah status di menu **Sewa** (Menunggu → Disetujui → Berjalan → Selesai/Batal). Status *Disetujui* mengirim WA ke member bila notifikasi aktif.

### Menu Kategori ala aplikasi (beranda)
Di bawah slide hero ada **menu kategori bergaya aplikasi HP**: 4 kolom × 2 baris, geser ke kanan untuk menu ke-9 dan seterusnya (desktop menampilkan semuanya dalam satu baris).
- Atur di **Tampilan & Teks → Bagian Link Bio → Menu Kategori (ala Aplikasi) → Atur**.
- Tiap menu bisa dinyalakan/dimatikan, diganti nama, diurutkan, dan diberi **ikon** atau **gambar ilustrasi** (PNG transparan ±160 px).
- Tujuannya bisa kategori katalog, halaman (Harga Emas, Jual Emas, Galeri, Lelang, Akun), kata pencarian, atau link luar.
- Tersedia juga judul opsional, bentuk ikon (kotak membulat / lingkaran / tanpa latar), dan tombol **Kembalikan bawaan**.

### Galeri Pesanan Custom & Galeri Pre-Order
Dua galeri foto **tanpa judul, deskripsi, atau harga**:
- **Galeri Custom** (`#/galeri/custom`) berisi contoh pesanan dan model custom: cincin nama, liontin nama, cincin kawin, dll.
- **Galeri Pre-Order** (`#/galeri/po`) berisi model baru atau perhiasan jadi yang tidak ada di toko tetapi bisa dipesan.

**Tampilan di HP (v4):** tab galeri bisa digeser (tidak terpotong walau galeri lebih dari 3), tombol **Filter** (kategori + urutan Terbaru/Terlama/Acak), dan satu tombol **Tampilan** yang baru menampilkan pilihan tata letak *yang Anda aktifkan* saat diklik (atur di Tampilan → Galeri → `galeri_layouts`).

**Unggah foto** (dasbor → **Galeri Custom & PO**):
1. Pilih tab galeri.
2. Isi **kategori** (pilih dari daftar atau ketik baru) dan kata kunci (opsional).
3. Pilih atau seret **banyak foto sekaligus**. Foto dikompres otomatis dan diunggah 3 sekaligus, dengan progres per foto.

**Kelola foto**: ketuk foto untuk memilih (bisa banyak), lalu:
- ubah kategori;
- pindah ke galeri lain (Custom ↔ PO);
- sembunyikan atau tampilkan;
- naikkan ke atas;
- hapus (berkas di Drive ikut dibuang).

Admin cabang mengelola foto yang ia unggah sendiri.

**Untuk pelanggan**:
- Pencarian membaca kategori dan kata kunci. Filter kategori menampilkan jumlah foto per kategori.
- Ada 5 pilihan tampilan: **Grid, Mosaik, Masonry, Besar, Rapat**.
- Ketuk foto untuk membukanya layar penuh (bisa digeser). Tombol **Tanyakan model ini** membuka WhatsApp toko dengan pesan berisi **link foto** dan **link galeri**, sehingga admin langsung tahu model yang ditanyakan.

**Display & Layout** (superadmin, di halaman yang sama): pilih tampilan yang boleh dipakai pengunjung, tampilan awal HP dan desktop, jarak & sudut foto, label kategori di foto, urutan kategori, teks halaman, serta isi pesan WhatsApp.

### Galeri tambahan (Ready Stock, Perak, & galeri buatan sendiri)
Bawaan ada 4 galeri: **Custom, Pre-Order, Ready Stock, Perak**.
- **Galeri baru**: dasbor → **Galeri Foto → Kelola galeri → Galeri baru**. Isi nama (mis. "Emas Muda"); kode halaman dibuat otomatis (`#/galeri/emas-muda`).
- Di sana juga bisa mengubah judul, keterangan & ikon, mengurutkan, menyembunyikan, atau menghapus galeri. Galeri yang masih berisi foto tidak bisa dihapus.
- Pasang galeri di **Menu**, **Navigasi bawah**, atau **Menu Kategori** dengan tujuan halaman `#/galeri/<kode>`.
- Bagian galeri di beranda menampilkan foto **acak** dari semua galeri, tanpa label, dengan efek **berjalan** (2 baris bergeser), **muncul**, atau **diam**. Atur di **Tampilan → Bagian → Galeri**. Tombol **Lihat semua** dan ikon grid di kanan judul membuka halaman galeri.

### Favorit ❤️
- Pelanggan menekan ❤️ di kartu produk, detail produk, foto galeri, atau saat foto dibuka layar penuh. Ikon menjadi merah dan item tersimpan di **Favorit** (`#/favorit`).
- Navigasi bawah menampilkan jumlah favorit. Bila keranjang/Pesanan nonaktif, slot navigasi **Pesanan** otomatis diganti **Favorit**.
- Di halaman Favorit pelanggan bisa memfilter Produk/Foto, menghapus item, **Tanya** satu item, atau **Tanyakan semua** lewat WhatsApp (berisi nama, harga & link produk serta link foto).
- Favorit disimpan di perangkat pelanggan (tanpa login). Bila pelanggan berganti HP atau menghapus data browser, favoritnya hilang.

### Watermark foto otomatis (dasbor → **Watermark Foto**)
- Watermark **dibakar permanen** ke gambar di browser sebelum diunggah ke Drive, jadi tetap terlihat saat foto diunduh atau dibagikan.
- Berlaku untuk foto **produk** dan foto **galeri**. Foto yang sudah terunggah sebelumnya **tidak berubah**.
- **Pengaturan**: status aktif, mode **Logo / Teks / Logo + Teks**, logo usaha atau logo khusus (PNG/SVG/WebP), posisi 9 titik atau **berulang** (anti-crop), ukuran 5–100%, transparansi 0–100%, rotasi −180°…180°, jarak tepi horizontal & vertikal, warna Original/Custom, efek Shadow/Glow/Outline, layer **Depan** (jelas) atau **Belakang** (menyatu dengan foto).
- **Pratinjau langsung** berubah saat setelan digeser. Tombol **Mobile/Desktop** menunjukkan tampilannya di kartu HP dan layar lebar; foto contoh bisa diganti.
- **Global / per brand**: tab **Global** berlaku untuk semua. Tab tiap toko (Emas Kota Bali, Emas Putri Bali) bisa memakai **pengaturan khusus brand**.
- **Per produk**: di form produk, di atas foto, pilih **ikut pengaturan brand / tanpa watermark / khusus produk ini** (posisi & ukuran sendiri). Pilih sebelum menambahkan foto.
- **Galeri**: saklar **Beri watermark otomatis** di panel unggah. Matikan untuk foto yang sudah punya watermark agar tidak dobel.

### Backend GAS & Basis Data (dasbor superadmin → **Backend GAS & Database**)
- **Status API**: online/gangguan, waktu respons, pemicu latar, sisa kuota email, status GoldAPI & Fonnte, dan URL `/exec`.
- **Kapasitas Sheets**: sisa dari batas 10 juta sel, plus jumlah baris & sel per tabel.
- **Backup**: tombol **Backup sekarang** membuat salinan utuh spreadsheet di folder Drive `Backup_Database`. Bisa juga otomatis harian/mingguan, dengan jumlah backup yang disimpan dibatasi (yang lama dibuang ke sampah Drive).
- **Pemulihan**: pilih backup → centang tabel → ketik `PULIHKAN`. Kondisi sekarang otomatis dibackup dulu sebelum dipulihkan, jadi bisa dibatalkan.
- **Unduh semua data (JSON)**: arsip cadangan di komputer.

### Bagikan produk dengan foto
Tombol **Bagikan** di detail produk punya pilihan **Kirim foto + link**:
- Di HP (Android/iPhone), foto produk dikirim sebagai gambar beserta nama, harga, keterangan singkat & link ke WhatsApp, Instagram, dll.
- Di komputer, WhatsApp terbuka dengan teks + link.

Link situs yang ditempel di WhatsApp/Facebook menampilkan **gambar sampul** `assets/og-cover.jpg` beserta judul & deskripsi.
- ⚠️ Di `index.html`, ubah alamat `og:image` dan `og:url` bila alamat GitHub Pages Anda bukan `nabirekreatif.github.io/biolink`. Tema Blogger mengaturnya otomatis.
- Ganti gambar sampul dengan menimpa `assets/og-cover.jpg` (1200×630 px).

### Notifikasi & suara di dasbor
Angka notifikasi hanya tampil di **ikon lonceng** (bilah atas HP, tombol **Notifikasi** di header desktop, dan tombol Notifikasi di sidebar). Menu yang punya tugas ditandai titik merah kecil.

- Dasbor memeriksa setiap ±45 detik (dan saat dasbor dibuka kembali) apakah ada:
  - pengajuan **sewa** baru;
  - **klaim lelang** yang belum ditukar;
  - **member** yang perlu diverifikasi.
- Bila ada yang baru: bunyi + getar, pesan 🔔, dan angka merah di menu & ikon lonceng.
- Ketuk **🔔** untuk melihat daftarnya, mematikan suara, atau **Tes suara**.
- Simpan berhasil / gagal juga memakai bunyi singkat.
- Di HP, suara baru aktif setelah layar dasbor disentuh sekali (aturan browser).

---

## 5. Reset data contoh & reset sandi superadmin (lewat backend)

Keduanya **hanya** bisa dijalankan dari editor Apps Script. Tidak ada tombol di website.

| Kebutuhan | Fungsi yang dijalankan (▶) | Hasil |
|---|---|---|
| Mengisi ulang data contoh | **`jalankanResetDataContoh`** | Menu, slide, rekening, layanan, dan statistik diganti data contoh paket aktif. **Akun admin, outlet, sosmed, dan pengaturan utama tidak diubah.** |
| Pakai data contoh **toko emas** (bawaan) | **`gantiKeDataEmas`** | 23 perhiasan (emas, perak, non-logam, sewa pengantin), 14 kadar, 4 slide, 5 layanan, toko Emas Kota Bali & Emas Putri Bali, FAQ, menu & teks toko emas, event lelang contoh. Akun admin & member tidak diubah. |
| Pakai data contoh **kuliner** | **`gantiKeDataKuliner`** | Data contoh rumah makan. Akun admin tidak diubah. |
| Pakai data contoh **toko HP** | **`gantiKeDataHP`** | Data contoh konter handphone (katalog HP, servis, tukar tambah). Akun admin tidak diubah. |
| Lupa sandi admin/superadmin (paling mudah) | Halaman masuk dasbor → **Lupa sandi? Kirim tautan ke email** | Tautan **sekali pakai, berlaku 30 menit** dikirim ke Gmail akun (kolom email di **Admin & Akses**). Superadmin tanpa email menerima di **Gmail pemilik Apps Script**. Sandi lama tetap berlaku sampai tautan dipakai. |
| Lupa sandi superadmin (tanpa email) | **`resetPasswordSuperadmin`** | Sandi sementara tampil di **Log eksekusi**, semua sesi lama dicabut, dan sandi wajib diganti saat login. |
| Menentukan sendiri sandi sementara | Setelan proyek → **Properti skrip** → tambah `SUPERADMIN_SANDI_BARU` = sandi pilihan, lalu jalankan `resetPasswordSuperadmin` | Properti otomatis dihapus setelah dipakai. |
| Lupa sandi admin cabang | Dasbor superadmin → **Admin & Akses → Reset** | Admin tersebut wajib mengganti sandi saat login. |
| Pemicu hilang / antrean WA macet | **`pasangTrigger`** | Pemicu 1 menit dipasang ulang. |
| Data publik belum berubah | **`bersihkanCache`** | Cache dikosongkan sehingga data langsung dimuat ulang. |

---

## 6. Notifikasi WhatsApp (Fonnte) & Email

1. Daftar di **fonnte.com** → **Device** → scan QR dengan nomor WA toko → salin **token**.
2. Dasbor → **WhatsApp & Notifikasi → ⚙️ Konfigurasi** → tempel token → **Cek Perangkat** (harus `connect`) → **Kirim Tes WA** → nyalakan saklar WhatsApp → **Simpan**. Token disimpan aman di server dan tidak pernah tampil ke pengunjung.
3. Email: nyalakan saklar Email → **Kirim Tes**. Kuota Gmail biasa sekitar 100 email/hari.
4. **Matriks notifikasi otomatis**: atur kejadian mana yang dikirim lewat WA dan/atau email, beserta isi pesannya:
   - Admin login (keamanan)
   - Admin cabang menambah produk
   - Produk ditandai HABIS
   - Pop-up promo dinyalakan
   - Sandi admin direset
   - Ringkasan mingguan setiap Senin pagi (kunjungan, klik WA Nabire vs Serui, produk paling ditanyakan)
5. **📣 Blast WhatsApp** (promo ke pelanggan): pilih sasaran (segmen/tag CRM atau tempel nomor) → **Deteksi Nomor WA** → tulis pesan (`{nama}`, `{toko}`, `{link}`) → pilih batch **10/20/50** dan jeda → **Mulai Blast**. Server tetap mengirim 1 batch per menit walau halaman ditutup.
   - **Tips anti-blokir:** pakai nomor yang sudah lama aktif, mulai dengan batch 10, jeda acak `3-8` detik, tambahkan "Balas STOP untuk berhenti", dan jangan kirim tautan yang sama ke ratusan orang dalam satu jam.

## 7. CRM Kontak

- **Sinkron** otomatis memasukkan tim admin. Pelanggan masuk lewat **Import CSV** (kolom `nama, wa, email, segmen, tag`; ada template) atau **Tambah Kontak**. Nomor 62/+62 otomatis diubah jadi 08, dan kontak ganda dilewati sehingga import aman diulang.
- Kartu KPI bisa diklik sebagai filter: WA terverifikasi, belum dicek, opt-out, duplikat.
- Aksi massal: deteksi WA, beri tag, **Blast ke terpilih**, opt-out/opt-in, gabungkan duplikat, hapus, dan ekspor CSV.
- Kontak **opt-out** tidak pernah ikut blast.

## 8. Migrasi data dari app/katalog lama

Dasbor → **Migrasi Data** → tempel URL spreadsheet lama → pilih data → **Pindai (Dry-run)** → periksa angka → **Jalankan Import**.
- Spreadsheet lama hanya **dibaca**, tidak diubah.
- Kolom dikenali dari nama header, termasuk variasinya: "Nama Produk", "Harga Jual", "Lokasi", "Stok", "Foto", dan lainnya.
- Import ulang tidak membuat data dobel. Jalankan sekali lagi tepat sebelum pindah untuk menangkap data terbaru.
- Gunakan **akun Google yang sama** agar foto Drive lama tetap tampil.
- Tersedia juga **Import produk dari CSV** (ada template).

## 9. Pasang sebagai aplikasi (PWA) & bagikan link

- **Tombol Install** ada di header (bila dipasang di tab Header & Navigasi), di lembar **Menu**, dan di lembar **Bagikan**. Warnanya mengikuti warna utama tema.
  - Android/Chrome: ketuk **Install** → **Pasang**. Tombol **hilang otomatis** setelah aplikasi terpasang, dan tidak tampil saat link bio dibuka dari aplikasi yang sudah terpasang.
  - iPhone: tombol menampilkan petunjuk *Bagikan → Tambah ke Layar Utama*.
- Saat dibuka sebagai aplikasi terpasang, tampilannya seperti APK: **zoom dimatikan** (cubit, ketuk ganda, Ctrl+gulir), tidak ada tarik-untuk-muat-ulang, teks tidak ikut terseleksi saat ditekan lama, ada animasi pindah halaman, dan warna bilah status mengikuti warna header.
- Saat pop-up atau menu terbuka, halaman di belakangnya **tidak ikut tergulir**.
- **Menu → Bagikan** menampilkan:
  - **QR Code** yang bisa dipindai langsung dari layar atau **diunduh** sebagai gambar PNG berbingkai, siap dicetak atau ditempel di toko.
  - Tautan yang bisa **disalin**.
  - Tombol bagikan ke **WhatsApp, Facebook, Telegram, X**, dan aplikasi lain.
- Tombol bagikan di halaman detail produk memakai lembar yang sama, jadi QR-nya langsung membuka produk tersebut.

- **Nama aplikasi di layar HP**: atur di **Bagian → Profil & Logo → Nama aplikasi di layar HP** (bawaan "Emas Kota Bali").
  - Sebelumnya nama terpotong menjadi "Emas Kota Ba" oleh template. Sekarang nama dikirim utuh.
  - Beberapa launcher Android tetap memotong nama panjang. Bila masih terpotong, pakai nama yang lebih pendek (mis. "Kota Bali").
  - Untuk aplikasi yang **sudah terpasang**, hapus dulu ikon lama lalu pasang ulang agar nama baru terbaca.

## 10. Lisensi template (Nabire Kreatif)

- Domain yang belum berlisensi tampil dalam **mode DEMO**: hanya ada **pita merah "DEMO"** di pojok kiri atas. Tidak ada bilah melayang di bawah, dan semua fitur tetap berjalan.
- Cara aktivasi (pilih salah satu):
  - ketuk **pita DEMO**;
  - buka **`domain-anda/#key`**;
  - dasbor → menu **Lisensi**.

  Lalu masukkan kode `NK-XXXX-XXXX`. Cukup **sekali per domain**; setelah itu semua pengunjung tidak diminta kode lagi. Panel aktivasi juga punya tautan **Beli lisensi** ke halaman produk di Nabire Kreatif.
- Setelah berlisensi, **pita DEMO hilang** dan footer menampilkan **"© 2026 <nama usaha>. by Nabirekreatif.com"** (nama usaha diambil dari profil di dasbor). Footer ini dijaga: bila disembunyikan atau teksnya diubah, halaman terkunci.
- **Jangan** mengubah berkas selain `js/config.js`, dan jangan menghapus atau menutupi hak cipta. Halaman akan **terkunci**.
- Wajib HTTPS (GitHub Pages sudah HTTPS). Bila memakai Cloudflare, matikan *Auto Minify* dan *Rocket Loader* karena bisa memicu kunci yang keliru.
- Pencabutan lisensi berlaku paling lambat 24 jam kemudian.

## 11. Pasang di Blogger (domain blog sendiri)

Tema Blogger hanya "pintu masuk". File aplikasi (CSS, JS, gambar, `nk-license-blogger.js`) tetap di GitHub Pages, jadi langkah 3 (unggah ke GitHub) harus sudah selesai.

1. **GitHub dulu**: pastikan isi ZIP terbaru sudah di-*push*, termasuk `nk-license-blogger.js`. Buka `https://USERNAME.github.io/REPO/nk-license-blogger.js` di browser untuk memastikan berkasnya ada.
2. **Cadangkan tema lama**: Blogger → **Tema** → ▾ → **Cadangkan**.
3. Buka `tema-tokoemas.xml` dengan Notepad. Di bagian paling atas ada blok **PENGATURAN TEMA**, satu-satunya bagian yang boleh diubah:
   - `GAS_URL`: URL `/exec` Apps Script Anda (sudah terisi).
   - `NAMA_USAHA`: nama usaha untuk hak cipta saat berlisensi.
   - `ASET`: alamat GitHub Pages, diakhiri `/` (bawaan `https://nabirekreatif.github.io/biolink/`).
   - `VERSI`: **naikkan angkanya** (7 → 8 → 9 …) setiap kali Anda memperbarui file di GitHub, supaya pengunjung tidak memakai file lama dari cache.
4. Blogger → **Tema** → ▾ → **Edit HTML** → hapus semua → tempel isi `tema-tokoemas.xml` → **Simpan**. (Atau ▾ → **Pulihkan** → unggah berkas XML.)
5. **Judul & deskripsi** situs diatur di Blogger → **Setelan** (Judul, Deskripsi, Deskripsi penelusuran), bukan di kode.
6. **Halaman admin**: Blogger → **Halaman** → **Halaman baru** → judul `admin` → isi kosong → **Publikasikan**. Alamatnya menjadi `domainblog/p/admin.html` dan otomatis menampilkan dasbor.
7. Buka blog di **jendela Incognito**. Beranda menampilkan Link Bio; halaman `/p/...` dan postingan lain tetap menampilkan isi Blogger biasa.
8. **Lisensi**: domain blog tampil dalam mode **DEMO** sampai diaktifkan lewat `domainblog/#key` atau pita DEMO. Jangan mengedit file di GitHub selain `js/config.js`: segel tetap diperiksa, jadi file yang diubah membuat halaman terkunci.

Catatan Blogger:
- Tombol **Install (PWA)** bekerja di domain blog. Manifest dibuat otomatis untuk domain blog Anda dan ikonnya mengikuti logo di dasbor.
- *Service worker* (mode offline) tidak tersedia di Blogger karena Blogger tidak bisa menyimpan berkas `sw.js`. Aplikasi tetap bisa dipasang dan berjalan normal saat online.
- Setiap kali file di GitHub diperbarui: push ke GitHub → naikkan `VERSI` di tema → Simpan tema.

---

## Update dari versi sebelumnya

**Dari edisi Kuliner/HP ke edisi Toko Emas**:
1. Disarankan proyek Apps Script & spreadsheet **baru**: tempel kelima berkas `.gs` (termasuk **`Emas.gs` baru**), jalankan `setupAplikasi()`. Paket toko emas terpasang otomatis.
2. Memakai spreadsheet lama: tempel kelima berkas `.gs`, jalankan `setupAplikasi()` (menambah sheet Kadar, HargaLog, Member, Sewa, LelangKlaim & kolom produk baru) lalu **`gantiKeDataEmas()`**.
3. Deploy **Versi baru**, unggah isi ZIP ke GitHub (tetap pakai `js/config.js` lama yang berisi URL), push. Blogger: pasang `tema-tokoemas.xml`.

**Toko Emas v5** (notifikasi WA lebih andal + kirim manual, poster & widget halaman, Flash Sale dirapikan):
1. Tempel ulang **`Kode.gs`**, **`Emas.gs`**, **`Notifikasi.gs`** → Deploy → **Versi baru**. Unggah ZIP baru ke GitHub (pertahankan `js/config.js`), pasang tema Blogger `?v=14`.
2. Buka dasbor → **WhatsApp & Notifikasi**. Panel **Kesehatan notifikasi** di paling atas menunjukkan apa yang belum siap: token Fonnte, saklar WhatsApp, perangkat terhubung, **pemicu otomatis** (tekan *Pasang sekarang*), pesan tertunda/gagal beserta alasannya. Semua harus hijau agar member menerima WA otomatis.
3. Notifikasi kini **langsung terkirim** saat kejadian (tidak lagi menunggu pemicu 1 menit). Bila WA otomatis belum aktif/gagal, pakai tombol **Kabari / Kode / Kirim kode** (WhatsApp terbuka dengan pesan siap kirim) di menu Sewa, Flash Sale, Lelang Live, dan Member.
4. Kode Flash Sale baru berawalan **FS-** (kode lama LLG- tetap bisa ditukar). Kode **LLG-** khusus pemenang Lelang Live.
5. Dasbor → **Poster & Widget Halaman**: widget harga emas di Katalog (on/off + pilih kadar), banner Flash Sale ringkas di Katalog/Galeri (on/off), dan poster di atas tiap halaman fitur (Katalog, Harga Emas, Jual Emas, Galeri, Flash Sale, Lelang Live, Layanan, Lokasi, Favorit, Akun).

**Toko Emas v4** (Lelang Live, Flash Sale dengan booking, banner event baru, galeri rapi di HP, notifikasi di lonceng):
1. Tempel ulang **`Kode.gs`**, **`Emas.gs`** dan **`Notifikasi.gs`**, jalankan **`setupAplikasi()`** (menambah sheet **LelangLive** & **Tawaran**, kolom `blacklist` di Member), lalu Deploy → **Versi baru**.
2. Jalankan **`pasangTrigger()`** sekali (bila belum) agar lelang ditutup & pemenang dikirimi kode otomatis.
3. Unggah isi ZIP baru ke GitHub (pertahankan `js/config.js` Anda). Blogger: pasang tema baru (`?v=13`). Menu lama **Lelang** di link bio kini mengarah ke **Lelang Live**; Flash Sale punya menu sendiri (Tampilan → Menu, bisa diaktifkan).
4. Teks halaman harga: bila Anda pernah mengubah keterangan harga, buka Tampilan → Harga Emas dan hapus tulisan "di Emas Kota Bali" (sistem juga menyembunyikannya otomatis).

**Toko Emas v3** (watermark otomatis, Favorit, galeri Ready Stock/Perak/baru, menu Backend & Database, kartu lelang ringkas):
1. Tempel ulang **`Kode.gs`** dan **`Emas.gs`**, jalankan **`setupAplikasi()`** (menambah kolom `wm` di Produk), lalu Deploy → **Versi baru**.
2. Contoh galeri Ready Stock & Perak ikut terisi bila menjalankan `gantiKeDataEmas()`. Tanpa itu, galeri tersebut tetap ada tetapi kosong sampai Anda mengunggah foto.
3. Jalankan **`pasangTrigger()`** sekali agar backup otomatis ikut berjalan, lalu unggah ZIP baru ke GitHub.

**Toko Emas v2** (menu kategori ala aplikasi, Galeri Custom & PO, reset sandi via email, suara notifikasi, bagikan foto):
1. Tempel ulang **`Kode.gs`** dan **`Emas.gs`**, jalankan **`setupAplikasi()`** (menambah sheet **Galeri** + 2 bagian baru), lalu Deploy → **Versi baru**.
2. Data contoh galeri & menu kategori: jalankan **`gantiKeDataEmas()`** (produk & pengaturan diganti contoh). Tanpa itu, menu kategori memakai susunan bawaan dan galeri kosong sampai Anda mengunggah foto.
3. Unggah isi ZIP baru ke GitHub (pertahankan `js/config.js` Anda). Layar pembuka tidak lagi memakai logo/cache aplikasi lain di domain yang sama (mis. Acc Cell): cache lama dibersihkan otomatis.

## Kecepatan & PageSpeed

- Pengunjung yang membuka ulang dalam **2 menit** langsung melihat tampilan terakhir. Lebih dari itu, halaman **menunggu data terbaru** (maks. 3 detik) sehingga hasil edit dasbor (gambar hero, pop-up, teks) langsung tampil, **tanpa tampilan lama atau data contoh muncul dulu**. Bila server lambat > 3 detik, tampilan terakhir dipakai sementara. Pop-up promo hanya dibuka dari data terbaru.
- Atur lewat `CACHE_SEGAR_DETIK` di `js/config.js` (atau di tema Blogger): `0` = selalu tunggu data terbaru.
- Pengunjung **pertama kali** melihat kerangka abu-abu netral sampai data dari Apps Script datang. Header/navigasi bawaan tidak lagi ditampilkan lalu dihilangkan, sehingga halaman tidak "melompat".
- Batas yang tersisa: kunjungan pertama tetap menunggu jawaban Apps Script (biasanya 1–3 detik, lebih lama bila server baru "bangun"). Ini sifat layanan gratis Google, bukan kode template.
- Nilai PageSpeed bervariasi tiap pengujian. Uji 2–3 kali dan lihat rata-ratanya.

## Pemecahan masalah

| Gejala | Penyebab & solusi |
|---|---|
| Situs 404 di GitHub Pages | `index.html` tidak berada di root repo. Ulangi `git init` dari folder yang berisi `index.html`. |
| "Data belum bisa dimuat" | `GAS_URL` salah, deploy belum *Versi baru*, atau akses deploy bukan "Siapa saja". |
| "Backend belum disiapkan" | Jalankan `setupAplikasi()`. |
| Login terkunci 15 menit | Lima kali salah sandi. Tunggu, atau superadmin melakukan reset. |
| Gambar gagal diunggah | Kebijakan Google Workspace melarang berbagi publik. Minta admin Workspace mengizinkan berbagi "Siapa saja yang memiliki link". |
| WA tidak terkirim | Cek token dan status perangkat Fonnte (harus `connect`), lihat tab **Antrean**, lalu jalankan `pasangTrigger()`. |
| Tampilan/data lama sempat muncul lalu berubah | Perbarui ke v7. Di Blogger: pasang `tema-tokoemas.xml` baru (tema lama memakai skrip awal versi lama) dan naikkan `VERSI`. |
| Simpan produk gagal: "Kategori harus salah satu dari: HP Baru…" | Backend masih versi lama. Tempel `Kode.gs` v9 lalu Deploy → Versi baru. |
| Tombol Install tidak muncul / tidak bereaksi | Perbarui ke v7. Chrome hanya menawarkan pemasangan bila manifest valid dan aplikasi belum terpasang; bila prompt tidak tersedia, tombol menampilkan petunjuk pemasangan manual. Coba di Chrome (bukan browser bawaan WhatsApp/Instagram). |
| Di Blogger tampil teks polos / terkunci | `nk-license-blogger.js` belum ada di GitHub, atau `ASET` di tema salah. Buka URL berkas itu di browser, lalu naikkan `VERSI`. |
| Warna/teks baru belum tampil | Tunggu ±1 menit atau muat ulang halaman. Pastikan backend sudah *Versi baru* v4. |
| Harga emas tidak berubah otomatis | Cek **Harga Emas → Sumber = Otomatis**, API key tersimpan, dan pesan galat di kartu "Update terakhir". Kuota GoldAPI habis → pakai interval lebih jarang atau harga manual. Pastikan pemicu aktif (`pasangTrigger`). |
| Lupa sandi member: "hubungi admin" | Notifikasi WhatsApp (Fonnte) belum aktif. Aktifkan di menu WhatsApp & Notifikasi, atau superadmin → **Member → Reset sandi** (sandi sementara tampil di layar admin). |
| Layar pembuka masih menampilkan logo usaha lain | Muat ulang sekali (cache lama otomatis dihapus). Bila tetap, Chrome → Setelan situs → Hapus data, atau buka di jendela Samaran. |
| Email reset sandi tidak datang | Cek folder Spam/Promosi. Pastikan email akun terisi di **Admin & Akses**. Kuota MailApp Gmail biasa ±100 email/hari. |
| Halaman terkunci "Template tidak berlisensi" | Ada berkas tersegel yang diubah, atau hosting mengubah berkas. Unggah ulang berkas asli. |

## Batasan yang perlu diketahui

- **Foto produk contoh** berupa ilustrasi di `assets/contoh/`. Ganti dengan foto asli perhiasan dari dasbor.
- **GoldAPI.io paket gratis** dibatasi jumlah permintaan per bulan; "realtime" sebenarnya = setiap 1–24 jam sesuai pengaturan. Harga dari API adalah harga pasar dunia (XAU/IDR), bukan harga Antam/butik — atur selisih toko lewat markup & potongan per kadar, atau mode manual per kadar.
- Status "sudah mengikuti media sosial" diisi sendiri oleh member (tidak bisa dicek otomatis ke Instagram); admin memverifikasi saat menyetujui lelang.
- Pengiriman WA bergantung pada status perangkat Fonnte. Balasan WA dari pelanggan tidak tercatat otomatis.
- Pencabutan lisensi berlaku paling lambat 24 jam kemudian. Proteksi di browser mempersulit pembajakan, tetapi tidak 100% anti-bobol.
