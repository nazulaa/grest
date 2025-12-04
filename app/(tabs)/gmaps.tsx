import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, ActivityIndicator, Text, Platform, TextInput, TouchableOpacity, Linking, Alert, Animated } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getDatabase, ref, onValue } from 'firebase/database';
import { FontAwesome, MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';

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
if (!getApps().length) {
    initializeApp(firebaseConfig);
} else {
    getApp();
}
const db = getDatabase();

export default function MapScreen() {
    const [allMarkers, setAllMarkers] = useState([]);
    const [filteredMarkers, setFilteredMarkers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchVisible, setSearchVisible] = useState(false);
    const [selectedMarker, setSelectedMarker] = useState(null);

    const [fabOpen, setFabOpen] = useState(false);
    const animation = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const pointsRef = ref(db, 'points/');

        const unsubscribe = onValue(pointsRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const parsedMarkers = Object.keys(data)
                    .map(key => {
                        const point = data[key];
                        if (typeof point.coordinates !== 'string' || point.coordinates.trim() === '') {
                            return null;
                        }
                        const [latitude, longitude] = point.coordinates.split(',').map(Number);

                        if (isNaN(latitude) || isNaN(longitude)) {
                            console.warn(`Invalid coordinates for point ${key}:`, point.coordinates);
                            return null;
                        }

                        return {
                            id: key,
                            name: point.name,
                            latitude,
                            longitude,
                        };
                    })
                    .filter(Boolean);

                setAllMarkers(parsedMarkers);
                setFilteredMarkers(parsedMarkers);
            } else {
                setAllMarkers([]);
                setFilteredMarkers([]);
            }
            setLoading(false);
        }, (error) => {
            console.error(error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (searchQuery === '') {
            setFilteredMarkers(allMarkers);
        } else {
            const filtered = allMarkers.filter(marker =>
                marker.name.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setFilteredMarkers(filtered);
        }
    }, [searchQuery, allMarkers]);

    const toggleFab = () => {
        const toValue = fabOpen ? 0 : 1;
        
        Animated.spring(animation, {
            toValue,
            friction: 5,
            useNativeDriver: true,
        }).start();
        
        setFabOpen(!fabOpen);
    };

    const openInGoogleMaps = (latitude, longitude, name) => {
        const scheme = Platform.select({
            ios: 'maps:0,0?q=',
            android: 'geo:0,0?q='
        });
        const latLng = `${latitude},${longitude}`;
        const label = name;
        const url = Platform.select({
            ios: `${scheme}${label}@${latLng}`,
            android: `${scheme}${latLng}(${label})`
        });

        Linking.openURL(url).catch(() => {
            Alert.alert('Error', 'Unable to open Google Maps');
        });
    };

    const formButtonStyle = {
        transform: [
            {
                translateY: animation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -70],
                }),
            },
        ],
        opacity: animation,
    };

    const mapwebviewButtonStyle = {
        transform: [
            {
                translateY: animation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -140],
                }),
            },
        ],
        opacity: animation,
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#2d5016" />
                <Text style={styles.loadingText}>Loading map data...</Text>
            </View>
        );
    }

    if (Platform.OS === 'web') {
        return (
            <View style={styles.loadingContainer}>
                <FontAwesome name="globe" size={64} color="#ccc" />
                <Text style={styles.webMessage}>Maps are not available on the web version.</Text>
                <Text style={styles.webSubMessage}>Please use the mobile app to view the map.</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
              <View style={styles.headerContent}>
                <Text style={styles.headerTitle}>Google Maps</Text>
                <TouchableOpacity onPress={() => setSearchVisible(!searchVisible)} style={styles.headerSearchIcon}>
                  <MaterialIcons name="search" size={24} color="white" />
                </TouchableOpacity>
              </View>
            </View>
            {searchVisible && (
                <View style={[styles.searchContainer, { top: 90 }]}>
                    <FontAwesome name="search" size={18} color="#888" style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search for a location..."
                        placeholderTextColor="#999"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                    {searchQuery !== '' && (
                        <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
                            <FontAwesome name="times-circle" size={18} color="#888" />
                        </TouchableOpacity>
                    )}
                </View>
            )}

            <MapView
                style={styles.map}
                initialRegion={{
                    latitude: -7.7956,
                    longitude: 110.3695,
                    latitudeDelta: 0.02,
                    longitudeDelta: 0.01,
                }}
                zoomControlEnabled={true}
            >
                {filteredMarkers.map(marker => (
                    <Marker
                        key={marker.id}
                        coordinate={{ latitude: marker.latitude, longitude: marker.longitude }}
                        title={marker.name}
                        description={`Tap to open in Google Maps`}
                        onPress={() => setSelectedMarker(marker)}
                        onCalloutPress={() => openInGoogleMaps(marker.latitude, marker.longitude, marker.name)}
                    />
                ))}
            </MapView>

            {/* Tombol MapWebView */}
            <Animated.View style={[styles.miniFab, mapwebviewButtonStyle]} pointerEvents={fabOpen ? 'auto' : 'none'}>
                <TouchableOpacity 
                    style={styles.miniFabButton}
                    onPress={() => {
                        toggleFab();
                        router.push('/mapwebview');
                    }}
                >
                    <FontAwesome name="map" size={20} color="white" />
                </TouchableOpacity>
            </Animated.View>

            {/* Tombol Input Form */}   
            <Animated.View style={[styles.miniFab, formButtonStyle]} pointerEvents={fabOpen ? 'auto' : 'none'}>
                <TouchableOpacity 
                    style={styles.miniFabButton}
                    onPress={() => {
                        toggleFab();
                        router.push('/forminputlocation');
                    }}
                >
                    <FontAwesome name="edit" size={20} color="white" />
                </TouchableOpacity>
            </Animated.View>

            {/* Main FAB */}
            <TouchableOpacity 
                style={styles.fab} 
                onPress={toggleFab}
                activeOpacity={0.8}
            >
                <Animated.View
                    style={{
                        transform: [{
                            rotate: animation.interpolate({
                                inputRange: [0, 1],
                                outputRange: ['0deg', '45deg'],
                            }),
                        }],
                    }}
                >
                    <FontAwesome name="plus" size={24} color="white" />
                </Animated.View>
            </TouchableOpacity>

            {/* Result Count */}
            {searchQuery !== '' && (
                <View style={styles.resultBadge}>
                    <Text style={styles.resultText}>
                        {filteredMarkers.length} location{filteredMarkers.length !== 1 ? 's' : ''} found
                    </Text>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#666',
    },
    webMessage: {
        marginTop: 20,
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
    },
    webSubMessage: {
        marginTop: 8,
        fontSize: 14,
        color: '#666',
    },
    searchContainer: {
        position: 'absolute',
        top: 60,
        left: 15,
        right: 15,
        zIndex: 10,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        borderRadius: 12,
        paddingHorizontal: 15,
        paddingVertical: 5,
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
    },
    searchIcon: {
        marginRight: 10,
    },
    searchInput: {
        flex: 1,
        height: 45,
        fontSize: 16,
        color: '#333',
    },
    clearButton: {
        padding: 5,
    },
    map: {
        width: '100%',
        height: '100%',
    },
    fab: {
        position: 'absolute',
        width: 56,
        height: 56,
        alignItems: 'center',
        justifyContent: 'center',
        right: 20,
        bottom: 110,
        backgroundColor: '#2d5016',
        borderRadius: 28,
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        zIndex: 999,
    },
    miniFab: {
        position: 'absolute',
        right: 20,
        bottom: 110,
        zIndex: 998,
    },
    miniFabButton: {
        width: 48,
        height: 48,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#2d5016',
        borderRadius: 24,
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.25,
        shadowRadius: 4,

        color: '#2d5016',
        fontSize: 16,
        paddingVertical: 10,
    },
    header: {
        backgroundColor: '#2d5016',
        paddingTop: 25,
        paddingBottom: 20,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        zIndex: 10,
    },
    headerContent: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    headerTitle: {
        fontSize: 25,
        fontWeight: 'bold',
        color: '#ffffff',
        textAlign: 'center',
        flex: 1,
    },
    headerSearchIcon: {
      position: 'absolute',
      right: 0,
      padding: 5,
    },
    resultBadge: {
        position: 'absolute',
        top: 115,
        left: 15,
        backgroundColor: 'rgba(45, 80, 22, 0.9)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        zIndex: 10,
    },
    resultText: {
        color: 'white',
        fontSize: 12,
        fontWeight: '600',
    },
});