import React, { useEffect, useState } from 'react';

import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';

export default function CalendarioScreen({ navigation }) {

  const [fichas, setFichas] = useState([]);
  const [mesAtual, setMesAtual] = useState(new Date());

  const azul = '#147DBA';
  const azulEscuro = '#172A55';

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

  const primeiroDia = new Date(
    ano,
    mes,
    1
  ).getDay();

  const quantidadeDias = new Date(
    ano,
    mes + 1,
    0
  ).getDate();

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

    const data = `${String(dia).padStart(2, '0')}/${String(
      mes + 1
    ).padStart(2, '0')}/${ano}`;

    return fichas.some(
      (ficha) => ficha.data === data
    );
  }

  function fichasDoMes() {

    return fichas.filter((ficha) => {

      const partes = ficha.data.split('/');

      const mesFicha = Number(partes[1]);
      const anoFicha = Number(partes[2]);

      return (
        mesFicha === mes + 1 &&
        anoFicha === ano
      );
    });
  }

  const dias = [];

  // Espaços antes do primeiro dia
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
      >

        <View
          style={[
            styles.numeroContainer,
            temFicha && styles.numeroSelecionado,
          ]}
        >

          <Text
            style={[
              styles.numero,
              temFicha && styles.numeroBranco,
            ]}
          >
            {dia}
          </Text>

        </View>

        {temFicha && (
          <View style={styles.ponto} />
        )}

      </TouchableOpacity>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={styles.container}
    >

      {/* VOLTAR */}

      <TouchableOpacity
        style={styles.voltar}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.setaVoltar}>
          ←
        </Text>
      </TouchableOpacity>


      {/* TÍTULO */}

      <Text style={styles.titulo}>
        Calendário
      </Text>


      {/* MÊS */}

      <View style={styles.seletorMes}>

        <TouchableOpacity
          style={styles.botaoMes}
          onPress={() => mudarMes(-1)}
        >
          <Text style={styles.seta}>
            ‹
          </Text>
        </TouchableOpacity>


        <Text style={styles.nomeMes}>
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


      {/* DIAS DA SEMANA */}

      <View style={styles.semana}>

        <Text style={styles.nomeSemana}>Dom</Text>
        <Text style={styles.nomeSemana}>Seg</Text>
        <Text style={styles.nomeSemana}>Ter</Text>
        <Text style={styles.nomeSemana}>Qua</Text>
        <Text style={styles.nomeSemana}>Qui</Text>
        <Text style={styles.nomeSemana}>Sex</Text>
        <Text style={styles.nomeSemana}>Sáb</Text>

      </View>


      {/* CALENDÁRIO */}

      <View style={styles.calendario}>
        {dias}
      </View>


      {/* LEGENDA */}

      <View style={styles.legenda}>

        <View style={styles.pontoLegenda} />

        <Text style={styles.textoLegenda}>
          Ficha registrada
        </Text>

      </View>


      {/* RESUMO */}

      <View style={styles.resumo}>

        <Text style={styles.resumoTitulo}>
          Fichas neste mês
        </Text>

        <Text style={styles.quantidade}>
          {fichasDoMes().length}
        </Text>

      </View>

    </ScrollView>
  );
}


const styles = StyleSheet.create({

  container: {
    flexGrow: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
  },


  /* VOLTAR */

  voltar: {
    width: 35,
    height: 35,
    justifyContent: 'center',
  },

  setaVoltar: {
    fontSize: 24,
    color: '#333333',
  },


  /* TÍTULO */

  titulo: {
    fontSize: 27,
    fontWeight: 'bold',
    color: '#222222',
    marginTop: 15,
    marginBottom: 25,
  },


  /* MÊS */

  seletorMes: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 22,
  },

  nomeMes: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#172A55',
  },

  botaoMes: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#147DBA',
    justifyContent: 'center',
    alignItems: 'center',
  },

  seta: {
    color: '#FFFFFF',
    fontSize: 27,
    lineHeight: 28,
  },


  /* SEMANA */

  semana: {
    flexDirection: 'row',
    marginBottom: 8,
  },

  nomeSemana: {
    width: '14.28%',
    textAlign: 'center',
    fontSize: 12,
    fontWeight: 'bold',
    color: '#777777',
  },


  /* CALENDÁRIO */

  calendario: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },

  dia: {
    width: '14.28%',
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
  },

  diaComFicha: {
    backgroundColor: '#F5F8FB',
    borderRadius: 10,
  },

  numeroContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },

  numeroSelecionado: {
    backgroundColor: '#147DBA',
  },

  numero: {
    fontSize: 14,
    color: '#333333',
  },

  numeroBranco: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },

  ponto: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#147DBA',
    marginTop: 2,
  },


  /* LEGENDA */

  legenda: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 25,
  },

  pontoLegenda: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#147DBA',
    marginRight: 8,
  },

  textoLegenda: {
    fontSize: 13,
    color: '#666666',
  },


  /* RESUMO */

  resumo: {
    marginTop: 25,
    padding: 18,
    borderRadius: 12,
    backgroundColor: '#F7F7F7',
  },

  resumoTitulo: {
    fontSize: 15,
    color: '#666666',
    marginBottom: 8,
  },

  quantidade: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#172A55',
  },

});