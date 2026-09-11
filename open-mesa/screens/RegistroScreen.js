import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function RegistroScreen({ navigation, route }) {
  const [data, setData] = useState(new Date(route.params.date));
  const [mostrarSeletor, setMostrarSeletor] = useState(false);

  const [qtdRefeicao, setQtdRefeicao] = useState('');
  const [qtdMarmita, setQtdMarmita] = useState('');
 
  const VALOR_UNITARIO = 2;
 
  function mudarDia(quantidadeDias) {
    const novaData = new Date(data);
    novaData.setDate(novaData.getDate() + quantidadeDias);
    setData(novaData);
  }

  function handleEscolherData(event, dataEscolhida) {
    setMostrarSeletor(false);
    if (dataEscolhida) {
      setData(dataEscolhida);
    }
  }
 
  function formatarValor(numero) {
    return `R$ ${numero.toFixed(2).replace('.', ',')}`;
  }
 
  const dia = String(data.getDate()).padStart(2, '0');
  const mes = String(data.getMonth() + 1).padStart(2, '0');
 
  const podeEditar = data.toDateString() === new Date().toDateString();
 
  const valorRefeicao = Number(qtdRefeicao || 0) * VALOR_UNITARIO;
  const valorMarmita = Number(qtdMarmita || 0) * VALOR_UNITARIO;
  const total = valorRefeicao + valorMarmita;
 
  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={styles.back}>{'\u2190'}</Text>
      </TouchableOpacity>
 
      <View style={styles.dateRow}>
        <TouchableOpacity onPress={() => mudarDia(-1)}>
          <Text style={styles.dateArrow}>{'\u2190'}</Text>
        </TouchableOpacity>
        <Text style={styles.dateText}>Data {dia} de {mes}</Text>
        <TouchableOpacity onPress={() => mudarDia(1)}>
          <Text style={styles.dateArrow}>{'\u2192'}</Text>
        </TouchableOpacity>
      </View>
 
      {mostrarSeletor && (
        <DateTimePicker value={data} 
        mode="date" 
        onChange={handleEscolherData} />
      )}

      <View style={styles.headerRow}>
        <Text style={styles.headerLabel}></Text>
        <Text style={styles.columnHeader}>Quantidade</Text>
        <Text style={styles.columnHeader}>Valor</Text>
      </View>
 
      <View style={styles.row}>
        <Text style={styles.rowLabel}>Refeição</Text>
        <TextInput
          style={[styles.input, !podeEditar && styles.inputDesabilitado]}
          value={qtdRefeicao}
          onChangeText={setQtdRefeicao}
          keyboardType="numeric"
          editable={podeEditar}
        />
        <Text style={styles.valorText}>{formatarValor(valorRefeicao)}</Text>
      </View>
 
      <View style={styles.row}>
        <Text style={styles.rowLabel}>Marmita</Text>
        <TextInput
          style={[styles.input, !podeEditar && styles.inputDesabilitado]}
          value={qtdMarmita}
          onChangeText={setQtdMarmita}
          keyboardType="numeric"
          editable={podeEditar}
        />

        <Text style={styles.valorText}>{formatarValor(valorMarmita)}</Text>
      </View>
 
      <Text style={styles.totalLabel}>Total</Text>
      <View style={styles.totalBar}>
        <Text style={styles.totalText}>{formatarValor(total)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 24, 
    backgroundColor: '#fdf7f0' 
},

  back: { 
    fontSize: 36, 
    marginBottom: 20 
},

  dateRow: {
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center',
    marginBottom: 32,
  },

  dateArrow: { 
    fontSize: 22, 
    marginHorizontal: 16 
},

  dateText: {
    backgroundColor: '#1d3f7a', 
    color: '#fff', 
    fontWeight: 'bold',
    borderRadius: 20, 
    paddingVertical: 8, 
    paddingHorizontal: 20,
  },

  headerRow: { 
    flexDirection: 'row', 
    marginBottom: 8 
},

  headerLabel: { 
    flex: 1, 
    textAlign: 'center', 
    fontWeight: 'bold', 
    color: '#333' 
},

  columnHeader: { 
    width: 90, 
    textAlign: 'center', 
    fontWeight: 'bold', 
    color: '#333', 
    marginHorizontal: 4 
  },

  row: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 12 
},

  rowLabel: { 
    flex: 1.4, 
    fontWeight: 'bold', 
    color: '#333' 
},

  input: {
    flex: 1, 
    borderWidth: 1, 
    borderColor: '#ccc', 
    borderRadius: 6,
    padding: 8, 
    marginHorizontal: 4, 
    backgroundColor: '#fff', 
    textAlign: 'center',
  },

  inputDesabilitado: { 
    backgroundColor: '#eee', 
    color: '#999' 
  },

  valorText: {
    width: 90, 
    textAlign: 'center', 
    fontWeight: 'bold', 
    color: '#333', 
    marginHorizontal: 4,
    borderWidth: 1, 
    borderColor: '#ccc', 
    borderRadius: 6, 
    paddingVertical: 8, 
    backgroundColor: '#eee',
  },

  totalLabel: { 
    textAlign: 'center', 
    fontWeight: 'bold', 
    marginTop: 24, 
    marginBottom: 8 
},

  totalBar: { 
    backgroundColor: '#1d3f7a', 
    borderRadius: 20, 
    paddingVertical: 12, 
    alignItems: 'center' 
},

  totalText: { 
    color: '#fff', 
    fontWeight: 'bold', 
    fontSize: 16 
},
});