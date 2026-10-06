import React, { useEffect, useState } from 'react';

import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';

function normalizarFichas(lista) {
  if (!Array.isArray(lista)) {
    return [];
  }

  return lista
    .filter(Boolean)
    .map((ficha, index) => {
      const quantidade = Number(ficha.quantidade ?? 0);
      const valor = Number(ficha.valor ?? 0);
      const total = Number(
        ficha.total ?? quantidade * valor
      );

      return {
        id: ficha.id ?? `${ficha.data ?? 'ficha'}-${index}`,
        tipo: ficha.tipo ?? ficha.descricao ?? 'Ficha',
        local: ficha.local ?? 'Local não informado',
        quantidade,
        valor,
        total,
        data: ficha.data ?? new Date().toLocaleDateString('pt-BR'),
      };
    });
}

export default function HistoricoScreen() {
  const [fichas, setFichas] = useState([]);

  const carregarFichas = async () => {
    try {
      const dados = await AsyncStorage.getItem('@openmesa:fichas');

      if (!dados) {
        setFichas([]);
        return;
      }

      const fichasSalvas = JSON.parse(dados);
      setFichas(normalizarFichas(fichasSalvas));
    } catch (error) {
      console.log('Erro ao carregar fichas:', error);

      Alert.alert(
        'Erro',
        'Não foi possível carregar o histórico.'
      );
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    carregarFichas();
  }, []);

  const excluirFicha = async (id) => {
    try {
      const novasFichas = fichas.filter(
        (ficha) => ficha.id !== id
      );

      await AsyncStorage.setItem(
        '@openmesa:fichas',
        JSON.stringify(novasFichas)
      );

      setFichas(novasFichas);

      Alert.alert(
        'Sucesso',
        'Ficha excluída.'
      );
    } catch (error) {
      console.log('Erro ao excluir ficha:', error);

      Alert.alert(
        'Erro',
        'Não foi possível excluir a ficha.'
      );
    }
  };

  function confirmarExclusao(id) {
    Alert.alert(
      'Excluir ficha',
      'Deseja realmente excluir esta ficha?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => excluirFicha(id),
        },
      ]
    );
  }

  function formatarValor(valor) {
    return Number(valor || 0)
      .toFixed(2)
      .replace('.', ',');
  }

  return (
    <ScrollView
      contentContainerStyle={styles.container}
    >

      <Text style={styles.titulo}>
        Histórico
      </Text>

      {fichas.length === 0 ? (

        <View style={styles.vazio}>

          <Text style={styles.vazioTitulo}>
            Nenhuma ficha cadastrada
          </Text>

          <Text style={styles.vazioTexto}>
            As fichas cadastradas aparecerão aqui.
          </Text>

        </View>

      ) : (

        fichas.map((ficha) => (

          <View
            key={ficha.id}
            style={styles.card}
          >

            <View style={styles.cabecalhoCard}>

              <Text style={styles.tipo}>
                {ficha.tipo ?? 'Ficha'}
              </Text>

              <Text style={styles.data}>
                {ficha.data ?? 'Data indisponível'}
              </Text>

            </View>

            <Text style={styles.local}>
              {ficha.local ?? 'Local não informado'}
            </Text>

            <View style={styles.informacoes}>

              <View>
                <Text style={styles.label}>
                  Quantidade
                </Text>

                <Text style={styles.valor}>
                  {ficha.quantidade}
                </Text>
              </View>

              <View>
                <Text style={styles.label}>
                  Valor/refeição
                </Text>

                <Text style={styles.valor}>
                  R$ {formatarValor(ficha.valor)}
                </Text>
              </View>

              <View>
                <Text style={styles.label}>
                  Total
                </Text>

                <Text style={styles.total}>
                  R$ {formatarValor(ficha.total)}
                </Text>
              </View>

            </View>

            <TouchableOpacity
              style={styles.botaoExcluir}
              onPress={() => confirmarExclusao(ficha.id)}
            >
              <Text style={styles.textoExcluir}>
                Excluir
              </Text>
            </TouchableOpacity>

          </View>

        ))

      )}

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
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
  },

  vazio: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },

  vazioTitulo: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },

  vazioTexto: {
    fontSize: 15,
    color: '#666666',
    textAlign: 'center',
  },

  card: {
    backgroundColor: '#F7F7F7',
    borderRadius: 12,
    padding: 18,
    marginBottom: 15,
  },

  cabecalhoCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  tipo: {
    fontSize: 19,
    fontWeight: 'bold',
  },

  data: {
    fontSize: 13,
    color: '#777777',
  },

  local: {
    fontSize: 15,
    color: '#555555',
    marginTop: 5,
    marginBottom: 18,
  },

  informacoes: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  label: {
    fontSize: 12,
    color: '#777777',
    marginBottom: 4,
  },

  valor: {
    fontSize: 15,
    fontWeight: '600',
  },

  total: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#7A4E2D',
  },

  botaoExcluir: {
    marginTop: 18,
    paddingVertical: 10,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#DDDDDD',
  },

  textoExcluir: {
    color: '#B00020',
    fontWeight: '600',
  },
});
