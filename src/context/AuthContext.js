import { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CHAVE_SESSAO = '@openmesa:sessao';
const AuthContext = createContext();


export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [carregando, setCarregando] = useState(true); 

  // Ao iniciar o app: restaura a sessão salva (se houver)
  useEffect(() => {
    AsyncStorage.getItem(CHAVE_SESSAO)
      .then((json) => {
        if (json) setUsuario(JSON.parse(json));
      })
      .finally(() => setCarregando(false));
  }, []);

  // Ao entrar, salva no storage
  const entrar = (dados) => {
    setUsuario(dados);
    AsyncStorage.setItem(CHAVE_SESSAO, JSON.stringify(dados));
  };

  // Ao sair, apaga do storage
  const sair = () => {
    setUsuario(null);
    AsyncStorage.removeItem(CHAVE_SESSAO);
  };
  return (
    <AuthContext.Provider value={{ usuario, entrar, sair, carregando }}>
      {children}
    </AuthContext.Provider>
  );
}

//Exporta o contexto para ser usado em outras telas do aplicativo
export const useAuth = () => useContext(AuthContext);