import React, { useState } from 'react';
import { 
    StyleSheet, 
    Text, 
    TextInput, 
    TouchableOpacity, 
    View, 
    Alert, 
    ActivityIndicator, 
    Platform,
    Image
} from 'react-native';
import { Link, useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';

// 💡 IMPORTS FIREBASE DENGAN PERSISTENCE
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { 
    getAuth, 
    createUserWithEmailAndPassword, 
    initializeAuth, 
    getReactNativePersistence,
    Auth,
    // 💡 IMPORT BARU: updateProfile untuk menyimpan username
    updateProfile 
} from 'firebase/auth'; 
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

// --- Konfigurasi dan Inisialisasi Firebase ---

// ⚠️ Ganti ini dengan konfigurasi Firebase Anda yang sebenarnya!
const firebaseConfig = {
    apiKey: "AIzaSyBxeu9lBIerELkRbVitSyi61P8AyS0erdo",
    authDomain: "react-native-4cd88.firebaseapp.com",
    databaseURL: "https://react-native-4cd88-default-rtdb.firebaseio.com",
    projectId: "react-native-4cd88",
    storageBucket: "react-native-4cd88.appspot.com", // Pastikan bucket ini valid
    messagingSenderId: "1058330646461",
    appId: "1:1058330646461:web:b737d8808d9ddde97224d4"
};

let app: FirebaseApp;
let auth: Auth;
let storage: any;

// Mencegah inisialisasi ganda
if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
    // Inisialisasi Auth dengan Async Storage untuk persistence (menyimpan sesi login)
    auth = initializeAuth(app, {
        persistence: getReactNativePersistence(ReactNativeAsyncStorage)
    });
    storage = getStorage(app);
} else {
    app = getApp();
    // Mengambil instance Auth yang sudah ada
    auth = getAuth(app); 
    storage = getStorage(app);
}
// ------------------------------------------

// --- Asumsi Komponen Tema dan Konstanta ---
// Asumsi Anda memiliki file-file ini di path yang benar
import { Colors } from '../constants/theme'; 
import { ThemedText } from '../components/themed-text'; 
import { ThemedView } from '../components/themed-view'; 
// ------------------------------------------

// 💡 Definisi Type untuk Error Firebase yang umum
interface FirebaseAuthError extends Error {
    code: string;
}

export default function RegisterScreen() {
    const [email, setEmail] = useState('');
    // 💡 STATE BARU: Untuk menyimpan username
    const [username, setUsername] = useState(''); 
    const [password, setPassword] = useState('');
    const [image, setImage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const pickImage = async () => {
        // No permissions request is necessary for launching the image library
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.All,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
        }
    };

    const handleRegister = async () => {
        // 💡 VALIDASI BARU: Username harus diisi
        if (!email || !username.trim() || !password) {
            Alert.alert('Input Wajib', 'Email, Username, dan password harus diisi.');
            return;
        }

        if (password.length < 6) {
            Alert.alert('Password Lemah', 'Password minimal harus 6 karakter.');
            return;
        }

        setIsLoading(true);
        try {
            // 1. Buat pengguna dengan email dan password
            const userCredential = await createUserWithEmailAndPassword(auth, email, password); 
            const user = userCredential.user;

            let photoURL = null;
            if (image) {
                const response = await fetch(image);
                const blob = await response.blob();
                const storageRef = ref(storage, `images/${user.uid}/profile.jpg`);
                await uploadBytes(storageRef, blob);
                photoURL = await getDownloadURL(storageRef);
            }

            // 2. Simpan Username sebagai Display Name menggunakan updateProfile
            if (user) {
                await updateProfile(user, {
                    displayName: username.trim(),
                    photoURL: photoURL
                });
                console.log(`Username ${username.trim()} dan foto profil berhasil disimpan.`);
            }

            Alert.alert(
                'Registrasi Berhasil', 
                `Akun untuk ${email} dengan Username ${username.trim()} berhasil dibuat. Silakan masuk.`
            );
            
            // Arahkan pengguna ke layar login setelah berhasil mendaftar
            router.replace('/login'); 
            
        } catch (error) {
            let message = 'Registrasi gagal. Coba lagi nanti.';

            // Type assertion untuk error
            const firebaseError = error as FirebaseAuthError; 

            if (firebaseError.code) {
                const errorCode = firebaseError.code;
                if (errorCode === 'auth/invalid-email') message = 'Format email tidak valid.';
                if (errorCode === 'auth/email-already-in-use') message = 'Email ini sudah terdaftar. Silakan gunakan email lain atau masuk.';
                if (errorCode === 'auth/weak-password') message = 'Password terlalu lemah. Minimal 6 karakter.';
                // Tambahkan penanganan error spesifik lainnya jika perlu
            }

            Alert.alert('Registrasi Error', message);
            
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <ThemedView style={styles.container}>
            <ThemedText style={styles.title}>Daftar Akun Baru</ThemedText>
            <ThemedText style={styles.subtitle}>Buat akun Anda</ThemedText>

            {image && <Image source={{ uri: image }} style={styles.image} />}
            <TouchableOpacity style={styles.button} onPress={pickImage}>
                <Text style={styles.buttonText}>Pilih Foto Profil</Text>
            </TouchableOpacity>

            {/* Input Email */}
            <TextInput
                style={styles.input}
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor="#A9A9A9"
                editable={!isLoading}
            />
            
            {/* 💡 INPUT BARU: Username */}
            <TextInput
                style={styles.input}
                placeholder="Username (Nama Tampilan)"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                placeholderTextColor="#A9A9A9"
                editable={!isLoading}
            />

            {/* Input Password */}
            <TextInput
                style={styles.input}
                placeholder="Password (Min. 6 Karakter)" 
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                placeholderTextColor="#A9A9A9"
                editable={!isLoading}
            />

            {/* Tombol Daftar */}
            <TouchableOpacity 
                style={[styles.button, isLoading && styles.buttonDisabled]} 
                onPress={handleRegister}
                disabled={isLoading}
            >
                {isLoading ? (
                    <ActivityIndicator color="#FFFFFF" />
                ) : (
                    <Text style={styles.buttonText}>Daftar</Text>
                )}
            </TouchableOpacity>

            {/* Link Login: Perbaikan untuk Error "asChild" dan "Text strings" */}
            <View style={styles.registerContainer}>
                {/* Teks statis dibungkus ThemedText */}
                <ThemedText>Sudah punya akun? </ThemedText> 
                
                {/* Link harus membungkus satu komponen yang dapat ditekan */}
                <Link href="/login" asChild>
                    {/* TouchableOpacity adalah satu-satunya child element yang dapat ditekan */}
                    <TouchableOpacity> 
                        {/* Text di dalam TouchableOpacity */}
                        <Text style={[styles.registerLink, {color: Colors.light.primary}]}> 
                            Masuk
                        </Text>
                    </TouchableOpacity>
                </Link>
            </View>
        </ThemedView>
    );
}

// -------------------------------------------------------------------
// STYLES
// -------------------------------------------------------------------

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        backgroundColor: Colors.light.background, 
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: Colors.light.primary,
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 16,
        color: Colors.light.text,
        marginBottom: 30,
    },
    input: {
        width: '100%',
        height: 50,
        backgroundColor: '#FFFFFF',
        borderRadius: 10,
        paddingHorizontal: 15,
        marginBottom: 15, // Dibuat sama untuk semua input
        fontSize: 16,
        borderWidth: 1,
        borderColor: Colors.light.secondary || '#ccc',
        color: Colors.light.text,
    },
    button: {
        width: '100%',
        height: 50,
        backgroundColor: Colors.light.primary,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 10,
        marginBottom: 10,
    },
    buttonDisabled: {
        opacity: 0.7,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
    registerContainer: {
        flexDirection: 'row',
        marginTop: 20,
    },
    registerLink: {
        fontWeight: 'bold',
    },
    image: {
        width: 100,
        height: 100,
        borderRadius: 50,
        marginBottom: 15,
    },
});