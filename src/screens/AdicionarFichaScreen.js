import { useEffect, useState } from 'react';
 
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
 
import PopupFichas from '../components/popupFichas';
import { useFichas, TIPOS } from '../context/FichasContext';
 


 
export default function AdicionarFichaScreen({ navigation }) {
  const { adicionarFicha, carregando, erroCarregamento } = useFichas();
  const [tipo, setTipo] = useState('');
  const [local, setLocal] = useState('');
  const [quantidade, setQuantidade] = useState('');
  const [valor, setValor] = useState('');
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState(false);
  const [salvando, setSalvando] = useState(false);
 
  const quantidadeNumero = Number(quantidade) || 0;
  const valorNumero = Number(String(valor).replace(',', '.')) || 0;
  const total = quantidadeNumero * valorNumero;
 
  // A mensagem de sucesso some sozinha depois de alguns segundos
  useEffect(() => {
    if (!sucesso) return;
    const temporizador = setTimeout(() => setSucesso(false), 3000);
    return () => clearTimeout(temporizador);
  }, [sucesso]);
 
  // Atualiza um campo e apaga o aviso de erro anterior
  function aoDigitar(atualizarCampo) {
    return (texto) => {
      atualizarCampo(texto);
      setErro('');
    };
  }
 
  function selecionarTipo(novoTipo) {
    setTipo(novoTipo);
    setErro('');
  }
 
  const salvarFicha = async () => {
    setSucesso(false);
 
    if (!tipo) {
      setErro('Selecione o tipo da ficha.');
      return;
    }
 
    if (!local.trim()) {
      setErro('Informe o local.');
      return;
    }
 
    if (!Number.isInteger(quantidadeNumero) || quantidadeNumero <= 0) {
      setErro('A quantidade deve ser um número inteiro maior que zero.');
      return;
    }
 
    if (valorNumero <= 0) {
      setErro('O valor deve ser maior que zero.');
      return;
    }
 
    setErro('');
    setSalvando(true);
 
    try {
      await adicionarFicha({
        tipo,
        local,
        quantidade: quantidadeNumero,
        valor: valorNumero,
      });
 
      // Limpa o formulário para o próximo cadastro e avisa que deu certo
      setTipo('');
      setLocal('');
      setQuantidade('');
      setValor('');
      setSucesso(true);
    } catch (error) {
      console.log('Erro ao salvar ficha:', error);
      setErro(error.message || 'Não foi possível salvar a ficha.');
    } finally {
      setSalvando(false);
    }
  };
 
  const botaoDesabilitado = salvando || carregando;
 
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.titulo}>Adicionar Ficha</Text>
 
      {erroCarregamento !== '' && (
        <Text style={styles.mensagemErro}>{erroCarregamento}</Text>
      )}
 
      <Text style={styles.label}>Cadastro rápido</Text>
 
      <PopupFichas />
 
      <Text style={styles.label}>Cadastro detalhado</Text>
 
      <Text style={styles.label}>Tipo</Text>
 
      <View style={styles.opcoesTipo}>
        <TouchableOpacity
          style={[
            styles.opcaoTipo,
            tipo === TIPOS.MARMITA && styles.opcaoSelecionada,
          ]}
          onPress={() => selecionarTipo(TIPOS.MARMITA)}
        >
          <Text
            style={[
              styles.textoOpcao,
              tipo === TIPOS.MARMITA && styles.textoSelecionado,
            ]}
          >
            Marmita
          </Text>
        </TouchableOpacity>
 
        <TouchableOpacity
          style={[
            styles.opcaoTipo,
            tipo === TIPOS.REFEICAO && styles.opcaoSelecionada,
          ]}
          onPress={() => selecionarTipo(TIPOS.REFEICAO)}
        >
          <Text
            style={[
              styles.textoOpcao,
              tipo === TIPOS.REFEICAO && styles.textoSelecionado,
            ]}
          >
            Refeição
          </Text>
        </TouchableOpacity>
      </View>
 
      <Text style={styles.label}>Local</Text>
 
      <TextInput
        style={styles.input}
        placeholder="Ex.: Restaurante Popular"
        value={local}
        onChangeText={aoDigitar(setLocal)}
      />
 
      <Text style={styles.label}>Quantidade</Text>
 
      <TextInput
        style={styles.input}
        placeholder="Ex.: 10"
        keyboardType="numeric"
        value={quantidade}
        onChangeText={aoDigitar(setQuantidade)}
      />
 
      <Text style={styles.label}>Valor por refeição</Text>
 
      <TextInput
        style={styles.input}
        placeholder="Ex.: 2,00"
        keyboardType="decimal-pad"
        value={valor}
        onChangeText={aoDigitar(setValor)}
      />
 
      <View style={styles.totalContainer}>
        <Text style={styles.totalLabel}>Total</Text>
 
        <Text style={styles.total}>
          R$ {total.toFixed(2).replace('.', ',')}
        </Text>
      </View>
 
      {erro !== '' && <Text style={styles.mensagemErro}>{erro}</Text>}
 
      {sucesso && (
        <Text style={styles.mensagemSucesso}>Ficha cadastrada com sucesso!</Text>
      )}
 
      <TouchableOpacity
        style={[styles.botaoSalvar, botaoDesabilitado && styles.botaoDesabilitado]}
        onPress={salvarFicha}
        disabled={botaoDesabilitado}
      >
        <Text style={styles.textoBotao}>
          {salvando ? 'Salvando...' : 'Salvar Ficha'}
        </Text>
      </TouchableOpacity>
 
      <TouchableOpacity
        style={styles.botaoCancelar}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.textoCancelar}>Voltar</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
 
//Cores e design para cada componente da tela
//Não esquecer de atualizar para utilizar o padrão do index.jx
const styles = StyleSheet.create({
  opcoesTipo: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
 
  opcaoTipo: {
    flex: 1,
    height: 50,
    borderWidth: 1,
    borderColor: '#CCCCCC',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
 
  opcaoSelecionada: {
    backgroundColor: '#147DBA',
    borderColor: '#147DBA',
  },
 
  textoOpcao: {
    fontSize: 16,
    fontWeight: '600',
    color: '#147DBA',
  },
 
  textoSelecionado: {
    color: '#FFFFFF',
  },
 
  container: {
    flexGrow: 1,
    padding: 24,
    backgroundColor: '#FFFFFF',
  },
 
  titulo: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
  },
 
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 12,
  },
 
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#CCCCCC',
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
  },
 
  totalContainer: {
    marginTop: 25,
    padding: 20,
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
  },
 
  totalLabel: {
    fontSize: 16,
    color: '#666666',
  },
 
  total: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 5,
  },
 
  mensagemErro: {
    color: '#B3261E',
    fontSize: 15,
    fontWeight: '600',
    marginTop: 15,
  },
 
  mensagemSucesso: {
    color: '#1F5F4A',
    fontSize: 15,
    fontWeight: '600',
    marginTop: 15,
  },
 
  botaoSalvar: {
    height: 52,
    backgroundColor: '#147DBA',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 25,
  },
 
  botaoDesabilitado: {
    opacity: 0.6,
  },
 
  textoBotao: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: 'bold',
  },
 
  botaoCancelar: {
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
 
  textoCancelar: {
    color: '#147DBA',
    fontSize: 16,
    fontWeight: '600',
  },
});