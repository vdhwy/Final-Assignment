import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function Sorting({ sortBy, setSortBy, isSelectionMode, setIsSelectionMode, setSelectedIds }) {
    return (
        <View style={styles.topControls}>
            <TouchableOpacity 
                style={styles.controlButton} 
                onPress={() => setSortBy(sortBy === 'date' ? 'name' : 'date')}
            >
                <Ionicons name="swap-vertical" size={16} color="#5C6BC0" />
                <Text style={styles.controlText}>Sort: {sortBy === 'date' ? 'Date' : 'Name'}</Text>
            </TouchableOpacity>

            <TouchableOpacity 
                style={styles.controlButton} 
                onPress={() => {
                    setIsSelectionMode(!isSelectionMode);
                    setSelectedIds([]);
                }}
            >
                <Ionicons name={isSelectionMode ? "close-circle" : "checkbox-outline"} size={16} color="#5C6BC0" />
                <Text style={styles.controlText}>{isSelectionMode ? 'Cancel' : 'Select'}</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    topControls: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        paddingVertical: 10,
        marginBottom: 10,
    },
    controlButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 15,
        borderWidth: 1,
        borderColor: '#5C6BC0',
        borderRadius: 8,
        backgroundColor: 'white',
        marginRight: 15,
    },
    controlText: {
        marginLeft: 5,
        fontSize: 14,
        fontWeight: 'bold',
        color: '#5C6BC0',
    }
});