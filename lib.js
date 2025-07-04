import { google } from 'googleapis';
import { authenticate } from '@google-cloud/local-auth';
import fs from 'fs/promises';
import path from 'path';

// Helper sederhana untuk logging
const log = (message, level = 'INFO') => console.log(`[${new Date().toISOString()}] - ${level} - ${message}`);

// Konfigurasi path
const __dirname = path.dirname(new URL(import.meta.url).pathname.substring(1)); // Disesuaikan untuk Windows
const CREDENTIALS_PATH = path.join(__dirname, 'client_secret.json');
const TOKEN_PATH = path.join(__dirname, 'token.json');
const SCOPES = ['https://www.googleapis.com/auth/youtube.upload'];

/**
 * Membaca token yang sudah ada dari file.
 */
async function loadSavedCredentialsIfExist() {
    try {
        const content = await fs.readFile(TOKEN_PATH);
        const credentials = JSON.parse(content);
        return google.auth.fromJSON(credentials);
    } catch (err) {
        return null;
    }
}

/**
 * Menyimpan kredensial (terutama refresh token) ke file token.json.
 */
async function saveCredentials(client) {
    const content = await fs.readFile(CREDENTIALS_PATH);
    const keys = JSON.parse(content);
    const key = keys.installed || keys.web;
    const payload = JSON.stringify({
        type: 'authorized_user',
        client_id: key.client_id,
        client_secret: key.client_secret,
        refresh_token: client.credentials.refresh_token,
    });
    await fs.writeFile(TOKEN_PATH, payload);
    log(`Token otorisasi berhasil disimpan di ${TOKEN_PATH}`);
}

/**
 * Fungsi utama untuk otorisasi.
 * Akan membuka browser untuk login jika token.json tidak ada.
 */
export async function authorize() {
    let client = await loadSavedCredentialsIfExist();
    if (client) {
        log("Otorisasi dari file token.json yang ada berhasil.");
        return client;
    }
    
    log("File token.json tidak ditemukan, memulai alur otorisasi baru...");
    client = await authenticate({
        scopes: SCOPES,
        keyfilePath: CREDENTIALS_PATH,
    });

    if (client.credentials) {
        await saveCredentials(client);
    }
    return client;
}

/**
 * Fungsi untuk mengupload video ke YouTube.
 */
export async function uploadVideo(auth, videoPath, metadata, fallback_text) {
    log("Memulai upload video ke YouTube...");
    const service = google.youtube('v3');
    const title = metadata.title || fallback_text.substring(0, 99);
    const description = metadata.description || `${fallback_text}\n\n#shorts #fyp`;
    const tags = metadata.tags || ['news', 'berita', 'inspirasi', 'motivasi'];
    const categoryId = metadata.categoryId || '25'; // 25 = News & Politics

    const res = await service.videos.insert({
        auth: auth,
        part: 'snippet,status',
        requestBody: {
            snippet: { title, description, tags, categoryId },
            status: { privacyStatus: 'public' },
        },
        media: {
            body: (await import('fs')).createReadStream(videoPath),
        },
    });
    log(`Video berhasil diunggah! ID: ${res.data.id}`);
    return res.data;
}
