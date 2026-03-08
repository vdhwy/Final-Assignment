// app/(app)/profile.js
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native';
import { useAuth } from '../../context/authContext';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { setDoc, doc } from 'firebase/firestore';
import { db, auth, storage } from '../../firebaseConfig';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export default function ProfileScreen() {
    const { user, setUser } = useAuth();
    const [image, setImage] = useState(auth?.currentUserprofileImageUrl || null);
    const [uploading, setUploading] = useState(false);

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled) {
            const localUri = result.assets[0].uri;
            
            setImage(localUri); 
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.headerSection}>
                <TouchableOpacity onPress={pickImage} style={styles.imageContainer} disabled={uploading}>
                    {image ? (
                        <Image source={{ uri: image }} style={styles.profileImage} />
                    ) : (
                        <View style={styles.placeholder}>
                            <Ionicons name="camera" size={40} color="#a0a0a0" />
                        </View>
                    )}
                    <View style={styles.editBadge}>
                        {uploading ? (
                            <Ionicons name='cloud-upload' size={14} color='white'/>
                        ) : (
                            <Ionicons name="pencil" size={14} color="white" />
                        )}
                    </View>
                </TouchableOpacity>
            </View>

            <View style={styles.infoSection}>
                <View style={styles.infoRow}>
                    <Text style={styles.label}>Username</Text>
                    <Text style={styles.value}>{user?.username || 'Guest User'}</Text>
                </View>

                <View style={styles.infoRow}>
                    <Text style={styles.label}>Email</Text>
                    <Text style={styles.value}>{user?.email || auth?.currentUser?.email || 'No email provided'}</Text>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    headerSection: {
        alignItems: 'center',
        paddingVertical: 40,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    imageContainer: {
        position: 'relative',
    },
    profileImage: {
        width: 120,
        height: 120,
        borderRadius: 60, // Makes it perfectly round
    },
    placeholder: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#e0e0e0',
        alignItems: 'center',
        justifyContent: 'center',
    },
    editBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#5C6BC0',
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 3,
        borderColor: 'white',
    },
    infoSection: {
        padding: 20,
    },
    infoRow: {
        backgroundColor: 'white',
        padding: 15,
        borderRadius: 10,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    label: {
        fontSize: 12,
        color: '#666',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 5,
    },
    value: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    }
});