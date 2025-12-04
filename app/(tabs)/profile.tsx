import { ThemedText } from '@/components/themed-text';
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Image, ScrollView, Alert, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { MaterialIcons } from '@expo/vector-icons';

export default function ProfileScreen() {
  const [username, setUsername] = useState('Loading...');
  const [email, setEmail] = useState('Loading...');
  const [joinedDate, setJoinedDate] = useState('Loading...');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const loadProfileData = async () => {
      const sessionDataString = await AsyncStorage.getItem('user_session');
      const savedImageUri = await AsyncStorage.getItem('profile_image');
      if (savedImageUri) {
        setImageUri(savedImageUri);
      }
      if (sessionDataString) {
        const sessionData = JSON.parse(sessionDataString);
        setUsername(sessionData.displayName || 'No username');
        setEmail(sessionData.email || 'No email');
          
        if (sessionData.creationTime) {
          const date = new Date(sessionData.creationTime);
          const formattedDate = date.toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
          });
          setJoinedDate(formattedDate);
        } else {
          setJoinedDate('N/A');
        }
      } else {
        router.replace('/login');
      }
    };

    loadProfileData();
  }, []);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Sorry, we need camera roll permissions to make this work!');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setImageUri(uri);
      await AsyncStorage.setItem('profile_image', uri);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      "Logout",
      "Apakah Anda yakin ingin keluar?",
      [
        {
          text: "Batal",
          style: "cancel"
        },
        { 
          text: "Yakin", 
          onPress: async () => {
            await AsyncStorage.removeItem('user_session');
            await AsyncStorage.removeItem('profile_image');
            router.replace('/login');
          }
        }
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
        "Hapus Akun",
        "Apakah Anda benar-benar yakin ingin menghapus akun Anda? Tindakan ini tidak dapat dibatalkan.",
        [
            {
                text: "Batal",
                style: "cancel",
            },
            {
                text: "Yakin",
                onPress: () => {
                    // Logika penghapusan akun akan ditambahkan di sini
                    console.log("Pengguna memilih untuk menghapus akun.");
                    // Misalnya, setelah logika hapus, redirect ke halaman login
                    // router.replace('/login');
                    Alert.alert("Permintaan Diterima", "Akun Anda akan segera dihapus.");
                },
                style: "destructive",
            },
        ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <ThemedText style={styles.headerTitle}>Profile</ThemedText>
      </View>

      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Profile Avatar */}
        <View style={styles.avatarContainer}>
          <TouchableOpacity onPress={pickImage} style={styles.avatarCircle}>
            {imageUri ? (
              <Image source={{ uri: imageUri }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatarInner}>
                <MaterialIcons name="person" size={60} color="white" />
              </View>
            )}
          </TouchableOpacity>
          <Text style={styles.username}>{username}</Text>
        </View>

        {/* User Info Fields */}
        <View style={styles.infoContainer}>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Email</Text>
            <TextInput
              style={styles.input}
              value={email}
              editable={false}
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Joined Date</Text>
            <TextInput
              style={styles.input}
              value={joinedDate}
              editable={false}
              placeholderTextColor="#999"
            />
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteAccount}>
            <Text style={styles.deleteButtonText}>Hapus Akun</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutText}>Log Out</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#c5d9c0',
  },
  header: {
    backgroundColor: '#2d5016',
    paddingTop: 30,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerTitle: {
    fontSize: 25,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
  },
  scrollContent: {
    flex: 1,
    paddingTop: 30,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  avatarCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 3,
    borderColor: '#2d5016',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 6,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 55,
  },
  avatarInner: {
    width: '100%',
    height: '100%',
    borderRadius: 55,
    backgroundColor: '#2d5016',
    justifyContent: 'center',
    alignItems: 'center',
  },
  username: {
    fontSize: 22,
    fontWeight: '700',
    color: '#2d5016',
    letterSpacing: 0.3,
  },
  infoContainer: {
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2d5016',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  input: {
    backgroundColor: '#ffffff',
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#2d5016',
    paddingHorizontal: 18,
    paddingVertical: 16,
    fontSize: 15,
    color: '#2d5016',
    fontWeight: '500',
  },
  buttonContainer: {
    paddingHorizontal: 20,
    marginTop: 10,
  },
  logoutButton: {
    backgroundColor: '#2d5016',
    borderRadius: 15,
    paddingVertical: 18,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  deleteButton: {
    backgroundColor: '#b91c1c', // A shade of red
    borderRadius: 15,
    paddingVertical: 18,
    alignItems: 'center',
    marginBottom: 15, // Space between delete and logout buttons
    shadowColor: '#000',
    shadowOffset: {
        width: 0,
        height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
});