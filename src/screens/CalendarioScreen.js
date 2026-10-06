import React, { useEffect, useState } from 'react';

import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';

export default function CalendarioScreen() {

  const [fichas, setFichas] = useState([]);
  const [mesAtual, setMesAtual] = useState(new Date());

  useEffect(() => {
    carregarFichas();
  }, []);

  async function carregarFichas() {
    try {
      const dados = await AsyncStorage.getItem(
        '@openmesa:fichas'
      );

      if (dados) {
        setFichas(JSON.parse(dados));
      } else {
        setFichas([]);
      }

    } catch (error) {
      console.log('Erro ao carregar fichas:', error);
    }
  }

  const ano = mesAtual.getFullYear();
  const mes = mesAtual.getMonth();

  const primeiroDia = new Date(ano, mes, 1).getDay();
  const quantidadeDias = new Date(
    ano,
    mes + 1,
    0
  ).getDate();

  const meses = [
    'Janeiro',
    'Fevereiro',
    'Março',
    'Abril',
    'Maio',
    'Junho',
    'Julho',
    'Agosto',
    'Setembro',
    'Outubro',
    'Novembro',
    'Dezembro',
  ];

  function mudarMes(valor) {
    setMesAtual(
      new Date(
        ano,
        mes + valor,
        1
      )
    );
  }

  function possuiFicha(dia) {

    const dataDia =
      `${String(dia).padStart(2, '0')}/` +
      `${String(mes + 1).padStart(2, '0')}/` +
      `${ano}`;

    return fichas.some(
      (ficha) => ficha.data === dataDia
    );
  }

  function fichasDoDia(dia) {

    const dataDia =
      `${String(dia).padStart(2, '0')}/` +
      `${String(mes + 1).padStart(2, '0')}/` +
      `${ano}`;

    return fichas.filter(
      (ficha) => ficha.data === dataDia
    );
  }

  function selecionarDia(dia) {
    const fichasEncontradas = fichasDoDia(dia);

    if (fichasEncontradas.length > 0) {
      console.log(
        'Fichas do dia:',
        fichasEncontradas
      );
    }
  }

  const dias = [];

  // Espaços antes do primeiro dia do mês
  for (let i = 0; i < primeiroDia; i++) {
    dias.push(
      <View
        key={`vazio-${i}`}
        style={styles.dia}
      />
    );
  }

  // Dias do mês
  for (let dia = 1; dia <= quantidadeDias; dia++) {

    const temFicha = possuiFicha(dia);

    dias.push(
      <TouchableOpacity
        key={dia}
        style={[
          styles.dia,
          temFicha && styles.diaComFicha,
        ]}
        onPress={() => selecionarDia(dia)}
      >

        <Text
          style={[
            styles.numeroDia,
            temFicha && styles.numeroComFicha,
          ]}
        >
          {dia}
        </Text>

        {temFicha && (
          <View style={styles.indicador} />
        )}

      </TouchableOpacity>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={styles.container}
    >

      <Text style={styles.titulo}>
        Calendário
      </Text>

      {/* Cabeçalho do mês */}
      <View style={styles.cabecalho}>

        <TouchableOpacity
          style={styles.botaoMes}
          onPress={() => mudarMes(-1)}
        >
          <Text style={styles.seta}>
            ‹
          </Text>
        </TouchableOpacity>

        <Text style={styles.mes}>
          {meses[mes]} {ano}
        </Text>

        <TouchableOpacity
          style={styles.botaoMes}
          onPress={() => mudarMes(1)}
        >
          <Text style={styles.seta}>
            ›
          </Text>
        </TouchableOpacity>

      </View>

      {/* Dias da semana */}
      <View style={styles.semana}>

        <Text style={styles.nomeDia}>
          Dom
        </Text>

        <Text style={styles.nomeDia}>
          Seg
        </Text>

        <Text style={styles.nomeDia}>
          Ter
        </Text>

        <Text style={styles.nomeDia}>
          Qua
        </Text>

        <Text style={styles.nomeDia}>
          Qui
        </Text>

        <Text style={styles.nomeDia}>
          Sex
        </Text>

        <Text style={styles.nomeDia}>
          Sáb
        </Text>

      </View>

      {/* Calendário */}
      <View style={styles.calendario}>
        {dias}
      </View>

      {/* Legenda */}
      <View style={styles.legenda}>

        <View style={styles.indicadorLegenda} />

        <Text style={styles.textoLegenda}>
          Dia com ficha cadastrada
        </Text>

      </View>

      {/* Resumo */}
      <View style={styles.resumo}>

        <Text style={styles.resumoTitulo}>
          Resumo do mês
        </Text>

        <Text style={styles.resumoTexto}>
          Fichas cadastradas:{' '}
          {
            fichas.filter((ficha) => {
              const partes = ficha.data.split('/');

              return (
                Number(partes[1]) === mes + 1 &&
                Number(partes[2]) === ano
              );
            }).length
          }
        </Text>

      </View>

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
    marginBottom: 25,
  },

  cabecalho: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },

  botaoMes: {
    width: 45,
    height: 45,
    borderRadius: 8,
    backgroundColor: '#F2F2F2',
    justifyContent: 'center',
    alignItems: 'center',
  },

  seta: {
    fontSize: 30,
    color: '#7A4E2D',
  },

  mes: {
    fontSize: 20,
    fontWeight: 'bold',
  },

  semana: {
    flexDirection: 'row',
    marginBottom: 8,
  },

  nomeDia: {
    width: '14.28%',
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '600',
    color: '#777777',
  },

  calendario: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },

  dia: {
    width: '14.28%',
    height: 55,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },

  diaComFicha: {
    backgroundColor: '#F1E6DC',
  },

  numeroDia: {
    fontSize: 16,
    color: '#333333',
  },

  numeroComFicha: {
    fontWeight: 'bold',
    color: '#7A4E2D',
  },

  indicador: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#7A4E2D',
    marginTop: 4,
  },

  legenda: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 25,
  },

  indicadorLegenda: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#7A4E2D',
    marginRight: 8,
  },

  textoLegenda: {
    color: '#666666',
  },

  resumo: {
    marginTop: 25,
    padding: 18,
    backgroundColor: '#F7F7F7',
    borderRadius: 10,
  },

  resumoTitulo: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },

  resumoTexto: {
    fontSize: 15,
    color: '#666666',
  },

});
