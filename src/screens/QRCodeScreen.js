import { useEffect, useRef, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Linking } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useFichas, TIPOS } from '../context/FichasContext';
import Botao from '../components/Botao';
import { cores, espacos } from '../theme';

// Cor do contorno do leitor conforme o resultado da última leitura
const COR_CONTORNO = {
  aguardando: '#FFFFFF',
  sucesso: '#2E7D32', // verde
  erro: '#C62828',    // vermelho
};

// Cor do ícone do pop-up conforme o tipo de resultado
const COR_POPUP = {
  sucesso: '#2E7D32',
  erro: '#C62828',
  aviso: '#ED8F00',
};

// Tempo (em milissegundos) sem enxergar o QR Code para liberar uma nova leitura
const TEMPO_LIBERAR = 800;

// Converte o texto lido do QR Code em um tipo de ficha (null se não for reconhecido)
function tipoDoQr(texto) {
  const valor = texto.trim().toLowerCase();
  if (valor === 'marmita') return TIPOS.MARMITA;
  if (valor === 'refeicao') return TIPOS.REFEICAO;
  return null;
}

export default function QRCodeScreen({ navigation }) {
  const { adicionarFicha } = useFichas();
  const [permissao, pedirPermissao] = useCameraPermissions();

  const [marmitas, setMarmitas] = useState(0);
  const [refeicoes, setRefeicoes] = useState(0);
  const [status, setStatus] = useState('aguardando'); // aguardando | sucesso | erro

  // Pop-up de resultado: { tipo: 'sucesso' | 'erro' | 'aviso', titulo, mensagem, voltar } ou null
  const [popup, setPopup] = useState(null);
  const [salvando, setSalvando] = useState(false); // true enquanto grava as fichas
  const [erroCamera, setErroCamera] = useState(''); // mensagem se a câmera não iniciar

  // Refs guardam valores sem redesenhar a tela (a câmera chama aoLer várias vezes por segundo)
  const travado = useRef(false);      // true enquanto o mesmo QR Code continua na câmera
  const ultimaDeteccao = useRef(0);   // horário em que a câmera viu um QR Code pela última vez

  // A cada 300ms confere se o QR Code saiu da câmera; se saiu, libera uma nova leitura
  useEffect(() => {
    const intervalo = setInterval(() => {
      if (travado.current && Date.now() - ultimaDeteccao.current > TEMPO_LIBERAR) {
        travado.current = false;
        setStatus('aguardando'); // contorno volta a ficar branco
      }
    }, 300);
    return () => clearInterval(intervalo); // para o relógio ao sair da tela
  }, []);

  // Chamada pela câmera toda vez que ela enxerga um QR Code
  const aoLer = ({ data }) => {
    ultimaDeteccao.current = Date.now(); // marca que o QR Code ainda está à vista
    if (salvando || popup) return;       // gravando ou com pop-up aberto: não conta leituras novas
    if (travado.current) return;         // já foi lido: ignora até ser reposicionado
    travado.current = true;

    const tipo = tipoDoQr(data);
    if (!tipo) {
      setStatus('erro'); // QR Code não reconhecido: contorno vermelho
      return;
    }

    if (tipo === TIPOS.MARMITA) setMarmitas((q) => q + 1);
    else setRefeicoes((q) => q + 1);
    setStatus('sucesso'); // leitura válida: contorno verde
  };

  // Registra no histórico as quantidades lidas e avisa o resultado em um pop-up
  const confirmar = async () => {
    if (salvando) return; // evita toque duplo em "Confirmar"

    if (marmitas + refeicoes === 0) {
      setPopup({
        tipo: 'aviso',
        titulo: 'Nada para registrar',
        mensagem: 'Leia ao menos um QR Code antes de confirmar.',
        voltar: false,
      });
      return;
    }

    // Guarda o que será registrado para mostrar no pop-up depois de zerar os contadores
    const qtdMarmitas = marmitas;
    const qtdRefeicoes = refeicoes;

    setSalvando(true);
    try {
      if (qtdMarmitas > 0) {
        await adicionarFicha(TIPOS.MARMITA, qtdMarmitas);
        setMarmitas(0); // zera já: se o próximo registro falhar, estas não são repetidas
      }
      if (qtdRefeicoes > 0) {
        await adicionarFicha(TIPOS.REFEICAO, qtdRefeicoes);
        setRefeicoes(0);
      }

      const linhas = [];
      if (qtdMarmitas > 0) linhas.push(`${qtdMarmitas} ${qtdMarmitas === 1 ? 'marmita' : 'marmitas'}`);
      if (qtdRefeicoes > 0) linhas.push(`${qtdRefeicoes} ${qtdRefeicoes === 1 ? 'refeição' : 'refeições'}`);

      setPopup({
        tipo: 'sucesso',
        titulo: 'Leituras registradas!',
        mensagem: `Foram registradas no sistema: ${linhas.join(' e ')}.`,
        voltar: true,
      });
    } catch (erro) {
      setPopup({
        tipo: 'erro',
        titulo: 'Não foi possível registrar',
        mensagem: erro?.message || 'Tente novamente.',
        voltar: false,
      });
    } finally {
      setSalvando(false);
    }
  };

  // Fecha o pop-up; se o registro deu certo, também volta para a tela anterior
  const fecharPopup = () => {
    const deveVoltar = popup?.voltar;
    setPopup(null);
    if (deveVoltar) navigation.goBack();
  };

  // Seta de voltar: usada em TODOS os estados da tela (carregando, sem permissão, erro e câmera)
  const botaoVoltar = (
    <Pressable
      style={styles.voltar}
      onPress={() => navigation.goBack()}
      hitSlop={16}
      accessibilityRole="button"
      accessibilityLabel="Voltar"
    >
      <Text style={styles.setaVoltar}>←</Text>
    </Pressable>
  );

  // Enquanto a permissão carrega, mostra só o fundo preto (com a seta de voltar)
  if (!permissao) return <View style={styles.tela}>{botaoVoltar}</View>;

  // Sem permissão da câmera: explica, oferece permitir (ou abrir as configurações) e deixa voltar
  if (!permissao.granted) {
    return (
      <View style={[styles.tela, styles.centro]}>
        {botaoVoltar}
        <Text style={styles.aviso}>Precisamos da câmera para ler os QR Codes.</Text>
        {permissao.canAskAgain ? (
          <Botao titulo="Permitir câmera" onPress={pedirPermissao} />
        ) : (
          <Botao titulo="Abrir configurações" onPress={() => Linking.openSettings()} />
        )}
        <Botao titulo="Voltar" variante="secundario" onPress={() => navigation.goBack()} />
      </View>
    );
  }

  // Câmera indisponível (sem câmera no aparelho, em uso por outro app, etc.)
  if (erroCamera) {
    return (
      <View style={[styles.tela, styles.centro]}>
        {botaoVoltar}
        <Text style={styles.aviso}>Não foi possível iniciar a câmera.</Text>
        <Text style={styles.avisoDetalhe}>{erroCamera}</Text>
        <Botao titulo="Tentar novamente" onPress={() => setErroCamera('')} />
        <Botao titulo="Voltar" variante="secundario" onPress={() => navigation.goBack()} />
      </View>
    );
  }

  const cor = COR_CONTORNO[status];

  return (
    <View style={styles.tela}>
      <View style={styles.areaCamera}>
        <CameraView
          style={StyleSheet.absoluteFill}
          facing="back"
          barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
          onBarcodeScanned={aoLer}
          onMountError={(e) => setErroCamera(e?.message || 'Câmera indisponível neste aparelho.')}
        />

        {/* Contorno do leitor: quatro cantos que mudam de cor */}
        <View style={styles.centralizar} pointerEvents="none">
          <View style={styles.moldura}>
            <View style={[styles.canto, styles.topoEsq, { borderColor: cor }]} />
            <View style={[styles.canto, styles.topoDir, { borderColor: cor }]} />
            <View style={[styles.canto, styles.baixoEsq, { borderColor: cor }]} />
            <View style={[styles.canto, styles.baixoDir, { borderColor: cor }]} />
          </View>
        </View>

        {botaoVoltar}
      </View>

      {/* Contadores e botão de confirmar */}
      <View style={styles.rodape}>
        <View style={styles.contadores}>
          <View style={styles.contador}>
            <Text style={styles.contadorRotulo}>Marmita</Text>
            <Text style={styles.contadorValor}>{marmitas}</Text>
          </View>
          <View style={styles.contador}>
            <Text style={styles.contadorRotulo}>Refeição</Text>
            <Text style={styles.contadorValor}>{refeicoes}</Text>
          </View>
        </View>
        <Botao titulo={salvando ? 'Salvando...' : 'Confirmar'} onPress={confirmar} />
      </View>

      {/* Pop-up de resultado (View sobreposta: funciona no celular e no navegador) */}
      {popup && (
        <View style={styles.popupFundo}>
          <View style={styles.popupCartao}>
            <Text style={[styles.popupIcone, { color: COR_POPUP[popup.tipo] }]}>
              {popup.tipo === 'sucesso' ? '✓' : popup.tipo === 'erro' ? '✕' : '!'}
            </Text>
            <Text style={styles.popupTitulo}>{popup.titulo}</Text>
            <Text style={styles.popupMensagem}>{popup.mensagem}</Text>
            <Botao titulo="OK" onPress={fecharPopup} />
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: '#000000' },
  centro: { justifyContent: 'center', padding: espacos.g },
  aviso: { color: '#FFFFFF', fontSize: 16, textAlign: 'center', marginBottom: espacos.m },
  avisoDetalhe: { color: '#BBBBBB', fontSize: 13, textAlign: 'center', marginBottom: espacos.m },

  areaCamera: { flex: 1 },
  centralizar: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
  moldura: { width: '65%', height: '80%' },
  canto: { position: 'absolute', width: 45, height: 45 },
  topoEsq: { top: 0, left: 0, borderTopWidth: 5, borderLeftWidth: 5 },
  topoDir: { top: 0, right: 0, borderTopWidth: 5, borderRightWidth: 5 },
  baixoEsq: { bottom: 0, left: 0, borderBottomWidth: 5, borderLeftWidth: 5 },
  baixoDir: { bottom: 0, right: 0, borderBottomWidth: 5, borderRightWidth: 5 },

  voltar: { position: 'absolute', top: 48, left: 20, zIndex: 10 },
  setaVoltar: { color: '#FFFFFF', fontSize: 32 },

  rodape: { padding: espacos.m },
  contadores: { flexDirection: 'row', gap: espacos.m, marginBottom: espacos.m },
  contador: { flex: 1, backgroundColor: cores.escura, borderRadius: 16, padding: espacos.m, alignItems: 'center' },
  contadorRotulo: { color: '#DDDDDD', fontSize: 14 },
  contadorValor: { color: '#FFFFFF', fontSize: 28, fontWeight: 'bold' },

  popupFundo: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: espacos.g,
    zIndex: 20,
  },
  popupCartao: { width: '100%', maxWidth: 380, backgroundColor: '#FFFFFF', borderRadius: 16, padding: espacos.g, alignItems: 'center' },
  popupIcone: { fontSize: 48, fontWeight: 'bold', marginBottom: espacos.p },
  popupTitulo: { fontSize: 20, fontWeight: 'bold', color: cores.escura, textAlign: 'center', marginBottom: espacos.p },
  popupMensagem: { fontSize: 16, color: cores.texto, textAlign: 'center', marginBottom: espacos.m },
});