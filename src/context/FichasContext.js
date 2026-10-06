import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react';

const FichasContext = createContext(null);

function formatarData(data = new Date()) {
  const dataAtual = new Date(data);

  const ano = dataAtual.getFullYear();
  const mes = String(dataAtual.getMonth() + 1).padStart(2, '0');
  const dia = String(dataAtual.getDate()).padStart(2, '0');

  return `${ano}-${mes}-${dia}`;
}

export function FichasProvider({ children }) {
  const [fichas, setFichas] = useState([]);

  const contadorId = useRef(0);

  const adicionarFicha = useCallback(
    ({
      descricao,
      quantidade,
      valor,
      data = new Date(),
    }) => {
      const quantidadeNumerica = Number(quantidade);
      const valorNumerico = Number(valor);

      if (!descricao || !descricao.trim()) {
        throw new Error('Digite a descrição da ficha.');
      }

      if (
        !Number.isFinite(quantidadeNumerica) ||
        quantidadeNumerica <= 0
      ) {
        throw new Error('Digite uma quantidade válida.');
      }

      if (
        !Number.isFinite(valorNumerico) ||
        valorNumerico < 0
      ) {
        throw new Error('Digite um valor válido.');
      }

      contadorId.current += 1;

      const novaFicha = {
        id: `${Date.now()}-${contadorId.current}`,
        descricao: descricao.trim(),
        quantidade: quantidadeNumerica,
        valor: valorNumerico,
        data: formatarData(data),

        // O total é calculado dentro do Context
        total: quantidadeNumerica * valorNumerico,
      };

      setFichas((listaAtual) => [
        ...listaAtual,
        novaFicha,
      ]);

      return novaFicha;
    },
    []
  );

  const removerFicha = useCallback((id) => {
    setFichas((listaAtual) =>
      listaAtual.filter((ficha) => ficha.id !== id)
    );
  }, []);

  const fichasDoDia = useCallback(
    (data = new Date()) => {
      const dataFormatada = formatarData(data);

      return fichas.filter(
        (ficha) => ficha.data === dataFormatada
      );
    },
    [fichas]
  );

  const totalGeral = useMemo(() => {
    return fichas.reduce(
      (total, ficha) => total + ficha.total,
      0
    );
  }, [fichas]);

  const totalDoDia = useCallback(
    (data = new Date()) => {
      return fichasDoDia(data).reduce(
        (total, ficha) => total + ficha.total,
        0
      );
    },
    [fichasDoDia]
  );

  const limparFichas = useCallback(() => {
    setFichas([]);
  }, []);

  const valorContexto = useMemo(
    () => ({
      fichas,
      adicionarFicha,
      removerFicha,
      fichasDoDia,
      totalGeral,
      totalDoDia,
      limparFichas,
    }),
    [
      fichas,
      adicionarFicha,
      removerFicha,
      fichasDoDia,
      totalGeral,
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
