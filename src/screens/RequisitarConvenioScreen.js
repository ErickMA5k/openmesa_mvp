import { useState } from 'react';
import {View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../context/AuthContext';
import { restaurantes } from '../data/restaurantes';

const CHAVE = '@openmesa:convenios';

export default function RequisitarConvenioScreen({ navigation }) {
  const { usuario } = useAuth();
  const [empresa, setEmpresa] = useState(usuario?.perfil === 'empresa' ? usuario.nome : '');
  // Define o tipo de restaurante
  const [restauranteId, setRestauranteId] = useState(null)
  //Necessário para determinar a quantidade de marmitas requisitadas
  const [quantidade, setQuantidade] = useState('');
  const [observacao, setObservacao] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [sucesso, setSucesso] = useState('');
  const [erro, setErro] = useState('');

  async function salvar() {
    const qtd = Number(quantidade);

    setSucesso('');
    setErro('');

    //Grupo de mensagens de erro. A primeira normalmente não ocorre devido ao nome da empresa estar atrelada ao usuário. Elemento legado
    if (!empresa.trim()) {
      setErro('Informe a empresa.');
      return;
    }

    if (!restauranteId) {
      setErro('Escolha o restaurante que receberá o pedido.');
      return;
    }

    if (!Number.isInteger(qtd) || qtd <= 0) {
      setErro('Informe uma quantidade inteira maior que zero.');
      return;
    }

    setSalvando(true);

    try {
      const dados = await AsyncStorage.getItem(CHAVE);
      const lista = dados ? JSON.parse(dados) : [];

      if (!Array.isArray(lista)) {
        throw new Error('Os dados salvos não estão em uma lista válida.');
      }

      lista.push({
        id: String(Date.now()),
        empresa: empresa.trim(),
        restaurante: restauranteId, //Determinação necessária para interagir com as permissões de leitura do restauirante
        quantidade: qtd,
        observacao: observacao.trim(),
        data: new Date().toLocaleDateString('pt-BR', {
          timeZone: 'America/Sao_Paulo',
        }),
      });

      await AsyncStorage.setItem(CHAVE, JSON.stringify(lista));

      setSucesso('Requisição registrada com sucesso!');
      setEmpresa(usuario?.perfil === 'empresa' ? usuario.nome : '');
      setRestauranteId(null);
      setQuantidade('');
      setObservacao('');
    } catch (e) {
      console.error('Erro ao salvar requisição:', e);
      setErro(`Não foi possível salvar: ${e.message || e}`);
    } finally {
      setSalvando(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.titulo}>Requisitar Marmitas para Empresa</Text>

      <Text style={styles.label}>Empresa</Text>
      <TextInput
        style={styles.input}
        placeholder="Nome da empresa"
        value={empresa}
        editable={usuario?.perfil !== 'empresa'}
        onChangeText={setEmpresa}
      />

      <Text style={styles.label}>Restaurante que receberá o pedido</Text>
      {/* Aparece uma opção para cada restaurante, adição de novos restaurantes devem ser feitos dentro do restaurantes.js */}
      {restaurantes.map((r) => (
        <TouchableOpacity
          key={r.id}
          style={[
            styles.opcaoRestaurante,
            restauranteId === r.id && styles.opcaoSelecionada,
          ]}
          onPress={() => setRestauranteId(r.id)}
        >
          <Text
            style={[
              styles.textoOpcao,
              restauranteId === r.id && styles.textoSelecionado,
            ]}
          >
            {r.nome}
          </Text>
        </TouchableOpacity>
      ))}

      <Text style={styles.label}>Quantidade de marmitas</Text>
      <TextInput
        style={styles.input}
        placeholder="Ex.: 20"
        keyboardType="numeric"
        value={quantidade}
        onChangeText={setQuantidade}
      />

      <Text style={styles.label}>Observação (opcional)</Text>
      <TextInput
        style={[styles.input, styles.observacao]}
        placeholder="Informações adicionais"
        value={observacao}
        onChangeText={setObservacao}
        multiline
      />

      {erro !== '' && <Text style={styles.mensagemErro}>{erro}</Text>}

      {sucesso !== '' && <Text style={styles.mensagemSucesso}>{sucesso}</Text>}

      <TouchableOpacity
        style={styles.botao}
        onPress={salvar}
        disabled={salvando}
      >
        <Text style={styles.textoBotao}>
          {salvando ? 'Salvando...' : 'Registrar requisições'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.voltar}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.textoVoltar}>Voltar</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 24, backgroundColor: '#FFFFFF' },
  titulo: { fontSize: 25, fontWeight: 'bold', color: '#172A55', marginBottom: 20 },
  label: { fontSize: 15, fontWeight: '600', marginTop: 14, marginBottom: 7 },
  input: { borderWidth: 1, borderColor: '#CCCCCC', borderRadius: 8, padding: 13, fontSize: 16 },
  observacao: { minHeight: 85, textAlignVertical: 'top' },

  opcaoRestaurante: {
    minHeight: 50,
    borderWidth: 1,
    borderColor: '#CCCCCC',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  opcaoSelecionada: { backgroundColor: '#147DBA', borderColor: '#147DBA' },
  textoOpcao: { fontSize: 16, fontWeight: '600', color: '#147DBA', textAlign: 'center' },
  textoSelecionado: { color: '#FFFFFF' },

  botao: { backgroundColor: '#147DBA', padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 24 },
  textoBotao: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  voltar: { padding: 15, alignItems: 'center' },
  textoVoltar: { color: '#147DBA', fontWeight: '600' },
  mensagemErro: { color: '#B3261E', fontSize: 15, fontWeight: '600', marginTop: 15, textAlign: 'center' },
  mensagemSucesso: { color: '#1F5F4A', fontSize: 15, fontWeight: '600', marginTop: 15, textAlign: 'center' },
});