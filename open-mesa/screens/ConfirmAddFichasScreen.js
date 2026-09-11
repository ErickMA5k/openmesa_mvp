import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';

export default function ConfirmAddFichasScreen({ navigation, route }) {
    const { marmitas, refeicoes } = route.params;
    const total = Number(marmitas) + Number(refeicoes);

    function handleCancelar() {
        navigation.goBack();
    }

    function handleContinuar() {
        navigation.navigate('AddFichasSuccess');
    }

    return (
    <BlurView intensity={40} tint="dark" style={styles.overlay}>
        <View style={styles.card}>
            <View style={styles.messageBox}>
                <Text style={styles.messageText}>Deseja adicionar {total} fichas?</Text>
            </View>

            <View style={styles.buttonRow}>
                <TouchableOpacity style={styles.buttonCancelar} onPress={handleCancelar}>
                    <Text style={styles.buttonText}>Cancelar</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.buttonContinuar} onPress={handleContinuar}>
                    <Text style={styles.buttonText}>Continuar</Text>
                </TouchableOpacity>
            </View>
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
        marginBottom: 20,
  },
  
    messageText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
        textAlign: 'center'
    },

    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between'
    },

    buttonCancelar: {
        flex: 1,
        backgroundColor: '#2563eb',
        borderRadius: 20,
        paddingVertical: 12,
        alignItems: 'center',
        marginRight: 8
    },

    buttonContinuar: {
        flex: 1,
        backgroundColor: '#2563eb',
        borderRadius: 20,
        paddingVertical: 12,
        alignItems: 'center',        
        marginLeft: 8
    },

    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16
    },
});