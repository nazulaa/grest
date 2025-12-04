import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Tabs, router } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { HapticTab } from '@/components/haptic-tab';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        // Warna hijau untuk active
        tabBarActiveTintColor: '#2d5016',
        tabBarInactiveTintColor: '#7a9d7a',
        
        headerShown: false,
        tabBarButton: HapticTab,
        
        // Modern floating tab bar style
        tabBarStyle: {
          position: 'absolute',
          marginHorizontal: 20,
          bottom: 20,
          backgroundColor: '#ffffff',
          borderRadius: 30,
          elevation: 20,
          shadowColor: '#2d5016',
          shadowOffset: {
            width: 0,
            height: 8,
          },
          shadowOpacity: 0.15,
          shadowRadius: 12,
          height: 70,
          paddingHorizontal: 8,
          paddingBottom: 8,
          paddingTop: 10,
          borderWidth: 0,
          borderTopWidth: 0,
        },
        tabBarItemStyle: {
          marginHorizontal: 2,
        },
        
        // Hide labels
        tabBarShowLabel: false,
        
        tabBarIconStyle: {
          marginTop: 0,
        },
        
        sceneStyle: {
          paddingBottom: 0,
        },
      }}>
      
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconContainer, focused && styles.iconContainerActive]}>
              <MaterialIcons 
                size={focused ? 26 : 24} 
                name="home" 
                color={color} 
              />
            </View>
          ),
        }}
      />
      
      <Tabs.Screen
        name="mapwebview"
        options={{
          title: 'Maps',
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconContainer, focused && styles.iconContainerActive]}>
              <MaterialIcons 
                size={focused ? 22 : 20} 
                name="map" 
                color={color} 
              />
            </View>
          ),
        }}
      />
      
      <Tabs.Screen
        name="gee"
        options={{
          title: 'Analisis',
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconContainer, focused && styles.iconContainerActive]}>
              <MaterialIcons 
                size={focused ? 22 : 20} 
                name="analytics" 
                color={color} 
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="gmaps"
        options={{
          title: 'Gmaps',
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconContainer, focused && styles.iconContainerActive]}>
              <MaterialIcons 
                size={focused ? 22 : 20} 
                name="my-location" 
                color={color} 
              />
            </View>
          ),
        }}
      />
      
  
      <Tabs.Screen
        name="lokasi"
        options={{
          title: 'Plants',
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconContainer, focused && styles.iconContainerActive]}>
              <MaterialIcons 
                size={focused ? 22 : 20} 
                name="grass" 
                color={color} 
              />
            </View>
          ),
        }}
      />
            
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconContainer, focused && styles.iconContainerActive]}>
              <MaterialIcons 
                size={focused ? 22 : 20} 
                name="person" 
                color={color} 
              />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    width: 45,
    height: 45,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 15,
    transition: 'all 0.2s',
  },
  iconContainerActive: {
    backgroundColor: '#e8f5e9',
    transform: [{ scale: 1.08 }],
  },
  centerButtonWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -35,
  },
  centerButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 5,
    borderColor: '#ffffff',
    shadowColor: '#2d5016',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 12,
  },
});