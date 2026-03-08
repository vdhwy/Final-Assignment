import { useContext, useState } from "react"
import { addLocation, LocationContext } from "../firebase/FirestoreController";
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useAuth } from "../context/authContext";

export default function LocationInput() {
    const [loc, setLoc] = useState('');
    const locations = useContext(LocationContext);
    const { user } = useAuth();

    async function insertLocation() {
        if (loc === '') return; 
        await addLocation(user?.uid, loc); 
        setLoc(''); 
    }
    return (
        <View>
            <Text variant='headlineMedium' style={styles.text}>
                {locations ? 'Location: ' + locations.length: 'None location added to list!'}
            </Text>
            <View style={styles.inputContainer}>
                <TextInput style={styles.input} onChangeText={setLoc} value={loc}/>
                <TouchableOpacity onPress={insertLocation}>
                    <Ionicons style={styles.icon} name="add-circle-sharp" size={30} color="black" />
                </TouchableOpacity>
            </View>
            
        </View>
    )
}

const styles = StyleSheet.create({
    inputContainer: {
        flexDirection: 'row',     // Aligns the icon and text side-by-side
        alignItems: 'center',     // Centers them vertically
        backgroundColor: '#dfdbdbff', // Gives the illusion of the input background
        borderRadius: 12,         // Rounds the corners of the "box"
        paddingHorizontal: 16,    // Adds space on the left and right
        height: 56,               // Sets the height of the "box"
        margin: 10,
        fontSize: 16, // Comfortable reading size
        color: '#3C4858', // A dark gray for readability with a hint of warmth
        shadowColor: '#9E9E9E', // A medium gray shadow for depth
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 4,
        width: '90%',
    },
    input: {
        flex: 1
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
    text: {
        color: '#000000ff', // Maintained white for clear visibility
        fontSize: 15, // Slightly larger for emphasis
        fontWeight: '500', // Semi-bold for a balanced weight
        textAlign: 'center',
        margin: 10
    },
    icon: {
        marginRight: 5,   
        flexDirection: 'row'       // Adds space between the icon and the text
    },
})