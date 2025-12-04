import React, { useState, useRef } from 'react';
import {
    StyleSheet,
    View,
    Text,
    ActivityIndicator,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ThemedText } from './themed-text';

const GEE_APP_URL = 'https://ee-rifdanajlaazzahra.projects.earthengine.app/view/grest';

type GeeMapCardProps = {
    cardHeight?: number;
};

export default function GeeMapCard({ cardHeight = 250 }: GeeMapCardProps) {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [loadProgress, setLoadProgress] = useState(0);
    const webViewRef = useRef<WebView>(null);

    const handleLoadStart = () => {
        setLoading(true);
        setError(null);
    };

    const handleLoadEnd = () => {
        setLoading(false);
    };

    const handleError = (syntheticEvent: any) => {
        const { nativeEvent } = syntheticEvent;
        console.error('WebView error in GeeMapCard:', nativeEvent);
        setLoading(false);
        setError('Failed to load map. Try refreshing the app.');
    };

    const handleLoadProgress = ({ nativeEvent }: any) => {
        setLoadProgress(nativeEvent.progress);
    };

    // Custom injected JavaScript to help with loading
    const injectedJavaScript = `
        (function() {
            // Signal when page is fully loaded
            window.addEventListener('load', function() {
                window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'page.loaded'
                }));
            });
            true;
        })();
    `;

    const handleMessage = (event: any) => {
        try {
            const message = JSON.parse(event.nativeEvent.data);
            if (message.type === 'page.loaded') {
                setLoading(false);
                setError(null);
            }
        } catch (e) {
            // console.log('WebView message in GeeMapCard:', event.nativeEvent.data);
        }
    };

    return (
        <View style={[styles.cardContainer, { height: cardHeight }]}>
            {loading && (
                <View style={styles.overlay}>
                    <ActivityIndicator size="large" color="#2d5016" />
                    <ThemedText style={styles.overlayText}>
                        Loading Map... {Math.round(loadProgress * 100)}%
                    </ThemedText>
                </View>
            )}

            {error && (
                <View style={styles.overlay}>
                    <MaterialCommunityIcons name="alert-circle-outline" size={40} color="#f44336" />
                    <ThemedText style={styles.overlayText}>{error}</ThemedText>
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
                onHttpError={handleError} // Treat HTTP errors as general errors
                onLoadProgress={handleLoadProgress}
                onMessage={handleMessage}
                injectedJavaScript={injectedJavaScript}
                originWhitelist={['*']}
                javaScriptEnabled={true}
                domStorageEnabled={true}
                startInLoadingState={false}
                scalesPageToFit={true}
                allowsInlineMediaPlayback={true}
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
    );
}

const styles = StyleSheet.create({
    cardContainer: {
        width: '100%',
        backgroundColor: '#ffffff',
        borderRadius: 12,
        overflow: 'hidden',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        position: 'relative',
    },
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
        borderRadius: 12, // Match card container
    },
    overlayText: {
        marginTop: 10,
        fontSize: 14,
        color: '#2d5016',
        fontWeight: '600',
        textAlign: 'center',
    },
    webView: {
        flex: 1,
        backgroundColor: '#f5f1e8', // Fallback background
    },
    webViewHidden: {
        opacity: 0,
    },
});