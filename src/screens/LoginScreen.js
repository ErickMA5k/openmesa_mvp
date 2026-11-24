import { useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  KeyboardAvoidingView,
  ScrollView,
} from 'react-native';
import Input from '../components/Input';
import Botao from '../components/Botao';
import { useAuth } from '../context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { usuarios as usuariosIniciais } from '../data/usuarios';

const CHAVE = '@openmesa:usuarios';

export default function LoginScreen() {
  const { entrar } = useAuth();

  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');

  const [erroUsuario, setErroUsuario] = useState('');
  const [erroSenha, setErroSenha] = useState('');

  const aoEntrar = async () => {
  let temErro = false;

  setErroUsuario('');
  setErroSenha('');

  if (!usuario.trim()) {
    setErroUsuario('Preencha o usuário');
    temErro = true;
  }

  if (!senha.trim()) {
    setErroSenha('Preencha a senha');
    temErro = true;
  }

  if (temErro) return;

  try {
    const dados = await AsyncStorage.getItem(CHAVE);

    const listaUsuarios = dados
      ? JSON.parse(dados)
      : usuariosIniciais;

    const encontrado = listaUsuarios.find(
      (u) =>
        u.usuario === usuario.trim().toLowerCase() &&
        u.senha === senha &&
        u.ativo !== false
    );

    if (!encontrado) {
      setErroSenha('Usuário ou senha inválidos');
      return;
    }

    entrar({
      nome: encontrado.nome,
      perfil: encontrado.perfil,
      restaurante: encontrado.restaurante,
    });
  } catch (erro) {
    console.log('Erro ao consultar usuários:', erro);
    setErroSenha('Não foi possível realizar o login.');
  }
};

  return (
    <KeyboardAvoidingView
      style={styles.tela}
      behavior="padding"
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >

        {/* Logo */}
        <View style={styles.logoContainer}>
          <Image
            source={require('../assets/icon.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        {/* Título */}
        <Text style={styles.titulo}>
          Bem-vindo ao OpenMesa
        </Text>

        <Text style={styles.subtitulo}>
          Entre para continuar
        </Text>

        {/* Formulário */}
        <View style={styles.formulario}>

          {/* Usuário */}
          <Input
            label="Usuário"
            value={usuario}
            onChangeText={(texto) => {
              setUsuario(texto);
              setErroUsuario('');
            }}
            autoCapitalize="none"
            autoCorrect={false}
            erro={erroUsuario}
          />

          {/* Senha */}
          <Input
            label="Senha"
            value={senha}
            autoComplete="off"
            textContentType="none"
            onChangeText={(texto) => {
              setSenha(texto);
              setErroSenha('');
            }}
            secureTextEntry
            erro={erroSenha}
          />

          {/* Botão */}
          <View style={styles.botaoContainer}>
            <Botao
              titulo="Entrar"
              onPress={aoEntrar}
            />
          </View>

        </View>

        {/* Rodapé */}
        <Text style={styles.rodape}>
          Restaurante Popular
        </Text>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({

  tela: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  container: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 28,
    paddingVertical: 40,
  },

  logoContainer: {
    alignItems: 'center',
    marginBottom: 25,
  },

  logo: {
    width: 125,
    height: 90,
  },

  titulo: {
    fontSize: 26,
    fontWeight: '700',
    color: '#172A55',
    textAlign: 'center',
    marginBottom: 8,
  },

  subtitulo: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 35,
  },

  formulario: {
    width: '100%',
  },

  botaoContainer: {
    marginTop: 15,
  },

  rodape: {
    textAlign: 'center',
    marginTop: 35,
    fontSize: 13,
    color: '#9CA3AF',
  },

});