import { View, Text, StyleSheet } from 'react-native';

export default function forgotAccount() {
    return (
        <View style={styles.container}>
            <Text>Your forgot account</Text>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    }
})