import { View, Text, Image, StyleSheet, TouchableOpacity, ScrollView, Modal, Pressable } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { nomeDoRestaurante } from '../data/restaurantes';
import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { podeFazer } from '../data/permissoes';
import { STATUS, statusDoPedido, lerConvenios } from '../data/convenios';
import { cores, espacos, fontes } from '../theme';

//Botões que o Caixa vê (o Fiscal também usa todos eles)
const botoesCaixa = [
  { titulo: 'Adicionar Ficha', descricao: 'Registrar uma nova ficha', tela: 'AdicionarFicha', simbolo: '+', principal: true },
  { titulo: 'Histórico', descricao: 'Consultar fichas registradas', tela: 'Historico', simbolo: '≡' },
  { titulo: 'Calendário', descricao: 'Visualizar fichas por data', tela: 'Calendario', simbolo: '□' },
  { titulo: 'Escanear QR Code', descricao: 'Ler o QR Code das fichas', tela: 'QRCode', simbolo: '▣' },
];

//Telas de registro de fichas: só o Caixa usa (o Fiscal usa só os de consulta)
const telasSoDoCaixa = ['AdicionarFicha', 'QRCode'];

//Botões do Fiscal: os de consulta do Caixa + os convênios já aprovados pelo admin para o restaurante dele
const botoesFiscal = [
  // copia os botões do Caixa, menos os de registrar ficha
  ...botoesCaixa.filter((b) => !telasSoDoCaixa.includes(b.tela)),
  { titulo: 'Marmitas de convênio', descricao: 'Pedidos de convênio aprovados', tela: 'MarmitasConvenio', simbolo: '≡' },
];

//Telas que o admin NÃO usa:
//- AdicionarFicha e QRCode: a ficha é registrada para o restaurante de quem a lança, e o admin não tem restaurante
//- MarmitasConvenio: o admin já vê e decide os convênios na tela de Aprovação
const telasForaDoAdmin = ['AdicionarFicha', 'QRCode', 'MarmitasConvenio'];

//Lista de botões de cada perfil. A chave é o mesmo "perfil" do usuarios.js
const botoesPorPerfil = {
  caixa: botoesCaixa,
  fiscal: botoesFiscal,
  empresa: [
    { titulo: 'Fazer pedido', descricao: 'Solicitar marmitas ao restaurante', tela: 'FazerPedido', simbolo: '+', principal: true },
    { titulo: 'Histórico de pedidos', descricao: 'Consultar pedidos feitos', tela: 'HistoricoPedidos', simbolo: '≡' },
  ],
  admin: [
    ...botoesFiscal.filter((b) => !telasForaDoAdmin.includes(b.tela)),
    { titulo: 'Relatórios', descricao: 'Planilhas de vendas', tela: 'Relatorios', simbolo: '↓' },
    { titulo: 'Aprovação de convênios', descricao: 'Aprovar ou recusar pedidos das empresas', tela: 'AprovacaoConvenios', simbolo: '✓' },
  ],
};

export default function HomeScreen({ navigation }) {
  const { sair, usuario } = useAuth();
  const [modalSairVisivel, setModalSairVisivel] = useState(false);

  // Números das notificações (null = ainda não carregou)
  const [pendentes, setPendentes] = useState(null);

  const notificacoes = {
    AprovacaoConvenios: pendentes,
  };

  // Recarrega as contagens sempre que a Home volta a ficar visível
  useFocusEffect(
    useCallback(() => {
      const ehAdmin = podeFazer(usuario, 'aprovarConvenio');
      if (!ehAdmin) return; // os outros perfis não têm notificações

      let ativo = true; // evita atualizar a tela se ela já foi fechada

      lerConvenios()
        .then((lista) => {
          if (!ativo) return;
          setPendentes(lista.filter((p) => statusDoPedido(p) === STATUS.PENDENTE).length);
        })
        .catch(() => {}); // se a leitura falhar, o número não aparece (melhor do que mostrar 0 errado)

      return () => {
        ativo = false;
      };
    }, [usuario])
  );
 
  return (
    <ScrollView contentContainerStyle={styles.container}>

      {/* Cabeçalho */}
      <View style={styles.header}>

        <Image
          source={require('../assets/icon.png')}
          style={styles.logo}
          resizeMode="contain"
        />

        <View style={styles.headerTexto}>
          <Text style={styles.ola}>
            Olá,
          </Text>

          <Text style={styles.nome}>
            {usuario?.nome || 'Usuário'}
          </Text>

         {/* Restaurante do usuário (só aparece para Caixa e Fiscal) */}
          {usuario?.restaurante && (
            <Text style={styles.restaurante}>
              {nomeDoRestaurante(usuario.restaurante)}
            </Text>
          )}

        </View>

      </View>

      {/* Subtítulo */}
      <Text style={styles.subtitulo}>
        Gerencie suas fichas de forma simples.
      </Text>

      
        {/* Ações */}

      <View style={styles.acoes}>
        {(botoesPorPerfil[usuario?.perfil] || []).map((b) => (
          <TouchableOpacity
            key={b.tela}
            style={styles.cardAcao}
            activeOpacity={0.8}
            onPress={() => navigation.navigate(b.tela)}
          >
            <View style={b.principal ? styles.iconeAdicionar : styles.icone}>
              <Text style={b.principal ? styles.iconeTexto : styles.iconeSimbolo}>
                {b.simbolo}
              </Text>
            </View>

            <View>
              <Text style={styles.cardTitulo}>{b.titulo}</Text>
              <Text style={styles.cardDescricao}>{b.descricao}</Text>
            </View>

            {/* Notificação em vermelho
            UPDATE: só aparece se o número de notificações for maior que 0 */}
            {notificacoes[b.tela] > 0 && (
              <View style={styles.selo}>
                <Text style={styles.textoSelo}>{notificacoes[b.tela]}</Text>
              </View>
            )}

          </TouchableOpacity>
        ))}
      </View>

      {/* Sair */}
      <TouchableOpacity
        style={styles.botaoSair}
        activeOpacity={0.7}
        onPress={() => setModalSairVisivel(true)}
      >
        <Text style={styles.textoSair}>
          Sair da conta
        </Text>
      </TouchableOpacity>

      {/* Pop-up de confirmação para sair */}
      <Modal
        visible={modalSairVisivel}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalSairVisivel(false)}
      >
        <Pressable
          style={styles.modalFundo}
          onPress={() => setModalSairVisivel(false)}
        >
          <Pressable style={styles.modalCartao} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.modalTitulo}>Deseja Sair</Text>
            <Text style={styles.modalMensagem}>
              Tem certeza de que deseja sair da sua conta?
            </Text>

            <View style={styles.modalLinhaBotoes}>
              <TouchableOpacity
                style={styles.modalBotaoCancelar}
                activeOpacity={0.7}
                onPress={() => setModalSairVisivel(false)}
              >
                <Text style={styles.modalTextoCancelar}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalBotaoConfirmar}
                activeOpacity={0.7}
                onPress={() => {
                  setModalSairVisivel(false);
                  sair();
                }}
              >
                <Text style={styles.modalTextoConfirmar}>Sim</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

    </ScrollView>
  );
}

const styles = StyleSheet.create({

  container: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 35,
    backgroundColor: '#FFFFFF',
  },

  /* Cabeçalho */

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },

  logo: {
    width: 70,
    height: 60,
    marginRight: 14,
  },

  headerTexto: {
    flex: 1,
  },

  ola: {
    fontSize: 15,
    color: '#777777',
    alignItems: 'center',
  
  },

  nome: {
    fontSize: 25,
    fontWeight: '700',
    color: '#172A55',
  },

  restaurante: {
    fontSize: 13,
    color: '#777777',
  },

  subtitulo: {
    fontSize: 14,
    color: '#777777',
    marginBottom: 25,
  },


  /* Ações */

  tituloAcoes: {
    fontSize: 19,
    fontWeight: '700',
    color: '#172A55',
    marginTop: 50,
    marginBottom: 15,
  },

  acoes: {
    gap: 12,
  },

  cardAcao: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5EAF0',
    borderRadius: 14,
    padding: 16,

    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 5,

    elevation: 2,
  },

  iconeAdicionar: {
    width: 46,
    height: 46,
    borderRadius: 13,
    backgroundColor: '#147DBA',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },

  icone: {
    width: 46,
    height: 46,
    borderRadius: 13,
    backgroundColor: '#EAF4FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },

  iconeTexto: {
    color: '#FFFFFF',
    fontSize: 30,
    fontWeight: '300',
    lineHeight: 32,
  },

  iconeSimbolo: {
    color: '#147DBA',
    fontSize: 24,
    fontWeight: '600',
  },

  cardTitulo: {
    fontSize: 16,
    fontWeight: '700',
    color: '#172A55',
    marginBottom: 3,
  },

  cardDescricao: {
    fontSize: 12,
    color: '#777777',
  },

  /* Sair */

  botaoSair: {
    marginTop: 'auto',
    marginBottom: 20,
    alignItems: 'center',
    paddingVertical: 14,
  },

  textoSair: {
    fontSize: 14,
    fontWeight: '600',
    color: '#B84A4A',
  },

    /* Notificação (círculo vermelho com o número) */

  selo: {
    marginLeft: 'auto', // empurra o círculo para o canto direito do card
    minWidth: 28,
    height: 28,
    borderRadius: 14,
    paddingHorizontal: 8,
    backgroundColor: cores.perigo,
    justifyContent: 'center',
    alignItems: 'center',
  },

  textoSelo: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },

  /* Pop-up Modal de Confirmação */
  modalFundo: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: espacos.m,
  },

  modalCartao: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: cores.secundaria,
    borderRadius: 14,
    padding: espacos.g,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },

  modalTitulo: {
    fontSize: fontes.g,
    fontWeight: 'bold',
    color: cores.escura,
    marginBottom: espacos.p,
  },

  modalMensagem: {
    fontSize: fontes.p,
    color: '#666666',
    marginBottom: espacos.m,
    lineHeight: 20,
  },

  modalLinhaBotoes: {
    flexDirection: 'row',
    gap: espacos.p,
  },

  modalBotaoCancelar: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: cores.borda,
    backgroundColor: cores.secundaria,
    alignItems: 'center',
  },

  modalTextoCancelar: {
    fontSize: fontes.m,
    fontWeight: '600',
    color: '#555555',
  },

  modalBotaoConfirmar: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: cores.perigo,
    alignItems: 'center',
  },

  modalTextoConfirmar: {
    fontSize: fontes.m,
    fontWeight: 'bold',
    color: cores.secundaria,
  },
});
