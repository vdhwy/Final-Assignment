
import { View, Text, StatusBar, Image, StyleSheet, TouchableOpacity, Alert, Pressable, TextInput, TouchableWithoutFeedback } from 'react-native';
import { Octicons } from '@expo/vector-icons';
import AntDesign from '@expo/vector-icons/AntDesign';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { cloneElement, useState, useRef } from 'react';
import { AuthContextProvider, useAuth } from '../context/authContext';
import Loading from '../components/Loading';
import { useRouter } from 'expo-router';
import Feather from '@expo/vector-icons/Feather';
import CustomKeyboardView from '../components/CustomKeyboardView';
import { Ionicons } from '@expo/vector-icons';


export default function signUp() {
    const router = useRouter();
    const {register} = useAuth();

    //Loading state
    const [loading, setLoading] = useState(false);

    //Hidden password state
    const [isSecure, setIsSecure] = useState(true);

    //
    const emailRef = useRef('');
    const passwordRef = useRef('');
    const confirmPasswordRef = useRef('');
    const usernameRef = useRef('');

    const handleRegister = async () => {
        if (!emailRef.current || !passwordRef.current || !confirmPasswordRef.current || !usernameRef.current) {
            Alert.alert('Sign Up', 'Please fill in all the necessary information')
            return;
        }

        setLoading(true);

        let response = await register(emailRef.current, passwordRef.current, usernameRef.current, confirmPasswordRef.current);
        setLoading(false);
        
        console.log('Got result: ', response);
        if (!response) {
            Alert.alert('Sign up: ', response.msg);
        }
    }

    return (
        <CustomKeyboardView>
            <SafeAreaView style={styles.container}>
                <StatusBar style='dark'/>
                <View>
                    <Image style={styles.image} source={require('../assets/images/register.png')}/>
                </View>

                <View>
                    <Text style={[styles.signInText, {backgroundColor: '#a1a1feff'}]}>Sign Up</Text>
                    <View style={styles.inputContainer}>
                        <Feather name='user' color='gray' size={20} style={styles.icon}/>
                        <TextInput 
                            style={styles.input}
                            placeholder='Username' 
                            onChangeText={value => usernameRef.current=value}
                            autoCapitalize='false'
                        />
                    </View>
                    <View style={styles.inputContainer}>
                        <Octicons name="mail" size={20} color="gray" style={styles.icon}/>
                        <TextInput 
                            style={styles.input}
                            placeholder='Email address' 
                            onChangeText={value => emailRef.current=value} 
                            autoCapitalize='false'
                        /> 
                    </View>    
                    <View style={styles.inputContainer}>
                        <AntDesign name="lock" size={20} color="gray" style={styles.icon}/>
                        <TextInput 
                            style={styles.input}
                            placeholder='Password' 
                            onChangeText={value => passwordRef.current=value} 
                            secureTextEntry={isSecure}
                            autoCapitalize='false'
                        /> 
                        <TouchableOpacity style={{alignItems: 'flex-end'}} onPress={() => setIsSecure(!isSecure)}>
                            <Ionicons 
                                name={isSecure ? 'eye-off' : 'eye'} 
                                size={24} 
                                color="gray" 
                            />
                        </TouchableOpacity>
                    </View>
                    <View style={styles.inputContainer}>
                        <AntDesign name="lock" size={20} color="gray" style={styles.icon}/>
                        <TextInput 
                            style={styles.input}
                            placeholder='Confirm password' 
                            onChangeText={value => confirmPasswordRef.current=value} 
                            secureTextEntry={isSecure}
                            autoCapitalize='false'
                        />
                        <TouchableOpacity style={{alignItems: 'flex-end'}} onPress={() => setIsSecure(!isSecure)}>
                            <Ionicons 
                                name={isSecure ? 'eye-off' : 'eye'} 
                                size={24} 
                                color="gray" 
                            />
                        </TouchableOpacity> 
                    </View>  

                    <View>
                        {
                            loading? (
                                <View>
                                    <Loading/>
                                </View>
                            ) : (
                                <TouchableOpacity style={styles.button} onPress={handleRegister}>
                                    <Text style={styles.text}>Register</Text>
                                </TouchableOpacity>
                            )
                        }
                    </View>
                     
                    <View style={styles.signUpContainer}>
                        <Text>Already have an account?</Text>
                        <TouchableOpacity onPress={() => router.push('signIn')}>
                            <Text style={{fontWeight: 'bold', color: '#444affff'}}> Sign In</Text>
                        </TouchableOpacity>
                    </View>
                    
                </View>
            </SafeAreaView>
        </CustomKeyboardView>
        
    );
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffffff',
        width: '100%',
    },
    image: {
        paddingTop: 5,
        resizeMode: 'contain',
        width: 400,
        height: 250,
        alignItems: 'center',
        shadowColor: '#9E9E9E', // A medium gray shadow for depth
        shadowOffset: { width: 0, height: 4 },
    },
    inputContainer: {
        flexDirection: 'row',     
        alignItems: 'center',     
        backgroundColor: '#dfdbdbff', 
        borderRadius: 12,         
        paddingHorizontal: 16,    
        height: 56,               
        margin: 10,
        fontSize: 16, // Comfortable reading size
        color: '#3C4858', // A dark gray for readability with a hint of warmth
        shadowColor: '#9E9E9E', // A medium gray shadow for depth
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 4,
    },
    text: {
        color: '#ffffffff', // Maintained white for clear visibility
        fontSize: 18, // Slightly larger for emphasis
        fontWeight: '600', // Semi-bold for a balanced weight
    },
    signInText: {
        color: '#000000ff', // Maintained white for clear visibility
        fontSize: 40, // Slightly larger for emphasis
        fontWeight: '600', // Semi-bold for a balanced weight
        textAlign: 'center',
        backgroundColor: '#ffffffff',
        paddingVertical: 10,
        marginBottom: 10
    },
    button: {
        marginVertical: 10,
        backgroundColor: '#7f8feaff', // A lighter indigo to complement the title color
        padding: 20,
        borderRadius: 15, // Matching rounded corners for consistency
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#5C6BC0', // Shadow color to match the button for a cohesive look
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 5,
        elevation: 5,
        marginHorizontal: 10
    },
    icon: {
        marginRight: 12,   
        flexDirection: 'row'       // Adds space between the icon and the text
    },
    input: {
        flex: 1,                  // Tells the input to fill the remaining width
        fontSize: 16,
        color: '#1C1C1E',
        height: 56, 
    },
    forgotPasswordText: {
        color: '#3C4858',
        fontSize: 13,
        textAlign: 'right',
        paddingRight: 15,
        margin: 5,
    },
    signUpContainer: {
        flexDirection: 'row', 
        justifyContent: 'center',
        alignItems: 'center',
    }
})
