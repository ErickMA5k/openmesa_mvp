import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';

export default function AddFichasSuccessScreen({ navigation }) {
    function handleFechar(){
        navigation.navigate('Home');
    }

    return (
        <BlurView intensity={40} tint="dark" style={styles.overlay}>
            <View style={styles.card}>
                <View style={styles.messageBox}>
                    <Text style={styles.messageText}>Fichas registradas com sucesso!</Text>
                </View>

                <TouchableOpacity style={styles.button} onPress={handleFechar}>
                    <Text style={styles.buttonText}>Fechar</Text>
                </TouchableOpacity>
            </View>
        </BlurView>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },

    card: {
        width: '85%',
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20
    },

    messageBox: {
        backgroundColor: '#1d3f7a',
        borderRadius: 10,
        paddingVertical: 24,
        paddingHorizontal: 16,
        marginBottom: 20
    },

    messageText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
        textAlign: 'center'
    },

    button: {
        backgroundColor: '#2563Eb',
        borderRadius: 20,
        paddingVertical: 12,
        alignItems: 'center'
    },

    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16
    },
});