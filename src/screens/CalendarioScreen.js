import React, { useState } from 'react';

import { useFichas, TIPOS } from '../context/FichasContext';

import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';

import { fontes } from '../theme';

export default function CalendarioScreen({ navigation }) {
  const { totalFichas, fichas } = useFichas();
  const [mesAtual, setMesAtual] = useState(new Date());
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

  // Usa o totalFichas como hook para inicializar a contagem de fichas
  function obterQuantidadeFichasDoDia(dia) {
    const dataFormatada = `${String(dia).padStart(2, '0')}/${String(mes + 1).padStart(2, '0')}/${ano}`;
    return totalFichas(dataFormatada);
  }

  // Fichas do mês e ano atualmente selecionados
  const fichasDoMes = fichas.filter((f) => {
    const partes = String(f.data || '').split('/');
    if (partes.length !== 3) return false;
    const mesFicha = Number(partes[1]) - 1;
    const anoFicha = Number(partes[2]);
    return mesFicha === mes && anoFicha === ano;
  });

  // Fichas do Restaurante (vendas normais, marmitas e refeição)
  const totalBalcaoMes = fichasDoMes
    .filter((f) => f.tipo !== TIPOS.CONVENIO)
    .reduce((soma, f) => soma + f.quantidade, 0);

  // Marmitas de Convênio (pedidos aprovados de empresas)
  const totalConvenioMes = fichasDoMes
    .filter((f) => f.tipo === TIPOS.CONVENIO)
    .reduce((soma, f) => soma + f.quantidade, 0);

  const totalGeralMes = totalBalcaoMes + totalConvenioMes;

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

  // Dias do mês atualizados para contar fichas individualmente
  for (let dia = 1; dia <= quantidadeDias; dia++) {

    const quantidadeFichasDia = obterQuantidadeFichasDoDia(dia);
    const temFicha = quantidadeFichasDia > 0;
  

    dias.push(
      <TouchableOpacity
        key={dia}
        style={[
          styles.dia,
          temFicha && styles.diaComFicha,
        ]}
        onPress={() =>
          navigation.push('Historico', {
            data: `${String(dia).padStart(2, '0')}/${String(mes + 1).padStart(2, '0')}/${ano}`,
          })
        }
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
          <View style={styles.indicadorContainer}>
            <View style={styles.ponto} />
            {quantidadeFichasDia > 1 && (
              <Text style={styles.textoQuantidadeDia}>
                {quantidadeFichasDia}
              </Text>
            )}
          </View>
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


      {/* RESUMO DO MÊS COM SEPARAÇÃO */}
      <View style={styles.resumo}>
        <Text style={styles.resumoTitulo}>
          Total de fichas no mês: <Text style={styles.quantidadeDestaque}>{totalGeralMes}</Text>
        </Text>

        <View style={styles.linhaCardsResumo}>
          <View style={styles.cardResumoItem}>
            <Text style={styles.rotuloResumoItem}>Fichas do Restaurante</Text>
            <Text style={styles.valorResumoBalcao}>{totalBalcaoMes}</Text>
          </View>

          <View style={[styles.cardResumoItem, styles.cardResumoConvenio]}>
            <Text style={styles.rotuloResumoItem}>Marmitas de Convênio</Text>
            <Text style={styles.valorResumoConvenio}>{totalConvenioMes}</Text>
          </View>
        </View>
      </View>

    </ScrollView>
  );
}

//Cores e design para cada componente da tela
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
    fontSize: fontes.g,
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
    fontSize: fontes.m,
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
    fontSize: fontes.p,
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
    fontSize: fontes.p,
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
  },

  indicadorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },

  textoQuantidadeDia: {
    fontSize: fontes.p,
    fontWeight: 'bold',
    color: '#147DBA',
    marginLeft: 2,
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
    fontSize: fontes.p,
    color: '#666666',
  },


  /* RESUMO */

  resumo: {
    marginTop: 25,
    marginBottom: 30,
    padding: 18,
    borderRadius: 12,
    backgroundColor: '#F7F7F7',
    borderWidth: 1,
    borderColor: '#E5EAF0',
  },

  resumoTitulo: {
    fontSize: fontes.m,
    color: '#555555',
    marginBottom: 14,
    fontWeight: '600',
  },

  quantidadeDestaque: {
    color: '#172A55',
    fontWeight: 'bold',
  },

  linhaCardsResumo: {
    flexDirection: 'row',
    gap: 12,
  },

  cardResumoItem: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },

  cardResumoConvenio: {
    backgroundColor: '#F0F7FC',
    borderColor: '#BAE0F7',
  },

  rotuloResumoItem: {
    fontSize: 13,
    color: '#666666',
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 6,
  },

  valorResumoBalcao: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#172A55',
  },

  valorResumoConvenio: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#147DBA',
  },
});