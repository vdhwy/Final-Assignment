import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert, TextInput, FlatList, TouchableOpacity } from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import * as Location from 'expo-location';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebaseConfig'; 
import { useAuth } from '../../context/authContext'; 
import { Ionicons } from '@expo/vector-icons'; 
import CenterUser from '../../components/CenterUser';

export default function MapScreen() {
    const { user } = useAuth();
    const [locations, setLocations] = useState([]);
    
    const [mapRegion, setMapRegion] = useState(null);
    const [firebaseLoading, setFirebaseLoading] = useState(true);
    const [locationLoading, setLocationLoading] = useState(true);

    // New states for the Country Search and Map Ref
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const mapRef = useRef(null); // Used to animate the map camera

    useEffect(() => {
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission to access location was denied');
                return;
            }

            let currentLocation = await Location.getCurrentPositionAsync({});
            setMapRegion({
                latitude: currentLocation.coords.latitude,
                longitude: currentLocation.coords.longitude,
                latitudeDelta: 0.05,
                longitudeDelta: 0.05,
            });
            setLocationLoading(false);
        })();
    }, []);

    useEffect(() => {
        const currentUserId = user?.userId || user?.uid;
        if (!currentUserId) {
          setFirebaseLoading(false);
          return;
        }
        const q = query(collection(db, 'locations'), where('userId', '==', currentUserId));

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const fetchedLocations = [];
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                if (data.latitude && data.longitude) {
                    fetchedLocations.push({ id: doc.id, ...data });
                }
            });
            setLocations(fetchedLocations);
            setFirebaseLoading(false);
        }, (error) => {
            console.error("Error fetching map locations: ", error);
            setFirebaseLoading(false);
        });

        return () => unsubscribe();
    }, [user?.userId, user?.uid]);

    const handleSearchCountry = async (text) => {
        setSearchQuery(text);
        
        if (text.length < 2) {
            setSearchResults([]);
            return;
        }

        setIsSearching(true);
        try {
            // Fetch data from REST Countries API
            const response = await fetch(`https://restcountries.com/v3.1/name/${text}`);
            if (response.ok) {
                const data = await response.json();
                setSearchResults(data);
            } else {
                setSearchResults([]);
            }
        } catch (error) {
            console.error("Error fetching country: ", error);
            setSearchResults([]);
        } finally {
            setIsSearching(false);
        }
    };

    // 👇 3Handle selecting a country from the dropdown
    const handleSelectCountry = (country) => {
        setSearchQuery(country.name.common); // Put the name in the input box
        setSearchResults([]); // Hide the dropdown

        // Animate the map to the country's coordinates
        if (country.latlng && mapRef.current) {
            mapRef.current.animateToRegion({
                latitude: country.latlng[0],
                longitude: country.latlng[1],
                latitudeDelta: 10, // Zoomed out to see the whole country
                longitudeDelta: 10,
            }, 1000); // 1000ms animation duration
        }
    };

    if (firebaseLoading || locationLoading || !mapRegion) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#5C6BC0" />
                <Text style={styles.loadingText}>Finding your location...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            
            {/* 👇 4. The Floating Search Bar Overlay */}
            <View style={styles.searchOverlay}>
                <View style={styles.searchBarContainer}>
                    <Ionicons name="search" size={20} color="gray" style={styles.searchIcon} />
                    <TextInput
                        style={styles.mapSearchInput}
                        placeholder="Search for a country..."
                        value={searchQuery}
                        onChangeText={handleSearchCountry}
                    />
                    {isSearching && <ActivityIndicator size="small" color="#5C6BC0" style={{ marginRight: 10 }} />}
                </View>

                {/* The Dropdown Results */}
                {searchResults.length > 0 && (
                    <FlatList
                        data={searchResults}
                        keyExtractor={(item) => item.cca3}
                        style={styles.searchResultsList}
                        keyboardShouldPersistTaps="handled" 
                        renderItem={({ item }) => (
                            <TouchableOpacity 
                                style={styles.searchResultItem}
                                onPress={() => handleSelectCountry(item)}
                            >
                                <Text style={styles.searchResultText}>{item.name.common}</Text>
                                <Text style={styles.searchResultFlag}>{item.flag}</Text>
                            </TouchableOpacity>
                        )}
                    />
                )}
            </View>

            <MapView 
                ref={mapRef} 
                style={styles.map} 
                initialRegion={mapRegion}
                showsUserLocation={true} 
                showsMyLocationButton={true} 
            >
                {locations.map((loc) => (
                    <Marker
                        key={loc.id}
                        coordinate={{ latitude: loc.latitude, longitude: loc.longitude }}
                        pinColor="#5C6BC0" 
                    >
                        <Callout>
                            <View style={styles.calloutContainer}>
                                <Text style={styles.calloutTitle}>{loc.name}</Text>
                                <Text style={styles.calloutRating}>⭐️ {loc.rating} / 5</Text>
                                <Text style={styles.calloutDesc} numberOfLines={2}>{loc.description}</Text>
                            </View>
                        </Callout>
                    </Marker>
                ))}
                <CenterUser style={{paddingHorizontal: 100}} setMapRegion={setMapRegion} mapRef={mapRef}/>
            </MapView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 10,
        color: '#666',
        fontSize: 16,
    },
    map: {
        width: '100%',
        height: '100%',
    },
    calloutContainer: {
        width: 150,
        padding: 5,
    },
    calloutTitle: {
        fontWeight: 'bold',
        fontSize: 16,
        marginBottom: 2,
    },
    calloutRating: {
        fontSize: 12,
        color: '#FFD700',
        fontWeight: 'bold',
        marginBottom: 4,
    },
    calloutDesc: {
        fontSize: 12,
        color: '#555',
    },
    // 👇 Search Overlay Styles
    searchOverlay: {
        position: 'absolute',
        paddingTop: 20,
        width: '100%',
        paddingHorizontal: 20,
        zIndex: 10, // Keeps it on top of the Map
    },
    searchBarContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        borderRadius: 10,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    searchIcon: {
        paddingLeft: 15,
    },
    mapSearchInput: {
        flex: 1,
        height: 50,
        paddingHorizontal: 10,
        fontSize: 16,
    },
    searchResultsList: {
        backgroundColor: 'white',
        borderRadius: 10,
        marginTop: 5,
        maxHeight: 200, 
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    searchResultItem: {
        flexDirection: 'row',
        justifyContent: 'space-between', // Pushes text to left, flag to right
        alignItems: 'center',
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    searchResultText: {
        fontSize: 16,
        color: '#333',
        flex: 1,
    },
    searchResultFlag: {
        fontSize: 24, // Makes the flag emoji nice and clear
    }
});