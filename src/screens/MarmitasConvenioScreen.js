import { useCallback, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { useFichas, TIPOS } from '../context/FichasContext';
import { podeFazer } from '../data/permissoes';
import { STATUS, statusDoPedido, lerConvenios } from '../data/convenios';
import { cores, espacos, fontes } from '../theme';

// Tela do Fiscal: pedidos de convênio aprovados para o restaurante dele.
// Incluir um pedido registra uma ficha do tipo Convênio na contagem de hoje.
export default function MarmitasConvenioScreen() {
  const { usuario } = useAuth();
  const { fichas, adicionarFicha } = useFichas();
  const [pedidos, setPedidos] = useState([]);
  const [confirmando, setConfirmando] = useState(null); // id do pedido aguardando confirmação
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState(null); // { tipo: 'sucesso' | 'erro', texto }

  const podeIncluir = podeFazer(usuario, 'incluirConvenio');

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

  // Registra a ficha de convênio (o destino é a empresa que fez o pedido)
  async function incluir(pedido) {
    if (salvando) return;
    setSalvando(true);
    setMensagem(null);

    try {
      await adicionarFicha({
        tipo: TIPOS.CONVENIO,
        quantidade: pedido.quantidade,
        destino: pedido.empresa,
        pedidoId: pedido.id,
      });
      setMensagem({ tipo: 'sucesso', texto: 'Pedido incluído na contagem do dia.' });
    } catch (e) {
      setMensagem({ tipo: 'erro', texto: e.message || 'Não foi possível incluir o pedido.' });
    } finally {
      setConfirmando(null);
      setSalvando(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.titulo}>Marmitas de convênio</Text>
      <Text style={styles.aviso}>Ao incluir um pedido, as marmitas são registradas com a data e a hora de agora.</Text>

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

            {/* Pedido já incluído: mostra quando */}
            {ficha && (
              <Text style={styles.incluido}>Incluído na contagem em {ficha.data} às {ficha.hora}</Text>
            )}

            {/* Pedido ainda não incluído: botão e confirmação (só para quem tem permissão) */}
            {!ficha && podeIncluir && (
              confirmando === pedido.id ? (
                <View style={styles.confirmacao}>
                  <Text style={styles.textoConfirmacao}>
                    Incluir {pedido.quantidade} marmitas na contagem de hoje?
                  </Text>
                  <View style={styles.linhaBotoes}>
                    <TouchableOpacity
                      style={[styles.botao, styles.botaoConfirmar]}
                      onPress={() => incluir(pedido)}
                      disabled={salvando}
                    >
                      <Text style={styles.textoBotao}>{salvando ? 'Salvando...' : 'Sim'}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.botao, styles.botaoCancelar]}
                      onPress={() => setConfirmando(null)}
                      disabled={salvando}
                    >
                      <Text style={styles.textoCancelar}>Cancelar</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <TouchableOpacity
                  style={[styles.botao, styles.botaoConfirmar, styles.botaoIncluir]}
                  onPress={() => {
                    setMensagem(null);
                    setConfirmando(pedido.id);
                  }}
                >
                  <Text style={styles.textoBotao}>Incluir na contagem</Text>
                </TouchableOpacity>
              )
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
  aviso: { fontSize: fontes.p, color: '#777777', marginBottom: espacos.m },
  vazio: { color: '#777777', marginTop: espacos.m },

  card: { padding: 15, borderWidth: 1, borderColor: cores.borda, borderRadius: 10, marginBottom: espacos.m },
  empresa: { fontSize: fontes.m, fontWeight: 'bold', color: cores.escura, marginBottom: 6 },
  incluido: { marginTop: espacos.p, color: '#1F5F4A', fontWeight: '600' },

  confirmacao: { marginTop: espacos.m },
  textoConfirmacao: { fontWeight: '600', color: cores.escura },
  linhaBotoes: { flexDirection: 'row', gap: espacos.p, marginTop: espacos.p },
  botao: { flex: 1, paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  botaoIncluir: { flex: 0, marginTop: espacos.m },
  botaoConfirmar: { backgroundColor: cores.primaria },
  botaoCancelar: { backgroundColor: cores.secundaria, borderWidth: 1, borderColor: cores.borda },
  textoBotao: { color: '#FFFFFF', fontWeight: 'bold', fontSize: fontes.m },
  textoCancelar: { color: '#555555', fontWeight: '600', fontSize: fontes.m },

  mensagemErro: { color: cores.perigo, fontWeight: '600', marginBottom: espacos.m },
  mensagemSucesso: { color: '#1F5F4A', fontWeight: '600', marginBottom: espacos.m },
});