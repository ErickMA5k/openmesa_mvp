import { View, Text } from 'react-native';
import Botao from '../components/Botao';
import { useAuth } from '../context/AuthContext';
import { espacos } from '../theme';

export default function HomeScreen({ navigation }) {
  const { usuario, sair } = useAuth();

  return (
    <View style={{ padding: espacos.m }}>
      <Text>Olá, {usuario?.nome}</Text>
      <Botao titulo="Adicionar Ficha" onPress={() => navigation.navigate('AdicionarFicha')} />
      <Botao titulo="Histórico" onPress={() => navigation.navigate('Historico')} />
      <Botao titulo="Calendário" onPress={() => navigation.navigate('Calendario')} />
      <Botao titulo="Sair" variante="perigo" onPress={sair} />
    </View>
  );
}