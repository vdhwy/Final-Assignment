import LottieView from 'lottie-react-native';
import { View, Text } from 'react-native';

export default function Loading() {
    return (
        <View style={{justifyContent: 'center', alignItems: 'center'}}>
            <LottieView 
                style={{height: 100, width: 500}} 
                source={require('../assets/images/LoadingDot.json')} 
                autoPlay 
                loop
            />
        </View>
    )
}