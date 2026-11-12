import { useCallback, useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { useFichas } from '../context/FichasContext';
import { STATUS, statusDoPedido, lerConvenios } from '../data/convenios';
import { cores, espacos, fontes } from '../theme';

// Tela do Fiscal: pedidos de convênio aprovados para o restaurante dele.
// Os convênios aprovados pelo administrador são adicionados automaticamente ao histórico.
export default function MarmitasConvenioScreen() {
  const { usuario } = useAuth();
  const { fichas } = useFichas();
  const [pedidos, setPedidos] = useState([]);
  const [mensagem, setMensagem] = useState(null); // { tipo: 'sucesso' | 'erro', texto }

  // Recarrega os pedidos sempre que a tela ganha foco
  useFocusEffect(
    useCallback(() => {
      let ativo = true;

      async function carregar() {
        try {
          const lista = await lerConvenios();
          if (ativo) {
            // Só pedidos APROVADOS e do restaurante do Fiscal; os mais novos primeiro
            setPedidos(
              lista
                .filter((p) => p.restaurante === usuario?.restaurante && statusDoPedido(p) === STATUS.APROVADO)
                .reverse()
            );
          }
        } catch (e) {
          if (ativo) setMensagem({ tipo: 'erro', texto: `Não foi possível carregar os pedidos: ${e.message || e}` });
        }
      }

      carregar();
      return () => {
        ativo = false;
      };
    }, [usuario])
  );

  // Se existir uma ficha criada a partir do pedido, ele já foi incluído na contagem
  const fichaDoPedido = (id) => fichas.find((f) => f.pedidoId === id);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.titulo}>Marmitas de convênio</Text>
      <Text style={styles.aviso}>
        Os pedidos de convênio aprovados pelo administrador entram automaticamente na contagem e no histórico de fichas.
      </Text>

      {mensagem && (
        <Text style={mensagem.tipo === 'erro' ? styles.mensagemErro : styles.mensagemSucesso}>
          {mensagem.texto}
        </Text>
      )}

      {pedidos.length === 0 && (
        <Text style={styles.vazio}>Nenhum pedido aprovado para o seu restaurante.</Text>
      )}

      {pedidos.map((pedido) => {
        const ficha = fichaDoPedido(pedido.id);

        return (
          <View key={pedido.id} style={styles.card}>
            <Text style={styles.empresa}>{pedido.empresa}</Text>
            <Text>Quantidade: {pedido.quantidade} marmitas</Text>
            <Text>Data do pedido: {pedido.data}</Text>
            {pedido.observacao ? <Text>Observação: {pedido.observacao}</Text> : null}

            {ficha ? (
              <Text style={styles.incluido}>
                ✓ Registrado no histórico em {ficha.data}{ficha.hora ? ` às ${ficha.hora}` : ''}
              </Text>
            ) : (
              <Text style={styles.incluido}>
                ✓ Registrado automaticamente no histórico
              </Text>
            )}
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20, backgroundColor: cores.secundaria },
  titulo: { fontSize: fontes.g, fontWeight: 'bold', color: cores.escura, marginBottom: espacos.p },
  aviso: { fontSize: fontes.p, color: '#555555', marginBottom: espacos.m, lineHeight: 20 },
  vazio: { color: '#777777', marginTop: espacos.m },

  card: { padding: 15, borderWidth: 1, borderColor: cores.borda, borderRadius: 10, marginBottom: espacos.m },
  empresa: { fontSize: fontes.m, fontWeight: 'bold', color: cores.escura, marginBottom: 6 },
  incluido: { marginTop: espacos.p, color: '#1F5F4A', fontWeight: '600' },

  mensagemErro: { color: cores.perigo, fontWeight: '600', marginBottom: espacos.m },
  mensagemSucesso: { color: '#1F5F4A', fontWeight: '600', marginBottom: espacos.m },
});
