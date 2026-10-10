import { Pressable, Text, StyleSheet } from 'react-native';
import { cores, espacos, fontes } from '../theme';

const variantes = {
  primario: { backgroundColor: cores.primaria },
  secundario: { backgroundColor: cores.secundaria, borderWidth: 1, borderColor: cores.primaria },
  perigo: { backgroundColor: cores.perigo },
};

export default function Botao({ titulo, onPress, variante = 'primario' }) {
  const corTexto = variante === 'secundario' ? cores.primaria : '#FFFFFF';
  return (
    <Pressable style={[styles.base, variantes[variante]]} onPress={onPress}>
      <Text style={[styles.texto, { color: corTexto }]}>{titulo}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { padding: espacos.m, borderRadius: 8, alignItems: 'center', marginBottom: espacos.p },
  texto: { fontSize: fontes.m, fontWeight: 'bold' },
});