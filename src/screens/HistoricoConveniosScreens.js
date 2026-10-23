
import { useCallback, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

const CHAVE = '@openmesa:convenios';

export default function HistoricoConveniosScreen() {
  const [requisicoes, setRequisicoes] = useState([]);

  useFocusEffect(
    useCallback(() => {
      let ativo = true;

      async function carregar() {
        try {
          const dados = await AsyncStorage.getItem(CHAVE);
          if (ativo) {
            setRequisicoes(dados ? JSON.parse(dados).reverse() : []);
          }
        } catch {
          if (ativo) setRequisicoes([]);
        }
      }

      carregar();

      return () => {
        ativo = false;
      };
    }, [])
  );

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Hist├│rico de Conv├¬nios</Text>

      <FlatList
        data={requisicoes}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <Text style={styles.vazio}>Nenhuma requisi├º├úo registrada.</Text>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.empresa}>{item.empresa}</Text>
            <Text>Quantidade: {item.quantidade} marmitas</Text>
            <Text>Data: {item.data}</Text>
            {item.observacao ? (
              <Text>Observa├º├úo: {item.observacao}</Text>
            ) : null}
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#FFFFFF' },
  titulo: { fontSize: 23, fontWeight: 'bold', color: '#172A55', marginBottom: 18 },
  card: { padding: 15, borderWidth: 1, borderColor: '#E5EAF0', borderRadius: 10, marginBottom: 12 },
  empresa: { fontSize: 17, fontWeight: 'bold', color: '#172A55', marginBottom: 6 },
  vazio: { color: '#777777', marginTop: 15 },
});
