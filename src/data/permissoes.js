//Usaremos esse arquivo para determinar as permissões entre os perfis sem a necessidade de criar telas para cada função
export const permissoes = {
  caixa: {
    adicionarFicha: true, // registrar fichas de marmita e refeição (manual e QR Code)
    incluirConvenio: false, // incluir marmitas de convênio na contagem
    cadastroDetalhado: false, // formulário detalhado
    excluirFicha: false, // Refente a capacidade de excluir do histórico
    aprovarConvenio: false, // aprovar ou recusar pedidos de convênio
  },
  fiscal: {
    adicionarFicha: false, // o Fiscal não registra fichas comuns (nem manual, nem por QR Code)
    incluirConvenio: true, // só registra fichas ao incluir marmitas de convênio aprovadas
    cadastroDetalhado: false,
    excluirFicha: true,
    aprovarConvenio: false,
  },
  empresa: {
    adicionarFicha: false,
    incluirConvenio: false,
    cadastroDetalhado: false,
    excluirFicha: false,
    aprovarConvenio: false,
  },
  admin: {
    // Acesso apenas ás funções administrativas, o admin não é associado á nenhum restaurante, portanto, não pode adicionar fichas
    adicionarFicha: false,
    incluirConvenio: false,
    excluirFicha: true,
    aprovarConvenio: true,
  },
};
 
// Responde se o usuário logado pode fazer a ação. Perfil ou ação desconhecidos = não pode.
export function podeFazer(usuario, acao) {
  return permissoes[usuario?.perfil]?.[acao] === true;
}