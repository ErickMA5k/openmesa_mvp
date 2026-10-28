export const usuarios = [
 { usuario: 'caixa1', senha: '1234', nome: 'Caixa 1', perfil: 'caixa', restaurante: 'jaiara' },
  { usuario: 'caixa2', senha: '1234', nome: 'Caixa 2', perfil: 'caixa', restaurante: 'morumbi' },
    /*Perfil Fiscal: acessa tudo do Caixa e as funções de convênio, relatórios e pagamentos*/
  { usuario: 'fiscal1', senha: '1234', nome: 'Fiscal 1', perfil: 'fiscal', restaurante: 'jaiara' },
  { usuario: 'fiscal2', senha: '1234', nome: 'Fiscal 2', perfil: 'fiscal', restaurante: 'morumbi' },
    /*Perfil Empresa-Convênio: só faz pedidos de marmitas e consulta o histórico deles*/
  { usuario: 'empresa1', senha: '1234', nome: 'Empresa 1', perfil: 'empresa' },
  /*Perfil do administrador, contém todas as funções do aplicativo e pode criar ou cancelar usuários*/
  { usuario: 'admin1', senha:'1234',nome: 'Administrador', perfil: 'admin'},
];