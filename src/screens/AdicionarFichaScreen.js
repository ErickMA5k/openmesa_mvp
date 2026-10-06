import React, { useState } from 'react';

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';

export default function AdicionarFichaScreen({ navigation }) {
  const [tipo, setTipo] = useState('');
  const [local, setLocal] = useState('');
  const [quantidade, setQuantidade] = useState('');
  const [valor, setValor] = useState('');

  const quantidadeNumero = Number(quantidade) || 0;
  const valorNumero = Number(String(valor).replace(',', '.')) || 0;
  const total = quantidadeNumero * valorNumero;

  const salvarFicha = async () => {
    if (!tipo || !local || !quantidade || !valor) {
      Alert.alert('Atenção', 'Preencha todos os campos.');
      return;
    }

    if (quantidadeNumero <= 0 || valorNumero <= 0) {
      Alert.alert(
        'Atenção',
        'Quantidade e valor devem ser maiores que zero.'
      );
      return;
    }

    try {
      const dadosExistentes = await AsyncStorage.getItem('@openmesa:fichas');
      const fichasExistentes = dadosExistentes ? JSON.parse(dadosExistentes) : [];
      const ficha = {
        id: Date.now().toString(),
        tipo,
        local,
        quantidade: quantidadeNumero,
        valor: valorNumero,
        total,
        data: new Date().toLocaleDateString('pt-BR'),
      };

      const listaAtualizada = Array.isArray(fichasExistentes)
        ? [...fichasExistentes, ficha]
        : [ficha];

      await AsyncStorage.setItem(
        '@openmesa:fichas',
        JSON.stringify(listaAtualizada)
      );

      Alert.alert('Sucesso', 'Ficha cadastrada com sucesso!', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      console.log('Erro ao salvar ficha:', error);
      Alert.alert('Erro', 'Não foi possível salvar a ficha.');
    }
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
    >

      <Text style={styles.titulo}>
        Adicionar Ficha
      </Text>

      <Text style={styles.label}>
        Tipo
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Ex.: Marmita"
        value={tipo}
        onChangeText={setTipo}
      />

      <Text style={styles.label}>
        Local
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Ex.: Restaurante Popular"
        value={local}
        onChangeText={setLocal}
      />

      <Text style={styles.label}>
        Quantidade
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Ex.: 10"
        keyboardType="numeric"
        value={quantidade}
        onChangeText={setQuantidade}
      />

      <Text style={styles.label}>
        Valor por refeição
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Ex.: 2,00"
        keyboardType="decimal-pad"
        value={valor}
        onChangeText={setValor}
      />

      <View style={styles.totalContainer}>

        <Text style={styles.totalLabel}>
          Total
        </Text>

        <Text style={styles.total}>
          R$ {total.toFixed(2).replace('.', ',')}
        </Text>

      </View>

      <TouchableOpacity
        style={styles.botaoSalvar}
        onPress={salvarFicha}
      >
        <Text style={styles.textoBotao}>
          Salvar Ficha
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.botaoCancelar}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.textoCancelar}>
          Cancelar
        </Text>
      </TouchableOpacity>

    </ScrollView>
  );
}

const styles = StyleSheet.create({

  container: {
    flexGrow: 1,
    padding: 24,
    backgroundColor: '#FFFFFF',
  },

  titulo: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
  },

  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 12,
  },

  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#CCCCCC',
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
  },

  totalContainer: {
    marginTop: 25,
    padding: 20,
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
  },

  totalLabel: {
    fontSize: 16,
    color: '#666666',
  },

  total: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 5,
  },

  botaoSalvar: {
    height: 52,
    backgroundColor: '#7A4E2D',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 25,
  },

  textoBotao: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: 'bold',
  },

  botaoCancelar: {
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },

  textoCancelar: {
    color: '#7A4E2D',
    fontSize: 16,
    fontWeight: '600',
  },

});