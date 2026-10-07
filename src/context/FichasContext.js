import { createContext, useContext, useRef, useState } from 'react';

const FichasContext = createContext();
const valorFicha = 2;

function dataHoje() {
  return new Date().toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' });
}

function formatarData(data) {
  const [dia, mes, ano] = data.split('/');
  return `${ano}-${mes}-${dia}`;
}

export const TIPOS = {
  MARMITA: 'Marmita',
  REFEICAO: 'Refeição',
};

export function FichasProvider({ children }) {
  const [fichas, setFichas] = useState([]);
  const fichasRef = useRef(0);

  function adicionarFicha(tipo, quantidade) {
    fichasRef.current += 1;
    const data = formatarData(dataHoje());
    const FichaID = fichasRef.current;

    setFichas((ListaFichas) => [
      ...ListaFichas,
      { FichaID, tipo, data, quantidade },
    ]);
  }

  function totalGeral() {
    return fichas.reduce((soma, item) => soma + Number(item.quantidade || 0), 0);
  }

  function receitaTotal() {
    return totalGeral() * valorFicha;
  }

  return (
    <FichasContext.Provider value={{ fichas, adicionarFicha, totalGeral, receitaTotal }}>
      {children}
    </FichasContext.Provider>
  );
}

export function useFichas() {
  const context = useContext(FichasContext);

  if (!context) {
    throw new Error('useFichas deve ser utilizado somente em componentes dentro de um FichasProvider');
  }

  return context;
}
