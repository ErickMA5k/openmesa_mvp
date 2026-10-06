import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const FichasContext = createContext(null);
const STORAGE_KEY = '@openmesa:fichas';
const VALOR_FIXO = 2;

export const TIPOS = {
  MARMITA: 'Marmita',
  REFEICAO: 'Refeição',
};

function formatarData(data = new Date()) {
  if (typeof data === 'string') {
    const dataBrasileira = data.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (dataBrasileira) {
      return data;
    }

    const dataIso = data.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (dataIso) {
      return `${dataIso[3]}/${dataIso[2]}/${dataIso[1]}`;
    }
  }

  return new Date(data).toLocaleDateString('pt-BR');
}

function normalizarFichas(lista) {
  if (!Array.isArray(lista)) {
    throw new Error('Os dados de fichas salvos não estão em uma lista válida.');
  }

  return lista
    .filter((ficha) => ficha && typeof ficha === 'object')
    .map((ficha, index) => {
      const quantidade = Number(ficha.quantidade ?? 0);
      const valor = Number(ficha.valor ?? VALOR_FIXO);

      return {
        ...ficha,
        id: String(ficha.id ?? ficha.FichaID ?? `${Date.now()}-${index}`),
        tipo: ficha.tipo ?? ficha.descricao ?? 'Ficha',
        local: ficha.local ?? '',
        quantidade,
        valor,
        total: Number(ficha.total ?? quantidade * valor),
        data: formatarData(ficha.data),
      };
    });
}

export function FichasProvider({ children }) {
  const [fichas, setFichas] = useState([]);
  const fichasRef = useRef([]);
  const contadorId = useRef(0);
  const inicializacaoRef = useRef(Promise.resolve());
  const erroCarregamentoRef = useRef(null);

  useEffect(() => {
    let ativo = true;
    const inicializacao = AsyncStorage.getItem(STORAGE_KEY)
      .then((dados) => {
        const fichasSalvas = dados ? normalizarFichas(JSON.parse(dados)) : [];
        fichasRef.current = fichasSalvas;

        if (ativo) {
          setFichas(fichasSalvas);
        }
      })
      .catch((error) => {
        erroCarregamentoRef.current = error;
        console.log('Erro ao carregar fichas:', error);

        if (ativo) {
          Alert.alert('Erro', 'Não foi possível carregar as fichas salvas.');
        }
      });

    inicializacaoRef.current = inicializacao;

    return () => {
      ativo = false;
    };
  }, []);

  const salvarLista = useCallback(async (lista) => {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(lista));
    fichasRef.current = lista;
    setFichas(lista);
  }, []);

  const adicionarFicha = useCallback(
    async (registro, quantidadeRapida) => {
      await inicializacaoRef.current;

      if (erroCarregamentoRef.current) {
        throw erroCarregamentoRef.current;
      }

      const dados = typeof registro === 'string'
        ? {
            tipo: registro,
            quantidade: quantidadeRapida,
            valor: VALOR_FIXO,
          }
        : registro;

      const tipo = dados?.tipo ?? dados?.descricao;
      const quantidade = Number(dados?.quantidade);
      const valor = Number(dados?.valor ?? VALOR_FIXO);

      if (!tipo || !String(tipo).trim()) {
        throw new Error('Informe o tipo da ficha.');
      }

      if (!Number.isFinite(quantidade) || quantidade <= 0) {
        throw new Error('Digite uma quantidade válida.');
      }

      if (!Number.isFinite(valor) || valor < 0) {
        throw new Error('Digite um valor válido.');
      }

      contadorId.current += 1;
      const novaFicha = {
        id: `${Date.now()}-${contadorId.current}`,
        tipo: String(tipo).trim(),
        local: dados?.local?.trim() || 'Não informado',
        quantidade,
        valor,
        total: quantidade * valor,
        data: formatarData(dados?.data),
      };

      const dadosSalvos = await AsyncStorage.getItem(STORAGE_KEY);
      const listaAtual = dadosSalvos
        ? normalizarFichas(JSON.parse(dadosSalvos))
        : fichasRef.current;
      const listaAtualizada = [...listaAtual, novaFicha];

      await salvarLista(listaAtualizada);
      return novaFicha;
    },
    [salvarLista]
  );

  const removerFicha = useCallback(
    async (id) => {
      const listaAtualizada = fichasRef.current.filter(
        (ficha) => ficha.id !== id
      );
      await salvarLista(listaAtualizada);
    },
    [salvarLista]
  );

  const fichasDoDia = useCallback(
    (data = new Date()) => {
      const dataFormatada = formatarData(data);
      return fichas.filter((ficha) => ficha.data === dataFormatada);
    },
    [fichas]
  );

  const totalGeral = useCallback(
    () => fichas.reduce((soma, ficha) => soma + ficha.quantidade, 0),
    [fichas]
  );

  const receitaTotal = useCallback(
    () => fichas.reduce((soma, ficha) => soma + ficha.total, 0),
    [fichas]
  );

  const totalDoDia = useCallback(
    (data = new Date()) =>
      fichasDoDia(data).reduce((soma, ficha) => soma + ficha.total, 0),
    [fichasDoDia]
  );

  const limparFichas = useCallback(
    () => salvarLista([]),
    [salvarLista]
  );

  const valorContexto = useMemo(
    () => ({
      fichas,
      adicionarFicha,
      removerFicha,
      fichasDoDia,
      totalGeral,
      receitaTotal,
      totalDoDia,
      limparFichas,
    }),
    [
      fichas,
      adicionarFicha,
      removerFicha,
      fichasDoDia,
      totalGeral,
      receitaTotal,
      totalDoDia,
      limparFichas,
    ]
  );

  return (
    <FichasContext.Provider value={valorContexto}>
      {children}
    </FichasContext.Provider>
  );
}

export function useFichas() {
  const contexto = useContext(FichasContext);

  if (!contexto) {
    throw new Error(
      'useFichas deve ser usado dentro de FichasProvider.'
    );
  }

  return contexto;
}
