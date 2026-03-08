import React, { useState, useEffect, useRef } from 'react'; // 👈 Add useRef here
import { TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';

export default function CenterUser({ setMapRegion, mapRef }) { 
    
    const centerOnUserLocation = async () => {
        try {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission Denied', 'Allow location access to use this feature.');
                return;
            }

            let location = await Location.getCurrentPositionAsync({});
            
            const newRegion = {
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
            };

            // Pan camera view
            if (mapRef && mapRef.current) {
                mapRef.current.animateToRegion(newRegion, 1000); // 1000ms animation
            }

        } catch (error) {
            console.error("Error getting location: ", error);
        }
    };

    return (
        <TouchableOpacity style={styles.myLocationButton} onPress={centerOnUserLocation}>
            <Ionicons name="navigate" size={24} color="#5C6BC0" />
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    myLocationButton: {
        position: 'absolute',
        bottom: 110, 
        right: 20,
        backgroundColor: 'white',
        padding: 12,
        borderRadius: 30, 
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        zIndex: 10,
    },
});