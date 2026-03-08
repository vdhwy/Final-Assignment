import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { collection, query, where, onSnapshot, doc, deleteDoc } from 'firebase/firestore'; 
import { db } from '../../firebaseConfig'; 
import { useAuth } from '../../context/authContext'; 
import Entypo from '@expo/vector-icons/Entypo';
import MapView, { Marker } from 'react-native-maps';
import Sorting from '../../components/Sorting'; 
import CardView from '../../components/CardView';
import { useRouter } from 'expo-router';
import AntDesign from '@expo/vector-icons/AntDesign';


export default function HomeScreen() {
    const router = useRouter();
    const { user } = useAuth();
    const flatListRef = useRef(null);

    //Location state
    const [locations, setLocations] = useState([]);

    //Loading state
    const [loading, setLoading] = useState(true);

    //Select button state
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [isMapModalVisible, setMapModalVisible] = useState(false);
    const [isDetailsModalVisible, setDetailsModalVisible] = useState(false); 

    //Sorting button state
    const [sortBy, setSortBy] = useState('date'); 
    const [isSelectionMode, setIsSelectionMode] = useState(false);
    const [selectedIds, setSelectedIds] = useState([]);

    //Navigate button state
    const [isPointingUp, setIsPointingUp] = useState(false);

    useEffect(() => {
        const currentUserId = user?.userId;
        if (!currentUserId) {
            setLoading(false);
            return;
        }

        setLoading(true);
        const q = query(collection(db, 'locations'), where('userId', '==', currentUserId));

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const fetchedLocations = [];
            querySnapshot.forEach((doc) => {
                fetchedLocations.push({ id: doc.id, ...doc.data() });
            });
            setLocations(fetchedLocations);
            setLoading(false);
        }, (error) => {
            console.error("Real-time fetch error: ", error);
            Alert.alert("Database Error", error.message);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user?.userId]);

    const sortedLocations = [...locations].sort((a, b) => {
        if (sortBy === 'name') {
            return (a.name || '').localeCompare(b.name || '');
        } else {
            const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
            const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
            return timeB - timeA;
        }
    });

    //Delete single cards
    const deleteSingleLocation = (id) => {
        Alert.alert("Delete Location", "Are you sure you want to delete this review?", [
            { text: "Cancel", style: "cancel" },
            { text: "Delete", style: "destructive", onPress: async () => {
                await deleteDoc(doc(db, 'locations', id));
                setDetailsModalVisible(false); 
            }}
        ]);
    };

    //Delete selected cards
    const deleteSelectedLocations = () => {
        if (selectedIds.length === 0) return;
        Alert.alert("Delete Selected", `Are you sure you want to delete ${selectedIds.length} locations?`, [
            { text: "Cancel", style: "cancel" },
            { text: "Delete", style: "destructive", onPress: async () => {
                setLoading(true);
                await Promise.all(selectedIds.map(id => deleteDoc(doc(db, 'locations', id))));
                setSelectedIds([]);
                setIsSelectionMode(false);
                setLoading(false);
            }}
        ]);
    };

    //Delete all cards
    const clearAllLocations = () => {
        if (locations.length === 0) return;
        Alert.alert("Clear All", "Are you sure you want to delete ALL your reviews? This cannot be undone.", [
            { text: "Cancel", style: "cancel" },
            { text: "Delete All", style: "destructive", onPress: async () => {
                setLoading(true);
                await Promise.all(locations.map(item => deleteDoc(doc(db, 'locations', item.id))));
                setLoading(false);
            }}
        ]);
    };

    //Scroll handle
    const handleScroll = (event) => {
        const { contentOffset } = event.nativeEvent;
        setIsPointingUp(contentOffset.y > 200); 
    };
    const scrollToTop = () => flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
    const scrollToBottom = () => flatListRef.current?.scrollToEnd({ animated: true });

    //Toggle Selection
    const toggleSelection = (id) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter(itemId => itemId !== id));
        } else {
            setSelectedIds([...selectedIds, id]);
        }
    };

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#5C6BC0" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {locations.length === 0 ? (
                <View style={styles.centered}>
                    <Entypo name="magnifying-glass" size={50} color="gray" />
                    <View style={{flexDirection: 'row'}}>
                        <Text style={styles.emptyText}>You haven't added any locations yet!</Text>
                        <TouchableOpacity onPress={() => router.push('reviews')}>
                            <Text style={[styles.emptyText, {color: '#5C6BC0'}]}> Add now?</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            ) : (
                <FlatList
                    ref={flatListRef}
                    data={sortedLocations} 
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContainer}
                    onScroll={handleScroll}
                    scrollEventThrottle={16}
                    ListHeaderComponent={locations.length > 0 ? (
                        <Sorting 
                            sortBy={sortBy}
                            setSortBy={setSortBy}
                            isSelectionMode={isSelectionMode}
                            setIsSelectionMode={setIsSelectionMode}
                            setSelectedIds={setSelectedIds}
                        />
                    ) : null}
                    ListEmptyComponent={() => (
                        <View style={styles.centeredEmpty}>
                            <Entypo name="magnifying-glass" size={50} color="gray" />
                            <View style={{flexDirection: 'row', marginTop: 10}}>
                                <Text style={styles.emptyText}>You haven't added any locations yet!</Text>
                                <TouchableOpacity onPress={() => router.push('reviews')}>
                                    <Text style={[styles.emptyText, {color: '#5C6BC0', fontWeight: 'bold'}]}> Add now?</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                    ListFooterComponent={locations.length > 0 && !isSelectionMode ? (
                        <TouchableOpacity style={styles.clearAllButton} onPress={clearAllLocations}>
                            <Ionicons name="trash-bin-outline" size={20} color="white" />
                            <Text style={styles.clearAllButtonText}>Clear all locations</Text>
                        </TouchableOpacity>
                    ) : null}
                    renderItem={({ item }) => (
                        <CardView 
                            item={item}
                            isSelectionMode={isSelectionMode}
                            isSelected={selectedIds.includes(item.id)}
                            toggleSelection={toggleSelection}
                            openDetailsModal={(loc) => { setSelectedLocation(loc); setDetailsModalVisible(true); }}
                            openMapModal={(loc) => { setSelectedLocation(loc); setMapModalVisible(true); }}
                            deleteSingleLocation={deleteSingleLocation}
                            openUpdateScreen={() => handleUpdateLocation(item)}
                        />
                    )}
                />
            )}
            {locations.length > 0 && (
                <View style={styles.scrollButtonsContainer}>
                    <TouchableOpacity style={styles.scrollNavButton} onPress={isPointingUp ? scrollToTop : scrollToBottom}>
                        <Ionicons name={isPointingUp ? "chevron-up" : "chevron-down"} size={28} color="white" />
                    </TouchableOpacity>
                </View>
            )}
            {isSelectionMode && selectedIds.length > 0 && (
                <TouchableOpacity style={styles.floatingDeleteButton} onPress={deleteSelectedLocations}>
                    <Ionicons name="trash" size={24} color="white" />
                    <Text style={styles.floatingDeleteText}>Delete Selected ({selectedIds.length})</Text>
                </TouchableOpacity>
            )}

            <Modal visible={isMapModalVisible} animationType="slide">
                <View style={styles.modalContainer}>
                    {selectedLocation && (
                        <MapView 
                            style={styles.map} 
                            initialRegion={{
                                latitude: selectedLocation.latitude,
                                longitude: selectedLocation.longitude,
                                latitudeDelta: 0.01,
                                longitudeDelta: 0.01,
                            }}
                        >
                            <Marker coordinate={{ latitude: selectedLocation.latitude, longitude: selectedLocation.longitude }} title={selectedLocation.name} pinColor="#5C6BC0" />
                        </MapView>
                    )}
                    <View style={styles.modalFooter}>
                        <TouchableOpacity style={styles.closeMapButton} onPress={() => setMapModalVisible(false)}>
                            <AntDesign name="close-circle" size={24} color="#ccc" />
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            <Modal visible={isDetailsModalVisible} animationType="fade" transparent={true}>
                <View style={styles.modalOverlay}>
                    <View style={styles.detailsCard}>
                        {selectedLocation && (
                            <>
                                <View style={styles.detailsHeader}>
                                    <Text style={styles.detailsTitle}>{selectedLocation.name}</Text>
                                    <TouchableOpacity onPress={() => setDetailsModalVisible(false)}>
                                        <Ionicons name="close-circle" size={28} color="#ccc" />
                                    </TouchableOpacity>
                                </View>
                                {/* Star rendering */}
                                <View style={styles.modalStarRow}>
                                    {[1, 2, 3, 4, 5].map((i) => (
                                        <Ionicons key={i} name={selectedLocation.rating >= i ? 'star' : selectedLocation.rating >= i - 0.5 ? 'star-half' : 'star-outline'} size={16} color={selectedLocation.rating >= i - 0.5 ? '#FFD700' : '#d3d3d3'} />
                                    ))}
                                </View>
                                <Text style={styles.fullDescription}>{selectedLocation.description.trim()}</Text>
                                <Text>
                                    Last updated: {selectedLocation.createdAt?.toDate 
                                        ? selectedLocation.createdAt.toDate().toLocaleDateString() 
                                        : 'Unknown date'}
                                </Text>
                                <View style={styles.deleteContainer}>
                                    <TouchableOpacity style={styles.deleteCardButton} onPress={() => deleteSingleLocation(selectedLocation.id)}>
                                        <Ionicons style={{textAlign: 'center'}} name="trash-outline" size={20} color="white" />
                                    </TouchableOpacity>
                                </View>
                            </>
                        )}
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        backgroundColor: '#f5f5f5' 
    },
    centered: { 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center', 
        padding: 20 
    },
    emptyText: {
        fontSize: 16, 
        color: '#666', 
        marginTop: 10 
    },
    listContainer: { 
        padding: 15, 
        paddingBottom: 80 
    }, 
    floatingDeleteButton: {
        position: 'absolute',
        bottom: 30,
        left: 30,
        right: 30,
        backgroundColor: '#ef5350',
        paddingVertical: 15,
        borderRadius: 12,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
    },
    floatingDeleteText: { 
        color: 'white', 
        fontSize: 18, 
        fontWeight: 'bold', 
        marginLeft: 10 
    },
    modalContainer: { flex: 1 },
    map: { 
        width: '100%', 
        height: '100%' 
    },
    modalFooter: { 
        position: 'absolute', 
        top: 50, 
        right: 5,
        width: '24%', 
        paddingHorizontal: 20,
    },
    closeMapButton: { 
        backgroundColor: '#5C6BC0', 
        padding: 15, 
        borderRadius: 30, 
        alignItems: 'flex-start', 
        shadowColor: '#000', 
        shadowOffset: { width: 0, height: 2 }, 
        shadowOpacity: 0.3, 
        shadowRadius: 4, 
        elevation: 5 
    },
    closeMapButtonText: { 
        color: 'white', 
        fontSize: 5, 
        fontWeight: 'bold' 
    },
    modalOverlay: { 
        flex: 1, 
        backgroundColor: 'rgba(0, 0, 0, 0.5)', 
        justifyContent: 'center', 
        alignItems: 'center', 
        padding: 20 
    },
    detailsCard: { 
        width: '100%', 
        backgroundColor: 'white', 
        borderRadius: 15, 
        padding: 20, 
        shadowColor: '#000', 
        shadowOffset: { width: 0, height: 2 }, 
        shadowOpacity: 0.25, 
        shadowRadius: 4, 
        elevation: 5 
    },
    detailsHeader: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: 10 
    },
    detailsTitle: { 
        fontSize: 22, 
        fontWeight: 'bold', 
        color: '#333', 
        flex: 1 
    },
    modalStarRow: { 
        flexDirection: 'row', 
        marginBottom: 15 
    },
    fullDescription: { 
        fontSize: 16, 
        color: '#444', 
        lineHeight: 24, 
        marginBottom: 20 
    },
    coordinateText: { 
        fontSize: 12, 
        color: '#888', 
        fontStyle: 'italic', 
        textAlign: 'right' 
    },

    clearAllButton: {
        backgroundColor: '#ef5350', // A nice red to indicate a destructive action
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 12,
        marginBottom: 15, 
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
    },
    clearAllButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
        marginLeft: 8,
    },
    deleteCardButton: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#ff3b3bff',
        borderRadius: 5,
        width: '10%',
        height: 30
    },
    deleteContainer: {
        alignItems: 'flex-end',
        paddingTop: 20,
    },
    scrollButtonsContainer: {
        position: 'absolute',
        right: 20,
        bottom: 40,
        alignItems: 'center',
    },
    scrollNavButton: {
        backgroundColor: 'rgba(92, 107, 192, 0.9)', // Slightly transparent primary color
        width: 45,
        height: 45,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
    },
});