# Bot Otomatisasi YouTube Shorts -Niche Quotes

Bot Node.js ini dirancang untuk membuat dan mengupload video YouTube Shorts secara otomatis berdasarkan daftar kutipan (quotes) yang Anda sediakan.

---

## ✨ Fitur Utama

-   **Konten dari Teks:** Mengambil kutipan secara otomatis dari file `quotes.txt`.
-   **Visual Dinamis:** Mencari footage video yang relevan secara otomatis dari Pexels.
-   **Metadata AI:** Menggunakan Gemini AI untuk membuat judul, deskripsi, dan tag yang SEO-friendly untuk setiap video.
-   **Video Editing Otomatis:** Menggabungkan footage, musik latar, dan teks kutipan menjadi video 9:16 menggunakan FFmpeg dan ImageMagick.
-   **Upload Resmi & Aman:** Menggunakan **YouTube Data API v3** dengan otorisasi **OAuth 2.0**, yang merupakan cara paling aman dan andal.
-   **Otomatisasi Penuh:** Dirancang untuk berjalan secara terjadwal dengan GitHub Actions.

---

## ⚙️ Panduan Penyiapan Lengkap

Ikuti langkah-langkah ini dari awal hingga akhir untuk menjalankan bot.

### Langkah 1: Instalasi Lokal

Pertama, siapkan proyek di komputer Anda.

1.  **Prasyarat**: Pastikan [Node.js](https://nodejs.org/) (versi 20.x atau lebih baru) dan [Git](https://git-scm.com/) sudah terinstal di komputer Anda.
2.  **Clone Repositori**: Unduh proyek dari GitHub ke komputer Anda.
    ```bash
    git clone [URL_REPOSITORI_ANDA]
    cd [NAMA_FOLDER_REPOSITORI]
    ```
3.  **Instal Dependensi**: Perintah ini akan menginstal semua library yang dibutuhkan oleh bot.
    ```bash
    npm install
    ```
4.  **Siapkan Konten**:
    -   Isi file `quotes.txt` dengan beberapa kutipan (satu kutipan per baris).
    -   Masukkan file font `.ttf` atau `.otf` Anda ke dalam folder `font/`.
    -   Masukkan file audio `.mp3` ke dalam folder `music/` (dan subfolder jika perlu, sesuaikan path di `config.json`).

### Langkah 2: Otorisasi YouTube API (Proses Satu Kali)

Ini adalah bagian terpenting untuk memberikan izin kepada bot agar bisa mengupload ke channel Anda.

**A. Dapatkan Kunci `client_secret.json` dari Google Cloud**

1.  Buka **Google Cloud Console**: [https://console.cloud.google.com/](https://console.cloud.google.com/)
2.  Buat **Proyek Baru** atau pilih yang sudah ada.
3.  Di bar pencarian, cari dan **ENABLE** (Aktifkan) API **"YouTube Data API v3"**.
4.  Setelah API aktif, pergi ke menu **APIs & Services > OAuth consent screen**.
    -   **User Type**: Pilih **External** -> **CREATE**.
    -   Isi kolom wajib: **App name** (misal: `Bot Kutipan Saya`), **User support email**, dan **Developer contact information** dengan email Anda. Klik **SAVE AND CONTINUE** terus hingga selesai.
5.  Kembali ke menu **APIs & Services > Credentials**.
    -   Klik **+ CREATE CREDENTIALS** -> **OAuth client ID**.
    -   **Application type**: Pilih **Desktop app**.
    -   Klik **CREATE**.
    -   Sebuah pop-up akan muncul. Klik tombol **DOWNLOAD JSON**.
    -   Ubah nama file yang diunduh menjadi **`client_secret.json`** dan letakkan di folder utama proyek Anda.

**B. Dapatkan Kunci `token.json` di Komputer Anda**

1.  **Buat File Otorisasi (`authorize.js`)**
    -   Di folder proyek utama Anda, buat sebuah file baru dan beri nama **`authorize.js`**.
    -   Salin dan tempel **seluruh kode** di bawah ini ke dalam file `authorize.js` tersebut:

    ```javascript
    // File: authorize.js
    // Skrip ini hanya untuk dijalankan satu kali di komputer lokal
    // untuk menghasilkan file token.json

    import { google } from 'googleapis';
    import { authenticate } from '@google-cloud/local-auth';
    import fs from 'fs/promises';
    import path from 'path';
    import process from 'process';

    const log = (message) => console.log(`[AUTH] ${message}`);

    const __dirname = path.dirname(new URL(import.meta.url).pathname.substring(1));
    const CREDENTIALS_PATH = path.join(__dirname, 'client_secret.json');
    const TOKEN_PATH = path.join(__dirname, 'token.json');
    const SCOPES = ['[https://www.googleapis.com/auth/youtube.upload](https://www.googleapis.com/auth/youtube.upload)'];

    async function saveCredentials(client) {
        const content = await fs.readFile(CREDENTIALS_PATH, 'utf-8');
        const keys = JSON.parse(content);
        const key = keys.installed || keys.web;
        const payload = JSON.stringify({
            type: 'authorized_user',
            client_id: key.client_id,
            client_secret: key.client_secret,
            refresh_token: client.credentials.refresh_token,
        });
        await fs.writeFile(TOKEN_PATH, payload);
    }

    async function runAuthorization() {
        try {
            log("Memulai alur otorisasi baru...");
            const client = await authenticate({
                scopes: SCOPES,
                keyfilePath: CREDENTIALS_PATH,
            });
            if (client.credentials) {
                await saveCredentials(client);
                log("\n✅ Otorisasi berhasil! File 'token.json' telah dibuat.");
                log("Anda sekarang bisa menyalin isi 'client_secret.json' dan 'token.json' ke GitHub Secrets.");
            }
        } catch (e) {
            console.error("Gagal melakukan otorisasi:", e);
        }
    }

    runAuthorization();
    ```
2.  **Jalankan Skrip**: Di terminal Anda (pastikan berada di dalam folder proyek), jalankan:
    ```bash
    node authorize.js
    ```
3.  **Ikuti Alur Login di Browser**:
    -   Sebuah jendela browser akan terbuka secara otomatis.
    -   **Login** ke akun Google/YouTube Anda.
    -   Jika muncul layar "Google hasn't verified this app", klik **"Advanced"** lalu **"Go to [nama aplikasi Anda] (unsafe)"**.
    -   Klik **"Allow"** atau **"Izinkan"** pada layar persetujuan.
    -   Setelah berhasil, Anda bisa menutup tab browser tersebut.
4.  **Verifikasi**: Sebuah file baru bernama **`token.json`** akan muncul di folder proyek Anda.

### Langkah 3: Konfigurasi GitHub Secrets dan Variables

## 🔑 Penyiapan Lisensi, Secrets, dan Variables

Ini adalah langkah terakhir dan paling penting untuk membuat bot berjalan otomatis. Di sini kita akan menyimpan semua kunci rahasia dan konfigurasi di GitHub.

### 1. Dapatkan Lisensi Anda (Wajib)

Bot ini memerlukan kunci lisensi (berupa email yang terdaftar) untuk dapat berfungsi. Tanpa lisensi yang valid, eksekusi akan otomatis berhenti.

-   **Link Pembelian Lisensi:**
    **[https://lynk.id/botxautomation/17ege0lk6607/](https://lynk.id/botxautomation/17ege0lk6607/)**

Setelah Anda memiliki lisensi, lanjutkan ke langkah berikutnya.

### 2. Konfigurasi di Pengaturan Repositori GitHub

Buka repositori GitHub Anda, lalu pergi ke `Settings > Secrets and variables > Actions`.

#### Pada tab "Secrets"

Klik `New repository secret` untuk membuat **semua** *secret* di bawah ini. Pastikan penamaan **sama persis**.

| Nama Secret | Sumber Nilai / Keterangan |
| :--- | :--- |
| `GOOGLE_CLIENT_SECRET_JSON` | Salin **seluruh isi** file `client_secret.json` Anda dan tempel di sini. |
| `GOOGLE_TOKEN_JSON` | Salin **seluruh isi** file `token.json` Anda dan tempel di sini. |
| `PEXELS_API_KEY` | API Key dari akun Pexels Anda. |
| `GEMINI_API_KEY` | API Key dari Google AI Studio. |
| `BOT_LICENSE_EMAIL` | Isi dengan alamat **email** yang Anda gunakan untuk membeli lisensi. |

3.  **Pada tab `Variables`**, klik `New repository variable` untuk membuat *variable* ini:

| Nama Variable | Contoh Nilai |
| :--- | :--- |
| `CHANNEL_NAME`| `Kutipan Harian` |

---

## 🚀 Menjalankan Bot

Setelah semua penyiapan selesai, bot akan berjalan secara otomatis sesuai jadwal yang ada di file `.github/workflows/youtube_bot.yml`.

Anda juga bisa menjalankannya secara manual:
1.  Buka tab **"Actions"** di repositori GitHub Anda.
2.  Pilih workflow di sebelah kiri.
3.  Klik tombol **"Run workflow"**.
