import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';

import { useAuth } from '../context/AuthContext';
import { useFichas } from '../context/FichasContext';
import { espacos } from '../theme';

export default function HomeScreen({ navigation }) {
  const { usuario, sair } = useAuth();

  const {
    fichas,
    totalGeral,
    receitaTotal,
  } = useFichas();

  return (
    <View style={styles.container}>

      {/* Cabeçalho */}
      <View style={styles.header}>

        <Image
          source={require('../assets/icon.png')}
          style={styles.logo}
          resizeMode="contain"
        />

        <View style={styles.headerTexto}>
          <Text style={styles.ola}>
            Olá,
          </Text>

          <Text style={styles.nome}>
            {usuario?.nome || 'Usuário'}
          </Text>
        </View>

      </View>

      {/* Subtítulo */}
      <Text style={styles.subtitulo}>
        Gerencie suas fichas de forma simples.
      </Text>

      
        {/* Ações */}

      <View style={styles.acoes}>

        <TouchableOpacity
          style={styles.cardAcao}
          activeOpacity={0.8}
          onPress={() => navigation.navigate('AdicionarFicha')}
        >
          <View style={styles.iconeAdicionar}>
            <Text style={styles.iconeTexto}>
              +
            </Text>
          </View>

          <View>
            <Text style={styles.cardTitulo}>
              Adicionar Ficha
            </Text>

            <Text style={styles.cardDescricao}>
              Registrar uma nova ficha
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cardAcao}
          activeOpacity={0.8}
          onPress={() => navigation.navigate('Historico')}
        >
          <View style={styles.icone}>
            <Text style={styles.iconeSimbolo}>
              ≡
            </Text>
          </View>

          <View>
            <Text style={styles.cardTitulo}>
              Histórico
            </Text>

            <Text style={styles.cardDescricao}>
              Consultar fichas registradas
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cardAcao}
          activeOpacity={0.8}
          onPress={() => navigation.navigate('Calendario')}
        >
          <View style={styles.icone}>
            <Text style={styles.iconeSimbolo}>
              □
            </Text>
          </View>

          <View>
            <Text style={styles.cardTitulo}>
              Calendário
            </Text>

            <Text style={styles.cardDescricao}>
              Visualizar fichas por data
            </Text>
          </View>
        </TouchableOpacity>

      </View>

      {/* Sair */}
      <TouchableOpacity
        style={styles.botaoSair}
        activeOpacity={0.7}
        onPress={sair}
      >
        <Text style={styles.textoSair}>
          Sair da conta
        </Text>
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 35,
    backgroundColor: '#FFFFFF',
  },

  /* Cabeçalho */

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },

  logo: {
    width: 70,
    height: 60,
    marginRight: 14,
  },

  headerTexto: {
    flex: 1,
  },

  ola: {
    fontSize: 15,
    color: '#777777',
    alignItems: 'center',
  
  },

  nome: {
    fontSize: 25,
    fontWeight: '700',
    color: '#172A55',
  },

  subtitulo: {
    fontSize: 14,
    color: '#777777',
    marginBottom: 25,
  },


  /* Ações */

  tituloAcoes: {
    fontSize: 19,
    fontWeight: '700',
    color: '#172A55',
    marginTop: 50,
    marginBottom: 15,
  },

  acoes: {
    gap: 12,
  },

  cardAcao: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5EAF0',
    borderRadius: 14,
    padding: 16,

    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 5,

    elevation: 2,
  },

  iconeAdicionar: {
    width: 46,
    height: 46,
    borderRadius: 13,
    backgroundColor: '#147DBA',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },

  icone: {
    width: 46,
    height: 46,
    borderRadius: 13,
    backgroundColor: '#EAF4FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },

  iconeTexto: {
    color: '#FFFFFF',
    fontSize: 30,
    fontWeight: '300',
    lineHeight: 32,
  },

  iconeSimbolo: {
    color: '#147DBA',
    fontSize: 24,
    fontWeight: '600',
  },

  cardTitulo: {
    fontSize: 16,
    fontWeight: '700',
    color: '#172A55',
    marginBottom: 3,
  },

  cardDescricao: {
    fontSize: 12,
    color: '#777777',
  },

  /* Sair */

  botaoSair: {
    marginTop: 'auto',
    marginBottom: 20,
    alignItems: 'center',
    paddingVertical: 14,
  },

  textoSair: {
    fontSize: 14,
    fontWeight: '600',
    color: '#B84A4A',
  },

});