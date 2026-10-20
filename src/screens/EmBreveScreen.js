import { View, Text, StyleSheet } from 'react-native';
import { cores, espacos, fontes } from '../theme';

// Tela provisória: ocupa o lugar das telas que ainda serão construídas
export default function EmBreveScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.texto}>Em construção</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  // Centraliza o texto na tela
  container: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', padding: espacos.m },
  texto: { fontSize: fontes.g, color: cores.texto },
});