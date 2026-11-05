import { useEffect, useState } from 'react';
import { cores, espacos , fontes } from '../theme';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useFichas } from '../context/FichasContext';
import { useAuth } from '../context/AuthContext';
import { podeFazer } from '../data/permissoes';
import { nomeDoRestaurante } from '../data/restaurantes';
import { dataHoje } from '../data/convenios';

function formatarValor(valor) {
  return Number(valor || 0)
    .toFixed(2)
    .replace('.', ',');
}

// Opções de período do filtro
const PERIODOS = [
  { id: 'hoje', titulo: 'Hoje' },
  { id: '7dias', titulo: '7 dias' },
  { id: 'mes', titulo: 'Este mês' },
  { id: 'tudo', titulo: 'Tudo' },
  { id: 'datas', titulo: 'Datas' },
];

// Formata o que a pessoa digita como dd/mm/aaaa (ela digita só os números; as barras entram sozinhas)
function mascaraData(texto) {
  const numeros = texto.replace(/\D/g, '').slice(0, 8); // mantém só dígitos, no máximo 8
  if (numeros.length <= 2) return numeros;
  if (numeros.length <= 4) return `${numeros.slice(0, 2)}/${numeros.slice(2)}`;
  return `${numeros.slice(0, 2)}/${numeros.slice(2, 4)}/${numeros.slice(4)}`;
}

// Converte 'dd/mm/aaaa' em um número comparável (aaaammdd, ex.: 20261104).
// Devolve null se o texto estiver incompleto ou a data não existir (ex.: 31/02/2026)
function numeroDaData(texto) {
  const partes = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(texto);
  if (!partes) return null;
  const dia = Number(partes[1]);
  const mes = Number(partes[2]);
  const ano = Number(partes[3]);
  const data = new Date(Date.UTC(ano, mes - 1, dia));
  // Se o JavaScript "corrigiu" a data para outra, ela não existe
  if (data.getUTCFullYear() !== ano || data.getUTCMonth() !== mes - 1 || data.getUTCDate() !== dia) {
    return null;
  }
  return ano * 10000 + mes * 100 + dia;
}

// Número (aaaammdd) da data de N dias atrás, a partir de hoje (horário de Brasília)
function diasAtras(dias) {
  const [dia, mes, ano] = dataHoje().split('/').map(Number);
  const data = new Date(Date.UTC(ano, mes - 1, dia - dias)); // o JavaScript acerta a virada de mês e de ano
  return data.getUTCFullYear() * 10000 + (data.getUTCMonth() + 1) * 100 + data.getUTCDate();
}

// Devolve [inicio, fim] do período escolhido (null = sem limite)
function intervaloDoPeriodo(periodo, de, ate) {
  const hoje = numeroDaData(dataHoje());
  if (periodo === 'hoje') return [hoje, hoje];
  if (periodo === '7dias') return [diasAtras(6), hoje];
  if (periodo === 'mes') return [Math.floor(hoje / 100) * 100 + 1, hoje]; // do dia 1 do mês até hoje
  if (periodo === 'datas') return [numeroDaData(de), numeroDaData(ate)];
  return [null, null]; // 'tudo'
}

export default function HistoricoScreen({ navigation, route }) {
  // As fichas vêm do Context (que já lê, valida e grava no armazenamento)
  const { fichas, carregando, erroCarregamento, removerFicha, fichasDoDia, totalFichas,receitaTotal } = useFichas();

  // Só alguns perfis (ver data/permissoes.js) enxergam o botão de excluir
  const { usuario } = useAuth();
  const podeExcluir = podeFazer(usuario, 'excluirFicha');

  // Id da ficha que está aguardando confirmação de exclusão (null = nenhuma)
  const [idParaConfirmar, setIdParaConfirmar] = useState(null);

  // Aviso exibido no topo: { tipo: 'sucesso' | 'erro', texto: '...' } ou null
  const [mensagem, setMensagem] = useState(null);

    // Filtros da lista (valem na visão geral; o filtro por dia vem do Calendário)
  const [periodo, setPeriodo] = useState('tudo');
  const [de, setDe] = useState(''); // data inicial digitada (dd/mm/aaaa)
  const [ate, setAte] = useState(''); // data final digitada
  const [destino, setDestino] = useState(null); // null = todos os destinos

  // A mensagem de sucesso some sozinha depois de alguns segundos
  useEffect(() => {
    if (!mensagem || mensagem.tipo !== 'sucesso') return;
    const temporizador = setTimeout(() => setMensagem(null), 3000);
    return () => clearTimeout(temporizador);
  }, [mensagem]);

  const dataFiltro = route?.params?.data ?? null;

  // --- Filtros por período e destino ---
  const [inicio, fim] = intervaloDoPeriodo(periodo, de, ate);

  // Erro quando as datas digitadas são inválidas ou estão invertidas
  let erroPeriodo = '';
  if (periodo === 'datas') {
    if ((de.length === 10 && inicio === null) || (ate.length === 10 && fim === null)) {
      erroPeriodo = 'Digite datas válidas no formato dd/mm/aaaa.';
    } else if (inicio !== null && fim !== null && inicio > fim) {
      erroPeriodo = 'A data inicial não pode ser depois da data final.';
    }
  }

  const fichasFiltradas = erroPeriodo
    ? []
    : fichas.filter((ficha) => {
        const dia = numeroDaData(ficha.data);
        if (inicio !== null && dia < inicio) return false;
        if (fim !== null && dia > fim) return false;
        if (destino && ficha.destino !== destino) return false;
        return true;
      });

  // Destinos que já aparecem nas fichas de convênio (opções do filtro, em ordem alfabética)
  const destinos = [...new Set(fichas.filter((f) => f.destino).map((f) => f.destino))]
    .sort((a, b) => a.localeCompare(b, 'pt-BR'));

  // Marmitas de convênio por destino, dentro do filtro atual
  const totaisPorDestino = {};
  fichasFiltradas.forEach((f) => {
    if (f.destino) totaisPorDestino[f.destino] = (totaisPorDestino[f.destino] || 0) + f.quantidade;
  });
  const listaTotais = Object.entries(totaisPorDestino)
    .sort(([a], [b]) => a.localeCompare(b, 'pt-BR'));

  // Resumo do filtro atual
  const somaFichas = fichasFiltradas.reduce((soma, f) => soma + f.quantidade, 0);
  const somaReceita = fichasFiltradas.reduce((soma, f) => soma + f.total, 0);

  const filtrando = periodo !== 'tudo' || destino !== null;
  const fichasExibidas = dataFiltro ? fichasDoDia(dataFiltro) : fichasFiltradas;

  useEffect(() => {
    navigation.setOptions({
      title: dataFiltro ? `Histórico de ${dataFiltro}` : 'Histórico',
    });
  }, [navigation, dataFiltro]);

  function pedirConfirmacao(id) {
    setMensagem(null);
    setIdParaConfirmar(id);
  }

  async function excluirFicha(id) {
    try {
      await removerFicha(id);
      setMensagem({ tipo: 'sucesso', texto: 'Ficha excluída.' });
    } catch (error) {
      console.log('Erro ao excluir ficha:', error);
      setMensagem({
        tipo: 'erro',
        texto: error.message || 'Não foi possível excluir a ficha.',
      });
    } finally {
      setIdParaConfirmar(null);
    }
  }

  const listaVazia =
      !carregando && erroCarregamento === '' && fichasExibidas.length === 0;

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">     
     <Text style={styles.titulo}>
        {dataFiltro ? `Fichas de ${dataFiltro}` : 'Histórico'}
      </Text>

      {dataFiltro && !carregando && (
        <View style={styles.resumoDia}>
          <View>
            <Text style={styles.label}>Fichas no dia</Text>
            <Text style={styles.valor}>{totalFichas(dataFiltro)}</Text>
          </View>

          <View>
            <Text style={styles.label}>Receita do dia</Text>
            <Text style={styles.total}>R$ {formatarValor(receitaTotal(dataFiltro))}</Text>
          </View>

          <TouchableOpacity
            style={styles.botaoVerTudo}
            onPress={() => navigation.setParams({ data: undefined })}
          >
            <Text style={styles.textoVerTudo}>Ver todas</Text>
          </TouchableOpacity>
        </View>
      )}

            {/* Filtros e resumo: aparecem na visão geral (o filtro por dia vem do Calendário) */}
      {!dataFiltro && !carregando && (
        <View>
          <Text style={styles.rotuloFiltro}>Período</Text>
          <View style={styles.linhaChips}>
            {PERIODOS.map((p) => (
              <TouchableOpacity
                key={p.id}
                style={[styles.chip, periodo === p.id && styles.chipSelecionado]}
                onPress={() => setPeriodo(p.id)}
              >
                <Text style={[styles.textoChip, periodo === p.id && styles.textoChipSelecionado]}>
                  {p.titulo}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Datas digitadas com o teclado: as barras entram sozinhas */}
          {periodo === 'datas' && (
            <View style={styles.linhaDatas}>
              <TextInput
                style={styles.campoData}
                placeholder="De: dd/mm/aaaa"
                keyboardType="numeric"
                maxLength={10}
                value={de}
                onChangeText={(texto) => setDe(mascaraData(texto))}
              />
              <TextInput
                style={styles.campoData}
                placeholder="Até: dd/mm/aaaa"
                keyboardType="numeric"
                maxLength={10}
                value={ate}
                onChangeText={(texto) => setAte(mascaraData(texto))}
              />
            </View>
          )}
          {erroPeriodo !== '' && <Text style={styles.mensagemErro}>{erroPeriodo}</Text>}

          {/* Destinos: só aparecem depois que existe alguma ficha de convênio */}
          {destinos.length > 0 && (
            <>
              <Text style={styles.rotuloFiltro}>Destino (convênio)</Text>
              <View style={styles.linhaChips}>
                <TouchableOpacity
                  style={[styles.chip, destino === null && styles.chipSelecionado]}
                  onPress={() => setDestino(null)}
                >
                  <Text style={[styles.textoChip, destino === null && styles.textoChipSelecionado]}>Todos</Text>
                </TouchableOpacity>
                {destinos.map((d) => (
                  <TouchableOpacity
                    key={d}
                    style={[styles.chip, destino === d && styles.chipSelecionado]}
                    onPress={() => setDestino(d)}
                  >
                    <Text style={[styles.textoChip, destino === d && styles.textoChipSelecionado]}>{d}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}

          {/* Resumo do filtro atual */}
          <View style={styles.resumoDia}>
            <View>
              <Text style={styles.label}>Fichas</Text>
              <Text style={styles.valor}>{somaFichas}</Text>
            </View>
            <View>
              <Text style={styles.label}>Receita</Text>
              <Text style={styles.total}>R$ {formatarValor(somaReceita)}</Text>
            </View>
          </View>

          {/* Totais por destino: mostra as marmitas de convênio de cada empresa lado a lado */}
          {listaTotais.length > 0 && (
            <View style={styles.cardTotais}>
              <Text style={styles.tituloTotais}>Marmitas de convênio por destino</Text>
              {listaTotais.map(([nome, quantidade]) => (
                <View key={nome} style={styles.linhaTotal}>
                  <Text style={styles.nomeDestino}>{nome}</Text>
                  <Text style={styles.valor}>{quantidade}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      )}

      {erroCarregamento !== '' && (
        <Text style={styles.mensagemErro}>{erroCarregamento}</Text>
      )}

      {mensagem && (
        <Text
          style={
            mensagem.tipo === 'erro'
              ? styles.mensagemErro
              : styles.mensagemSucesso
          }
        >
          {mensagem.texto}
        </Text>
      )}

      {carregando && (
        <Text style={styles.vazioTexto}>Carregando fichas...</Text>
      )}

      {listaVazia && (
        <View style={styles.vazio}>
         <Text style={styles.vazioTitulo}>
            {dataFiltro ? 'Nenhuma ficha neste dia' : filtrando ? 'Nenhuma ficha encontrada' : 'Nenhuma ficha cadastrada'}
          </Text>

          <Text style={styles.vazioTexto}>
            {dataFiltro
              ? `Não há fichas registradas em ${dataFiltro}.`
              : filtrando
                ? 'Tente outro período ou destino.'
                : 'As fichas cadastradas aparecerão aqui.'}
          </Text>
        </View>
      )}

      {fichasExibidas.map((ficha) => (
        <View key={ficha.id} style={styles.card}>
          <View style={styles.cabecalhoCard}>
            <Text style={styles.tipo}>{ficha.tipo}</Text>

            {/* Data e, quando existir, a hora da venda (ex.: 21/10/2026 às 14:35) */}
            <Text style={styles.data}>
              {ficha.hora ? `${ficha.data} às ${ficha.hora}` : ficha.data}
            </Text>
          </View>

          {/* Restaurante da venda; nas marmitas de convênio mostra também o destino */}
          <Text style={styles.local}>
            {nomeDoRestaurante(ficha.restaurante) || ficha.local}
            {ficha.destino ? `\nDestino: ${ficha.destino}` : ''}
          </Text>

          <View style={styles.informacoes}>
            <View>
              <Text style={styles.label}>Quantidade</Text>

              <Text style={styles.valor}>{ficha.quantidade}</Text>
            </View>

            <View>
              <Text style={styles.label}>Valor/refeição</Text>

              <Text style={styles.valor}>R$ {formatarValor(ficha.valor)}</Text>
            </View>

            <View>
              <Text style={styles.label}>Total</Text>

              <Text style={styles.total}>R$ {formatarValor(ficha.total)}</Text>
            </View>
          </View>

          {podeExcluir && (idParaConfirmar === ficha.id ? (
            <View style={styles.confirmacao}>
              <Text style={styles.textoConfirmacao}>Excluir esta ficha?</Text>

              <View style={styles.linhaConfirmacao}>
                <TouchableOpacity
                  style={styles.botaoConfirmar}
                  onPress={() => excluirFicha(ficha.id)}
                >
                  <Text style={styles.textoConfirmar}>Sim, excluir</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.botaoDesistir}
                  onPress={() => setIdParaConfirmar(null)}
                >
                  <Text style={styles.textoDesistir}>Cancelar</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.botaoExcluir}
              onPress={() => pedirConfirmacao(ficha.id)}
            >
              <Text style={styles.textoExcluir}>Excluir</Text>
            </TouchableOpacity>
          ))}
        </View>
      ))}
    </ScrollView>
  );
}
//Cores e design para cada componente da tela
//Não esquecer de atualizar para utilizar o padrão do index.jx
const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#FFFFFF',
  },

  titulo: {
    fontSize: fontes.g,
    fontWeight: 'bold',
    color: cores.texto,
    marginBottom: espacos.m,
  },

  mensagemErro: {
    color: cores.perigo,
    fontSize: fontes.p,
    fontWeight: '600',
    marginBottom: espacos.m,
  },

  mensagemSucesso: {
    color: '#1F5F4A',
    fontSize: fontes.p,
    fontWeight: '600',
    marginBottom: espacos.m,
  },

  vazio: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: espacos.g,
  },

  vazioTitulo: {
    fontSize: fontes.m,
    fontWeight: 'bold',
    marginBottom: espacos.p,
  },

  vazioTexto: {
    fontSize: fontes.p,
    color: '#666666',
    textAlign: 'center',
  },
resumoDia: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F7F7F7',
    borderRadius: 12,
    padding: espacos.m,
    marginBottom: espacos.m,
  },

  botaoVerTudo: {
    paddingVertical: espacos.p,
    paddingHorizontal: espacos.m,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: cores.primaria,
  },

  textoVerTudo: {
    color: cores.primaria,
    fontWeight: '600',
    fontSize: fontes.p,
  },

  card: {
    backgroundColor: cores.fundo,
    borderRadius: 12,
    padding: espacos.m,
    marginBottom: espacos.m,
  },

  cabecalhoCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  tipo: {
    fontSize: fontes.m,
    fontWeight: 'bold',
    color: cores.texto,
  },

  data: {
    fontSize: fontes.p,
    color: '#777777',
  },

  local: {
    fontSize: fontes.p,
    color: '#555555',
    marginTop: espacos.p,
    marginBottom: espacos.m,
  },

  informacoes: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  label: {
    fontSize: fontes.p,
    color: '#777777',
    marginBottom: espacos.p,
  },

  valor: {
    fontSize: fontes.p,
    fontWeight: '600',
    color: cores.texto,
  },

  total: {
    fontSize: fontes.p,
    fontWeight: 'bold',
    color: cores.primaria,
  },

  botaoExcluir: {
    marginTop: espacos.m,
    paddingVertical: espacos.p,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: cores.borda,
  },

  textoExcluir: {
    color: '#B00020',
    fontWeight: '600',
  },

  confirmacao: {
    marginTop: espacos.m,
    paddingTop: espacos.p,
    borderTopWidth: 1,
    borderTopColor: cores.borda,
  },

  textoConfirmacao: {
    fontSize: fontes.p,
    fontWeight: '600',
    color: cores.texto,
  },

  linhaConfirmacao: {
    flexDirection: 'row',
    gap: espacos.p,
    marginTop: espacos.p,
  },

  botaoConfirmar: {
    flex: 1,
    paddingVertical: espacos.p,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: cores.perigo,
  },

  textoConfirmar: {
    color: cores.secundaria,
    fontWeight: '600',
  },

  botaoDesistir: {
    flex: 1,
    paddingVertical: espacos.p,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: cores.borda,
  },

  textoDesistir: {
    color: '#555555',
    fontWeight: '600',
  },
  
    /* Filtros */

  rotuloFiltro: {
    fontSize: fontes.p,
    fontWeight: '600',
    color: cores.texto,
    marginTop: espacos.p,
    marginBottom: espacos.p,
  },

  linhaChips: {
    flexDirection: 'row',
    flexWrap: 'wrap', // quebra de linha quando não cabem todos
    gap: espacos.p,
    marginBottom: espacos.p,
  },

  chip: {
    paddingVertical: espacos.p,
    paddingHorizontal: espacos.m,
    borderWidth: 1,
    borderColor: cores.borda,
    borderRadius: 20,
    backgroundColor: cores.secundaria,
  },

  chipSelecionado: {
    backgroundColor: cores.primaria,
    borderColor: cores.primaria,
  },

  textoChip: {
    fontSize: fontes.p,
    fontWeight: '600',
    color: cores.primaria,
  },

  textoChipSelecionado: {
    color: cores.secundaria,
  },

  linhaDatas: {
    flexDirection: 'row',
    gap: espacos.p,
    marginBottom: espacos.p,
  },

  campoData: {
    flex: 1,
    borderWidth: 1,
    borderColor: cores.borda,
    borderRadius: 8,
    padding: 12,
    fontSize: fontes.m,
  },

  cardTotais: {
    borderWidth: 1,
    borderColor: cores.borda,
    borderRadius: 12,
    padding: espacos.m,
    marginBottom: espacos.m,
  },

  tituloTotais: {
    fontSize: fontes.m,
    fontWeight: 'bold',
    color: cores.escura,
    marginBottom: espacos.p,
  },

  linhaTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },

  nomeDestino: {
    flex: 1,
    fontSize: fontes.p,
    color: cores.texto,
    marginRight: espacos.p,
  },
});
