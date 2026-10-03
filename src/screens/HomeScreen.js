import { View, Button } from 'react-native';

export default function HomeScreen({ navigation }) {
  return (
    <View>
      <Button title="Adicionar Ficha" onPress={() => navigation.navigate('AdicionarFicha')} />
      <Button title="Histórico" onPress={() => navigation.navigate('Historico')} />
      <Button title="Calendário" onPress={() => navigation.navigate('Calendario')} />
    </View>
  );
}