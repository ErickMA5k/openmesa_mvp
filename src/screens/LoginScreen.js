import { useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';

import Input from '../components/Input';
import Botao from '../components/Botao';
import { useAuth } from '../context/AuthContext';

export default function LoginScreen() {
  const { entrar } = useAuth();

  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');

  const [erroUsuario, setErroUsuario] = useState('');
  const [erroSenha, setErroSenha] = useState('');

  const aoEntrar = () => {
    let temErro = false;

    // Limpa os erros anteriores
    setErroUsuario('');
    setErroSenha('');

    // Verifica usuário
    if (!usuario.trim()) {
      setErroUsuario('Preencha o usuário');
      temErro = true;
    }

    // Verifica senha
    if (!senha.trim()) {
      setErroSenha('Preencha a senha');
      temErro = true;
    }

    // Se tiver algum erro, não continua
    if (temErro) {
      return;
    }

    // Login
    entrar({
      nome: usuario,
      perfil: 'caixa',
    });
  };

  return (
    <KeyboardAvoidingView
      style={styles.tela}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
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