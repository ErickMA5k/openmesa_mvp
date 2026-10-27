import { useCallback, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { nomeDoRestaurante } from '../data/restaurantes';

const CHAVE = '@openmesa:convenios';

// Função que limite a visibilidade do histórico
// Fiscal somente verá o pedido caso ele pertença á aquela restaurante
//Empresa somente verá o pedido caso o nome da empresa seja igual ao usuário; Provavel que alteremos isso no futuro com a aplicação do banco de dados
function usuarioPodeVer(usuario, pedido) {
  if (usuario?.perfil === 'fiscal') return pedido.restaurante === usuario.restaurante;
  if (usuario?.perfil === 'empresa') return pedido.empresa === usuario.nome;
  return false;
}

export default function HistoricoConveniosScreen() {
  const { usuario } = useAuth();
  const [requisicoes, setRequisicoes] = useState([]);

  useFocusEffect(
    useCallback(() => {
      let ativo = true;

      async function carregar() {
        try {
          const dados = await AsyncStorage.getItem(CHAVE);
          if (ativo) {
            const lista = dados ? JSON.parse(dados) : [];
            setRequisicoes(lista.filter((pedido) => usuarioPodeVer(usuario, pedido)).reverse());
          }
        } catch {
          if (ativo) setRequisicoes([]);
        }
      }

      carregar();

      return () => {
        ativo = false;
      };
    }, [usuario])
  );

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Histórico de Pedidos</Text>

      <FlatList
        data={requisicoes}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <Text style={styles.vazio}>Nenhuma requisição registrada.</Text>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.empresa}>{item.empresa}</Text>
            {item.restaurante ? (
              <Text>Restaurante: {nomeDoRestaurante(item.restaurante)}</Text>
            ) : null}
            <Text>Quantidade: {item.quantidade} marmitas</Text>
            <Text>Data: {item.data}</Text>
            {item.observacao ? (
              <Text>Observação: {item.observacao}</Text>
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