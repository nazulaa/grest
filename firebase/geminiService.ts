import { GoogleGenerativeAI } from "@google/generative-ai";
import { GEMINI_API_KEY } from "./geminiConfig";

// Inisialisasi SDK
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

export const sendToGemini = async (message: string): Promise<string> => {
  // Validasi dasar
  if (!message || message.trim() === "") return "Pesan tidak boleh kosong.";
  if (!GEMINI_API_KEY || GEMINI_API_KEY.includes("GANTI")) return "API Key belum dikonfigurasi.";

  // Konfigurasi standar
  const generationConfig = {
    temperature: 0.7,
    topP: 0.8,
    topK: 40,
    maxOutputTokens: 1000,
  };

  // --- STRATEGI FALLBACK MODEL ---
  // Kita akan mencoba model-model berikut secara berurutan:
  // 1. gemini-1.5-flash-latest (Paling baru, cepat, dan kemungkinan besar tersedia)
  // 2. gemini-pro (Model klasik sebagai cadangan)
  
  const modelsToTry = ["gemini-1.5-flash-latest", "gemini-pro"];

  for (const modelName of modelsToTry) {
    try {
      console.log(`Mencoba model: ${modelName}...`);
      
      const model = genAI.getGenerativeModel({ model: modelName });
      
      const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: message }] }],
        generationConfig,
      });

      const response = await result.response;
      const text = response.text();

      console.log(`Sukses menggunakan model: ${modelName}`);
      return text;

    } catch (error: any) {
      console.warn(`Gagal dengan model ${modelName}:`, error.message);
      
      // Jika ini adalah model terakhir dan masih gagal, baru kita tampilkan error final
      if (modelName === modelsToTry[modelsToTry.length - 1]) {
        console.error("Semua model gagal. Ini adalah error final.");
        
        if (error.message?.includes("API key not valid")) {
          return "API Key tidak valid. Mohon periksa kembali kunci API Anda di file geminiConfig.ts.";
        }
        if (error.message?.includes("404") || error.message?.includes("was not found")) {
          return `Maaf, model ${modelName} tidak dapat ditemukan. Pastikan API Key Anda dibuat di project Google Cloud yang sudah mengaktifkan "Vertex AI API".`;
        }
        if (error.message?.includes("permission")) {
          return `Terjadi masalah izin (Permission Denied). Detail: ${error.message}`;
        }
        return `Maaf, terjadi kesalahan yang tidak terduga setelah mencoba semua model. Detail: ${error.message}`;
      }
      
      // Jika belum model terakhir, lanjut ke loop berikutnya
      console.log("Mencoba model alternatif...");
    }
  }

  // Baris ini seharusnya tidak pernah tercapai, tapi sebagai fallback terakhir.
  return "Terjadi kesalahan tidak terduga di luar loop.";
};

export const testGeminiConnection = async (): Promise<boolean> => {
  try {
    const response = await sendToGemini("Tes");
    return !response.includes("Maaf") && !response.includes("Gagal");
  } catch (error) {
    return false;
  }
};