

import { useCallback, useMemo, useState } from 'react';
import { Platform } from 'react-native';
import * as XLSX from 'xlsx';
import { useFichas, TIPOS } from '../context/FichasContext';
import { useAuth } from '../context/AuthContext';
import { podeFazer } from '../data/permissoes';
import { dataHoje } from '../data/convenios';
import { nomeDoRestaurante } from '../data/restaurantes';


// FILTROS E TOTAIS DAS FICHAS

// Opções de período do filtro
export const PERIODOS = [
  { id: 'hoje', titulo: 'Hoje' },
  { id: '7dias', titulo: '7 dias' },
  { id: 'mes', titulo: 'Este mês' },
  { id: 'tudo', titulo: 'Tudo' },
  { id: 'datas', titulo: 'Datas' },
];

// Opções de tipo. Além dos tipos reais, aceita 'balcao' (tudo que não é convênio) e
// 'convenios' (só convênio): são as duas abas do Histórico.
export const OPCOES_TIPO = [
  { id: null, titulo: 'Todos' },
  { id: TIPOS.MARMITA, titulo: 'Marmitas' },
  { id: TIPOS.REFEICAO, titulo: 'Refeições' },
  { id: TIPOS.CONVENIO, titulo: 'Convênios' },
];

function arredondar(numero) {
  return Math.round(numero * 100) / 100;
}

// Formata o que a pessoa digita como dd/mm/aaaa (as barras entram sozinhas)
export function mascaraData(texto) {
  const numeros = texto.replace(/\D/g, '').slice(0, 8);
  if (numeros.length <= 2) return numeros;
  if (numeros.length <= 4) return `${numeros.slice(0, 2)}/${numeros.slice(2)}`;
  return `${numeros.slice(0, 2)}/${numeros.slice(2, 4)}/${numeros.slice(4)}`;
}

// Converte 'dd/mm/aaaa' em um número comparável (aaaammdd, ex.: 20261104). Inválida = null
export function numeroDaData(texto) {
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

// Operação inversa: 20261104 -> '04/11/2026'
export function formatarNumeroData(numero) {
  if (numero === null || numero === undefined) return '';
  const ano = Math.floor(numero / 10000);
  const mes = Math.floor((numero % 10000) / 100);
  const dia = numero % 100;
  return `${String(dia).padStart(2, '0')}/${String(mes).padStart(2, '0')}/${ano}`;
}

// Número (aaaammdd) da data de N dias atrás, a partir de hoje (horário de Brasília)
function diasAtras(dias) {
  const [dia, mes, ano] = dataHoje().split('/').map(Number);
  const data = new Date(Date.UTC(ano, mes - 1, dia - dias));
  return data.getUTCFullYear() * 10000 + (data.getUTCMonth() + 1) * 100 + data.getUTCDate();
}

// Devolve [inicio, fim] do período escolhido (null = sem limite)
export function intervaloDoPeriodo(periodo, de = '', ate = '') {
  const hoje = numeroDaData(dataHoje());
  if (periodo === 'hoje') return [hoje, hoje];
  if (periodo === '7dias') return [diasAtras(6), hoje];
  if (periodo === 'mes') return [Math.floor(hoje / 100) * 100 + 1, hoje];
  if (periodo === 'datas') return [numeroDaData(de), numeroDaData(ate)];
  return [null, null];
}

// Mensagem de erro do período ('' = tudo certo). Só se aplica ao período "Datas"
export function validarPeriodo(periodo, de = '', ate = '') {
  if (periodo !== 'datas') return '';
  const [inicio, fim] = intervaloDoPeriodo(periodo, de, ate);
  if ((de.length === 10 && inicio === null) || (ate.length === 10 && fim === null)) {
    return 'Digite datas válidas no formato dd/mm/aaaa.';
  }
  if (inicio !== null && fim !== null && inicio > fim) {
    return 'A data inicial não pode ser depois da data final.';
  }
  return '';
}

function passaNoTipo(ficha, tipo) {
  if (!tipo) return true;
  if (tipo === 'balcao') return ficha.tipo !== TIPOS.CONVENIO;
  if (tipo === 'convenios') return ficha.tipo === TIPOS.CONVENIO;
  return ficha.tipo === tipo;
}

// Aplica todos os filtros de uma vez. "fichas" deve ser a lista de useFichas(), que já vem
// restrita ao restaurante do usuário (só o admin enxerga todos).
export function filtrarFichas(
  fichas,
  { tipo = null, periodo = 'tudo', de = '', ate = '', restaurante = null, empresa = null } = {}
) {
  if (validarPeriodo(periodo, de, ate)) return [];
  const [inicio, fim] = intervaloDoPeriodo(periodo, de, ate);

  return fichas.filter((ficha) => {
    if (!passaNoTipo(ficha, tipo)) return false;
    if (restaurante && ficha.restaurante !== restaurante) return false;
    if (empresa && ficha.destino !== empresa) return false;

    if (inicio !== null || fim !== null) {
      const dia = numeroDaData(ficha.data);
      if (dia === null) return false; // data ilegível não entra em filtro por período
      if (inicio !== null && dia < inicio) return false;
      if (fim !== null && dia > fim) return false;
    }
    return true;
  });
}

// Totais gerais e agrupados (por tipo, restaurante e empresa conveniada)
export function resumirFichas(fichas) {
  const geral = { registros: 0, quantidade: 0, receita: 0 };
  const grupos = { tipo: new Map(), restaurante: new Map(), empresa: new Map() };

  function somar(mapa, chave, ficha) {
    const atual = mapa.get(chave) ?? { chave, registros: 0, quantidade: 0, receita: 0 };
    atual.registros += 1;
    atual.quantidade += ficha.quantidade;
    atual.receita += ficha.total;
    mapa.set(chave, atual);
  }

  for (const ficha of fichas) {
    geral.registros += 1;
    geral.quantidade += ficha.quantidade;
    geral.receita += ficha.total;

    somar(grupos.tipo, ficha.tipo, ficha);
    somar(grupos.restaurante, ficha.restaurante ?? '', ficha);
    if (ficha.destino) somar(grupos.empresa, ficha.destino, ficha);
  }

  const lista = (mapa, ordenar) =>
    [...mapa.values()]
      .map((g) => ({ ...g, receita: arredondar(g.receita) }))
      .sort(ordenar);

  const ordemTipos = Object.values(TIPOS);
  const posicaoTipo = (t) => {
    const i = ordemTipos.indexOf(t);
    return i === -1 ? ordemTipos.length : i;
  };

  return {
    ...geral,
    receita: arredondar(geral.receita),
    porTipo: lista(grupos.tipo, (a, b) => posicaoTipo(a.chave) - posicaoTipo(b.chave)),
    porRestaurante: lista(grupos.restaurante, (a, b) =>
      (nomeDoRestaurante(a.chave) || a.chave).localeCompare(nomeDoRestaurante(b.chave) || b.chave, 'pt-BR')
    ),
    porEmpresa: lista(grupos.empresa, (a, b) => a.chave.localeCompare(b.chave, 'pt-BR')),
  };
}


//  MONTAGEM DA PLANILHA EXCEL
const FUSO = 'America/Sao_Paulo';

// Formatos de célula do Excel
const FMT_DATA = 'dd/mm/yyyy';
const FMT_MOEDA = '"R$" #,##0.00';
const FMT_INTEIRO = '0';

// Data e hora de agora no horário de Brasília (mesmo fuso usado nas fichas)
export function carimboAgora() {
  const agora = new Date();
  return {
    data: agora.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      timeZone: FUSO,
    }),
    hora: agora.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: FUSO,
    }),
  };
}

// Ex.: relatorio-openmesa_2026-11-13_1435.xlsx (sem ":" para não dar problema no Android)
export function nomeDoArquivo(prefixo = 'relatorio-openmesa') {
  const { data, hora } = carimboAgora();
  const [dia, mes, ano] = data.split('/');
  return `${prefixo}_${ano}-${mes}-${dia}_${hora.replace(':', '')}.xlsx`;
}

// 'dd/mm/aaaa' -> número de série do Excel. Gravar a data como número (e não como texto)
// deixa o Excel ordenar e filtrar por data. Feito em UTC, então o fuso do aparelho não muda o dia.
function serialExcel(texto) {
  const partes = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(texto);
  if (!partes) return texto;
  const [, dia, mes, ano] = partes.map(Number);
  return Math.round((Date.UTC(ano, mes - 1, dia) - Date.UTC(1899, 11, 30)) / 86400000);
}

// Pequeno construtor de planilha: guarda as linhas e os formatos por coluna,
// e só aplica os formatos depois que a folha existe.
function criarFolha() {
  const linhas = [];
  const formatos = [];

  return {
    linha(valores, formatosPorColuna = {}) {
      const r = linhas.length;
      linhas.push(valores);
      Object.entries(formatosPorColuna).forEach(([c, z]) => formatos.push({ r, c: Number(c), z }));
    },
    vazia() {
      linhas.push([]);
    },
    get quantidadeDeLinhas() {
      return linhas.length;
    },
    construir(largurasColunas = []) {
      const ws = XLSX.utils.aoa_to_sheet(linhas);
      formatos.forEach(({ r, c, z }) => {
        const celula = ws[XLSX.utils.encode_cell({ r, c })];
        if (celula && celula.t === 'n') celula.z = z;
      });
      ws['!cols'] = largurasColunas.map((wch) => ({ wch }));
      return ws;
    },
  };
}

function rotuloRestaurante(id) {
  return nomeDoRestaurante(id) || id || 'Não informado';
}

// Aba "Resumo": cabeçalho, filtros aplicados e totais
function montarResumo({ resumo, filtros, geradoPor }) {
  const f = criarFolha();
  const { data, hora } = carimboAgora();

  f.linha(['OpenMesa — Relatório de fichas']);
  f.linha(['Gerado em', `${data} às ${hora}`]);
  if (geradoPor) f.linha(['Gerado por', geradoPor]);
  f.vazia();

  f.linha(['Filtros aplicados']);
  f.linha(['Período', filtros.periodo]);
  f.linha(['Tipo', filtros.tipo]);
  f.linha(['Restaurante', filtros.restaurante]);
  f.linha(['Empresa conveniada', filtros.empresa]);
  f.vazia();

  f.linha(['Totais']);
  f.linha(['Registros', 'Fichas', 'Receita']);
  f.linha([resumo.registros, resumo.quantidade, resumo.receita], {
    0: FMT_INTEIRO,
    1: FMT_INTEIRO,
    2: FMT_MOEDA,
  });
  f.vazia();

  const bloco = (titulo, primeiraColuna, grupos, rotulo = (g) => g.chave) => {
    if (grupos.length === 0) return;
    f.linha([titulo]);
    f.linha([primeiraColuna, 'Registros', 'Fichas', 'Receita']);
    grupos.forEach((g) =>
      f.linha([rotulo(g), g.registros, g.quantidade, g.receita], {
        1: FMT_INTEIRO,
        2: FMT_INTEIRO,
        3: FMT_MOEDA,
      })
    );
    f.vazia();
  };

  bloco('Por tipo', 'Tipo', resumo.porTipo);
  bloco('Por restaurante', 'Restaurante', resumo.porRestaurante, (g) => rotuloRestaurante(g.chave));
  bloco('Por empresa conveniada', 'Empresa', resumo.porEmpresa);

  return f.construir([30, 34, 14, 16]);
}

// Aba "Fichas": uma linha por ficha, com filtro automático nos cabeçalhos
function montarDetalhe(fichas, resumo) {
  const f = criarFolha();
  const cabecalho = [
    'Data',
    'Hora',
    'Restaurante',
    'Tipo',
    'Empresa conveniada',
    'Pedido',
    'Quantidade',
    'Valor unitário',
    'Total',
  ];
  f.linha(cabecalho);

  const ordenadas = [...fichas].sort(
    (a, b) =>
      (numeroDaData(a.data) ?? 0) - (numeroDaData(b.data) ?? 0) ||
      String(a.hora).localeCompare(String(b.hora))
  );

  ordenadas.forEach((ficha) =>
    f.linha(
      [
        serialExcel(ficha.data),
        ficha.hora || '',
        rotuloRestaurante(ficha.restaurante),
        ficha.tipo,
        ficha.destino || '',
        ficha.pedidoId || '',
        ficha.quantidade,
        ficha.valor,
        ficha.total,
      ],
      { 0: FMT_DATA, 6: FMT_INTEIRO, 7: FMT_MOEDA, 8: FMT_MOEDA }
    )
  );

  const ultimaLinhaDeDados = f.quantidadeDeLinhas; // número da última linha de dados no Excel (base 1)

  // Total fora da faixa do filtro, para não sumir nem ser reordenado junto com os dados
  f.vazia();
  f.linha(['TOTAL', '', '', '', '', '', resumo.quantidade, '', resumo.receita], {
    6: FMT_INTEIRO,
    8: FMT_MOEDA,
  });

  const ws = f.construir([12, 8, 38, 12, 28, 22, 12, 16, 14]);
  ws['!autofilter'] = { ref: `A1:I${ultimaLinhaDeDados}` };
  return ws;
}

// filtros: { periodo, tipo, restaurante, empresa } já em texto legível
export function montarWorkbook({ fichas, filtros, geradoPor }) {
  const resumo = resumirFichas(fichas);

  const wb = XLSX.utils.book_new();
  wb.Props = { Title: 'Relatório OpenMesa', Author: 'OpenMesa' };
  XLSX.utils.book_append_sheet(wb, montarResumo({ resumo, filtros, geradoPor }), 'Resumo');
  XLSX.utils.book_append_sheet(wb, montarDetalhe(fichas, resumo), 'Fichas');
  return wb;
}

// ENTREGA DO ARQUIVO


const MIME_XLSX = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

function baixarNoNavegador(wb, nomeArquivo) {
  const bytes = XLSX.write(wb, { type: 'array', bookType: 'xlsx' });
  const url = URL.createObjectURL(new Blob([bytes], { type: MIME_XLSX }));

  const link = document.createElement('a');
  link.href = url;
  link.download = nomeArquivo;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  setTimeout(() => URL.revokeObjectURL(url), 10000);
}

// Os módulos nativos são carregados aqui dentro (require) para nunca rodarem na web.
async function compartilharNoCelular(wb, nomeArquivo) {
  const { File, Paths } = require('expo-file-system');
  const Sharing = require('expo-sharing');

  if (!(await Sharing.isAvailableAsync())) {
    throw new Error('Este aparelho não permite compartilhar arquivos.');
  }

  // base64 é o formato que o SheetJS documenta para React Native
  const base64 = XLSX.write(wb, { type: 'base64', bookType: 'xlsx' });
  const arquivo = new File(Paths.cache, nomeArquivo);
  await arquivo.write(base64, { encoding: 'base64' });

  await Sharing.shareAsync(arquivo.uri, {
    mimeType: MIME_XLSX, // Android
    UTI: 'org.openxmlformats.spreadsheetml.sheet', // iOS
    dialogTitle: 'Relatório OpenMesa',
  });
}

export async function exportarWorkbook(wb, nomeArquivo) {
  if (Platform.OS === 'web') {
    baixarNoNavegador(wb, nomeArquivo);
  } else {
    await compartilharNoCelular(wb, nomeArquivo);
  }
}

// Hook useRelatorio para o RelatoriosScreens



// Hook da tela de Relatórios. Mantém os mesmos filtros do Histórico (período, restaurante,
// tipo e empresa), calcula os totais e gera o arquivo Excel.
//
export function useRelatorio({ periodoInicial = 'mes', tipoInicial = null } = {}) {
  const { fichas, carregando, erroCarregamento } = useFichas();
  const { usuario } = useAuth();
  const ehAdmin = usuario?.perfil === 'admin';
  const podeEmitir = podeFazer(usuario, 'emitirRelatorio');

  // Filtros
  const [tipo, setTipoEstado] = useState(tipoInicial); // null | Marmita | Refeição | Convênio
  const [periodo, setPeriodo] = useState(periodoInicial);
  const [de, setDeEstado] = useState('');
  const [ate, setAteEstado] = useState('');
  const [restaurante, setRestauranteEstado] = useState(null); // null = todos (só vale para o admin)
  const [empresa, setEmpresa] = useState(null); // null = todas

  // Estado da exportação
  const [exportando, setExportando] = useState(false);
  const [mensagem, setMensagem] = useState(null); // { tipo: 'sucesso' | 'erro', texto }

  // Fiscal e Caixa já só recebem as fichas do próprio restaurante (FichasContext).
  // O filtro de restaurante só tem efeito para o admin.
  const restauranteEfetivo = ehAdmin ? restaurante : null;

  const erroPeriodo = validarPeriodo(periodo, de, ate);

  const fichasFiltradas = useMemo(
    () =>
      filtrarFichas(fichas, {
        tipo,
        periodo,
        de,
        ate,
        restaurante: restauranteEfetivo,
        empresa,
      }),
    [fichas, tipo, periodo, de, ate, restauranteEfetivo, empresa]
  );

  const resumo = useMemo(() => resumirFichas(fichasFiltradas), [fichasFiltradas]);

  // Empresas que têm convênio no restaurante escolhido (alimenta o seletor de empresa)
  const empresasDisponiveis = useMemo(
    () =>
      [
        ...new Set(
          fichas
            .filter(
              (f) =>
                f.tipo === TIPOS.CONVENIO &&
                (!restauranteEfetivo || f.restaurante === restauranteEfetivo)
            )
            .map((f) => f.destino)
            .filter(Boolean)
        ),
      ].sort((a, b) => a.localeCompare(b, 'pt-BR')),
    [fichas, restauranteEfetivo]
  );

  // Setters que mantêm os filtros coerentes entre si
  const setTipo = useCallback((novoTipo) => {
    setTipoEstado(novoTipo);
    // Empresa só faz sentido para convênios
    if (novoTipo && novoTipo !== TIPOS.CONVENIO && novoTipo !== 'convenios') setEmpresa(null);
  }, []);

  const setRestaurante = useCallback((id) => {
    setRestauranteEstado(id);
    setEmpresa(null); // a lista de empresas depende do restaurante
  }, []);

  const setDe = useCallback((texto) => setDeEstado(mascaraData(texto)), []);
  const setAte = useCallback((texto) => setAteEstado(mascaraData(texto)), []);

  // Atalho para "relatório do mês X": preenche o período personalizado com o mês inteiro
  const definirMes = useCallback((mes, ano) => {
    const mm = String(mes).padStart(2, '0');
    const ultimoDia = new Date(Date.UTC(ano, mes, 0)).getUTCDate();
    setPeriodo('datas');
    setDeEstado(`01/${mm}/${ano}`);
    setAteEstado(`${String(ultimoDia).padStart(2, '0')}/${mm}/${ano}`);
  }, []);

  const limparMensagem = useCallback(() => setMensagem(null), []);

  const limparFiltros = useCallback(() => {
    setTipoEstado(null);
    setPeriodo('tudo');
    setDeEstado('');
    setAteEstado('');
    setRestauranteEstado(null);
    setEmpresa(null);
  }, []);

  // Texto legível dos filtros, gravado na aba "Resumo" da planilha
  const descricaoFiltros = useMemo(() => {
    const [inicio, fim] = intervaloDoPeriodo(periodo, de, ate);
    const titulo = PERIODOS.find((p) => p.id === periodo)?.titulo ?? periodo;
    let textoPeriodo = 'Todo o período';
    if (periodo !== 'tudo') {
      textoPeriodo =
        inicio !== null && inicio === fim
          ? `${titulo} (${formatarNumeroData(inicio)})`
          : `${titulo} (${inicio !== null ? formatarNumeroData(inicio) : '…'} a ${
              fim !== null ? formatarNumeroData(fim) : '…'
            })`;
    }

    let textoTipo = OPCOES_TIPO.find((o) => o.id === tipo)?.titulo ?? 'Todos';
    if (tipo === 'balcao') textoTipo = 'Balcão (marmitas e refeições)';
    if (tipo === 'convenios') textoTipo = 'Convênios';

    return {
      periodo: textoPeriodo,
      tipo: textoTipo,
      restaurante: ehAdmin
        ? restaurante
          ? nomeDoRestaurante(restaurante)
          : 'Todos os restaurantes'
        : nomeDoRestaurante(usuario?.restaurante) || 'Não informado',
      empresa: empresa || 'Todas',
    };
  }, [periodo, de, ate, tipo, restaurante, empresa, ehAdmin, usuario]);

  // Gera o Excel com as fichas filtradas e entrega ao usuário:
  // no navegador baixa o arquivo; no celular abre o menu de compartilhar.
  // Devolve true se deu certo. Nunca lança erro: o motivo vai para "mensagem".
  const exportar = useCallback(async () => {
    if (exportando) return false;
    setMensagem(null);

    try {
      if (!podeEmitir) {
        throw new Error('Seu perfil não tem permissão para emitir relatórios.');
      }
      if (carregando) {
        throw new Error('Aguarde o carregamento das fichas.');
      }
      if (erroCarregamento) {
        throw new Error(erroCarregamento);
      }
      if (erroPeriodo) {
        throw new Error(erroPeriodo);
      }
      if (fichasFiltradas.length === 0) {
        throw new Error('Nenhuma ficha encontrada para os filtros escolhidos.');
      }

      setExportando(true);
      const wb = montarWorkbook({
        fichas: fichasFiltradas,
        filtros: descricaoFiltros,
        geradoPor: usuario?.nome,
      });
      await exportarWorkbook(wb, nomeDoArquivo());

      setMensagem({ tipo: 'sucesso', texto: 'Relatório gerado.' });
      return true;
    } catch (erro) {
      console.log('Erro ao exportar relatório:', erro);
      setMensagem({
        tipo: 'erro',
        texto: erro?.message || 'Não foi possível gerar o relatório.',
      });
      return false;
    } finally {
      setExportando(false);
    }
  }, [
    exportando,
    podeEmitir,
    carregando,
    erroCarregamento,
    erroPeriodo,
    fichasFiltradas,
    descricaoFiltros,
    usuario,
  ]);

  return {
    // opções para montar os seletores
    periodos: PERIODOS,
    opcoesTipo: OPCOES_TIPO,
    empresasDisponiveis,
    ehAdmin,
    podeEmitir,

    // filtros atuais e seus setters
    tipo,
    setTipo,
    periodo,
    setPeriodo,
    de,
    setDe,
    ate,
    setAte,
    restaurante,
    setRestaurante,
    empresa,
    setEmpresa,
    definirMes,
    limparFiltros,
    erroPeriodo,

    // resultado do filtro
    fichasFiltradas,
    resumo, 
    carregando,
    erroCarregamento,

    // exportação
    exportar,
    exportando,
    mensagem,
    limparMensagem,
  };
}