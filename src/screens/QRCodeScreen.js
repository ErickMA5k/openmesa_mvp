import { useEffect, useRef, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Alert } from 'react-native';
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

  // Registra no histórico as quantidades lidas
  const confirmar = async () => {
    if (marmitas + refeicoes === 0) {
      return Alert.alert('Nada para registrar', 'Leia ao menos um QR Code.');
    }
    try {
      if (marmitas > 0) await adicionarFicha(TIPOS.MARMITA, marmitas);
      if (refeicoes > 0) await adicionarFicha(TIPOS.REFEICAO, refeicoes);
      setMarmitas(0);
      setRefeicoes(0);
      Alert.alert('Pronto', 'Fichas registradas com sucesso!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (erro) {
      Alert.alert('Erro', erro.message);
    }
  };

  // Enquanto a permissão carrega, mostra só o fundo preto
  if (!permissao) return <View style={styles.tela} />;

  // Sem permissão da câmera: explica e oferece o botão para permitir
  if (!permissao.granted) {
    return (
      <View style={[styles.tela, styles.centro]}>
        <Text style={styles.aviso}>Precisamos da câmera para ler os QR Codes.</Text>
        <Botao titulo="Permitir câmera" onPress={pedirPermissao} />
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

        <Pressable style={styles.voltar} onPress={() => navigation.goBack()}>
          <Text style={styles.setaVoltar}>←</Text>
        </Pressable>
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
        <Botao titulo="Confirmar" onPress={confirmar} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: '#000000' },
  centro: { justifyContent: 'center', padding: espacos.g },
  aviso: { color: '#FFFFFF', fontSize: 16, textAlign: 'center', marginBottom: espacos.m },

  areaCamera: { flex: 1 },
  centralizar: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
  moldura: { width: '65%', height: '80%' },
  canto: { position: 'absolute', width: 45, height: 45 },
  topoEsq: { top: 0, left: 0, borderTopWidth: 5, borderLeftWidth: 5 },
  topoDir: { top: 0, right: 0, borderTopWidth: 5, borderRightWidth: 5 },
  baixoEsq: { bottom: 0, left: 0, borderBottomWidth: 5, borderLeftWidth: 5 },
  baixoDir: { bottom: 0, right: 0, borderBottomWidth: 5, borderRightWidth: 5 },

  voltar: { position: 'absolute', top: 48, left: 20 },
  setaVoltar: { color: '#FFFFFF', fontSize: 32 },

  rodape: { padding: espacos.m },
  contadores: { flexDirection: 'row', gap: espacos.m, marginBottom: espacos.m },
  contador: { flex: 1, backgroundColor: cores.escura, borderRadius: 16, padding: espacos.m, alignItems: 'center' },
  contadorRotulo: { color: '#DDDDDD', fontSize: 14 },
  contadorValor: { color: '#FFFFFF', fontSize: 28, fontWeight: 'bold' },
});