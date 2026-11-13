import { useCallback, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { nomeDoRestaurante } from '../data/restaurantes';
import { STATUS, statusDoPedido, rotuloStatus, corStatus, lerConvenios } from '../data/convenios';

// Quem pode ver cada pedido:
// - Fiscal - SOMENTE SE APROVADO; Caso o pedido volte a ficar pendente ou seja recusado após ser aprovado, ele desaparecerá da tela
// - Empresa e Administrador - Sempre
function usuarioPodeVer(usuario, pedido) {
  if (usuario?.perfil === 'fiscal') {
    return pedido.restaurante === usuario.restaurante && statusDoPedido(pedido) === STATUS.APROVADO;
  }
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
          const lista = await lerConvenios();
          if (ativo) {
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
      <Text style={styles.titulo}>Histórico de Empresas</Text>

      <FlatList
        data={requisicoes}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <Text style={styles.vazio}>Nenhuma requisição registrada.</Text>
        }
        renderItem={({ item }) => {
          const status = statusDoPedido(item);

          return (
            <View style={styles.card}>
              <View style={styles.linhaTopo}>
                <Text style={styles.empresa}>{item.empresa}</Text>
                <View style={[styles.selo, { backgroundColor: corStatus[status] }]}>
                  <Text style={styles.textoSelo}>{rotuloStatus[status]}</Text>
                </View>
              </View>

              {item.restaurante ? (
                <Text>Restaurante: {nomeDoRestaurante(item.restaurante)}</Text>
              ) : null}
              <Text>Quantidade: {item.quantidade} marmitas</Text>
              <Text>Data: {item.data}</Text>
              {item.dataDecisao ? <Text>Decisão em: {item.dataDecisao}</Text> : null}
              {item.observacao ? (
                <Text>Observação: {item.observacao}</Text>
              ) : null}
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#FFFFFF' },
  titulo: { fontSize: 23, fontWeight: 'bold', color: '#172A55', marginBottom: 18 },
  card: { padding: 15, borderWidth: 1, borderColor: '#E5EAF0', borderRadius: 10, marginBottom: 12 },
  linhaTopo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  empresa: { flex: 1, fontSize: 17, fontWeight: 'bold', color: '#172A55', marginRight: 8 },
  selo: { paddingVertical: 4, paddingHorizontal: 10, borderRadius: 12 },
  textoSelo: { color: '#FFFFFF', fontSize: 12, fontWeight: 'bold' },
  vazio: { color: '#777777', marginTop: 15 },
});