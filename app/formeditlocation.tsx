import * as Location from 'expo-location';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { initializeApp } from "firebase/app";
import { getDatabase, ref, update } from "firebase/database";
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBxeu9lBIerELkRbVitSyi61P8AyS0erdo",
    authDomain: "react-native-4cd88.firebaseapp.com",
    databaseURL: "https://react-native-4cd88-default-rtdb.firebaseio.com",
    projectId: "react-native-4cd88",
    storageBucket: "react-native-4cd88.firebasestorage.app",
    messagingSenderId: "1058330646461",
    appId: "1:1058330646461:web:b737d8808d9ddde97224d4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const FormEditLocation = () => {
    const router = useRouter();
    const params = useLocalSearchParams();
    const { id, name: initialName, coordinates: initialCoordinates, accuration: initialAccuration, date: initialDate, photoUrl } = params;

    const [name, setName] = useState((initialName as string) || '');
    const [location, setLocation] = useState((initialCoordinates as string) || '');
    const [accuration, setAccuration] = useState((initialAccuration as string) || '');
    const [date, setDate] = useState((initialDate as string) || '');
    const [loading, setLoading] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);


    // Get current location
    const getCoordinates = async () => {
        setLoading(true);
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission denied', 'Permission to access location was denied');
            setLoading(false);
            return;
        }

        try {
            let locData = await Location.getCurrentPositionAsync({});
            const coords = locData.coords.latitude + ',' + locData.coords.longitude;
            setLocation(coords);
            const accuracyValue = locData.coords.accuracy ? Math.round(locData.coords.accuracy) : 'N/A';
            setAccuration(`${accuracyValue} m`);
        } catch (error) {
            console.error("Error getting location:", error);
            Alert.alert("Error", "Failed to get current location.");
        } finally {
            setLoading(false);
        }
    };

    // Alert success update
    const createOneButtonAlert = (callback: () => void) =>
        Alert.alert('Success', 'Berhasil memperbarui data', [
            { text: 'OK', onPress: callback },
        ]);


    // Handle update
    const handleUpdate = () => {
        if (!id) {
            Alert.alert("Error", "Location ID not found.");
            return;
        }
        if (!name.trim() || !location.trim()) {
            Alert.alert('Validation Error', 'Nama dan Koordinat wajib diisi');
            return;
        }
        setIsUpdating(true);
        const pointRef = ref(db, `points/${id}`);
        update(pointRef, {
            name: name,
            coordinates: location,
            accuration: accuration,
            date: date,
            photoUrl: photoUrl || null,
            updatedAt: new Date().toISOString()
        }).then(() => {
            createOneButtonAlert(() => {
                router.back();
            });
        }).catch((e) => {
            console.error("Error updating document: ", e);
            Alert.alert("Error", "Gagal memperbarui data");
        }).finally(() => {
            setIsUpdating(false);
        });
    };


    return (
        <>
            <Stack.Screen options={{ title: 'Edit Location' }} />
            <SafeAreaView style={styles.container}>
                <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                    
                    <View style={styles.formSection}>
                        {/* Nama */}
                        <View style={styles.inputGroup}>
                            <View style={styles.labelRow}>
                                <MaterialIcons name="edit-location" size={20} color="#2d5016" />
                                <Text style={styles.label}>Point Name</Text>
                            </View>
                            <TextInput
                                style={styles.input}
                                placeholder='Enter location name...'
                                value={name}
                                onChangeText={setName}
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
                                style={styles.input}
                                placeholder="-6.200000,106.816666"
                                value={location}
                                onChangeText={setLocation}
                                keyboardType="numeric"
                                placeholderTextColor="#7a9d7a"
                            />
                        </View>

                        {/* Akurasi & Tanggal Row */}
                        <View style={styles.rowContainer}>
                            <View style={[styles.inputGroup, styles.halfWidth]}>
                                <View style={styles.labelRow}>
                                    <MaterialIcons name="my-location" size={18} color="#2d5016" />
                                    <Text style={styles.label}>Accuracy</Text>
                                </View>
                                <TextInput
                                    style={styles.input}
                                    placeholder="5 m"
                                    value={accuration}
                                    onChangeText={setAccuration}
                                    placeholderTextColor="#7a9d7a"
                                />
                            </View>

                            <View style={[styles.inputGroup, styles.halfWidth]}>
                                <View style={styles.labelRow}>
                                    <FontAwesome5 name="calendar-alt" size={16} color="#2d5016" />
                                    <Text style={styles.label}>Date</Text>
                                </View>
                                <TextInput
                                    style={styles.input}
                                    placeholder="YYYY-MM-DD"
                                    value={date}
                                    onChangeText={setDate}
                                    placeholderTextColor="#7a9d7a"
                                />
                            </View>
                        </View>

                        {/* Get Location Button */}
                        <TouchableOpacity
                            style={styles.gpsButton}
                            onPress={getCoordinates}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="#ffffff" />
                            ) : (
                                <>
                                    <MaterialIcons name="gps-fixed" size={22} color="#ffffff" />
                                    <Text style={styles.gpsButtonText}>Update from GPS</Text>
                                </>
                            )}
                        </TouchableOpacity>

                        {/* Info Box */}
                        <View style={styles.infoBox}>
                            <MaterialIcons name="info-outline" size={20} color="#2d5016" />
                            <Text style={styles.infoText}>
                                Click "Update from GPS" to get your current location coordinates
                            </Text>
                        </View>

                        {/* Update Button */}
                        <TouchableOpacity
                            style={[styles.updateButton, (isUpdating || !name.trim() || !location.trim()) && styles.updateButtonDisabled]}
                            onPress={handleUpdate}
                            disabled={isUpdating || !name.trim() || !location.trim()}
                        >
                            {isUpdating ? (
                                <ActivityIndicator color="#ffffff" size="small" />
                            ) : (
                                <>
                                    <MaterialIcons name="check-circle" size={24} color="#ffffff" />
                                    <Text style={styles.updateButtonText}>Update Location</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>

                    <View style={{ height: 20 }} />
                </ScrollView>
            </SafeAreaView>
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#c5d9c0',
    },
    scrollView: {
        flex: 1,
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
        marginTop: 8,
    },
    gpsButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#ffffff',
    },
    
    // Info Box
    infoBox: {
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        borderRadius: 12,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginTop: 20,
        borderWidth: 1,
        borderColor: '#7a9d7a',
    },
    infoText: {
        flex: 1,
        fontSize: 13,
        color: '#2d5016',
        lineHeight: 18,
    },
    
    // Update Button
    updateButton: {
        backgroundColor: '#2d5016',
        borderRadius: 12,
        paddingVertical: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        marginTop: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
        elevation: 6,
    },
    updateButtonDisabled: {
        opacity: 0.5,
    },
    updateButtonText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#ffffff',
    },
});

export default FormEditLocation;