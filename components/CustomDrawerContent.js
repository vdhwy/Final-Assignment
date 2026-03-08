import { useAuth } from '../context/authContext';
import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
// 👇 1. Added Image to the import!
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native'; 
import { Ionicons } from '@expo/vector-icons';

export default function CustomDrawerContent(props) {
    const router = useRouter();
    const { logout, user } = useAuth();
    const { bottom } = useSafeAreaInsets();
    
    const handleLogout = async () => {
        await logout();
        router.replace('signIn');
    }

    return (
        <View style={{ flex: 1 }}>
            <DrawerContentScrollView {...props}>
                <View style={styles.profileHeader}>
                    {/* 👇 2. Swapped profileImage to profileImageUrl */}
                    {user?.profileImageUrl ? (
                        <Image 
                            source={{ uri: user.profileImageUrl }} 
                            style={styles.drawerProfileImage}
                        />
                    ) : (
                        <Ionicons style={styles.icon} name="person-circle-outline" size={40} color="#555" />
                    )}
                    
                    <Text style={styles.usernameText}>
                        {user?.username || user?.displayName || 'Guest User'}
                    </Text>
                </View>
                <DrawerItemList {...props}/>
            </DrawerContentScrollView>
            <View style={[styles.signOutContainer, { paddingBottom: bottom }]}>
                <TouchableOpacity onPress={handleLogout} style={styles.signOutButton}>
                    <Ionicons name="log-out-outline" size={24} color="#d9534f" />
                    <Text style={styles.signOutText}>Sign Out</Text>
                </TouchableOpacity>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    signOutContainer: { 
        paddingHorizontal: 25, 
        paddingTop: 20, 
        borderTopWidth: 1, 
        borderTopColor: '#e0e0e0' 
    },
    signOutText: { 
        fontSize: 16,
        marginLeft: 15, 
        fontWeight: 'bold', 
        color: '#d9534f' 
    },
    signOutButton: { 
        flexDirection: 'row', 
        alignItems: 'center' 
    },
    profileHeader: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        paddingHorizontal: 20, 
        paddingVertical: 10, 
        borderBottomWidth: 1, 
        borderBottomColor: '#f0f0f0', 
        marginBottom: 10 
    },
    usernameText: { 
        fontSize: 16, 
        paddingLeft: 10, 
        fontWeight: 'bold' 
    },
    icon: { marginRight: 5 },
    
    drawerProfileImage: {
        width: 40,
        height: 40,
        borderRadius: 20, // Makes it a perfect circle
    }
})