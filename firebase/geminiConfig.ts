// PERINGATAN KEAMANAN:
// Menyimpan kunci API langsung di dalam kode aplikasi (client-side) sangat berisiko.
// Kunci ini dapat dengan mudah diekstrak dari aplikasi Anda.
// Untuk produksi, sangat disarankan menggunakan backend (misalnya, Firebase Cloud Functions)
// sebagai perantara untuk memanggil API Gemini secara aman.

// --- GANTI DENGAN KUNCI ANDA ---
// 1. Dapatkan kunci API Anda dari Google AI Studio: https://aistudio.google.com/
// 2. Pastikan "Generative Language API" telah diaktifkan di proyek Google Cloud Anda.
// 3. Tempel kunci Anda di bawah ini.

export const GEMINI_API_KEY = "AIzaSyDS3o29srRLtuAmCJd_xhZ7QTouGWn5vBA";