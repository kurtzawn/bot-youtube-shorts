# Bot Otomatisasi YouTube Shorts

Bot Node.js ini dirancang untuk membuat dan mengupload video YouTube Shorts secara otomatis. Bot ini memiliki dua mode operasi utama yang dapat diatur melalui file konfigurasi.

---

## ✨ Fitur Utama

-   **Dua Mode Operasi:**
    -   **Mode Berita:** Mengambil topik yang sedang tren dari Google Trends, melakukan riset di Google News, lalu membuat video berita lengkap dengan suara narasi (TTS) dan footage yang relevan.
    -   **Mode Kutipan:** Membuat video dari daftar kutipan yang sudah Anda siapkan di file teks.
-   **Pembuatan Konten AI:** Menggunakan Gemini AI untuk membuat naskah berita, judul, deskripsi, dan tag yang SEO-friendly.
-   **Text-to-Speech (TTS) Gratis:** Menghasilkan suara narator Bahasa Indonesia yang natural untuk video berita dengan mengotomatisasi Google Translate, tanpa memerlukan API berbayar.
-   **Video Editing Otomatis:** Menggabungkan beberapa klip video (montage), musik latar, suara narator, dan teks overlay secara dinamis menggunakan FFmpeg dan ImageMagick.
-   **Upload Resmi & Aman:** Menggunakan **YouTube Data API v3** dengan otorisasi **OAuth 2.0**, yang merupakan cara paling aman dan andal.
-   **Konfigurasi Fleksibel:** Semua aspek bot dapat diatur melalui file `config.json` dan `config2.json`.
-   **Otomatisasi Penuh:** Dirancang untuk berjalan secara terjadwal dengan GitHub Actions.

---

## 📂 Struktur Proyek

-   `index.js`: Titik masuk untuk menjalankan **Bot Kutipan**.
-   `news.js`: Titik masuk untuk menjalankan **Bot Berita**.
-   `lib.js`: Berisi fungsi-fungsi umum yang dipakai bersama (otorisasi, upload).
-   `package.json`: Daftar semua library Node.js yang dibutuhkan.
-   `config.json`: Pengaturan dasar/bersama.
-   `config2.json`: Pengaturan spesifik untuk **Bot Berita**.
-   `quotes.txt`: Sumber teks untuk **Bot Kutipan**.
-   `font/`: Folder untuk menyimpan file font kustom Anda (misal: `Oswald-Bold.ttf`).
-   `music/`: Folder utama untuk musik. Di dalamnya bisa ada subfolder seperti `news_tracks/` atau `inspirational/`.
-   `client_secret.json`: Kunci rahasia dari Google Cloud (Hanya ada di komputer lokal Anda).
-   `token.json`: Token otorisasi yang dibuat setelah login pertama (Hanya ada di komputer lokal Anda).
-   `.gitignore`: Mencegah file-file rahasia terunggah ke GitHub.

---

## ⚙️ Panduan Instalasi dan Penyiapan

### Prasyarat
-   [Node.js](https://nodejs.org/) (versi 20.x atau lebih baru)
-   [Git](https://git-scm.com/)

### Langkah-langkah Instalasi Lokal
1.  **Clone Repositori**
    ```bash
    git clone [URL_REPOSITORI_ANDA]
    cd [NAMA_FOLDER_REPOSITORI]
    ```
2.  **Instal Dependensi**
    Jalankan perintah ini di terminal. Perintah ini akan membaca `package.json` dan menginstal semua library yang dibutuhkan, sekaligus membuat file `package-lock.json`.
    ```bash
    npm install
    ```
3.  **Siapkan File Konten**
    -   Isi file `quotes.txt` dengan beberapa kutipan, satu per baris.
    -   Masukkan file font `.ttf` atau `.otf` Anda ke dalam folder `font/`.
    -   Masukkan file audio `.mp3` ke dalam folder `music/` (dan subfolder `news_tracks/` jika perlu).

4.  **Lakukan Otorisasi YouTube API**
    Ikuti panduan otorisasi di bawah ini dengan teliti. Ini adalah proses **satu kali** yang dilakukan di komputer Anda.

---

## 🔑 Panduan Otorisasi YouTube API (Satu Kali)

Proses ini bertujuan untuk mendapatkan file `client_secret.json` dan `token.json`.

### Bagian 1: Mendapatkan `client_secret.json` dari Google Cloud

1.  **Buka Google Cloud Console**: [https://console.cloud.google.com/](https://console.cloud.google.com/)
2.  **Buat Proyek Baru** atau pilih proyek yang sudah ada.
3.  **Aktifkan API**: Cari dan **ENABLE** API berikut:
    -   `YouTube Data API v3`
    -   `Cloud Text-to-Speech API` (diperlukan untuk fitur suara narator berita).
4.  **Konfigurasi OAuth Consent Screen**:
    -   Pergi ke **APIs & Services > OAuth consent screen**.
    -   Pilih **External** dan klik **CREATE**.
    -   Isi kolom yang wajib: **App name** (misal: "Bot Shorts Saya"), **User support email**, dan **Developer contact information**. Klik **SAVE AND CONTINUE** hingga selesai.
5.  **Buat Kredensial**:
    -   Pergi ke **APIs & Services > Credentials**.
    -   Klik **+ CREATE CREDENTIALS** -> **OAuth client ID**.
    -   **Application type**: Pilih **Desktop app**.
    -   Klik **CREATE**.
    -   Sebuah pop-up akan muncul. Klik tombol **DOWNLOAD JSON**.
    -   Ubah nama file yang diunduh menjadi **`client_secret.json`** dan letakkan di folder utama proyek Anda.

### Bagian 2: Mendapatkan `token.json` di Komputer Anda

1.  **Buat File Otorisasi**: Buat file baru bernama `authorize.js` di folder proyek Anda dan isi dengan kode berikut:
    ```javascript
    // authorize.js
    import { authorize } from './lib.js';
    console.log("Memulai proses otorisasi satu kali...");
    authorize().then(() => {
        console.log("\n✅ Otorisasi berhasil! File 'token.json' telah dibuat di folder Anda.");
    }).catch(console.error);
    ```
2.  **Jalankan Skrip**: Pastikan `client_secret.json` sudah ada di folder Anda. Lalu jalankan perintah ini di terminal:
    ```bash
    node authorize.js
    ```
3.  **Ikuti Alur Login di Browser**:
    -   Sebuah **jendela browser akan terbuka**.
    -   **Login** ke akun Google/YouTube Anda.
    -   Jika muncul layar "Google hasn't verified this app", klik **"Advanced"** lalu **"Go to [nama aplikasi Anda] (unsafe)"**.
    -   Klik **"Allow"** atau **"Izinkan"** pada layar persetujuan.
    -   Setelah berhasil, Anda bisa menutup tab browser tersebut.
4.  **Verifikasi**: Sebuah file baru bernama **`token.json`** akan muncul di folder proyek Anda.

### Bagian 3: Simpan Kredensial ke GitHub Secrets

1.  Buka repositori GitHub Anda, pergi ke `Settings > Secrets and variables > Actions`.
2.  Klik tab **`Secrets`**.
3.  Buat **semua** *secret* yang dibutuhkan di bawah ini:
    -   **`GOOGLE_CLIENT_SECRET_JSON`**: Salin seluruh isi file `client_secret.json` dan tempel di sini.
    -   **`GOOGLE_TOKEN_JSON`**: Salin seluruh isi file `token.json` dan tempel di sini.
    -   **`PEXELS_API_KEY`**: Isi dengan API key Pexels Anda.
    -   **`GEMINI_API_KEY`**: Isi dengan API key Gemini AI Anda.
    -   **`BOT_LICENSE_EMAIL`**: (Opsional) Isi dengan email lisensi Anda jika menggunakan sistem validasi lisensi.
4.  Klik tab **`Variables`** di sebelahnya.
5.  Buat **satu** *variable* baru:
    -   **`CHANNEL_NAME`**: Isi dengan nama persis channel YouTube Anda.

---

## 🚀 Menjalankan Bot

### Menjalankan di Komputer Lokal
Anda bisa menguji bot di komputer Anda dengan perintah berikut di terminal:
```bash
# Menjalankan bot kutipan
node index.js

# Menjalankan bot berita
node news.js
```

### Menjalankan Otomatis dengan GitHub Actions
Workflow sudah diatur untuk berjalan sesuai jadwal atau bisa juga dipicu secara manual.
1.  Buka tab **"Actions"** di repositori GitHub Anda.
2.  Pilih workflow **"YouTube Shorts Bot Suite"**.
3.  Klik **"Run workflow"**.
4.  Sekarang akan muncul **dropdown menu baru** bernama "Pilih bot yang ingin dijalankan". Pilih `news` atau `quotes`.
5.  Klik tombol hijau **"Run workflow"**.
