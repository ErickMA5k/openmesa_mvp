import { useCallback, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { podeFazer } from '../data/permissoes';
import { nomeDoRestaurante } from '../data/restaurantes';
import {
  STATUS, statusDoPedido, rotuloStatus, corStatus, dataHoje, lerConvenios, salvarConvenios,
} from '../data/convenios';

// Relevante para definir se usuários conseguem ver ou não os pedidos
const FILTROS = [
  { status: STATUS.PENDENTE, titulo: 'Pendentes' },
  { status: STATUS.APROVADO, titulo: 'Aprovados' },
  { status: STATUS.RECUSADO, titulo: 'Recusados' },
];


const ORDEM_ACOES = [STATUS.APROVADO, STATUS.RECUSADO, STATUS.PENDENTE];

//Status de aprovação, somente pedidos aprovados aparecem para fiscais 
const ACOES = {
  [STATUS.APROVADO]: { botao: 'Aprovar', pergunta: 'Confirmar a aprovação deste pedido?' },
  [STATUS.RECUSADO]: { botao: 'Recusar', pergunta: 'Confirmar a recusa deste pedido?' },
  [STATUS.PENDENTE]: { botao: 'Voltar a pendente', pergunta: 'Devolver este pedido para a lista de pendentes?' },
};

export default function AprovacaoConveniosScreen() {
  const { usuario } = useAuth();
  const [pedidos, setPedidos] = useState([]);
  const [filtro, setFiltro] = useState(STATUS.PENDENTE);
  // Pedido aguardando confirmação do clique: { id, acao } ou null
  const [confirmacao, setConfirmacao] = useState(null);
  const [processando, setProcessando] = useState(false);
  const [erro, setErro] = useState('');

  // Recarrega a lista sempre que a tela ganha foco
  useFocusEffect(
    useCallback(() => {
      let ativo = true;

      async function carregar() {
        try {
          const lista = await lerConvenios();
          if (ativo) {
            setPedidos(lista);
            setErro('');
          }
        } catch (e) {
          if (ativo) setErro(`Não foi possível carregar os pedidos: ${e.message || e}`);
        }
      }

      carregar();

      return () => {
        ativo = false;
      };
    }, [])
  );

  // Aprova ou recusa um pedido e grava quem decidiu e quando
  async function decidir(id, novoStatus) {
    if (processando) return;

    if (!podeFazer(usuario, 'aprovarConvenio')) {
      setErro('Seu perfil não tem permissão para aprovar convênios.');
      return;
    }

    setProcessando(true);
    setErro('');

    try {
      // Lê de novo do armazenamento para não gravar em cima de uma lista desatualizada
      const lista = await lerConvenios();

      const atualizada = lista.map((pedido) => {
        if (pedido.id !== id) return pedido;

        // Voltando para pendente: a decisão anterior deixa de valer
        if (novoStatus === STATUS.PENDENTE) {
          return { ...pedido, status: novoStatus, decididoPor: null, dataDecisao: null };
        }

        // Aprovado ou recusado: guarda quem decidiu e quando 
        return { ...pedido, status: novoStatus, decididoPor: usuario.nome, dataDecisao: dataHoje() };
      });

      await salvarConvenios(atualizada);
      setPedidos(atualizada);
      setConfirmacao(null);
    } catch (e) {
      setErro(`Não foi possível salvar a decisão: ${e.message || e}`);
    } finally {
      setProcessando(false);
    }
  }

  // Proteção extra: quem chegar aqui sem a permissão não vê os pedidos
  if (!podeFazer(usuario, 'aprovarConvenio')) {
    return (
      <View style={styles.container}>
        <Text style={styles.titulo}>Aprovação de convênios</Text>
        <Text style={styles.vazio}>Seu perfil não tem acesso a esta tela.</Text>
      </View>
    );
  }

  const visiveis = pedidos.filter((p) => statusDoPedido(p) === filtro).reverse();
  const contar = (status) => pedidos.filter((p) => statusDoPedido(p) === status).length;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.titulo}>Aprovação de convênios</Text>

      {/* Abas com a contagem de cada situação */}
      <View style={styles.abas}>
        {FILTROS.map((f) => (
          <TouchableOpacity
            key={f.status}
            style={[styles.aba, filtro === f.status && styles.abaSelecionada]}
            onPress={() => {
              setFiltro(f.status);
              setConfirmacao(null);
            }}
          >
            <Text style={[styles.textoAba, filtro === f.status && styles.textoAbaSelecionada]}>
              {f.titulo} ({contar(f.status)})
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {erro !== '' && <Text style={styles.mensagemErro}>{erro}</Text>}

      {visiveis.length === 0 && (
        <Text style={styles.vazio}>
          {filtro === STATUS.PENDENTE
            ? 'Nenhum pedido aguardando aprovação.'
            : 'Nenhum pedido nesta situação.'}
        </Text>
      )}

      {visiveis.map((pedido) => {
        const status = statusDoPedido(pedido);
        const emConfirmacao = confirmacao?.id === pedido.id;

        return (
          <View key={pedido.id} style={styles.card}>
            <View style={styles.linhaTopo}>
              <Text style={styles.empresa}>{pedido.empresa}</Text>
              <View style={[styles.selo, { backgroundColor: corStatus[status] }]}>
                <Text style={styles.textoSelo}>{rotuloStatus[status]}</Text>
              </View>
            </View>

            <Text>Restaurante: {nomeDoRestaurante(pedido.restaurante) || 'Não informado'}</Text>
            <Text>Quantidade: {pedido.quantidade} marmitas</Text>
            <Text>Data do pedido: {pedido.data}</Text>
            {pedido.observacao ? <Text>Observação: {pedido.observacao}</Text> : null}
            {pedido.decididoPor ? (
              <Text>Decidido por {pedido.decididoPor} em {pedido.dataDecisao}</Text>
            ) : null}

            {/* Botões de mudança de situação: aparecem em TODOS os pedidos */}
            {emConfirmacao ? (
              <View style={styles.confirmacao}>
                <Text style={styles.textoConfirmacao}>{ACOES[confirmacao.acao].pergunta}</Text>
                <View style={styles.linhaBotoes}>
                  <TouchableOpacity
                    style={[styles.botao, styles.botaoConfirmar]}
                    onPress={() => decidir(pedido.id, confirmacao.acao)}
                    disabled={processando}
                  >
                    <Text style={styles.textoBotao}>{processando ? 'Salvando...' : 'Sim'}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.botao, styles.botaoCancelar]}
                    onPress={() => setConfirmacao(null)}
                    disabled={processando}
                  >
                    <Text style={styles.textoCancelar}>Cancelar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View style={styles.linhaBotoes}>
                {ORDEM_ACOES.filter((destino) => destino !== status).map((destino) => (
                  <TouchableOpacity
                    key={destino}
                    style={[styles.botao, { backgroundColor: corStatus[destino] }]}
                    onPress={() => setConfirmacao({ id: pedido.id, acao: destino })}
                  >
                    <Text style={styles.textoBotao}>{ACOES[destino].botao}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20, backgroundColor: '#FFFFFF' },
  titulo: { fontSize: 23, fontWeight: 'bold', color: '#172A55', marginBottom: 16 },

  abas: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  aba: {
    flex: 1,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#CCCCCC',
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  abaSelecionada: { backgroundColor: '#147DBA', borderColor: '#147DBA' },
  textoAba: { fontSize: 13, fontWeight: '600', color: '#147DBA' },
  textoAbaSelecionada: { color: '#FFFFFF' },

  card: { padding: 15, borderWidth: 1, borderColor: '#E5EAF0', borderRadius: 10, marginBottom: 12 },
  linhaTopo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  empresa: { flex: 1, fontSize: 17, fontWeight: 'bold', color: '#172A55', marginRight: 8 },
  selo: { paddingVertical: 4, paddingHorizontal: 10, borderRadius: 12 },
  textoSelo: { color: '#FFFFFF', fontSize: 12, fontWeight: 'bold' },

  linhaBotoes: { flexDirection: 'row', gap: 10, marginTop: 12 },
  botao: { flex: 1, paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  botaoConfirmar: { backgroundColor: '#147DBA' },
  botaoCancelar: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#CCCCCC' },
  textoBotao: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 15, textAlign: 'center' },
  textoCancelar: { color: '#555555', fontWeight: '600', fontSize: 15 },

  confirmacao: { marginTop: 12 },
  textoConfirmacao: { fontWeight: '600', color: '#172A55' },

  mensagemErro: { color: '#B3261E', fontSize: 15, fontWeight: '600', marginBottom: 12 },
  vazio: { color: '#777777', marginTop: 15 },
});