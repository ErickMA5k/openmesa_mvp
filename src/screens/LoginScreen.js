import { useState } from 'react';
import { View } from 'react-native';
import Input from '../components/Input';
import Botao from '../components/Botao';
import { espacos } from '../theme';

export default function LoginScreen({ navigation }) {
  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');

  const entrar = () => {
    if (!usuario || !senha) return setErro('Preencha usuário e senha');
    setErro('');
    navigation.navigate('Home');
  };

  return (
    <View style={{ padding: espacos.m }}>
      <Input label="Usuário" value={usuario} onChangeText={setUsuario} autoCapitalize="none" />
      <Input label="Digite sua senha:" value={senha} onChangeText={setSenha} secureTextEntry erro={erro} />
      <Botao titulo="Login" onPress={entrar} />
    </View>
  );
}