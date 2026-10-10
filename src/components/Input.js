import { View, Text, TextInput, StyleSheet } from 'react-native';
import { cores, espacos, fontes } from '../theme';

export default function Input({ label, erro, ...props }) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TextInput style={[styles.input, erro ? styles.inputErro : null]} {...props} />
      {erro ? <Text style={styles.erro}>{erro}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: espacos.m },
  label: { fontSize: fontes.p, color: cores.texto, marginBottom: 4 },
  input: { borderWidth: 1, borderColor: cores.borda, borderRadius: 8, padding: espacos.m, fontSize: fontes.m },
  inputErro: { borderColor: cores.perigo },
  erro: { color: cores.perigo, fontSize: fontes.p, marginTop: 4 },
});