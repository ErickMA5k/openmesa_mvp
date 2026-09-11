import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';

export default function AddFichasScreen({ navigation }) {
    const [marmitas, setMarmitas] = useState('');
    const [refeicoes, setRefeicoes] = useState('');

    function handleConfirmar() {
        navigation.navigate('ConfirmAddFichas', { marmitas, refeicoes });
    }

return (
    <BlurView intensity={40} tint="dark" style={styles.overlay}>
        <View style={styles.card}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
                <Text style={styles.back}>{'\u2190'}</Text>
            </TouchableOpacity>

            <Text style={styles.label}>Digite a quantidade de marmitas</Text>
            <TextInput 
            style={styles.input} 
            value={marmitas} 
            onChangeText={setMarmitas} 
            keyboardType="numeric" 
            />

            <Text style={styles.label}>Digite a quantidade de refeições</Text>
            <TextInput 
            style={styles.input} 
            value={refeicoes} 
            onChangeText={setRefeicoes} 
            keyboardType="numeric" 
            />

            <TouchableOpacity style={styles.button} onPress={handleConfirmar}>
                <Text style={styles.buttonText}>Confirmar</Text>
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
        padding: 24,
    },

    back: {
        fontSize: 36,
        marginBottom: 20
    },

    label: {
        textAlign: 'center',
        marginBottom: 8,
        color: '#333'
    },

    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 6,
        padding: 10,
        marginBottom: 24,
        backgroundColor: '#fff',
        textAlign: 'center',
    },

    button: {
        backgroundColor: '#2563eb',
        borderRadius: 20,
        paddingVertical: 12,
        alignItems: 'center'
    },

    buttonText:{
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16
    },
});