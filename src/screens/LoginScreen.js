import { useState } from 'react';
import { View } from 'react-native';
import Input from '../components/Input';
import Botao from '../components/Botao';
import { espacos } from '../theme';
import { useAuth } from '../context/AuthContext';

export default function LoginScreen() {
  const { entrar } = useAuth();
  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');

  const aoEntrar = () => {
    if (!usuario || !senha) return setErro('Preencha usuário e senha');
    setErro('');
    entrar({ nome: usuario, perfil: 'caixa' });
  };

  return (
    <View style={{ padding: espacos.m }}>
      <Input label="Usuário" value={usuario} onChangeText={setUsuario} autoCapitalize="none" />
      <Input label="Digite sua senha:" value={senha} onChangeText={setSenha} secureTextEntry erro={erro} />
      <Botao titulo="Login" onPress={aoEntrar} />
    </View>
  );
}