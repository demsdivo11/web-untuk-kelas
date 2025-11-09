# Kelas X-5 Website

Website kelas yang dibangun dengan **React + Vite + Tailwind CSS** untuk kebutuhan confess, galeri kenangan, dan dashboard admin. Aplikasi ini terintegrasi dengan **Supabase** untuk menyimpan data confess, galeri, daftar siswa, serta profil kelas.

---

## 🚀 Cara Install & Menjalankan

> Pastikan Node.js 18+ sudah terpasang.

```bash
# 1. Clone repositori
git clone <repo-url>
cd kelas-sepuluh-lima

# 2. Install dependency
npm install

# 3. Buat file .env (lihat contoh pada README)
cp .env.example .env
# isi VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, dll.

# 4. Jalankan mode pengembangan
npm run dev
# buka http://localhost:5173

# 5. Build produksi (opsional)
npm run build
npm run preview
```

### Variabel Lingkungan

Tambahkan pada `.env`:

```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
VITE_SPOTIFY_CLIENT_ID=...
VITE_SPOTIFY_CLIENT_SECRET=...
```

Untuk confess, Anda perlu deploy Supabase Edge Function (`supabase/functions/confess`). Pastikan secrets `PROJECT_URL` dan `SERVICE_ROLE_KEY` sudah di-set sebelum deploy.

---

## 📦 Backend Supabase

1. **Tabel `gallery_photos`**  
   Menyimpan foto (title, description, image_url, thumbnail_url, uploaded_by).
2. **Bucket Storage `gallery`**  
   Folder `photos/` dan `thumbnails/`. Pastikan policy `insert/select/delete` diizinkan untuk `anon` (atau role khusus).
3. **Tabel `confessions`**  
   Dipakai Edge Function untuk menyimpan pesan confess.
4. **Tabel `students`**  
   Kolom rekomendasi: `id uuid`, `full_name text`, `nickname text`, `role_title text`, `role_description text`, `is_lead boolean`, `order_index int`.
5. **Tabel `class_profile`**  
   Menyimpan informasi kelas (grade/class label, jumlah siswa, kontak, link WA/IG, dst.).
6. **Tabel `admin_users`**  
   Minimal kolom `id`, `username`, `last_login`. Password dicek sederhana (`admin123` default).

Untuk setiap tabel dengan RLS aktif, tambahkan policy `select`/`insert` sesuai kebutuhan aplikasi (lihat dokumentasi Supabase).

---

## ✨ Fitur Utama

### Halaman Umum
- **Hero dinamis** – nama kelas, jumlah siswa, deskripsi otomatis mengikuti data dari dashboard admin (`class_profile`).
- **Confess Page** – form confess dengan integrasi pencarian lagu Spotify (preview cover, link ke Spotify). Pesan dikirim via Supabase Edge Function.
- **Gallery Page** – menampilkan foto dari bucket Supabase, lengkap dengan modal detail dan thumbnail.
- **Organizational Structure** – daftar pengurus + siswa diambil dari tabel `students`.
- **Contact Section & Footer** – informasi sekolah, kontak pengurus, dan CTA kolaborasi.

### Dashboard Admin
- **Login sederhana** – username diambil dari tabel `admin_users`, password default `admin123`.
- **Kelola Galeri** – upload (compress & resize), lihat, hapus, dan edit title/deskripsi foto. Upload thumbnail otomatis.
- **Dashboard Confess** – daftar konfesi dengan highlight lagu Spotify (cover, link). Ada refresh dan status loading/error.
- **Daftar Siswa** – fetch dari tabel `students`, bisa menambahkan siswa baru lewat modal.
- **Info Kelas** – form untuk mengatur grade, label kelas, jumlah siswa, kontak, link WA/IG. Nilai ini dipakai pada hero & brand.

### Edge Function (Supabase)
- Folder `supabase/functions/confess` berisi function untuk menerima confess (POST) dan menampilkan daftar confess (GET). Pastikan deploy dengan `supabase functions deploy confess --project-ref <ref>`.

---

## 🧱 Struktur Folder Singkat

```
src/
├── pages/                # Home, Confess, Gallery, Admin
├── components/           # Hero, Navigation, Contact, dll.
├── services/             # spotifyApi, confessApi
├── lib/                  # supabase client
└── hooks/                # useClassProfile (cache data kelas)
```

---

## 📄 Lisensi

Tidak ada lisensi khusus; sesuaikan dengan kebutuhan internal kelas. Anjeun bebas memodifikasi untuk pengembangan lanjut.

---

Jika terjadi error (misal 401/500 dari Supabase), cek:
1. Variable `.env` (VITE_SUPABASE_*, Spotify) sudah diisi benar.
2. Policy RLS di masing-masing tabel/bucket sudah mengizinkan operasi `anon`.
3. Edge function `confess` sudah di-deploy dan secrets `PROJECT_URL`/`SERVICE_ROLE_KEY` terset.

Selamat membangun rumah digital kelas kalian! 🎓
