import { restaurantes } from '../data/restaurantes';
import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  Pressable,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Input from '../components/Input';
import Botao from '../components/Botao';
import { usuarios as usuariosIniciais } from '../data/usuarios';
import { cores, espacos, fontes } from '../theme';

const CHAVE = '@openmesa:usuarios';

export default function GerenciarUsuariosScreen() {
  const [usuarios, setUsuarios] = useState([]);
  const [nome, setNome] = useState('');
  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');
  const [perfil, setPerfil] = useState('caixa');
  const [restaurante, setRestaurante] = useState('');
  const [carregando, setCarregando] = useState(true);
  const [modalDesativarVisivel, setModalDesativarVisivel] = useState(false);
  const [usuarioSelecionado, setUsuarioSelecionado] = useState(null);

  useEffect(() => {
    async function carregarUsuarios() {
      try {
        const dados = await AsyncStorage.getItem(CHAVE);

        const lista = dados
          ? JSON.parse(dados)
          : usuariosIniciais.map((item) => ({
              ...item,
              ativo: true,
            }));

        setUsuarios(lista);
      } catch (_erro) {
        Alert.alert('Erro', 'Não foi possível carregar os usuários.');
      } finally {
        setCarregando(false);
      }
    }

    carregarUsuarios();
  }, []);

  async function salvarUsuarios(novaLista) {
    await AsyncStorage.setItem(CHAVE, JSON.stringify(novaLista));
    setUsuarios(novaLista);
  }

  async function cadastrarUsuario() {
    if (!nome.trim() || !usuario.trim() || !senha.trim()) {
      Alert.alert('Atenção', 'Preencha todos os campos.');
      return;
    }

    const existe = usuarios.some(
      (item) =>
        item.usuario.toLowerCase() === usuario.trim().toLowerCase()
    );

    if (existe) {
      Alert.alert('Atenção', 'Este usuário já está cadastrado.');
      return;
    }
    if (perfil !== 'empresa' && !restaurante) {
      Alert.alert('Atenção', 'Selecione um restaurante.');
      return;
    }

    const novoUsuario = {
      nome: nome.trim(),
      usuario: usuario.trim().toLowerCase(),
      senha,
      perfil,
      restaurante: perfil === 'empresa' ? undefined : restaurante,
      ativo: true,
    };

    try {
      await salvarUsuarios([...usuarios, novoUsuario]);

      setNome('');
      setUsuario('');
      setSenha('');
      setPerfil('caixa');
      setRestaurante('');

      Alert.alert('Sucesso', 'Usuário cadastrado.');
    } catch {
      Alert.alert('Erro', 'Não foi possível salvar o usuário.');
    }
  }

  function abrirModalDesativar(item) {
    // Função que impede a desativação do admin
    if (item.perfil === 'admin') return;
    setUsuarioSelecionado(item);
    setModalDesativarVisivel(true);
  }

  async function confirmarDesativacao() {
    if (!usuarioSelecionado) return;
    try {
      const novaLista = usuarios.map((usuarioAtual) =>
        usuarioAtual.usuario === usuarioSelecionado.usuario
          ? { ...usuarioAtual, ativo: false }
          : usuarioAtual
      );
      await salvarUsuarios(novaLista);
    } catch {
      Alert.alert('Erro', 'Não foi possível desativar o usuário.');
    } finally {
      setModalDesativarVisivel(false);
      setUsuarioSelecionado(null);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.titulo}>Gerenciar Usuários</Text>

      <Text style={styles.subtitulo}>Cadastrar novo usuário</Text>

      <Input
        label="Nome"
        value={nome}
        onChangeText={setNome}
        placeholder="Nome completo"
      />

      <Input
        label="Usuário"
        value={usuario}
        onChangeText={setUsuario}
        autoCapitalize="none"
        placeholder="Nome de acesso"
      />

      <Input
        label="Senha"
        value={senha}
        onChangeText={setSenha}
        secureTextEntry
        placeholder="Senha"
      />

      <Text style={styles.label}>Perfil</Text>

      <View style={styles.perfis}>
        {['caixa', 'fiscal', 'empresa'].map((item) => (
          <TouchableOpacity
            key={item}
            style={[
              styles.botaoPerfil,
              perfil === item && styles.perfilSelecionado,
            ]}
            onPress={() => setPerfil(item)}
          >
            <Text
              style={[
                styles.textoPerfil,
                perfil === item && styles.textoSelecionado,
              ]}
            >
              {item.charAt(0).toUpperCase() + item.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {perfil !== 'empresa' && (
        <>
          <Text style={styles.label}>Restaurante</Text>

          {restaurantes.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.botaoPerfil,
                restaurante === item.id && styles.perfilSelecionado,
              ]}
              onPress={() => setRestaurante(item.id)}
            >
              <Text
                style={[
                  styles.textoPerfil,
                  restaurante === item.id && styles.textoSelecionado,
                ]}
              >
                {item.nome}
              </Text>
            </TouchableOpacity>
          ))}
        </>
      )}

      <Botao titulo="Cadastrar usuário" onPress={cadastrarUsuario} />

      <Text style={styles.subtitulo}>Usuários cadastrados</Text>

      {carregando ? (
        <Text>Carregando usuários...</Text>
      ) : (
        // Filtro para evitar que o usuário admin seja listado
        usuarios
          .filter((item) => item.perfil !== 'admin' && item.ativo !== false)
          .map((item) => (
            <View key={item.usuario} style={styles.card}>
              <View style={styles.dados}>
                <Text style={styles.nome}>{item.nome}</Text>
                <Text style={styles.info}>
                  {item.usuario} • {item.perfil}
                </Text>
                <Text
                  style={{
                    color: item.ativo === false ? cores.perigo : '#1F7A45',
                  }}
                >
                  {item.ativo === false ? 'Desativado' : 'Ativo'}
                </Text>
              </View>

              {item.ativo !== false && (
                <TouchableOpacity
                  style={styles.botaoDesativar}
                  onPress={() => abrirModalDesativar(item)}
                >
                  <Text style={styles.textoDesativar}>Desativar</Text>
                </TouchableOpacity>
              )}
            </View>
          ))
      )}

      {/* Modal de confirmação de desativação */}
      <Modal
        visible={modalDesativarVisivel}
        transparent
        animationType="fade"
        onRequestClose={() => setModalDesativarVisivel(false)}
      >
        <View style={styles.modalFundo}>
          <View style={styles.modalCartao}>
            <Text style={styles.modalTitulo}>Desativar usuário</Text>
            <Text style={styles.modalMensagem}>
              Deseja desativar{' '}
              <Text style={{ fontWeight: 'bold' }}>
                {usuarioSelecionado?.nome}
              </Text>
              ?
            </Text>
            <View style={styles.modalLinhaBotoes}>
              <Pressable
                style={styles.modalBotaoCancelar}
                onPress={() => setModalDesativarVisivel(false)}
              >
                <Text style={styles.modalTextoCancelar}>Cancelar</Text>
              </Pressable>
              <Pressable
                style={styles.modalBotaoConfirmar}
                onPress={confirmarDesativacao}
              >
                <Text style={styles.modalTextoConfirmar}>Desativar</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  titulo: {
    fontSize: fontes.g,
    fontWeight: 'bold',
    color: cores.texto,
    marginBottom: espacos.g,
  },
  subtitulo: {
    fontSize: fontes.m,
    fontWeight: 'bold',
    color: cores.texto,
    marginTop: espacos.m,
    marginBottom: espacos.m,
  },
  label: {
    fontSize: fontes.p,
    color: cores.texto,
    marginBottom: espacos.p,
  },
  perfis: {
    flexDirection: 'row',
    gap: espacos.p,
    marginBottom: espacos.m,
  },
  botaoPerfil: {
    flex: 1,
    padding: espacos.m,
    borderWidth: 1,
    borderColor: cores.borda,
    borderRadius: 8,
    alignItems: 'center',
  },
  perfilSelecionado: {
    backgroundColor: cores.primaria,
  },
  textoPerfil: {
    color: cores.texto,
  },
  textoSelecionado: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: espacos.m,
    borderWidth: 1,
    borderColor: cores.borda,
    borderRadius: 10,
    marginBottom: espacos.m,
  },
  dados: {
    flex: 1,
  },
  nome: {
    fontSize: fontes.m,
    fontWeight: 'bold',
    color: cores.texto,
  },
  info: {
    fontSize: fontes.p,
    color: '#777777',
    marginVertical: 4,
  },
  botaoDesativar: {
    padding: espacos.p,
  },
  textoDesativar: {
    color: cores.perigo,
    fontWeight: 'bold',
  },
  // Estilos do modal de confirmação
  modalFundo: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: espacos.g,
  },
  modalCartao: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: espacos.g,
    width: '100%',
    maxWidth: 400,
  },
  modalTitulo: {
    fontSize: fontes.m,
    fontWeight: 'bold',
    color: cores.texto,
    marginBottom: espacos.p,
  },
  modalMensagem: {
    fontSize: fontes.p,
    color: cores.texto,
    marginBottom: espacos.g,
  },
  modalLinhaBotoes: {
    flexDirection: 'row',
    gap: espacos.m,
  },
  modalBotaoCancelar: {
    flex: 1,
    padding: espacos.m,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: cores.borda,
    alignItems: 'center',
  },
  modalTextoCancelar: {
    color: cores.texto,
    fontWeight: 'bold',
  },
  modalBotaoConfirmar: {
    flex: 1,
    padding: espacos.m,
    borderRadius: 8,
    backgroundColor: cores.perigo,
    alignItems: 'center',
  },
  modalTextoConfirmar: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});
