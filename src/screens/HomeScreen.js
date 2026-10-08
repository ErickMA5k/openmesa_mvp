import { View, Text, Image, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useFichas } from '../context/FichasContext';
import { espacos } from '../theme';

const botoesPorPerfil = {
  caixa: [
    { titulo: 'Adicionar Ficha', descricao: 'Registrar uma nova ficha', tela: 'AdicionarFicha', simbolo: '+', principal: true },
    { titulo: 'Histórico', descricao: 'Consultar fichas registradas', tela: 'Historico', simbolo: '≡' },
    { titulo: 'Calendário', descricao: 'Visualizar fichas por data', tela: 'Calendario', simbolo: '□' },
  ],
};

export default function HomeScreen({ navigation }) {
  const { usuario, sair } = useAuth();

  const {
    fichas,
    totalGeral,
    receitaTotal,
  } = useFichas();

    const confirmarSaida = () =>
    Alert.alert('Sair', 'Deseja realmente sair da conta?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sair', style: 'destructive', onPress: sair },
    ]);

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
        {(botoesPorPerfil[usuario?.perfil] || []).map((b) => (
          <TouchableOpacity
            key={b.tela}
            style={styles.cardAcao}
            activeOpacity={0.8}
            onPress={() => navigation.navigate(b.tela)}
          >
            <View style={b.principal ? styles.iconeAdicionar : styles.icone}>
              <Text style={b.principal ? styles.iconeTexto : styles.iconeSimbolo}>
                {b.simbolo}
              </Text>
            </View>

            <View>
              <Text style={styles.cardTitulo}>{b.titulo}</Text>
              <Text style={styles.cardDescricao}>{b.descricao}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Sair */}
      <TouchableOpacity
        style={styles.botaoSair}
        activeOpacity={0.7}
        onPress={confirmarSaida}>
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