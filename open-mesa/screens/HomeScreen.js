import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function HomeScreen({ navigation }) {
    return (
        <View style={styles.container}>
            <TouchableOpacity 
            onPress={() => navigation.navigate('ConfirmExit')}>
                <Text 
                 style={styles.back}>{'\u2190'}
                </Text>
            </TouchableOpacity>

            <View 
             style={styles.logoCircle}>
                <Text  
                 style={styles.logoText}>Open{'\n'}Mesa
                </Text>
            </View>

            <TouchableOpacity 
            style={styles.button} 
            onPress={() => navigation.navigate('AddFichas')}>
                <Text 
                 style={styles.buttonText}>Adicionar Fichas
                </Text>
            </TouchableOpacity>

            <TouchableOpacity 
             style={styles.button} 
             onPress={() => navigation.navigate('Historico')}>
                <Text 
                 style={styles.buttonText}>Checar Histórico
                </Text>
            </TouchableOpacity>

            <TouchableOpacity 
             style={styles.button} 
             onPress={() => navigation.navigate('QrCode')}>
                <Text 
                 style={styles.buttonText}>Escanear QR Code
                </Text>
            </TouchableOpacity>

        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 24,
        backgroundColor: '#fdf7f0'
    },

    back: {
        fontSize: 36,
        marginBottom: 20
},

    logoCircle: {
        width: 140,
        height: 140,
        borderRadius: 70,
        backgroundColor: '#1d3f7a',
        alignSelf: 'center',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 48,
    },

    logoText: {
        color: '#fff',
        fontSize: 22,
        fontWeight: 'bold',
        textAlign: 'center'
    },

    button: {
        backgroundColor: '#2563Eb',
        borderRadius: 20,
        paddingVertical: 16,
        alignItems: 'center',
        marginBottom: 16,
    },
    
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16
    },
})