import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View, Alert, ActivityIndicator } from 'react-native';
import { Link, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 💡 IMPORTS FIREBASE UNTUK INISIALISASI
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { app } from '../firebase/firebaseConfig'; // Menggunakan konfigurasi dari file terpisah

// --- Asumsi Komponen Tema dan Konstanta ---
import { Colors } from '../constants/theme'; 
import { ThemedText } from '../components/themed-text'; 
import { ThemedView } from '../components/themed-view'; 
// ------------------------------------------

const auth = getAuth(app); 
const firebaseConfig = {
    apiKey: "AIzaSyBxeu9lBIerELkRbVitSyi61P8AyS0erdo",
    authDomain: "react-native-4cd88.firebaseapp.com",
    databaseURL: "https://react-native-4cd88-default-rtdb.firebaseio.com",
    projectId: "react-native-4cd88",
    storageBucket: "react-native-4cd88.firebasestorage.app", // Pastikan bucket ini valid
    messagingSenderId: "1058330646461",
    appId: "1:1058330646461:web:b737d8808d9ddde97224d4"
};

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Input Wajib', 'Email dan password harus diisi.');
      return;
    }

    setIsLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Simpan sesi pengguna yang lebih lengkap
      const sessionData = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        creationTime: user.metadata.creationTime,
      };
      await AsyncStorage.setItem('user_session', JSON.stringify(sessionData));

      Alert.alert('Login Berhasil', `Selamat datang kembali, ${user.email}`);
      router.replace('/(tabs)'); 
      
    } catch (error) {
      let message = 'Login gagal. Periksa kembali email dan password Anda.';

      if (error && typeof error === 'object' && 'code' in error) {
        const errorCode = error.code;
        if (errorCode === 'auth/invalid-email') message = 'Format email tidak valid.';
        if (errorCode === 'auth/user-not-found' || errorCode === 'auth/invalid-credential') message = 'Email atau password tidak valid.';
        if (errorCode === 'auth/wrong-password') message = 'Password salah.';
        if (errorCode === 'auth/too-many-requests') message = 'Terlalu banyak percobaan login. Coba lagi nanti.';
      }

      Alert.alert('Login Error', message);
      
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.title}>Selamat Datang Kembali!</ThemedText>
      <ThemedText style={styles.subtitle}>Masuk ke akun Anda</ThemedText>

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

      {/* Input Password */}
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        placeholderTextColor="#A9A9A9"
        editable={!isLoading}
      />

      {/* Tombol Login */}
      <TouchableOpacity 
        style={[styles.button, isLoading && styles.buttonDisabled]} 
        onPress={handleLogin}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.buttonText}>Login</Text>
        )}
      </TouchableOpacity>

      {/* Link Register */}
      <View style={styles.registerContainer}>
        <ThemedText>Belum punya akun? </ThemedText>
        <Link href="/register" asChild>
          <TouchableOpacity>
            <ThemedText style={styles.registerLink}>Daftar</ThemedText>
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
    marginBottom: 15,
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
    color: Colors.light.primary,
    fontWeight: 'bold',
  },
});