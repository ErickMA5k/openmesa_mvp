import AsyncStorage from '@react-native-async-storage/async-storage';

// Arquivo central dos pedidos de convênio: usado pela tela da empresa, pela do admin e pelas listas.

// Módulo de armazenamento pelo Async; Remover ao integrar banco de dados
export const CHAVE_CONVENIOS = '@openmesa:convenios';

// Situações possíveis de um pedido
export const STATUS = {
  PENDENTE: 'pendente', // a empresa pediu, o admin ainda não decidiu
  APROVADO: 'aprovado', // o admin aprovou: o fiscal do restaurante passa a ver
  RECUSADO: 'recusado', // o admin recusou
};

// Textos e cores usados nas telas; Padronizar com o style.js no futuro
export const rotuloStatus = {
  [STATUS.PENDENTE]: 'Aguardando aprovação',
  [STATUS.APROVADO]: 'Aprovado',
  [STATUS.RECUSADO]: 'Recusado',
};

export const corStatus = {
  [STATUS.PENDENTE]: '#ED8F00',
  [STATUS.APROVADO]: '#2E7D32',
  [STATUS.RECUSADO]: '#C62828',
};

// Devolve o status do pedido. 
export function statusDoPedido(pedido) {
  return Object.values(STATUS).includes(pedido?.status) ? pedido.status : STATUS.PENDENTE;
}

// Data de hoje no formato dd/mm/aaaa, no fuso de Brasília
export function dataHoje() {
  return new Date().toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' });
}

// Lê a lista de pedidos gravada (lista vazia se ainda não existe nada)
export async function lerConvenios() {
  const dados = await AsyncStorage.getItem(CHAVE_CONVENIOS);
  const lista = dados ? JSON.parse(dados) : [];

  if (!Array.isArray(lista)) {
    throw new Error('Os dados salvos não estão em uma lista válida.');
  }

  return lista;
}

// Grava a lista de pedidos inteira
export async function salvarConvenios(lista) {
  await AsyncStorage.setItem(CHAVE_CONVENIOS, JSON.stringify(lista));
}