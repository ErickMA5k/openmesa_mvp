import { useEffect, useState } from 'react';

import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';

import { useFichas } from '../context/FichasContext';

function formatarValor(valor) {
  return Number(valor || 0)
    .toFixed(2)
    .replace('.', ',');
}

export default function HistoricoScreen() {
  // As fichas vêm do Context (que já lê, valida e grava no armazenamento)
  const { fichas, carregando, erroCarregamento, removerFicha } = useFichas();

  // Id da ficha que está aguardando confirmação de exclusão (null = nenhuma)
  const [idParaConfirmar, setIdParaConfirmar] = useState(null);

  // Aviso exibido no topo: { tipo: 'sucesso' | 'erro', texto: '...' } ou null
  const [mensagem, setMensagem] = useState(null);

  // A mensagem de sucesso some sozinha depois de alguns segundos
  useEffect(() => {
    if (!mensagem || mensagem.tipo !== 'sucesso') return;
    const temporizador = setTimeout(() => setMensagem(null), 3000);
    return () => clearTimeout(temporizador);
  }, [mensagem]);

  function pedirConfirmacao(id) {
    setMensagem(null);
    setIdParaConfirmar(id);
  }

  async function excluirFicha(id) {
    try {
      await removerFicha(id);
      setMensagem({ tipo: 'sucesso', texto: 'Ficha excluída.' });
    } catch (error) {
      console.log('Erro ao excluir ficha:', error);
      setMensagem({
        tipo: 'erro',
        texto: error.message || 'Não foi possível excluir a ficha.',
      });
    } finally {
      setIdParaConfirmar(null);
    }
  }

  const listaVazia =
    !carregando && erroCarregamento === '' && fichas.length === 0;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.titulo}>Histórico</Text>

      {erroCarregamento !== '' && (
        <Text style={styles.mensagemErro}>{erroCarregamento}</Text>
      )}

      {mensagem && (
        <Text
          style={
            mensagem.tipo === 'erro'
              ? styles.mensagemErro
              : styles.mensagemSucesso
          }
        >
          {mensagem.texto}
        </Text>
      )}

      {carregando && (
        <Text style={styles.vazioTexto}>Carregando fichas...</Text>
      )}

      {listaVazia && (
        <View style={styles.vazio}>
          <Text style={styles.vazioTitulo}>Nenhuma ficha cadastrada</Text>

          <Text style={styles.vazioTexto}>
            As fichas cadastradas aparecerão aqui.
          </Text>
        </View>
      )}

      {fichas.map((ficha) => (
        <View key={ficha.id} style={styles.card}>
          <View style={styles.cabecalhoCard}>
            <Text style={styles.tipo}>{ficha.tipo}</Text>

            <Text style={styles.data}>{ficha.data}</Text>
          </View>

          <Text style={styles.local}>{ficha.local}</Text>

          <View style={styles.informacoes}>
            <View>
              <Text style={styles.label}>Quantidade</Text>

              <Text style={styles.valor}>{ficha.quantidade}</Text>
            </View>

            <View>
              <Text style={styles.label}>Valor/refeição</Text>

              <Text style={styles.valor}>R$ {formatarValor(ficha.valor)}</Text>
            </View>

            <View>
              <Text style={styles.label}>Total</Text>

              <Text style={styles.total}>R$ {formatarValor(ficha.total)}</Text>
            </View>
          </View>

          {idParaConfirmar === ficha.id ? (
            <View style={styles.confirmacao}>
              <Text style={styles.textoConfirmacao}>Excluir esta ficha?</Text>

              <View style={styles.linhaConfirmacao}>
                <TouchableOpacity
                  style={styles.botaoConfirmar}
                  onPress={() => excluirFicha(ficha.id)}
                >
                  <Text style={styles.textoConfirmar}>Sim, excluir</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.botaoDesistir}
                  onPress={() => setIdParaConfirmar(null)}
                >
                  <Text style={styles.textoDesistir}>Cancelar</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.botaoExcluir}
              onPress={() => pedirConfirmacao(ficha.id)}
            >
              <Text style={styles.textoExcluir}>Excluir</Text>
            </TouchableOpacity>
          )}
        </View>
      ))}
    </ScrollView>
  );
}
//Cores e design para cada componente da tela
//Não esquecer de atualizar para utilizar o padrão do index.jx
const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#FFFFFF',
  },

  titulo: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
  },

  mensagemErro: {
    color: '#B3261E',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 15,
  },

  mensagemSucesso: {
    color: '#1F5F4A',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 15,
  },

  vazio: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },

  vazioTitulo: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },

  vazioTexto: {
    fontSize: 15,
    color: '#666666',
    textAlign: 'center',
  },

  card: {
    backgroundColor: '#F7F7F7',
    borderRadius: 12,
    padding: 18,
    marginBottom: 15,
  },

  cabecalhoCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  tipo: {
    fontSize: 19,
    fontWeight: 'bold',
  },

  data: {
    fontSize: 13,
    color: '#777777',
  },

  local: {
    fontSize: 15,
    color: '#555555',
    marginTop: 5,
    marginBottom: 18,
  },

  informacoes: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  label: {
    fontSize: 12,
    color: '#777777',
    marginBottom: 4,
  },

  valor: {
    fontSize: 15,
    fontWeight: '600',
  },

  total: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#7A4E2D',
  },

  botaoExcluir: {
    marginTop: 18,
    paddingVertical: 10,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#DDDDDD',
  },

  textoExcluir: {
    color: '#B00020',
    fontWeight: '600',
  },

  confirmacao: {
    marginTop: 18,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#DDDDDD',
  },

  textoConfirmacao: {
    fontSize: 15,
    fontWeight: '600',
    color: '#212121',
  },

  linhaConfirmacao: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 10,
  },

  botaoConfirmar: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#B00020',
  },

  textoConfirmar: {
    color: '#FFFFFF',
    fontWeight: '600',
  },

  botaoDesistir: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#BBBBBB',
  },

  textoDesistir: {
    color: '#555555',
    fontWeight: '600',
  },
});