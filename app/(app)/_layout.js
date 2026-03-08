import { View, Text,TouchableOpacity, StyleSheet, Image } from 'react-native';
import React from 'react';
import HomeHeader from '../../components/HomeHeader'; // Adjust path if needed
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Drawer } from 'expo-router/drawer';
import { Ionicons } from '@expo/vector-icons';
import CustomDrawerContent from '../../components/CustomDrawerContent';
import ProfileHeader from '../../components/ProfileHeader';
import MapHeader from '../../components/MapHeader';
import Entypo from '@expo/vector-icons/Entypo';
import LocationHeader from '../../components/LocationHeader';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

export default function _layout() {
    return (
        <GestureHandlerRootView style={{ flex: 1}}>
            <Drawer drawerContent={(props) => <CustomDrawerContent {...props}/>}
                screenOptions={{
                    drawerStyle: {
                        width: '70%',
                    },
                    drawerActiveTintColor: '#5C6BC0',
                }} 
            >
                <Drawer.Screen
                    name="home"
                    options={{
                        header: () => <HomeHeader/>,
                        drawerLabel: 'Home',
                        drawerIcon: ({ color, size }) => (
                            <Ionicons name="home-outline" size={size} color={color} />
                        )
                    }}
                />
                <Drawer.Screen
                    name="profile" 
                    options={{
                        header: () => <ProfileHeader/>,
                        drawerLabel: 'Profile',
                        drawerIcon: ({ color, size }) => (
                            <Ionicons name="person-outline" size={size} color={color} />
                        )
                    }}
                />
                <Drawer.Screen
                    name="reviews"
                    options={{
                        header: () => <LocationHeader/>,
                        drawerLabel: 'Reviews',
                        drawerIcon: ({ color, size }) => (
                            <MaterialIcons name="rate-review" size={24} color="gray" />
                        )
                    }}
                />
                <Drawer.Screen
                    name="map"
                    options={{
                        header: () => <MapHeader/>,
                        drawerLabel: 'Map view',
                        drawerIcon: ({ color, size }) => (
                            <Ionicons name="map-outline" size={24} color="gray" />
                        )
                    }}
                />
            </Drawer>
        </GestureHandlerRootView>
    )
}