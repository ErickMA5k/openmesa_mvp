
import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ScrollView
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../context/AuthContext';


const CHAVE = '@openmesa:convenios';

export default function RequisitarConvenioScreen({ navigation }) {
  const { usuario } = useAuth();
  const [empresa, setEmpresa] = useState(usuario?.perfil === 'empresa' ? usuario.nome : '');
  const [quantidade, setQuantidade] = useState('');
  const [observacao, setObservacao] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [sucesso, setSucesso] = useState('');

  
async function salvar() {
  const qtd = Number(quantidade);

  if (!empresa.trim()) {
    Alert.alert('Atenção', 'Informe a empresa.');
    return;
  }

  if (!Number.isInteger(qtd) || qtd <= 0) {
    Alert.alert('Atenção', 'Informe uma quantidade inteira maior que zero.');
    return;
  }

  setSalvando(true);

  try {
    const dados = await AsyncStorage.getItem(CHAVE);
    const lista = dados ? JSON.parse(dados) : [];

    if (!Array.isArray(lista)) {
      throw new Error('Os dados salvos n├úo est├úo em uma lista v├ílida.');
    }

    lista.push({
      id: String(Date.now()),
      empresa: empresa.trim(),
      quantidade: qtd,
      observacao: observacao.trim(),
      data: new Date().toLocaleDateString('pt-BR', {
        timeZone: 'America/Sao_Paulo',
      }),
    });

    await AsyncStorage.setItem(CHAVE, JSON.stringify(lista));

    setSucesso('Requisi├º├úo registrada com sucesso!');
    setEmpresa(usuario?.perfil === 'empresa' ? usuario.nome : '');
    setQuantidade('');
    setObservacao('');
  } catch (erro) {
    console.error('Erro ao salvar requisi├º├úo:', erro);
    Alert.alert(
      'Erro',
      `N├úo foi poss├¡vel salvar: ${erro.message || erro}`
    );
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

      <Text style={styles.label}>Quantidade de marmitas</Text>
      <TextInput
        style={styles.input}
        placeholder="Ex.: 20"
        keyboardType="numeric"
        value={quantidade}
        onChangeText={setQuantidade}
      />

      <Text style={styles.label}>Observa├º├úo (opcional)</Text>
      <TextInput
        style={[styles.input, styles.observacao]}
        placeholder="Informa├º├Áes adicionais"
        value={observacao}
        onChangeText={setObservacao}
        multiline
      />

{sucesso !== '' && (
  <Text style={styles.mensagemSucesso}>
    {sucesso}
  </Text>
)}

      <TouchableOpacity
        style={styles.botao}
        onPress={salvar}
        disabled={salvando}
      >
        <Text style={styles.textoBotao}>
          {salvando ? 'Salvando...' : 'Registrar requisi├º├úo'}
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
  botao: { backgroundColor: '#147DBA', padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 24 },
  textoBotao: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  voltar: { padding: 15, alignItems: 'center' },
  textoVoltar: { color: '#147DBA', fontWeight: '600' },
  mensagemSucesso: {
  color: '#1F5F4A',
  fontSize: 15,
  fontWeight: '600',
  marginTop: 15,
  textAlign: 'center',
},
});
