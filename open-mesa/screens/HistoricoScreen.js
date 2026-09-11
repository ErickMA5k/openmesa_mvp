import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Calendar } from 'react-native-calendars';

export default function HistoricoScreen({ navigation }) {
    const [selectedDate, setSelectedDate] = useState('');

    function formatarData(dataISO) {
       const [ano, mes, dia] = dataISO.split('-');
       return `${dia}/${mes}/${ano}`;
    }

    return (
        <View style={styles.container}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
                <Text style={styles.back}>{'\u2190'}</Text>
            </TouchableOpacity>
npx
            <Calendar
            onDayPress={(day) => {
                setSelectedDate(day.dateString);
                navigation.navigate('Registro', { date: day.dateString });
                }}

                theme={{
                    todayTextColor: '#2563eb',
                    arrowColor: '#2563eb',
                    selectedDayBackgroundColor: '#2563eb',
                }}
            />

                {selectedDate !== '' && (
                    <Text style={styles.selectedText}>Data selecionada: {formatarData(selectedDate)}</Text>
                )}
        </View>
    );
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

    selectedText: {
        marginTop: 16,
        fontSize: 16,
        textAlign: 'center',
        color: '#333'
    },
});