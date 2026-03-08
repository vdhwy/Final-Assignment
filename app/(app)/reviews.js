import React, { useState, useEffect, useRef  } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, Modal, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../firebaseConfig'; 
import { useAuth } from '../../context/authContext'; 
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import CenterUser from '../../components/CenterUser';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

export default function AddLocationScreen() {
    const { user } = useAuth(); 
    const mapRef = useRef(null); // 👈 Creates the reference

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [rating, setRating] = useState(0);
    const [isSaving, setIsSaving] = useState(false);

    // Map Modal State
    const [isMapModalVisible, setMapModalVisible] = useState(false);
    
    // Custom Autocomplete State
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);

    // Set default map location
    const [mapRegion, setMapRegion] = useState(''); 
    const [selectedLocation, setSelectedLocation] = useState(null); 

    useEffect(() => {
        Location.requestForegroundPermissionsAsync().then(response => {
            if (response.status === 'granted') {
                Location.getCurrentPositionAsync({}).then(location => {
                    setMapRegion({
                        latitude: location.coords.latitude,
                        longitude: location.coords.longitude,
                        latitudeDelta: 0.05,
                        longitudeDelta: 0.05,
                    });
                    setSelectedLocation({
                        latitude: location.coords.latitude,
                        longitude: location.coords.longitude,
                    });
                })
            }
        });
    }, []);

    const handleStarPress = (starNumber) => {
        if (rating === starNumber) {
            setRating(starNumber - 0.5);
        } else if (rating === starNumber - 0.5) {
            setRating(0);
        } else {
            setRating(starNumber);
        }
    };

    const searchPlaces = async (text) => {
        setSearchQuery(text);
        
        if (!text) {
            setSearchResults([]);
            return;
        }

        setIsSearching(true);
        try {
            
            const response = await fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(text)}`);
            
            if (!response.ok) throw new Error("Network response was not ok");
            
            const data = await response.json();     
            setSearchResults(data.features);
        } catch (error) {
            console.error("Error fetching places:", error);
        } finally {
            setIsSearching(false);
        }
    };

    const handleClearSelection = () => {
        setSearchQuery('');
        setSearchResults([]);
        setName('');
        setSelectedLocation(null);
    };
    
    const handleSelectPlace = (feature) => {
        const { name, city, state, country } = feature.properties;
        const [lon, lat] = feature.geometry.coordinates; 

        const displayName = [name, city, state, country].filter(Boolean).join(', ');

        setName(displayName || 'Selected Location');
        setSearchQuery(displayName); 
        setSearchResults([]); 

        setMapRegion({
            latitude: lat,
            longitude: lon,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
        });
        setSelectedLocation({
            latitude: lat,
            longitude: lon,
        });
    };

    const handleSaveLocation = async () => {
        if (!name || !description || rating === 0 || !selectedLocation) {
            Alert.alert('Missing Fields', 'Please fill out all fields and ensure a location is selected.');
            return;
        }

        setIsSaving(true);
        try {
            await addDoc(collection(db, 'locations'), {
                name: name,
                description: description,
                rating: rating,
                createdAt: new Date(),
                userId: user.userId,
                latitude: selectedLocation.latitude,
                longitude: selectedLocation.longitude
            });

            Alert.alert('Success!', 'Location saved.');
            setName('');
            setDescription('');
            setRating(0);
            setSearchQuery('');
        } catch (error) {
            console.error('Error adding location: ', error);
            Alert.alert('Save Failed', 'Could not save the location.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <Text style={styles.headerTitle}>Add new location</Text>

            <View style={[styles.inputGroup, {zIndex: 100}]}>
                <Text style={styles.label}>Location search</Text>
                
                <View style={styles.searchBarContainer}>
                    <Ionicons name="search" size={20} color="gray" style={styles.searchIcon} />
                    <TextInput
                        style={styles.mapSearchInput}
                        placeholder="Search for a place..."
                        value={searchQuery}
                        onChangeText={searchPlaces}
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={handleClearSelection} style={{ paddingHorizontal: 10 }}>
                            <Ionicons name="close-circle" size={20} color="#999" />
                        </TouchableOpacity>
                    )}
                    {isSearching && <ActivityIndicator size="small" color="#5C6BC0" style={{ marginRight: 10 }} />}
                    <TouchableOpacity style={styles.inlineMapButton} onPress={() => setMapModalVisible(true)}>
                        <Ionicons name="map" size={24} color="white" />
                    </TouchableOpacity>
                </View>

                {searchResults.length > 0 && (
                    <FlatList
                        data={searchResults}
                        keyExtractor={(item, index) => {
                            if (item.geometry && item.geometry.coordinates) {
                                return `${item.properties?.name} || 'loc'}-${item.geometry.coordinates[0]}-${item.geometry.coordinates[1]}-${index}`;
                            }
                            return `loc-${index}`;
                        }}    
                        style={styles.searchResultsList}
                        renderItem={({ item }) => {
                            const {name, city, state, country} = item.properties;
                            const displayLabel = [name, city, state, country].filter(Boolean).join(', ');
                            return (
                                <TouchableOpacity 
                                    style={styles.searchResultItem}
                                    onPress={() => handleSelectPlace(item)} 
                                >
                                    <Ionicons name="location-outline" size={20} color="gray" />
                                    <Text style={styles.searchResultText}>
                                        {displayLabel}
                                    </Text>
                                </TouchableOpacity>
                            );
                        }}  
                    />
                )}
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>Description</Text>
                <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="A beautiful place to visit..."
                    value={description}
                    onChangeText={setDescription}
                    multiline={true}
                    numberOfLines={4}
                />
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>Rating</Text>
                <View style={styles.starContainer}>
                    {[1, 2, 3, 4, 5].map((starNumber) => {
                        let iconName = 'star-outline';
                        if (rating >= starNumber) iconName = 'star';
                        else if (rating === starNumber - 0.5) iconName = 'star-half';

                        const iconColor = rating >= starNumber - 0.5 ? '#FFD700' : '#d3d3d3';

                        return (
                            <TouchableOpacity 
                                key={starNumber} 
                                onPress={() => handleStarPress(starNumber)}
                                style={styles.starButton}
                                activeOpacity={0.7}
                            >
                                <Ionicons name={iconName} size={40} color={iconColor} />
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </View>

            <TouchableOpacity 
                style={[styles.saveButton, isSaving && styles.saveButtonDisabled]} 
                onPress={handleSaveLocation}
                disabled={isSaving}
            >
                {isSaving ? <ActivityIndicator color="white" /> : <Text style={styles.saveButtonText}>Save Location</Text>}
            </TouchableOpacity>

            <Modal visible={isMapModalVisible} animationType="slide">
                <View style={styles.modalContainer}>
                    
                    <MapView style={styles.map} region={mapRegion} showsUserLocation={true} ref={mapRef}>
                        <Marker coordinate={{ latitude: mapRegion.latitude, longitude: mapRegion.longitude }} />
                    </MapView>

                    <View style={styles.modalSearchOverlay}>
                        <View style={styles.searchBarContainer}>
                            <Ionicons name="search" size={20} color="gray" style={styles.searchIcon} />
                            <TextInput 
                                style={styles.mapSearchInput}
                                placeholder="Search map..."
                                value={searchQuery}
                                onChangeText={searchPlaces}
                            />
                            {searchQuery.length > 0 && (
                                <TouchableOpacity onPress={handleClearSelection} style={{ paddingHorizontal: 10 }}>
                                    <Ionicons name="close-circle" size={20} color="#999" />
                                </TouchableOpacity>
                            )}
                            {isSearching && <ActivityIndicator size="small" color="#5C6BC0" style={{ marginRight: 10 }} />}
                        </View>

                        {/* Modal Dropdown Results */}
                        {searchResults.length > 0 && (
                            <FlatList
                                data={searchResults}
                                keyboardShouldPersistTaps="handled" // Lets you tap results without closing keyboard first
                                keyExtractor={(item, index) => {
                                    if (item.geometry && item.geometry.coordinates) {
                                        return `modal-${item.properties?.name}-${item.geometry.coordinates[0]}-${index}`;
                                    }
                                    return `modal-loc-${index}`;
                                }}    
                                style={styles.modalSearchResultsList}
                                renderItem={({ item }) => {
                                    const {name, city, state, country} = item.properties;
                                    const displayLabel = [name, city, state, country].filter(Boolean).join(', ');
                                    return (
                                        <TouchableOpacity 
                                            style={styles.searchResultItem}
                                            onPress={() => handleSelectPlace(item)} 
                                        >
                                            <Ionicons name="location-outline" size={20} color="gray" />
                                            <Text style={styles.searchResultText}>
                                                {displayLabel}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                }}  
                            />
                        )}
                    </View>

                    <CenterUser setMapRegion={setMapRegion} mapRef={mapRef}/>

                    <View style={styles.modalFooter}>
                        <TouchableOpacity 
                            style={styles.cancelMapButton} 
                            onPress={() => [setMapModalVisible(false), handleClearSelection()]}
                        >
                            <Text style={styles.cancelMapButtonText}>Cancel</Text>
                        </TouchableOpacity>

                        <TouchableOpacity 
                            style={styles.confirmMapButton} 
                            onPress={() => setMapModalVisible(false)}
                        >
                            <Text style={styles.saveButtonText}>Confirm</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#f5f5f5',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#333',
        textAlign: 'center',
    },
    inputGroup: {
        marginBottom: 20,
        zIndex: 20, // Important so the dropdown doesn't get hidden behind the description box!
    },
    label: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#555',
        marginBottom: 8,
    },
    input: {
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 10,
        padding: 15,
        fontSize: 16,
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    starContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginVertical: 10,
    },
    starButton: {
        marginHorizontal: 5,
    },
    saveButton: {
        backgroundColor: '#5C6BC0',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 10,
    },
    saveButtonDisabled: {
        backgroundColor: '#9fa8da',
    },
    saveButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    // 👇 Merged Input + Map Button Styles
    searchBarContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 10,
    },
    searchIcon: {
        paddingLeft: 15,
    },
    mapSearchInput: {
        flex: 1,
        height: 50,
        paddingHorizontal: 10,
        fontSize: 16,
        color: '#5e71ddff'
    },
    inlineMapButton: {
        backgroundColor: '#5C6BC0',
        padding: 13,
        borderTopRightRadius: 10,
        borderBottomRightRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
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
        position: 'absolute',
        top: 80,
        width: '100%',
    },
    searchResultItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    searchResultText: {
        marginLeft: 10,
        flex: 1,
        fontSize: 14,
        color: '#333',
    },
    // Modal Styles
    modalContainer: {
        flex: 1,
    },
    map: {
        width: '100%',
        height: '100%',
    },
    modalFooter: {
        position: 'absolute',
        bottom: 40,
        width: '100%',
        paddingHorizontal: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 15, 
    },
    cancelMapButton: {
        flex: 1, 
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: '#5C6BC0',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
    cancelMapButtonText: {
        color: '#5C6BC0',
        fontSize: 18,
        fontWeight: 'bold',
    },
    confirmMapButton: {
        flex: 1, 
        backgroundColor: '#5C6BC0',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
    },
    modalMapSearchInput: {
        flex: 1,
        height: 50,
        paddingHorizontal: 10,
        fontSize: 16,
        backgroundColor: '#cbcbcbff'
    },
    // 👇 Styles for the floating modal search bar
    modalSearchOverlay: {
        position: 'absolute',
        top: 60, // Drops it just below the phone's notch/status bar
        width: '100%',
        paddingHorizontal: 20,
        zIndex: 50,
        elevation: 10,
    },
    modalSearchResultsList: {
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
    
});