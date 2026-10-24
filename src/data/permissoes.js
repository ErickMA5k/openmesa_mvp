//Usaremos esse arquivo para determinar as permissões entre os perfis sem a necessidade de criar telas para cada função
export const permissoes = {
  caixa: {
    cadastroDetalhado: false, // formulário detalhado
    excluirFicha: false, // Refente a capacidade de excluir do histórico
  },
  fiscal: {
    cadastroDetalhado: true,
    excluirFicha: true,
  },
  empresa: {
    cadastroDetalhado: false,
    excluirFicha: false,
  },
};
 
// Responde se o usuário logado pode fazer a ação. Perfil ou ação desconhecidos = não pode.
export function podeFazer(usuario, acao) {
  return permissoes[usuario?.perfil]?.[acao] === true;
}