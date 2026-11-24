//Usaremos esse arquivo para determinar as permissões entre os perfis sem a necessidade de criar telas para cada função
export const permissoes = {
  caixa: {
    adicionarFicha: true, // registrar fichas de marmita e refeição (manual e QR Code)
    cadastroDetalhado: false, // formulário detalhado
    excluirFicha: false, // Refente a capacidade de excluir do histórico
    aprovarConvenio: false, // aprovar ou recusar pedidos de convênio
     emitirRelatorio: false, // Acesso a relatórios de fichas e convênios em Excel
  },
  fiscal: {
    adicionarFicha: false, // o Fiscal não registra fichas comuns (nem manual, nem por QR Code)
    cadastroDetalhado: false,
    excluirFicha: true,
    aprovarConvenio: false,
    emitirRelatorio: false,
  },
  empresa: {
    adicionarFicha: false,
    cadastroDetalhado: false,
    excluirFicha: false,
    aprovarConvenio: false,
    emitirRelatorio: false,
  },
  admin: {
    // Acesso apenas ás funções administrativas, o admin não é associado á nenhum restaurante, portanto, não pode adicionar fichas
    adicionarFicha: false,
    excluirFicha: true,
    aprovarConvenio: true,
    emitirRelatorio: true, //Somente o admin pode emitir relatórios, pois ele tem acesso a todos os restaurantes e empresas
  },
};
 
// Responde se o usuário logado pode fazer a ação. Perfil ou ação desconhecidos = não pode.
export function podeFazer(usuario, acao) {
  return permissoes[usuario?.perfil]?.[acao] === true;
}