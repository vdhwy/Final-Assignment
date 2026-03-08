import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Entypo from '@expo/vector-icons/Entypo';

export default function CardView({ 
    item, 
    isSelectionMode, 
    isSelected, 
    toggleSelection, 
    openDetailsModal, 
    openMapModal, 
    openUpdateScreen
}) {
    
    const renderStars = (rating) => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            let iconName = 'star-outline';
            if (rating >= i) iconName = 'star';
            else if (rating === i - 0.5) iconName = 'star-half';
            stars.push(<Ionicons key={i} name={iconName} size={16} color={rating >= i - 0.5 ? '#FFD700' : '#d3d3d3'} />);
        }
        return <View style={styles.starRow}>{stars}</View>;
    };

    const truncateText = (text, limit) => {
        if (!text) return '';
        if (text.length <= limit) return text;
        return `${text.substring(0, limit)}...`;
    };

    return (
        <TouchableOpacity 
            activeOpacity={isSelectionMode ? 0.7 : 1}
            onPress={() => isSelectionMode && toggleSelection(item.id)}
            style={[styles.card, isSelectionMode && isSelected && styles.cardSelected]}
        >
            <View style={styles.cardHeader}>
                <Text style={styles.locationName}>{item.name}</Text>
                {isSelectionMode ? (
                    <Ionicons 
                        name={isSelected ? "checkmark-circle" : "ellipse-outline"} 
                        size={24} 
                        color="#5C6BC0" 
                    />
                ) : (
                    renderStars(item.rating)
                )}
            </View>

            <Text style={styles.description} numberOfLines={2}>
                {truncateText(item.description, 30).trim()}
            </Text>

            <View style={styles.buttonRow}>
                <TouchableOpacity style={styles.mapLinkButton} onPress={() => openMapModal(item)} disabled={isSelectionMode}>
                    <Entypo name="location-pin" size={20} color="white" />
                    <Text style={styles.mapLinkText}>View</Text>
                </TouchableOpacity>

                {!isSelectionMode && (
                    <View style={styles.actionIconsRight}>
                        <TouchableOpacity onPress={openUpdateScreen} style={styles.editButton}>
                            <Ionicons name="pencil" size={20} color="white" />
                        </TouchableOpacity>
                        
                        <TouchableOpacity style={styles.detailsButton} onPress={() => openDetailsModal(item)} disabled={isSelectionMode}>
                            <Entypo name="dots-three-horizontal" size={20} color="#5C6BC0" />
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: 'white',
        borderRadius: 15,
        padding: 20,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    cardSelected: {
        borderColor: '#5C6BC0',
        borderWidth: 2,
        backgroundColor: '#f8f9ff',
    },
    cardHeader: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: 10 
    },
    locationName: { 
        fontSize: 18, 
        fontWeight: 'bold', 
        color: '#333', 
        flex: 1, 
        marginRight: 10 
    },
    starRow: { flexDirection: 'row' },
    description: { 
        fontSize: 14, 
        color: '#555', 
        lineHeight: 20, 
        marginBottom: 15 
    },
    buttonRow: { 
        flexDirection: 'row', 
        justifyContent: 'flex-start', 
        alignItems: 'center', 
        gap: 10 
    },
    detailsButton: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        backgroundColor: '#e8eaf6', 
        paddingVertical: 8, 
        paddingHorizontal: 15, 
        borderRadius: 8 
    },
    detailsButtonText: { 
        color: '#5C6BC0', 
        fontWeight: 'bold', 
        marginLeft: 5 
    },
    mapLinkButton: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        backgroundColor: '#5C6BC0', 
        paddingVertical: 8, 
        paddingHorizontal: 10, 
        borderRadius: 8 
    },
    mapLinkText: { 
        color: 'white', 
        fontWeight: 'bold', 
        marginLeft: 5 
    },
    deleteCardButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ef5350', 
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
        marginLeft: 'auto', 
    },
    actionIconsRight: {
        flexDirection: 'row',
        marginLeft: 'auto', 
        gap: 10,
    },
});