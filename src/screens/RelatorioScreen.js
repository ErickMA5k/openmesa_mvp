import { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { cores, espacos, fontes } from '../theme';
import { TIPOS } from '../context/FichasContext';
import { restaurantes, nomeDoRestaurante } from '../data/restaurantes';
import { useRelatorio } from '../hooks/useRelatorio';

function formatarValor(valor) {
  return Number(valor || 0)
    .toFixed(2)
    .replace('.', ',');
}

// Seletor estilo gaveta, o mesmo usado no Histórico (restaurante e empresa)
function Gaveta({ rotulo, texto, aberta, aoAlternar, opcoes, selecionado, aoEscolher, vazio }) {
  return (
    <View style={styles.blocoFiltro}>
      <Text style={styles.rotuloFiltro}>{rotulo}</Text>
      <TouchableOpacity style={styles.campoSelecao} onPress={aoAlternar} activeOpacity={0.7}>
        <Text style={styles.textoCampo}>{texto}</Text>
        <Text style={styles.seta}>{aberta ? '▲' : '▼'}</Text>
      </TouchableOpacity>

      {aberta && (
        <View style={styles.listaOpcoes}>
          <ScrollView style={styles.rolagemLista} nestedScrollEnabled keyboardShouldPersistTaps="handled">
            {opcoes.map((opcao) => (
              <TouchableOpacity
                key={String(opcao.id)}
                style={[styles.itemLista, selecionado === opcao.id && styles.itemSelecionado]}
                onPress={() => aoEscolher(opcao.id)}
              >
                <Text style={styles.textoItem}>{opcao.titulo}</Text>
                {selecionado === opcao.id && <Text style={styles.marca}>✓</Text>}
              </TouchableOpacity>
            ))}
            {vazio && (
              <View style={styles.itemVazio}>
                <Text style={styles.textoItemVazio}>{vazio}</Text>
              </View>
            )}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

export default function RelatorioScreen() {
  const r = useRelatorio({ periodoInicial: 'mes' });
  const [gavetaAberta, setGavetaAberta] = useState(null); // null | 'restaurante' | 'empresa'

  // A mensagem de sucesso some sozinha, a de erro fica até a próxima tentativa
  const { mensagem, limparMensagem } = r;
  useEffect(() => {
    if (!mensagem || mensagem.tipo !== 'sucesso') return;
    const temporizador = setTimeout(limparMensagem, 3000);
    return () => clearTimeout(temporizador);
  }, [mensagem, limparMensagem]);

  const alternar = (nome) => setGavetaAberta((atual) => (atual === nome ? null : nome));

  // Empresa só faz sentido quando o relatório inclui convênios
  const mostrarEmpresa = r.tipo === null || r.tipo === TIPOS.CONVENIO;

  const opcoesRestaurante = [
    { id: null, titulo: 'Todos os restaurantes' },
    ...restaurantes.map((rest) => ({ id: rest.id, titulo: rest.nome })),
  ];
  const opcoesEmpresa = [
    { id: null, titulo: 'Todas as empresas' },
    ...r.empresasDisponiveis.map((emp) => ({ id: emp, titulo: emp })),
  ];

  const semFichas = !r.carregando && r.fichasFiltradas.length === 0;
  const botaoBloqueado = r.exportando || r.carregando || semFichas || r.erroPeriodo !== '';

  if (!r.podeEmitir) {
    return (
      <View style={styles.container}>
        <Text style={styles.titulo}>Relatórios</Text>
        <Text style={styles.mensagemErro}>Seu perfil não tem permissão para emitir relatórios.</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.titulo}>Relatórios</Text>
      <Text style={styles.subtitulo}>
        Escolha os filtros e exporte as fichas em uma planilha do Excel.
      </Text>

      {r.erroCarregamento !== '' && <Text style={styles.mensagemErro}>{r.erroCarregamento}</Text>}

      {/* Tipo */}
      <Text style={styles.rotuloFiltro}>Tipo</Text>
      <View style={styles.linhaChips}>
        {r.opcoesTipo.map((opcao) => (
          <TouchableOpacity
            key={String(opcao.id)}
            style={[styles.chip, r.tipo === opcao.id && styles.chipSelecionado]}
            onPress={() => r.setTipo(opcao.id)}
          >
            <Text style={[styles.textoChip, r.tipo === opcao.id && styles.textoChipSelecionado]}>
              {opcao.titulo}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Restaurante (só o administrador escolhe; os demais perfis já veem o próprio) */}
      {r.ehAdmin && (
        <Gaveta
          rotulo="Restaurante"
          texto={r.restaurante ? nomeDoRestaurante(r.restaurante) : 'Todos os restaurantes'}
          aberta={gavetaAberta === 'restaurante'}
          aoAlternar={() => alternar('restaurante')}
          opcoes={opcoesRestaurante}
          selecionado={r.restaurante}
          aoEscolher={(id) => {
            r.setRestaurante(id);
            setGavetaAberta(null);
          }}
        />
      )}

      {/* Empresa conveniada */}
      {mostrarEmpresa && (
        <Gaveta
          rotulo="Empresa conveniada"
          texto={r.empresa || 'Todas as empresas'}
          aberta={gavetaAberta === 'empresa'}
          aoAlternar={() => alternar('empresa')}
          opcoes={opcoesEmpresa}
          selecionado={r.empresa}
          aoEscolher={(id) => {
            r.setEmpresa(id);
            setGavetaAberta(null);
          }}
          vazio={r.empresasDisponiveis.length === 0 ? 'Nenhum convênio aprovado' : null}
        />
      )}

      {/* Período */}
      <Text style={styles.rotuloFiltro}>Período</Text>
      <View style={styles.linhaChips}>
        {r.periodos.map((p) => (
          <TouchableOpacity
            key={p.id}
            style={[styles.chip, r.periodo === p.id && styles.chipSelecionado]}
            onPress={() => r.setPeriodo(p.id)}
          >
            <Text style={[styles.textoChip, r.periodo === p.id && styles.textoChipSelecionado]}>
              {p.titulo}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {r.periodo === 'datas' && (
        <View style={styles.linhaDatas}>
          <TextInput
            style={styles.campoData}
            placeholder="De: dd/mm/aaaa"
            keyboardType="numeric"
            maxLength={10}
            value={r.de}
            onChangeText={r.setDe}
          />
          <TextInput
            style={styles.campoData}
            placeholder="Até: dd/mm/aaaa"
            keyboardType="numeric"
            maxLength={10}
            value={r.ate}
            onChangeText={r.setAte}
          />
        </View>
      )}
      {r.erroPeriodo !== '' && <Text style={styles.mensagemErro}>{r.erroPeriodo}</Text>}

      <TouchableOpacity style={styles.botaoLimpar} onPress={r.limparFiltros}>
        <Text style={styles.textoLimpar}>Limpar filtros</Text>
      </TouchableOpacity>

      {/* Prévia do que vai para a planilha */}
      {!r.carregando && (
        <View style={styles.resumo}>
          <View style={styles.resumoLinha}>
            <View>
              <Text style={styles.label}>Fichas</Text>
              <Text style={styles.valor}>{r.resumo.quantidade}</Text>
            </View>
            <View>
              <Text style={styles.label}>Registros</Text>
              <Text style={styles.valor}>{r.resumo.registros}</Text>
            </View>
            <View>
              <Text style={styles.label}>Receita</Text>
              <Text style={styles.total}>R$ {formatarValor(r.resumo.receita)}</Text>
            </View>
          </View>

          {r.resumo.porTipo.map((g) => (
            <View key={g.chave} style={styles.linhaTipo}>
              <Text style={styles.textoTipo}>{g.chave}</Text>
              <Text style={styles.textoTipo}>
                {g.quantidade} fichas · R$ {formatarValor(g.receita)}
              </Text>
            </View>
          ))}
        </View>
      )}

      {r.carregando && <Text style={styles.vazioTexto}>Carregando fichas...</Text>}

      {semFichas && r.erroPeriodo === '' && (
        <Text style={styles.vazioTexto}>Nenhuma ficha encontrada para estes filtros.</Text>
      )}

      {r.mensagem && (
        <Text style={r.mensagem.tipo === 'erro' ? styles.mensagemErro : styles.mensagemSucesso}>
          {r.mensagem.texto}
        </Text>
      )}

      <TouchableOpacity
        style={[styles.botaoExportar, botaoBloqueado && styles.botaoExportarBloqueado]}
        onPress={() => r.exportar()}
        disabled={botaoBloqueado}
      >
        <Text style={styles.textoExportar}>{r.exportando ? 'Gerando planilha...' : 'Exportar Excel'}</Text>
      </TouchableOpacity>
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
    marginBottom: espacos.p,
  },

  subtitulo: {
    fontSize: fontes.p,
    color: '#666666',
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

  vazioTexto: {
    fontSize: fontes.p,
    color: '#666666',
    textAlign: 'center',
    marginBottom: espacos.m,
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

  botaoLimpar: {
    alignSelf: 'flex-start',
    paddingVertical: espacos.p,
    marginBottom: espacos.m,
  },

  textoLimpar: {
    color: cores.primaria,
    fontWeight: '600',
    fontSize: fontes.p,
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

  /* Prévia */
  resumo: {
    backgroundColor: '#F7F7F7',
    borderRadius: 12,
    padding: espacos.m,
    marginBottom: espacos.m,
  },

  resumoLinha: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: espacos.p,
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

  linhaTipo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderTopWidth: 1,
    borderTopColor: cores.borda,
  },

  textoTipo: {
    fontSize: fontes.p,
    color: '#555555',
  },

  /* Exportar */
  botaoExportar: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: cores.primaria,
  },

  botaoExportarBloqueado: {
    opacity: 0.5,
  },

  textoExportar: {
    color: cores.secundaria,
    fontSize: fontes.m,
    fontWeight: 'bold',
  },
});