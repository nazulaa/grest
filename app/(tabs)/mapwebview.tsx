import { WebView } from 'react-native-webview';
import { StyleSheet, View, TouchableOpacity, Alert, Animated, Text, TextInput } from 'react-native';
import { FontAwesome, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { getDatabase, ref, onValue, remove } from 'firebase/database';
import { useState, useRef, useEffect } from 'react';

// Inisialisasi Firebase
import { app } from '../../firebase/firebaseConfig';

const db = getDatabase(app);
const webmap = require('../../assets/html/map.html');

export default function App() {
    const router = useRouter();
    const [fabOpen, setFabOpen] = useState(false);
    const animation = useRef(new Animated.Value(0)).current;
    const webViewRef = useRef<WebView>(null);
    const [searchVisible, setSearchVisible] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // 1. Fetch data from Firebase on the React Native side
    useEffect(() => {
        const pointsRef = ref(db, 'points');
        const unsubscribe = onValue(pointsRef, (snapshot) => {
            const data = snapshot.val();
            if (data && webViewRef.current) {
                const pointsArray = Object.keys(data).map(key => ({
                    id: key,
                    ...data[key]
                }));
                // 2. Send the fetched data to the WebView
                webViewRef.current.postMessage(JSON.stringify({
                    action: 'loadPoints',
                    data: pointsArray
                }));
            }
        });

        // Cleanup subscription on unmount
        return () => unsubscribe();
    }, []);

    const handleWebViewMessage = (event: any) => {
        try {
            const message = JSON.parse(event.nativeEvent.data);
            const { action, data } = message;

            if (action === 'edit') {
                router.push({
                    pathname: '/forminputlocation',
                    params: { id: data.id }
                });
            }

            if (action === 'delete') {
                Alert.alert(
                    'Konfirmasi Hapus',
                    `Apakah Anda yakin ingin menghapus "${data.name}"?`,
                    [
                        { text: 'Batal', style: 'cancel' },
                        {
                            text: 'Hapus',
                            style: 'destructive',
                            onPress: async () => {
                                try {
                                    await remove(ref(db, `points/${data.id}`));
                                    Alert.alert('Berhasil', 'Data berhasil dihapus');
                                    // The onValue listener will automatically update the map
                                } catch (error) {
                                    console.error('Error deleting point:', error);
                                    Alert.alert('Error', 'Gagal menghapus data');
                                }
                            }
                        }
                    ]
                );
            }
        } catch (error) {
            console.error('Error handling webview message:', error);
        }
    };

    const toggleFab = () => {
        const toValue = fabOpen ? 0 : 1;
        
        Animated.spring(animation, {
            toValue,
            friction: 5,
            useNativeDriver: true,
        }).start();
        
        setFabOpen(!fabOpen);
    };

    const handleSearch = () => {
        if (searchQuery.trim() && webViewRef.current) {
            webViewRef.current.postMessage(JSON.stringify({
                action: 'search',
                data: searchQuery
            }));
            setSearchQuery('');
            setSearchVisible(false);
        }
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

    const mapButtonStyle = {
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

    return (
        <View style={styles.container}>
            <View style={styles.header}>
              <View style={styles.headerContent}>
                <Text style={styles.headerTitle}>Green Spots</Text>
                <TouchableOpacity onPress={() => setSearchVisible(!searchVisible)} style={styles.searchIcon}>
                  <MaterialIcons name="search" size={24} color="white" />
                </TouchableOpacity>
              </View>
            </View>
            {searchVisible && (
                <View style={styles.searchContainer}>
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Cari lokasi..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        onSubmitEditing={handleSearch}
                    />
                    <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
                        <Text style={styles.searchButtonText}>Cari</Text>
                    </TouchableOpacity>
                </View>
            )}
            <WebView
                ref={webViewRef}
                style={styles.webview}
                source={webmap}
                onMessage={handleWebViewMessage}
                javaScriptEnabled={true}
                domStorageEnabled={true}
                mixedContentMode="always"
                allowFileAccess={true}
            />
            
            {/* Tombol Google Maps */}
            <Animated.View style={[styles.miniFab, mapButtonStyle]} pointerEvents={fabOpen ? 'auto' : 'none'}>
                <TouchableOpacity 
                    style={styles.miniFabButton}
                    onPress={() => {
                        toggleFab();
                        router.push('/gmaps');
                    }}
                >
                    <FontAwesome name="map-marker" size={20} color="white" />
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
    searchIcon: {
      position: 'absolute',
      right: 0,
      padding: 5,
    },
    searchContainer: {
        position: 'absolute',
        top: 90,
        left: 20,
        right: 20,
        flexDirection: 'row',
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 5,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        zIndex: 20,
    },
    searchInput: {
        flex: 1,
        height: 40,
        paddingHorizontal: 10,
        backgroundColor: '#f0f0f0',
        borderRadius: 8,
    },
    searchButton: {
        paddingHorizontal: 15,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#2d5016',
        borderRadius: 8,
        marginLeft: 5,
    },
    searchButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
    webview: {
        flex: 1,
    },
    fab: {
        position: 'absolute',
        width: 56,
        height: 56,
        alignItems: 'center',
        justifyContent: 'center',
        right: 20,
        bottom: 110, // Increased from 20 to avoid tab bar (65 tab height + 20 margin + 25 spacing)
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
        bottom: 110, // Same as main FAB
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
    searchButton: {
        padding: 5,
    },
});