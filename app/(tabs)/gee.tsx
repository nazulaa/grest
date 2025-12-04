import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Linking,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { WebView } from 'react-native-webview';

const GEE_APP_URL = 'https://ee-rifdanajlaazzahra.projects.earthengine.app/view/grest';

export default function GeeScreen() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [loadProgress, setLoadProgress] = useState(0);
    const webViewRef = useRef<WebView>(null);

    const handleRefresh = () => {
        setIsRefreshing(true);
        setError(null);
        setLoading(true);
        if (webViewRef.current) {
            webViewRef.current.reload();
        }
        setTimeout(() => setIsRefreshing(false), 2000);
    };

    const handleLoadStart = () => {
        setLoading(true);
        setError(null);
    };

    const handleLoadEnd = () => {
        setLoading(false);
        setIsRefreshing(false);
    };

    const handleError = (syntheticEvent: any) => {
        const { nativeEvent } = syntheticEvent;
        console.error('WebView error:', nativeEvent);
        setLoading(false);
        setIsRefreshing(false);
        setError('Failed to load GEE application. The app may have loading restrictions.');
    };

    const handleHttpError = (syntheticEvent: any) => {
        const { nativeEvent } = syntheticEvent;
        console.warn('HTTP Error:', nativeEvent.statusCode, nativeEvent.url);
        if (nativeEvent.statusCode >= 400) {
            setError(`HTTP Error ${nativeEvent.statusCode}: Unable to load the application.`);
        }
    };

    const handleLoadProgress = ({ nativeEvent }: any) => {
        setLoadProgress(nativeEvent.progress);
    };

    const handleOpenInBrowser = async () => {
        try {
            const supported = await Linking.canOpenURL(GEE_APP_URL);
            if (supported) {
                await Linking.openURL(GEE_APP_URL);
            } else {
                Alert.alert('Error', 'Cannot open URL');
            }
        } catch (err) {
            Alert.alert('Error', 'Failed to open browser');
        }
    };

    // Custom injected JavaScript to help with loading
    const injectedJavaScript = `
        (function() {
            // Log any console messages
            const originalLog = console.log;
            const originalError = console.error;
            
            console.log = function(...args) {
                window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'console.log',
                    data: args
                }));
                originalLog.apply(console, args);
            };
            
            console.error = function(...args) {
                window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'console.error',
                    data: args
                }));
                originalError.apply(console, args);
            };
            
            // Signal when page is fully loaded
            window.addEventListener('load', function() {
                window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'page.loaded'
                }));
            });
            
            true;
        })();
    `;

    const handleMessage = async (event: any) => {
        try {
            const message = JSON.parse(event.nativeEvent.data);
            console.log('Message from WebView:', message);
            
            if (message.type === 'page.loaded') {
                setLoading(false);
                setError(null);
            }

            if (message.type === 'gee_analysis_result' && message.data) {
                const { vegetation, nonVegetation } = message.data;
                if (typeof vegetation === 'number' && typeof nonVegetation === 'number') {
                    const dataToStore = JSON.stringify({ vegetation, nonVegetation });
                    await AsyncStorage.setItem('vegetationData', dataToStore);
                    console.log('Stored vegetation data:', dataToStore);
                }
            }

        } catch (e) {
            console.log('WebView message (raw):', event.nativeEvent.data);
        }
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>GEE Analysis</Text>
                <Text style={styles.headerSubtitle}>GREST Project Viewer</Text>
            </View>

            {/* Control Bar */}
            <View style={styles.controlBar}>
                <TouchableOpacity
                    style={[styles.refreshButton, isRefreshing && styles.refreshButtonDisabled]}
                    onPress={handleRefresh}
                    disabled={isRefreshing}
                >
                    <MaterialCommunityIcons 
                        name="refresh" 
                        size={20} 
                        color="#2d5016" 
                    />
                    <Text style={styles.refreshButtonText}>
                        {isRefreshing ? 'Refreshing...' : 'Refresh'}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.browserButton}
                    onPress={handleOpenInBrowser}
                >
                    <MaterialCommunityIcons 
                        name="open-in-new" 
                        size={20} 
                        color="#2d5016" 
                    />
                </TouchableOpacity>
                
                <View style={styles.statusIndicator}>
                    <View style={[styles.statusDot, !loading && !error && styles.statusDotActive]} />
                    <Text style={styles.statusText}>
                        {loading ? `${Math.round(loadProgress * 100)}%` : error ? 'Error' : 'Ready'}
                    </Text>
                </View>
            </View>

            {/* WebView Container */}
            <View style={styles.webViewContainer}>
                {loading && (
                    <View style={styles.loadingOverlay}>
                        <ActivityIndicator size="large" color="#2d5016" />
                        <Text style={styles.loadingText}>
                            Loading GEE Application... {Math.round(loadProgress * 100)}%
                        </Text>
                        <Text style={styles.loadingSubText}>
                            This may take a moment
                        </Text>
                    </View>
                )}

                {error && (
                    <View style={styles.errorContainer}>
                        <MaterialCommunityIcons name="alert-circle-outline" size={60} color="#f44336" />
                        <Text style={styles.errorText}>{error}</Text>
                        <Text style={styles.errorSubText}>
                            Some GEE apps have restrictions when loaded in WebView.
                        </Text>
                        <View style={styles.buttonGroup}>
                            <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
                                <Text style={styles.retryButtonText}>Retry</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.browserOpenButton} onPress={handleOpenInBrowser}>
                                <MaterialCommunityIcons name="open-in-new" size={18} color="#fff" />
                                <Text style={styles.browserOpenButtonText}>Open in Browser</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}

                <WebView
                    ref={webViewRef}
                    source={{ 
                        uri: GEE_APP_URL,
                        headers: {
                            'User-Agent': 'Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36'
                        }
                    }}
                    style={[styles.webView, (loading || error) && styles.webViewHidden]}
                    onLoadStart={handleLoadStart}
                    onLoadEnd={handleLoadEnd}
                    onError={handleError}
                    onHttpError={handleHttpError}
                    onLoadProgress={handleLoadProgress}
                    onMessage={handleMessage}
                    injectedJavaScript={injectedJavaScript}
                    originWhitelist={['*']}
                    javaScriptEnabled={true}
                    domStorageEnabled={true}
                    startInLoadingState={false}
                    scalesPageToFit={true}
                    allowsInlineMediaPlayback={true}
                    mediaPlaybackRequiresUserAction={false}
                    mixedContentMode="always"
                    thirdPartyCookiesEnabled={true}
                    sharedCookiesEnabled={true}
                    allowFileAccess={true}
                    allowUniversalAccessFromFileURLs={true}
                    setSupportMultipleWindows={false}
                    cacheEnabled={true}
                    incognito={false}
                />
            </View>

            {/* Info Footer */}
            <View style={styles.footer}>
                <MaterialCommunityIcons name="information-outline" size={16} color="#666" />
                <Text style={styles.footerText}>
                    Swipe and zoom to interact • Tap browser icon to open externally
                </Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f1e8',
    },
    header: {
        backgroundColor: '#2d5016',
        paddingTop: Platform.OS === 'android' ? 20 : 30,
        paddingBottom: 10,
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
    headerSubtitle: {
        fontSize: 12,
        color: '#e8d96f',
        textAlign: 'center',
        marginTop: 4,
    },
    controlBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#ffffff',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    refreshButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#e8d96f',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 8,
        gap: 8,
    },
    refreshButtonDisabled: {
        opacity: 0.6,
    },
    refreshButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#2d5016',
    },
    browserButton: {
        padding: 8,
        backgroundColor: '#f0f0f0',
        borderRadius: 8,
    },
    statusIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#ccc',
    },
    statusDotActive: {
        backgroundColor: '#4caf50',
    },
    statusText: {
        fontSize: 12,
        color: '#666',
        fontWeight: '600',
    },
    webViewContainer: {
        flex: 1,
        backgroundColor: '#ffffff',
        margin: 16,
        borderRadius: 16,
        overflow: 'hidden',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    webView: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    webViewHidden: {
        opacity: 0,
    },
    loadingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: '#ffffff',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: '#2d5016',
        fontWeight: '600',
    },
    loadingSubText: {
        marginTop: 8,
        fontSize: 14,
        color: '#666',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    errorText: {
        marginTop: 16,
        fontSize: 16,
        color: '#f44336',
        textAlign: 'center',
        fontWeight: '600',
    },
    errorSubText: {
        marginTop: 8,
        fontSize: 14,
        color: '#999',
        textAlign: 'center',
        marginBottom: 20,
    },
    buttonGroup: {
        flexDirection: 'row',
        gap: 12,
    },
    retryButton: {
        backgroundColor: '#e8d96f',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
    },
    retryButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#2d5016',
    },
    browserOpenButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#2d5016',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
        gap: 8,
    },
    browserOpenButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#ffffff',
    },
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 12,
        gap: 8,
    },
    footerText: {
        fontSize: 11,
        color: '#666',
        textAlign: 'center',
    },
});