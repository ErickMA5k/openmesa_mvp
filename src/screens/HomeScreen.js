import { View, Text, Image, StyleSheet } from 'react-native';
import Botao from '../components/Botao';
import { useAuth } from '../context/AuthContext';
import { espacos } from '../theme';

export default function HomeScreen({ navigation }) {
  const { usuario, sair } = useAuth();

  return (
    <View style={styles.container}>

      {/* Logo */}
      <View style={styles.logoContainer}>
        <Image
          source={require('../assets/icon.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      {/* Saudação */}
      <Text style={styles.saude}>
        Olá, {usuario?.nome}
      </Text>

      <Text style={styles.subtitulo}>
        O que você deseja fazer?
      </Text>

      {/* Botões */}
      <View style={styles.botoes}>
        <Botao
          titulo="Adicionar Ficha"
          onPress={() => navigation.navigate('AdicionarFicha')}
        />

        <Botao
          titulo="Histórico"
          onPress={() => navigation.navigate('Historico')}
        />

        <Botao
          titulo="Calendário"
          onPress={() => navigation.navigate('Calendario')}
        />

        <Botao
          titulo="Sair"
          variante="perigo"
          onPress={sair}
        />
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: espacos.m,
    backgroundColor: '#FFFFFF',
  },

  logoContainer: {
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 25,
  },

  logo: {
    width: 130,
    height: 80,
  },

  saude: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#172A55',
    marginBottom: 5,
  },

  subtitulo: {
    fontSize: 15,
    color: '#666666',
    marginBottom: 25,
  },

  botoes: {
    gap: 12,
  },
});