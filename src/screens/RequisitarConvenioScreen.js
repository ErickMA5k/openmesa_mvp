import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { restaurantes, nomeDoRestaurante } from '../data/restaurantes';
import { STATUS, dataHoje, lerConvenios, salvarConvenios } from '../data/convenios';

export default function RequisitarConvenioScreen({ navigation }) {
  const { usuario } = useAuth();
  const [empresa, setEmpresa] = useState(usuario?.perfil === 'empresa' ? usuario.nome : '');
  // Guarda o "id" do restaurante escolhido (ex.: 'jaiara'), ou null se ainda não escolheu
  const [restauranteId, setRestauranteId] = useState(null);
  // Controla se a lista de restaurantes está aberta (a "barra de rolagem" do campo)
  const [listaAberta, setListaAberta] = useState(false);
  const [quantidade, setQuantidade] = useState('');
  const [observacao, setObservacao] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [sucesso, setSucesso] = useState('');
  const [erro, setErro] = useState('');

  function escolherRestaurante(id) {
    setRestauranteId(id);
    setListaAberta(false); // fecha a lista depois de escolher
    setErro('');
  }

  async function salvar() {
    const qtd = Number(quantidade);

    setSucesso('');
    setErro('');

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
      const lista = await lerConvenios();

      lista.push({
        id: String(Date.now()),
        empresa: empresa.trim(),
        restaurante: restauranteId, // é com este campo que o fiscal certo enxerga o pedido
        quantidade: qtd,
        observacao: observacao.trim(),
        data: dataHoje(),
        status: STATUS.PENDENTE, // todo pedido nasce pendente: o admin precisa aprovar
      });

      await salvarConvenios(lista);

      setSucesso('Requisição enviada! Aguardando aprovação do administrador.');
      setEmpresa(usuario?.perfil === 'empresa' ? usuario.nome : '');
      setRestauranteId(null);
      setListaAberta(false);
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
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.titulo}>Requisitar Marmitas para Empresa</Text>

      <Text style={styles.label}>Empresa</Text>
      <TextInput
        style={styles.input}
        placeholder="Nome da empresa"
        value={empresa}
        editable={usuario?.perfil !== 'empresa'}
        onChangeText={setEmpresa}
      />

      <Text style={styles.label}>Restaurante</Text>

      {/* Campo: mostra o restaurante escolhido; ao tocar, abre ou fecha a lista */}
      <TouchableOpacity
        style={styles.campoSelecao}
        onPress={() => setListaAberta(!listaAberta)}
        activeOpacity={0.7}
      >
        <Text style={restauranteId ? styles.textoCampo : styles.textoPlaceholder}>
          {restauranteId ? nomeDoRestaurante(restauranteId) : 'Selecione o restaurante'}
        </Text>
        <Text style={styles.seta}>{listaAberta ? '▴' : '▾'}</Text>
      </TouchableOpacity>

      {/* Lista com barra de rolagem, com uma opção para cada restaurante de data/restaurantes.js */}
      {listaAberta && (
        <View style={styles.listaOpcoes}>
          <ScrollView
            style={styles.rolagemLista}
            nestedScrollEnabled
            keyboardShouldPersistTaps="handled"
          >
            {restaurantes.map((r) => (
              <TouchableOpacity
                key={r.id}
                style={[styles.itemLista, restauranteId === r.id && styles.itemSelecionado]}
                onPress={() => escolherRestaurante(r.id)}
              >
                <Text style={styles.textoItem}>{r.nome}</Text>
                {restauranteId === r.id && <Text style={styles.marca}>✓</Text>}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

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

  campoSelecao: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#CCCCCC',
    borderRadius: 8,
    padding: 13,
    backgroundColor: '#FFFFFF',
  },
  textoCampo: { flex: 1, fontSize: 16, color: '#212121' },
  textoPlaceholder: { flex: 1, fontSize: 16, color: '#999999' },
  seta: { fontSize: 16, color: '#147DBA', marginLeft: 8 },

  listaOpcoes: {
    marginTop: 6,
    borderWidth: 1,
    borderColor: '#CCCCCC',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  rolagemLista: { maxHeight: 160 }, // altura máxima: passando disso, aparece a barra de rolagem
  itemLista: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 13,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  itemSelecionado: { backgroundColor: '#E8F3FA' },
  textoItem: { flex: 1, fontSize: 16, color: '#212121' },
  marca: { fontSize: 16, fontWeight: 'bold', color: '#147DBA', marginLeft: 8 },

  botao: { backgroundColor: '#147DBA', padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 24 },
  textoBotao: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  voltar: { padding: 15, alignItems: 'center' },
  textoVoltar: { color: '#147DBA', fontWeight: '600' },
  mensagemErro: { color: '#B3261E', fontSize: 15, fontWeight: '600', marginTop: 15, textAlign: 'center' },
  mensagemSucesso: { color: '#1F5F4A', fontSize: 15, fontWeight: '600', marginTop: 15, textAlign: 'center' },
});