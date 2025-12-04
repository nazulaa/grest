# 📱 GREST — GREEN SPATIAL TRACKING

## 📖 Deskripsi Produk
GREST (Green Spatial Tracking) adalah aplikasi mobile berbasis React Native yang berfungsi untuk menampilkan, memantau, dan menganalisis informasi spasial mengenai sebaran ruang hijau di wilayah perkotaan.  
Aplikasi ini menyediakan visualisasi WebGIS interaktif, tampilan Google Maps untuk navigasi lokasi, halaman profil pengguna, serta halaman analisis berbasis Google Earth Engine (GEE) yang menampilkan hasil olahan citra satelit seperti NDVI, klasifikasi area vegetasi, dan informasi lingkungan lainnya.

GREST dirancang sebagai sarana pemantauan lingkungan yang mudah diakses oleh peneliti, pemerintah daerah, atau masyarakat umum yang ingin mengetahui kondisi ruang hijau secara informatif, real-time, dan berbasis geospasial.

---

## 🛠️ Komponen Pembangun Produk
Teknologi utama yang digunakan dalam pengembangan aplikasi GREST meliputi:

### **Frontend**
- **React Native (Expo)** → Framework utama untuk membangun aplikasi Android/iOS dengan satu basis kode.  
- **React Navigation** → Mengatur navigasi antar-halaman aplikasi.  
- **WebView** → Menampilkan peta WebGIS dalam bentuk halaman HTML interaktif.  
- **Google Maps / react-native-maps** → Menyediakan tampilan peta dan lokasi pengguna langsung.  
- **AsyncStorage** → Menyimpan data sederhana di perangkat.
- **IMGBB** → menyimpan foto yang diunggah pengguna.

### **Backend & Layanan Pendukung**
- **Firebase Authentication** → Autentikasi pengguna menggunakan email & password.  
- **Firebase Firestore / Realtime Database** (opsional) → Penyimpanan data non-spasial.  
- **Google Earth Engine (GEE)** → Sumber analisis dan visualisasi citra satelit.  
- **Server WebGIS (Leaflet, OpenLayers, atau HTML custom)** → Menyimpan dan menampilkan layer sebaran ruang hijau.

### **Tools Lain**
- **Node.js & npm** → Manajemen library, environment, dan pengembangan aplikasi.  
- **Fetch API** → Mengambil data dari API atau server.  

---

## 🔍 Sumber Data
Aplikasi GREST memperoleh data dari beberapa sumber berikut:

- **Citra satelit** (Landsat, Sentinel) melalui Google Earth Engine untuk analisis NDVI, klasifikasi, dan visualisasi area vegetasi non vegetasi.   
- **Basemap** dari Google Maps / OpenStreetMap.  
- **Data pengguna** berupa data partisipasi yang disimpan melalui Firebase Realtime Database.  

---

### 🖼️ Tangkapan Layar

**Halaman Home**  
![home](https://github.com/user-attachments/assets/ebf952c6-8ef5-477b-926a-45d25e9ff7ae) 
**Google Maps View**  
![gmaps](https://github.com/user-attachments/assets/3ff8c9ea-e19a-443c-9874-fe657b4a27a8)

**Logo / Branding GREST**  
<img width="765" height="734" alt="grest" src="https://github.com/user-attachments/assets/744f552a-5601-4d1f-8131-8a90a0363f3c" />

**Halaman Profil**  
![profile](https://github.com/user-attachments/assets/fd80bc62-40d8-41a7-ad78-2907ca835f62)

**Form Input Data**  
![input](https://github.com/user-attachments/assets/b76ba441-59aa-4962-a7a4-c4f858b1496b)

**Daftar Data (List View)**  
![list](https://github.com/user-attachments/assets/510f4fc1-fb49-44e6-9396-75530798e0c6)


**Halaman Analisis GEE**  
![gee](https://github.com/user-attachments/assets/4a41ad73-8a16-4f14-9010-44888177c674)

**Peta WebView (Sebaran Ruang Hijau)**  
![webview](https://github.com/user-attachments/assets/44dfd652-e9ae-420e-9ece-a725b0aaaf51)

