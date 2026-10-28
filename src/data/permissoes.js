//Usaremos esse arquivo para determinar as permissões entre os perfis sem a necessidade de criar telas para cada função
export const permissoes = {
  caixa: {
    cadastroDetalhado: false, // formulário detalhado
    excluirFicha: false, // Refente a capacidade de excluir do histórico
    aprovarConvenio: false, // aprovar ou recusar pedidos de convênio
  },
  fiscal: {
    cadastroDetalhado: true,
    excluirFicha: true,
    aprovarConvenio: false,
  },
  empresa: {
    cadastroDetalhado: false,
    excluirFicha: false,
    aprovarConvenio: false,
  },
  admin: {
    // Acesso apenas ás funções administrativas, o admin não é associado á nenhum restaurante, portanto, não pode adicionar fichas
    excluirFicha: true,
    aprovarConvenio: true,
  },
};
 
// Responde se o usuário logado pode fazer a ação. Perfil ou ação desconhecidos = não pode.
export function podeFazer(usuario, acao) {
  return permissoes[usuario?.perfil]?.[acao] === true;
}