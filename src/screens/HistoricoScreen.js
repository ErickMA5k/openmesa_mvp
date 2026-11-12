import { useEffect, useState } from 'react';
import { cores, espacos, fontes } from '../theme';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useFichas, TIPOS } from '../context/FichasContext';
import { useAuth } from '../context/AuthContext';
import { podeFazer } from '../data/permissoes';
import { restaurantes, nomeDoRestaurante } from '../data/restaurantes';
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
function numeroDaData(texto) {
  const partes = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(texto);
  if (!partes) return null;
  const dia = Number(partes[1]);
  const mes = Number(partes[2]);
  const ano = Number(partes[3]);
  const data = new Date(Date.UTC(ano, mes - 1, dia));
  if (data.getUTCFullYear() !== ano || data.getUTCMonth() !== mes - 1 || data.getUTCDate() !== dia) {
    return null;
  }
  return ano * 10000 + mes * 100 + dia;
}

// Número (aaaammdd) da data de N dias atrás, a partir de hoje (horário de Brasília)
function diasAtras(dias) {
  const [dia, mes, ano] = dataHoje().split('/').map(Number);
  const data = new Date(Date.UTC(ano, mes - 1, dia - dias));
  return data.getUTCFullYear() * 10000 + (data.getUTCMonth() + 1) * 100 + data.getUTCDate();
}

// Devolve [inicio, fim] do período escolhido (null = sem limite)
function intervaloDoPeriodo(periodo, de, ate) {
  const hoje = numeroDaData(dataHoje());
  if (periodo === 'hoje') return [hoje, hoje];
  if (periodo === '7dias') return [diasAtras(6), hoje];
  if (periodo === 'mes') return [Math.floor(hoje / 100) * 100 + 1, hoje];
  if (periodo === 'datas') return [numeroDaData(de), numeroDaData(ate)];
  return [null, null];
}

export default function HistoricoScreen({ navigation, route }) {
  const { fichas, carregando, erroCarregamento, removerFicha, fichasDoDia } = useFichas();
  const { usuario } = useAuth();
  const podeExcluir = podeFazer(usuario, 'excluirFicha');
  const AdministradorCredenciado = usuario?.perfil === 'admin';

  const [idParaConfirmar, setIdParaConfirmar] = useState(null);
  const [mensagem, setMensagem] = useState(null);

  // Aba selecionada: 'balcao' (vendas do restaurante) e'convênios'(marmitas doadas para empresas)
  const [abaAtiva, setAbaAtiva] = useState('balcao');

  // Filtros
  const [periodo, setPeriodo] = useState('tudo');
  const [de, setDe] = useState('');
  const [ate, setAte] = useState('');
  const [empresaFiltro, setEmpresaFiltro] = useState(null); // null = todas as empresas
  const [gavetaEmpresaAberta, setGavetaEmpresaAberta] = useState(false);
  const [restauranteFiltro, setRestauranteFiltro] = useState(null); // null = todos os restaurantes
  const [gavetaRestauranteAberta, setGavetaRestauranteAberta] = useState(false);

  useEffect(() => {
    if (!mensagem || mensagem.tipo !== 'sucesso') return;
    const temporizador = setTimeout(() => setMensagem(null), 3000);
    return () => clearTimeout(temporizador);
  }, [mensagem]);

  const dataFiltro = route?.params?.data ?? null;

  const [inicio, fim] = intervaloDoPeriodo(periodo, de, ate);

  let erroPeriodo = '';
  if (periodo === 'datas') {
    if ((de.length === 10 && inicio === null) || (ate.length === 10 && fim === null)) {
      erroPeriodo = 'Digite datas válidas no formato dd/mm/aaaa.';
    } else if (inicio !== null && fim !== null && inicio > fim) {
      erroPeriodo = 'A data inicial não pode ser depois da data final.';
    }
  }

  // Convênios aprovados no contexto atual (respeitando o restaurante vinculado do fiscal ou o selecionado pelo admin)
  const conveniosContexto = fichas.filter((f) => {
    if (f.tipo !== TIPOS.CONVENIO) return false;
    if (AdministradorCredenciado && restauranteFiltro) return f.restaurante === restauranteFiltro;
    return true;
  });

  // Empresas que possuem convênios aprovados neste restaurante
  const empresasDisponiveis = [
    ...new Set(conveniosContexto.map((f) => f.destino).filter(Boolean)),
  ].sort((a, b) => a.localeCompare(b, 'pt-BR'));

  // Filtra as fichas conforme aba, restaurante, empresa e período
  const fichasFiltradas = erroPeriodo
    ? []
    : fichas.filter((ficha) => {
        // Separação por Abas
        if (abaAtiva === 'balcao' && ficha.tipo === TIPOS.CONVENIO) return false;
        if (abaAtiva === 'convenios' && ficha.tipo !== TIPOS.CONVENIO) return false;

        // Filtro por Restaurante (para Admin)
        if (AdministradorCredenciado && restauranteFiltro && ficha.restaurante !== restauranteFiltro) return false;

        // Filtro por Empresa (na aba de convênios)
        if (abaAtiva === 'convenios' && empresaFiltro && ficha.destino !== empresaFiltro) return false;

        // Filtro por Período
        const dia = numeroDaData(ficha.data);
        if (inicio !== null && dia < inicio) return false;
        if (fim !== null && dia > fim) return false;

        return true;
      });

  const fichasExibidas = dataFiltro
    ? (fichasDoDia(dataFiltro) || []).filter((ficha) => {
        if (abaAtiva === 'balcao' && ficha.tipo === TIPOS.CONVENIO) return false;
        if (abaAtiva === 'convenios' && ficha.tipo !== TIPOS.CONVENIO) return false;
        if (AdministradorCredenciado && restauranteFiltro && ficha.restaurante !== restauranteFiltro) return false;
        if (abaAtiva === 'convenios' && empresaFiltro && ficha.destino !== empresaFiltro) return false;
        return true;
      })
    : fichasFiltradas;

  // Resumo do filtro atual
  const somaFichas = fichasExibidas.reduce((soma, f) => soma + f.quantidade, 0);
  const somaReceita = fichasExibidas.reduce((soma, f) => soma + f.total, 0);

  const filtrando =
    periodo !== 'tudo' ||
    (abaAtiva === 'convenios' && empresaFiltro !== null) ||
    (AdministradorCredenciado && restauranteFiltro !== null);

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

      {/* Para Fiscal e Caixa: exibe o restaurante ao qual o usuário está atrelado */}
      {!AdministradorCredenciado && usuario?.restaurante && (
        <View style={styles.cardRestauranteFiscal}>
          <Text style={styles.rotuloRestauranteFiscal}>Restaurante vinculado:</Text>
          <Text style={styles.nomeRestauranteFiscal}>
            {nomeDoRestaurante(usuario.restaurante)}
          </Text>
        </View>
      )}

      {/* Abas Principais: Fichas vendidas NO RESTAURANTE e Fichas dadas por meio do convênio */}
      <View style={styles.linhaAbas}>
        <TouchableOpacity
          style={[styles.abaPrincipal, abaAtiva === 'balcao' && styles.abaPrincipalAtiva]}
          onPress={() => {
            setAbaAtiva('balcao');
            setGavetaEmpresaAberta(false);
          }}
        >
          <Text style={[styles.textoAbaPrincipal, abaAtiva === 'balcao' && styles.textoAbaPrincipalAtiva]}>
            Fichas do Balcão
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.abaPrincipal, abaAtiva === 'convenios' && styles.abaPrincipalAtiva]}
          onPress={() => {
            setAbaAtiva('convenios');
            setGavetaRestauranteAberta(false);
          }}
        >
          <Text style={[styles.textoAbaPrincipal, abaAtiva === 'convenios' && styles.textoAbaPrincipalAtiva]}>
            Marmitas de Convênio
          </Text>
        </TouchableOpacity>
      </View>

      {dataFiltro && !carregando && (
        <View style={styles.resumoDia}>
          <View>
            <Text style={styles.label}>
              {abaAtiva === 'balcao' ? 'Fichas do Balcão' : 'Marmitas de Convênio'}
            </Text>
            <Text style={styles.valor}>{somaFichas}</Text>
          </View>

          <View>
            <Text style={styles.label}>Receita no dia</Text>
            <Text style={styles.total}>R$ {formatarValor(somaReceita)}</Text>
          </View>

          <TouchableOpacity
            style={styles.botaoVerTudo}
            onPress={() => navigation.setParams({ data: undefined })}
          >
            <Text style={styles.textoVerTudo}>Ver todas</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Filtros e resumo: aparecem na visão geral */}
      {!dataFiltro && !carregando && (
        <View>
          {/* Administrador: seletor estilo gaveta para restaurantes */}
          {AdministradorCredenciado && (
            <View style={styles.blocoFiltro}>
              <Text style={styles.rotuloFiltro}>Restaurante</Text>
              <TouchableOpacity
                style={styles.campoSelecao}
                onPress={() => {
                  setGavetaRestauranteAberta(!gavetaRestauranteAberta);
                  setGavetaEmpresaAberta(false);
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.textoCampo}>
                  {restauranteFiltro ? nomeDoRestaurante(restauranteFiltro) : 'Todos os restaurantes'}
                </Text>
                <Text style={styles.seta}>{gavetaRestauranteAberta ? '▲' : '▼'}</Text>
              </TouchableOpacity>

              {gavetaRestauranteAberta && (
                <View style={styles.listaOpcoes}>
                  <ScrollView
                    style={styles.rolagemLista}
                    nestedScrollEnabled
                    keyboardShouldPersistTaps="handled"
                  >
                    <TouchableOpacity
                      style={[styles.itemLista, restauranteFiltro === null && styles.itemSelecionado]}
                      onPress={() => {
                        setRestauranteFiltro(null);
                        setEmpresaFiltro(null);
                        setGavetaRestauranteAberta(false);
                      }}
                    >
                      <Text style={styles.textoItem}>Todos os restaurantes</Text>
                      {restauranteFiltro === null && <Text style={styles.marca}>✓</Text>}
                    </TouchableOpacity>

                    {restaurantes.map((r) => (
                      <TouchableOpacity
                        key={r.id}
                        style={[styles.itemLista, restauranteFiltro === r.id && styles.itemSelecionado]}
                        onPress={() => {
                          setRestauranteFiltro(r.id);
                          setEmpresaFiltro(null);
                          setGavetaRestauranteAberta(false);
                        }}
                      >
                        <Text style={styles.textoItem}>{r.nome}</Text>
                        {restauranteFiltro === r.id && <Text style={styles.marca}>✓</Text>}
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>
          )}

          {/* Gaveta de Empresas: exibida exclusivamente na aba de Convênios */}
          {abaAtiva === 'convenios' && (
            <View style={styles.blocoFiltro}>
              <Text style={styles.rotuloFiltro}>Empresa conveniada</Text>
              <TouchableOpacity
                style={styles.campoSelecao}
                onPress={() => {
                  setGavetaEmpresaAberta(!gavetaEmpresaAberta);
                  setGavetaRestauranteAberta(false);
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.textoCampo}>
                  {empresaFiltro || 'Todas as empresas'}
                </Text>
                <Text style={styles.seta}>{gavetaEmpresaAberta ? '▲' : '▼'}</Text>
              </TouchableOpacity>

              {gavetaEmpresaAberta && (
                <View style={styles.listaOpcoes}>
                  <ScrollView
                    style={styles.rolagemLista}
                    nestedScrollEnabled
                    keyboardShouldPersistTaps="handled"
                  >
                    {/* Opção "Todas as empresas" sempre presente no topo */}
                    <TouchableOpacity
                      style={[styles.itemLista, empresaFiltro === null && styles.itemSelecionado]}
                      onPress={() => {
                        setEmpresaFiltro(null);
                        setGavetaEmpresaAberta(false);
                      }}
                    >
                      <Text style={styles.textoItem}>Todas as empresas</Text>
                      {empresaFiltro === null && <Text style={styles.marca}>✓</Text>}
                    </TouchableOpacity>

                    {empresasDisponiveis.map((emp) => (
                      <TouchableOpacity
                        key={emp}
                        style={[styles.itemLista, empresaFiltro === emp && styles.itemSelecionado]}
                        onPress={() => {
                          setEmpresaFiltro(emp);
                          setGavetaEmpresaAberta(false);
                        }}
                      >
                        <Text style={styles.textoItem}>{emp}</Text>
                        {empresaFiltro === emp && <Text style={styles.marca}>✓</Text>}
                      </TouchableOpacity>
                    ))}

                    {empresasDisponiveis.length === 0 && (
                      <View style={styles.itemVazio}>
                        <Text style={styles.textoItemVazio}>Nenhum convênio aprovado para este restaurante</Text>
                      </View>
                    )}
                  </ScrollView>
                </View>
              )}
            </View>
          )}

          {/* Filtro por Período */}
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

          {/* Resumo do filtro atual */}
          <View style={styles.resumoDia}>
            <View>
              <Text style={styles.label}>
                {abaAtiva === 'balcao' ? 'Fichas do Balcão' : 'Marmitas de Convênio'}
              </Text>
              <Text style={styles.valor}>{somaFichas}</Text>
            </View>
            <View>
              <Text style={styles.label}>Receita</Text>
              <Text style={styles.total}>R$ {formatarValor(somaReceita)}</Text>
            </View>
          </View>
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
            {dataFiltro
              ? 'Nenhuma ficha neste dia'
              : abaAtiva === 'balcao'
                ? 'Nenhuma ficha do balcão encontrada'
                : 'Nenhuma marmita de convênio encontrada'}
          </Text>

          <Text style={styles.vazioTexto}>
            {dataFiltro
              ? `Não há registros em ${dataFiltro}.`
              : filtrando
                ? 'Tente outro período, restaurante ou empresa.'
                : abaAtiva === 'balcao'
                  ? 'As fichas de balcão cadastradas aparecerão aqui.'
                  : 'As marmitas de convênio aprovadas aparecerão aqui.'}
          </Text>
        </View>
      )}

      {fichasExibidas.map((ficha) => (
        <View key={ficha.id} style={styles.card}>
          <View style={styles.cabecalhoCard}>
            <Text style={styles.tipo}>{ficha.tipo}</Text>

            {/* Data e hora da venda */}
            <Text style={styles.data}>
              {ficha.hora ? `${ficha.data} às ${ficha.hora}` : ficha.data}
            </Text>
          </View>

          {/* Restaurante da venda; nas marmitas de convênio mostra também a empresa */}
          <Text style={styles.local}>
            {nomeDoRestaurante(ficha.restaurante) || ficha.local}
            {ficha.destino ? `\nEmpresa: ${ficha.destino}` : ''}
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

  cardRestauranteFiscal: {
    backgroundColor: '#EBF4FA',
    borderLeftWidth: 4,
    borderLeftColor: cores.primaria,
    borderRadius: 8,
    padding: espacos.m,
    marginBottom: espacos.m,
  },

  rotuloRestauranteFiscal: {
    fontSize: fontes.p,
    color: '#555555',
    marginBottom: 4,
  },

  nomeRestauranteFiscal: {
    fontSize: fontes.m,
    fontWeight: 'bold',
    color: cores.escura,
  },

  /* Abas Principais (Balcão e Convênio) */
  linhaAbas: {
    flexDirection: 'row',
    gap: espacos.p,
    marginBottom: espacos.m,
  },

  abaPrincipal: {
    flex: 1,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: cores.borda,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: cores.secundaria,
  },

  abaPrincipalAtiva: {
    backgroundColor: cores.primaria,
    borderColor: cores.primaria,
  },

  textoAbaPrincipal: {
    fontSize: fontes.p,
    fontWeight: 'bold',
    color: cores.texto,
  },

  textoAbaPrincipalAtiva: {
    color: cores.secundaria,
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
    textAlign: 'center',
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
  blocoFiltro: {
    marginBottom: espacos.p,
  },

  rotuloFiltro: {
    fontSize: fontes.p,
    fontWeight: '600',
    color: cores.texto,
    marginTop: espacos.p,
    marginBottom: espacos.p,
  },

  linhaChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
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

  /* Seletor estilo gaveta */
  campoSelecao: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: cores.borda,
    borderRadius: 8,
    padding: 12,
    backgroundColor: cores.secundaria,
  },

  textoCampo: {
    flex: 1,
    fontSize: fontes.p,
    color: cores.texto,
    fontWeight: '500',
  },

  seta: {
    fontSize: 14,
    color: cores.primaria,
    marginLeft: 8,
  },

  listaOpcoes: {
    marginTop: 6,
    borderWidth: 1,
    borderColor: cores.borda,
    borderRadius: 8,
    backgroundColor: cores.secundaria,
    overflow: 'hidden',
  },

  rolagemLista: {
    maxHeight: 180,
  },

  itemLista: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },

  itemSelecionado: {
    backgroundColor: '#E8F3FA',
  },

  textoItem: {
    flex: 1,
    fontSize: fontes.p,
    color: cores.texto,
  },

  marca: {
    fontSize: 16,
    fontWeight: 'bold',
    color: cores.primaria,
    marginLeft: 8,
  },

  itemVazio: {
    padding: 14,
    alignItems: 'center',
  },

  textoItemVazio: {
    fontSize: fontes.p,
    color: '#888888',
    fontStyle: 'italic',
  },
});
