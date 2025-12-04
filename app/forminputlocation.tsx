import { ThemedText } from '@/components/themed-text';
import { FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { initializeApp } from 'firebase/app';
import { get, getDatabase, push, ref, update } from 'firebase/database';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';

// --- Konfigurasi Firebase ---
const firebaseConfig = {
    apiKey: "AIzaSyBxeu9lBIerELkRbVitSyi61P8AyS0erdo",
    authDomain: "react-native-4cd88.firebaseapp.com",
    databaseURL: "https://react-native-4cd88-default-rtdb.firebaseio.com",
    projectId: "react-native-4cd88",
    storageBucket: "react-native-4cd88.firebasestorage.app",
    messagingSenderId: "1058330646461",
    appId: "1:1058330646461:web:b737d8808d9ddde97224d4"
};
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// ⭐ API KEY IMGBB
const IMGBB_API_KEY = "f2f48bac1b562d93d7c118fd8c7700cb";
// ----------------------------

const DEFAULT_COORDS = { latitude: -7.7956, longitude: 110.3695 };

export default function CreatePointScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const [name, setName] = useState('');
  const [coordinates, setCoordinates] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [accuration, setAccuration] = useState('');
  const [photoUri, setPhotoUri] = useState(null);
  const [markerCoordinate, setMarkerCoordinate] = useState(DEFAULT_COORDS);
  const [mapRegion, setMapRegion] = useState({
      ...DEFAULT_COORDS,
      latitudeDelta: 0.0922,
      longitudeDelta: 0.0421,
  });
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const mapRef = useRef(null);

  const pointId = params.id;
  const isEditing = !!pointId;

  useEffect(() => {
    (async () => {
        if (Platform.OS !== 'web') {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission needed', 'Izinkan akses ke galeri untuk memilih foto.');
            }
        }
    })();

    if (isEditing) {
      loadPointData();
    } else {
      getCurrentLocation(); 
    }
  }, [pointId]);

  const loadPointData = async () => {
    try {
        const pointRef = ref(db, `points/${pointId}`);
        const snapshot = await get(pointRef);
        
        if (snapshot.exists()) {
            const point = snapshot.val();
            setName(point.name || '');
            setCoordinates(point.coordinates || '');
            setDate(point.date || new Date().toISOString().slice(0, 10));
            setAccuration(point.accuration || '');
            setPhotoUri(point.photoUrl || null);
            
            if (point.coordinates) {
                const [lat, lng] = point.coordinates.split(',').map(c => parseFloat(c.trim()));
                if (!isNaN(lat) && !isNaN(lng)) {
                    const newCoords = { latitude: lat, longitude: lng };
                    setMarkerCoordinate(newCoords);
                    
                    setMapRegion(prev => ({
                        ...prev,
                        latitude: lat,
                        longitude: lng,
                        latitudeDelta: 0.005,
                        longitudeDelta: 0.005,
                    }));
                }
            }
        }
    } catch (error) {
        console.error('Error loading point:', error);
        Alert.alert('Error', 'Failed to load point data');
    }
  };

  const getCurrentLocation = async () => {
    setLoading(true);
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
        Alert.alert('Izin Lokasi Ditolak', 'Izin untuk mengakses lokasi diperlukan.');
        setLoading(false);
        return;
    }

    try {
        let locData = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.High,
        });

        const lat = locData.coords.latitude.toFixed(9);
        const lng = locData.coords.longitude.toFixed(9);
        const coords = `${lat},${lng}`;
        const newCoords = { latitude: locData.coords.latitude, longitude: locData.coords.longitude };
        
        setCoordinates(coords);
        setMarkerCoordinate(newCoords);
        
        const accuracyValue = locData.coords.accuracy ? Math.round(locData.coords.accuracy) : 'N/A';
        setAccuration(`${accuracyValue} m`);
        setDate(new Date().toISOString().slice(0, 10));
        
        setMapRegion(prev => ({
            ...prev,
            latitude: newCoords.latitude,
            longitude: newCoords.longitude,
            latitudeDelta: 0.005,
            longitudeDelta: 0.005,
        }));

    } catch (error) {
        console.error("Error saat mendapatkan lokasi:", error);
        Alert.alert("Error", "Gagal mendapatkan lokasi saat ini.");
    } finally {
        setLoading(false);
    }
  };

  const pickImage = async () => {
      try {
          let result = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ['images'],
              allowsEditing: true,
              aspect: [4, 3],
              quality: 0.7,
          });

          if (!result.canceled) {
              setPhotoUri(result.assets[0].uri);
          }
      } catch (error) {
          console.error('Error picking image:', error);
          Alert.alert('Error', 'Gagal memilih gambar: ' + error.message);
      }
  };

  const uploadImageToImgBB = async (uri) => {
      if (!uri) return null;

      try {
          const response = await fetch(uri);
          const blob = await response.blob();
          
          const base64 = await new Promise((resolve, reject) => {
              const reader = new FileReader();
              reader.onloadend = () => {
                  const base64data = reader.result.split(',')[1];
                  resolve(base64data);
              };
              reader.onerror = reject;
              reader.readAsDataURL(blob);
          });

          const formData = new FormData();
          formData.append('image', base64);
          formData.append('name', `point_${Date.now()}`);

          const uploadResponse = await fetch(
              `https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`,
              {
                  method: 'POST',
                  body: formData,
              }
          );

          const result = await uploadResponse.json();

          if (result.success) {
              return result.data.url;
          } else {
              throw new Error(result.error?.message || 'Upload failed');
          }
      } catch (error) {
          console.error("Error uploading to ImgBB:", error);
          Alert.alert('Upload Error', 'Gagal mengupload gambar: ' + error.message);
          return null;
      }
  };

  const handleMarkerDragEnd = (e) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    const lat = latitude.toFixed(9);
    const lng = longitude.toFixed(9);
    
    setCoordinates(`${lat},${lng}`);
    setMarkerCoordinate({ latitude, longitude }); 
    
    mapRef.current?.animateToRegion({
        ...mapRegion,
        latitude: latitude,
        longitude: longitude,
    }, 500);
  };

  const handleMapPress = (e) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    const lat = latitude.toFixed(9);
    const lng = longitude.toFixed(9);
    
    const newCoords = { latitude, longitude };
    
    setCoordinates(`${lat},${lng}`);
    setMarkerCoordinate(newCoords);
    
    mapRef.current?.animateToRegion({
        ...mapRegion,
        latitude: latitude,
        longitude: longitude,
    }, 500);
  };
  
  const handleRegionChangeComplete = (region) => {
      setMapRegion(region);
  };

  const handleSave = async () => {
    if (!name.trim() || !coordinates.trim()) {
      Alert.alert('Validation Error', 'Nama dan Koordinat wajib diisi');
      return;
    }

    setLoading(true);
    let photoUrlToSave = photoUri;

    let currentUserId = null;
    try {
        const sessionDataString = await AsyncStorage.getItem('user_session');
        if (sessionDataString) {
            const sessionData = JSON.parse(sessionDataString);
            currentUserId = sessionData.uid;
        }
    } catch (e) {
        console.error("Error reading user session from AsyncStorage:", e);
        Alert.alert("Error", "Gagal membaca sesi pengguna. Coba login ulang.");
        setLoading(false);
        return;
    }

    if (!currentUserId && !isEditing) {
        Alert.alert("Error", "Pengguna tidak terautentikasi. Silakan login terlebih dahulu.");
        setLoading(false);
        return;
    }

    if (photoUri && !photoUri.startsWith('http')) {
        setUploadingImage(true);
        photoUrlToSave = await uploadImageToImgBB(photoUri);
        setUploadingImage(false);
        
        if (!photoUrlToSave) {
            setLoading(false);
            Alert.alert('Error', 'Gagal mengunggah foto, tidak bisa menyimpan data.');
            return; 
        }
    }
    
    const dataToSave: any = {
        name: name.trim(),
        coordinates: coordinates.trim(),
        date: date,
        accuration: accuration || 'N/A',
        photoUrl: photoUrlToSave,
    };

    if (currentUserId) {
        dataToSave.userId = currentUserId;
    }

    try {
      if (isEditing) {
        const pointRef = ref(db, `points/${pointId}`);
        await update(pointRef, {
            ...dataToSave,
            updatedAt: new Date().toISOString()
        });
        Alert.alert('Success', 'Point updated successfully');
        router.back(); 
      } else {
        const pointsRef = ref(db, 'points');
        await push(pointsRef, {
            ...dataToSave,
            createdAt: new Date().toISOString()
        });
        Alert.alert('Success', 'Point created successfully');

        setName('');
        setCoordinates('');
        setAccuration('');
        setPhotoUri(null);
        setDate(new Date().toISOString().slice(0, 10));
        setMarkerCoordinate(DEFAULT_COORDS);
        setMapRegion(prev => ({
            ...prev,
            ...DEFAULT_COORDS,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
        }));
      }
      
    } catch (error) {
      console.error('Error saving point:', error);
      Alert.alert('Error', 'Gagal menyimpan data. Cek koneksi internet Anda.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Stack.Screen options={{ title: isEditing ? 'Edit Location' : 'Input Form' }} />
      <SafeAreaView style={styles.container}>

        {/* Header dengan warna hijau gelap */}
              <View style={styles.header}>
                <ThemedText style={styles.headerTitle}>Form Input</ThemedText>
              </View>
        
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          
          {/* Form Section */}
          <View style={styles.formSection}>
            {/* Nama */}
            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <MaterialIcons name="location-on" size={20} color="#2d5016" />
                <Text style={styles.label}>Point Name</Text>
              </View>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Enter location name..."
                placeholderTextColor="#7a9d7a"
              />
            </View>

            {/* Koordinat */}
            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <FontAwesome5 name="map-marked-alt" size={18} color="#2d5016" />
                <Text style={styles.label}>Coordinates</Text>
              </View>
              <TextInput
                style={[styles.input, styles.readOnlyInput]}
                value={coordinates}
                editable={false}
                placeholder="Tap on map or use GPS"
                placeholderTextColor="#7a9d7a"
              />
              <View style={styles.infoRow}>
                <MaterialIcons name="info-outline" size={14} color="#7a9d7a" />
                <Text style={styles.helperText}>
                  Drag marker or tap on map to update
                </Text>
              </View>
            </View>

            {/* Date & Accuracy Row */}
            <View style={styles.rowContainer}>
              <View style={[styles.inputGroup, styles.halfWidth]}>
                <View style={styles.labelRow}>
                  <FontAwesome5 name="calendar-alt" size={16} color="#2d5016" />
                  <Text style={styles.label}>Date</Text>
                </View>
                <TextInput
                  style={[styles.input, styles.readOnlyInput]}
                  value={date}
                  editable={false}
                  placeholderTextColor="#7a9d7a"
                />
              </View>

              <View style={[styles.inputGroup, styles.halfWidth]}>
                <View style={styles.labelRow}>
                  <MaterialIcons name="my-location" size={18} color="#2d5016" />
                  <Text style={styles.label}>Accuracy</Text>
                </View>
                <TextInput
                  style={[styles.input, styles.readOnlyInput]}
                  value={accuration}
                  editable={false}
                  placeholder="N/A"
                  placeholderTextColor="#7a9d7a"
                />
              </View>
            </View>

            {/* GPS Button */}
            <TouchableOpacity
              style={styles.gpsButton}
              onPress={getCurrentLocation}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <>
                  <MaterialIcons name="gps-fixed" size={22} color="#ffffff" />
                  <Text style={styles.gpsButtonText}>Get Current Location</Text>
                </>
              )}
            </TouchableOpacity>

            {/* Photo Section */}
            <View style={styles.photoSection}>
              <View style={styles.labelRow}>
                <MaterialIcons name="photo-camera" size={20} color="#2d5016" />
                <Text style={styles.label}>Photo</Text>
              </View>
              
              {photoUri ? (
                <View style={styles.imageContainer}>
                  <Image source={{ uri: photoUri }} style={styles.imagePreview} />
                  {uploadingImage && (
                    <View style={styles.uploadingOverlay}>
                      <ActivityIndicator size="large" color="#2d5016" />
                      <Text style={styles.uploadingText}>Uploading...</Text>
                    </View>
                  )}
                  <TouchableOpacity 
                    style={styles.removeImageButton} 
                    onPress={() => setPhotoUri(null)}
                    disabled={uploadingImage}
                  >
                    <MaterialIcons name="delete" size={20} color="#ffffff" />
                    <Text style={styles.removeImageButtonText}>Remove Photo</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.uploadButton}
                  onPress={pickImage}
                >
                  <MaterialIcons name="add-photo-alternate" size={48} color="#7a9d7a" />
                  <Text style={styles.uploadButtonText}>Select Photo</Text>
                  <Text style={styles.uploadButtonSubtext}>Tap to choose from gallery</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Map Section */}
            <View style={styles.mapSection}>
              <View style={styles.labelRow}>
                <FontAwesome5 name="map" size={18} color="#2d5016" />
                <Text style={styles.label}>Map Location</Text>
              </View>
              
              <View style={styles.mapWrapper}>
                <MapView
                  ref={mapRef}
                  style={styles.map}
                  provider={PROVIDER_GOOGLE}
                  region={mapRegion}
                  onRegionChangeComplete={handleRegionChangeComplete}
                  onPress={handleMapPress}
                >
                  <Marker
                    coordinate={markerCoordinate}
                    draggable
                    onDragEnd={handleMarkerDragEnd}
                    title="Selected Location"
                    description={coordinates}
                  />
                </MapView>
              </View>
            </View>
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>

        {/* Fixed Save Button */}
        <View style={styles.bottomBar}>
          <TouchableOpacity
            style={[styles.saveButton, (loading || uploadingImage || !name.trim() || !coordinates.trim()) && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={loading || uploadingImage || !name.trim() || !coordinates.trim()}
          >
            {(loading || uploadingImage) ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <>
                <MaterialIcons name={isEditing ? "check-circle" : "save"} size={24} color="#ffffff" />
                <Text style={styles.saveButtonText}>
                  {isEditing ? 'Update Point' : 'Save Point'}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </>
  );
}

// ----------------------------------------------------
// MODERN CLEAN STYLES
// ----------------------------------------------------
const styles = StyleSheet.create({
  container: {
    flex: 1, 
    backgroundColor: '#c5d9c0', 
  },
  scrollView: {
    flex: 1, 
  },
    header: {
    paddingTop: 0,
    paddingBottom: 0,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerTitle: {
    fontSize: 25,
    fontWeight: 'bold',
    color: '#2d5016',
    textAlign: 'center',
  },
  // Form Section
  formSection: {
    padding: 20,
  },
  
  // Input Styles
  inputGroup: {
    marginBottom: 20,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 8,
  },
  label: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2d5016',
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#2d5016',
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: '#2d5016',
  },
  readOnlyInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderColor: '#7a9d7a',
    color: '#2d5016',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 4,
  },
  helperText: {
    fontSize: 12,
    color: '#7a9d7a',
    fontStyle: 'italic',
  },
  
  // Row Container
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  
  // GPS Button
  gpsButton: {
    backgroundColor: '#2d5016',
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  gpsButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  
  // Photo Section
  photoSection: {
    marginTop: 8,
    marginBottom: 20,
  },
  imageContainer: {
    alignItems: 'center',
  },
  imagePreview: {
    width: '100%',
    height: 220,
    borderRadius: 12,
    marginBottom: 12,
    resizeMode: 'cover',
    borderWidth: 2,
    borderColor: '#2d5016',
  },
  uploadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 60,
    backgroundColor: 'rgba(197, 217, 192, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  uploadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#2d5016',
    fontWeight: 'bold',
  },
  removeImageButton: {
    backgroundColor: '#d32f2f',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    width: '100%',
  },
  removeImageButtonText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  uploadButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#2d5016',
    paddingVertical: 40,
    alignItems: 'center',
  },
  uploadButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2d5016',
    marginTop: 12,
    marginBottom: 4,
  },
  uploadButtonSubtext: {
    fontSize: 13,
    color: '#7a9d7a',
  },
  
  // Map Section
  mapSection: {
    marginTop: 8,
  },
  mapWrapper: {
    height: 300,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#2d5016',
  },
  map: {
    flex: 1,
  },
  
  // Bottom Bar
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#c5d9c0',
    paddingHorizontal: 20,
    paddingVertical: 12,
    paddingBottom: 20,
    borderTopWidth: 2,
    borderTopColor: '#2d5016',
  },
  saveButton: {
    backgroundColor: '#2d5016',
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
});