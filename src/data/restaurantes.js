// Restaurantes vinculados ao sistema.
export const restaurantes = [
  { id: 'jaiara', nome: 'Restaurante Popular Jaiara' },
  { id: 'morumbi', nome: 'Restaurante Popular Morumbi' },
  { id: 'bairro-de-lourdes', nome: 'Restaurante Popular Bairro de Lourdes' },
  { id: 'flor-do-cerrado', nome: 'Restaurante Popular Flor do Cerrado' },
].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR')); // deixa sempre em ordem alfabética

// Devolve o nome do restaurante a partir do código (ou texto vazio se não existir)
export const nomeDoRestaurante = (id) => restaurantes.find((r) => r.id === id)?.nome ?? '';