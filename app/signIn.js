import { View, Text, StatusBar, Image, StyleSheet, TouchableOpacity, Alert, Pressable, TextInput, TouchableWithoutFeedback } from 'react-native';
import { Octicons } from '@expo/vector-icons';
import AntDesign from '@expo/vector-icons/AntDesign';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { cloneElement, useState, useRef } from 'react';
import Loading from '../components/Loading';
import { useRouter } from 'expo-router';
import CustomKeyboardView from '../components/CustomKeyboardView';
import { useAuth } from '../context/authContext';
import { Ionicons } from '@expo/vector-icons';

export default function signIn() {
    const router = useRouter();
    const {login} = useAuth();

    //Load authentication
    const [loading, setLoading] = useState(false);

    //Password and email state
    const [isSecure, setIsSecure] = useState(true);
    const emailRef = useRef('');
    const passwordRef = useRef('');

    const handleLogin = async () => {
        if (!emailRef.current || !passwordRef.current) {
            Alert.alert('Sign In', 'Please fill in all the necessary information')
            return;
        }
        setLoading(true);

        let response = await login(emailRef.current, passwordRef.current)
        setLoading(false);
        console.log('sign in response: ', response);
        if (!response.success) {
            Alert.alert('Sign In: ', response.msg)
        }
        
    }

    return (
        <CustomKeyboardView>
            <View style={styles.container}>
                <StatusBar style='dark'/>
                <View>
                    <Image style={styles.image} source={require('../assets/images/SignIn.png')}/>
                </View>

                <View>
                    <Text style={[styles.signInText, {backgroundColor: '#a1a1feff'}]}>Sign In</Text>
                    <View style={styles.inputContainer}>
                        <Octicons name='mail' color='gray' size={20} style={styles.icon}/>
                        <TextInput 
                            style={styles.input}
                            placeholder='Email' 
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
                            <Ionicons name={isSecure ? 'eye-off' : 'eye'} size={24} color="gray"/>
                        </TouchableOpacity>
                    </View>       

                    <TouchableOpacity onPress={() => router.push('forgotAccount')}>
                        <Text style={styles.forgotPasswordText}>Forgot password?</Text>
                    </TouchableOpacity>

                    <View>
                        {
                            loading? (
                                <View>
                                    <Loading/>
                                </View>
                            ) : (
                                <TouchableOpacity style={styles.button} onPress={handleLogin}>
                                    <Text style={styles.text}>Log In</Text>
                                </TouchableOpacity>
                            )
                        }
                    </View>

                    <View style={styles.signUpContainer}>
                        <Text>Don't have an account?</Text>
                        <TouchableOpacity onPress={() => router.push('signUp')}>
                            <Text style={{fontWeight: 'bold', color: '#444affff'}}> Sign Up</Text>
                        </TouchableOpacity>
                    </View>
                    
                </View>
            </View>
        </CustomKeyboardView>
        
    );
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffffff',
        width: '100%',
        top: 50,
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
        fontSize: 16, 
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
    },
    forgotPasswordText: {
        color: '#3C4858',
        fontSize: 13,
        textAlign: 'right',
        paddingRight: 15,
        margin: 5
    },
    signUpContainer: {
        flexDirection: 'row', 
        justifyContent: 'center',
        alignItems: 'center',
    }
})