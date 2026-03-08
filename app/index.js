import { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ImageBackground } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/authContext';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function StartPage() {
    const {isAuthenticated} = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (typeof isAuthenticated === 'undefined') return;
        const timer = setTimeout(() => {
            if (isAuthenticated) {
                router.replace('home');
            } else {
                router.replace('signIn');
            }
        }, 2000)
        return () => clearTimeout(timer);
    }, [isAuthenticated])

    return (
        <View style={styles.container}>
            <ImageBackground style={styles.image} source={require('../assets/images/image.jpg')}>    
                <View style={{paddingTop: 50}}>
                    <Text style={styles.title}>Map app</Text>
                </View>
                
                <View style={styles.loadingContainer}>
                    <ActivityIndicator style={styles.loadingLogo} size='large' color='#5C6BC0'/>
                </View>
            </ImageBackground>
        </View>
    )
}

const styles = StyleSheet.create({
    container: { 
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#ffffff'
    },
    loadingLogo: {
        justifyContent: 'center',
    },
    image: {
        width: 390, 
        height: 850
    },
    title: {
        textAlign: 'center',
        fontSize: 30,
        fontWeight: 'bold',
        marginBottom: 20,
        color: 'white'
    },
    loadingContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 300
    }
})