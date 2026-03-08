import { View, Text, Platform, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { createDrawerNavigator } from '@react-navigation/drawer';
import {
  createStaticNavigation,
  DrawerActions,
  useNavigation,
} from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

const ios = Platform.OS == 'ios';
export default function HomeHeader() {
    const { top } = useSafeAreaInsets();
    const navigation = useNavigation();

    const openMenu = () => {
        navigation.dispatch(DrawerActions. openDrawer());
    }
    return (
        <View style={styles.container}>
            <View style={[{paddingTop: ios? top:top+10 }, styles.homeBox]}>
                <TouchableOpacity onPress={openMenu} style={styles.menuButton}>
                    <Ionicons name="menu" size={30} color="black" />
                </TouchableOpacity>
                <Text style={styles.homeText}>Home</Text>
                <View style={styles.spacer}/>
            </View>
        </View>
        
    )
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#FFFFFF'
    },
    homeBox: {
        backgroundColor: '#7f8feaff', 
        borderBottomLeftRadius: 15, // Custom headers usually look best with bottom corners rounded
        borderBottomRightRadius: 15,
        flexDirection: 'row', // Places items side-by-side
        alignItems: 'center', // Vertically centers the icon and text
        justifyContent: 'space-between', // Pushes button left, spacer right, text center
        paddingHorizontal: 15, // Adds breathing room to the left and right edges
        paddingBottom: 15, // Replaces the paddingBottom that was on the text
        shadowColor: '#5C6BC0', 
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 5,
        elevation: 5,
    },
    homeText: {
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    menuButton: {
        width: 40, // Giving it a fixed width...
    },
    spacer: {
        width: 40, // ...and matching that width here keeps the title perfectly centered
    }
})
