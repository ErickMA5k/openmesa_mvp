import { createContext, useContext, useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Contexto para gerenciar fichas
const FichasContext = createContext(null);

// Nome da "gaveta" do AsyncStorage onde a lista de fichas é guardada
const STORAGE_KEY = '@openmesa:fichas';

// Valor de 2 reais para cada ficha.
// IMPORTANTE: cada ficha guarda o valor da época em que foi registrada (campo "valor").
// Alterar esta constante só afeta as fichas NOVAS;
const valorFicha = 2;

// Fuso usado em todas as datas. Fixar o fuso evita que o dia "vire" errado
// (por exemplo, depois das 21h) ou que dependa da configuração do aparelho.
const FUSO = 'America/Sao_Paulo';

// Tipos de ficha do cadastro rápido
// ATUALIZAÇÃO: Determinada o tipo "Convênio" que será utilizado nas futuras instâncias onde ocorrem "doações" de refeições pelo restaurante
  export const TIPOS = {
  MARMITA: 'Marmita',
  REFEICAO: 'Refeição',
  CONVENIO: 'Convênio',
};

// Converte a data para o formato dia/mês/ano (ex.: 07/10/2026), que é o formato lido
// pelas telas de Histórico e Calendário. Aceita um Date, um texto dia/mês/ano ou um
// texto ano-mês-dia (formato usado por APIs de calendário). Textos são só reorganizados,
// sem passar por Date, para o fuso não mudar o dia.
function formatarData(data = new Date()) {
  if (typeof data === 'string') {
    const iso = data.match(/^(\d{4})-(\d{2})-(\d{2})/);
    return iso ? `${iso[3]}/${iso[2]}/${iso[1]}` : data;
  }

  const dataConvertida = data instanceof Date ? data : new Date(data);

  if (Number.isNaN(dataConvertida.getTime())) {
    return formatarData(new Date());
  }

  return dataConvertida.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: FUSO,
  });
}

// Data de hoje no horário de Brasília (NÃO usa o fuso do aparelho)
function dataHoje() {
  return formatarData(new Date());
}

// Arredonda para 2 casas, evitando erros como 0.1 * 3 = 0.30000000000000004
function arredondar(numero) {
  return Math.round(numero * 100) / 100;
}

// Prepara a lista lida do armazenamento: completa campos que faltarem e aceita
// registros antigos (FichaID no lugar de id, datas em ano-mês-dia)
function normalizarFichas(lista) {
  if (!Array.isArray(lista)) {
    throw new Error('Os dados de fichas salvos não estão em uma lista válida.');
  }

  return lista
    .filter((ficha) => ficha && typeof ficha === 'object')
    .map((ficha, indice) => {
      const quantidade = Number(ficha.quantidade ?? 0);
      const valor = Number(ficha.valor ?? valorFicha);

      return {
        ...ficha,
        id: String(ficha.id ?? ficha.FichaID ?? `${Date.now()}-${indice}`),
        tipo: ficha.tipo ?? 'Ficha',
        local: ficha.local ?? 'Não informado',
        quantidade,
        valor,
        total: arredondar(Number(ficha.total ?? quantidade * valor)),
        data: formatarData(ficha.data),
      };
    });
}

// Fila de operações: cada leitura/gravação espera a anterior terminar.
// Sem ela, dois registros quase simultâneos leem a mesma lista antiga e o segundo
// sobrescreve o primeiro (a ficha do primeiro se perde).
function enfileirar(filaRef, operacao) {
  const resultado = filaRef.current.then(operacao);
  filaRef.current = resultado.catch(() => {}); 
  return resultado;
}

export function FichasProvider({ children }) {
  const [fichas, setFichas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erroCarregamento, setErroCarregamento] = useState('');

  const fichasRef = useRef([]); // cópia sempre atual da lista, base de todas as gravações
  const contadorId = useRef(0);
  const erroRef = useRef(false); // true se a leitura inicial falhou
  const filaRef = useRef(Promise.resolve());

  // Ao abrir o app, lê as fichas salvas. Se a leitura falhar, nada é gravado depois,
  // para não sobrescrever com uma lista vazia dados que ainda poderiam ser recuperados.
  useEffect(() => {
    enfileirar(filaRef, async () => {
      try {
        const dados = await AsyncStorage.getItem(STORAGE_KEY);
        const fichasSalvas = dados ? normalizarFichas(JSON.parse(dados)) : [];
        fichasRef.current = fichasSalvas;
        setFichas(fichasSalvas);
      } catch (erro) {
        console.log('Erro ao carregar fichas:', erro);
        erroRef.current = true;
        setErroCarregamento(
          'Não foi possível carregar as fichas salvas. Nada será gravado até o problema ser resolvido.'
        );
      } finally {
        setCarregando(false);
      }
    });
  }, []);

  // Único caminho que altera a lista: recebe uma função que devolve a lista nova,
  // grava no armazenamento e só então atualiza a tela (se a gravação falhar, nada muda)
  function alterarLista(transformar) {
    return enfileirar(filaRef, async () => {
      if (erroRef.current) {
        throw new Error(
          'As fichas salvas não puderam ser lidas. Nada foi gravado para não perder os dados.'
        );
      }

      const novaLista = transformar(fichasRef.current);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(novaLista));
      fichasRef.current = novaLista;
      setFichas(novaLista);
    });
  }

  // Função para gerar o ID, validar os dados e registrar a ficha na lista.
  // Aceita dois formatos de chamada:
  //   adicionarFicha(tipo, quantidade)                 -> cadastro rápido (popup)
  //   adicionarFicha({ tipo, local, quantidade, valor }) -> cadastro detalhado
  // Devolve a ficha criada; se algo estiver inválido ou a gravação falhar, lança um erro
  // ATUALIZAÇÃO: Nenhum dos campos aceita NANs nem infinitos e a quantidade agora deverá ser um inteiro positivo.
  async function adicionarFicha(registro, quantidadeRapida) {
    const dados =
      typeof registro === 'string'
        ? { tipo: registro, quantidade: quantidadeRapida }
        : registro;

    const tipo = String(dados?.tipo ?? '').trim();
    const quantidade = Number(dados?.quantidade);
    const valor = Number(dados?.valor ?? valorFicha);

    if (!tipo) {
      throw new Error('Informe o tipo da ficha.');
    }

    if (!Number.isInteger(quantidade) || quantidade <= 0) {
      throw new Error('A quantidade deve ser um número inteiro maior que zero.');
    }

    if (!Number.isFinite(valor) || valor < 0) {
      throw new Error('Informe um valor válido.');
    }

    // O ID mistura o horário e um contador, então continua único mesmo depois de
    // reiniciar o app. A data é sempre a de hoje (não pode ser informada pela tela).
    contadorId.current += 1;
    const novaFicha = {
      id: `${Date.now()}-${contadorId.current}`,
      tipo,
      local: String(dados?.local ?? '').trim() || 'Não informado',
      quantidade,
      valor,
      total: arredondar(quantidade * valor),
      data: dataHoje(),
    };

    await alterarLista((lista) => [...lista, novaFicha]);
    return novaFicha;
  }

  // Remove uma única ficha, pelo id (usada na tela de Histórico)
  async function removerFicha(id) {
    await alterarLista((lista) => lista.filter((ficha) => ficha.id !== String(id)));
  }

  // Fichas de um dia. Sem argumento, usa hoje; aceita Date, 'dd/mm/aaaa' ou 'aaaa-mm-dd'
  function fichasDoDia(data = new Date()) {
    const dataFormatada = formatarData(data);
    return fichas.filter((ficha) => ficha.data === dataFormatada);
  }


  // Garante que os elementos das listas somados sejam adicionados ao histórico
  function fichasConsideradas(data) {
    return data === undefined || data === null ? fichas : fichasDoDia(data);
  }

  // Quantidade de fichas registradas, soma o campo registrado "quantidade" da lista, de cada pedido.
   function totalFichas(data) {
    return fichasConsideradas(data).reduce((soma, ficha) => soma + ficha.quantidade, 0);
   }

  // Receita total gerada no pedido de fichas registrada
  function receitaTotal(data) {
    return arredondar (
      fichasConsideradas(data).reduce((soma, ficha) => soma + ficha.total, 0)
    )
  }


  // Disponibiliza apenas estas funções e dados para as telas. A lista só pode ser
  const valorContexto = {
    fichas,
    carregando,
    erroCarregamento,
    adicionarFicha,
    removerFicha,
    fichasDoDia,
    totalFichas,
    receitaTotal,
  };

  return (
    <FichasContext.Provider value={valorContexto}>
      {children}
    </FichasContext.Provider>
  );
}

// Exporta o acesso ao contexto para ser utilizado em outros componentes
export function useFichas() {
  const context = useContext(FichasContext);
  if (!context) {
    throw new Error('useFichas deve ser utilizado somente em contexto com um FichasProvider');
  }
  return context;
}