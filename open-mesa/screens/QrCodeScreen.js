import { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useAudioPlayer } from 'expo-audio';

export default function QrCodeScreen({ navigation }) {
    const[permission, requestPermission,] = useCameraPermissions();
    const[qtdMarmitas, setQtdMarmitas] = useState(0);
    const[qtdRefeicoes, setQtdRefeicoes] = useState(0);
    const[corBorda, setCorBorda] = useState('#fff');
    const travado = useRef(false);

    const somSucesso = useAudioPlayer(require('../assets/sounds/beep-sucesso.mp3')); 
    const somErro = useAudioPlayer(require('../assets/sounds/beep-erro.mp3'));
    
    function handleBarcodeScanned({ data }) {
        if (travado.current) return;
        travado.current = true;

        const conteudo = data.toUpperCase();

        if (conteudo.includes('MARMITA')) {
            setQtdMarmitas((quantidade) => quantidade + 1);
            indicarLeitura(true);
        } else if (conteudo.includes('REFEICAO')) {
            setQtdRefeicoes((quantidade) => quantidade + 1);
            indicarLeitura(true);
        } else {
            indicarLeitura(false);
        }
    }
    
    function indicarLeitura(sucesso) {
        setCorBorda(sucesso ? '#22c55e' : '#ef4444');
        const player = sucesso ? somSucesso : somErro;
        player.seekTo(0);
        player.play();
        
        setTimeout(() => {
            setCorBorda('#fff');
            travado.current = false;
        }, 1200);
    }

    function handleConfirmar(){
        navigation.navigate('ConfirmAddFichas', { marmitas: qtdMarmitas, refeicoes: qtdRefeicoes });
    }

    if (!permission) {
    return <View style={styles.container} />;
  }
 
  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.aviso}>Precisamos da sua permissão pra usar a câmera</Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Permitir</Text>
        </TouchableOpacity>
      </View>
    );
  }
 
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
        <Text style={styles.backText}>{'\u2190'}</Text>
      </TouchableOpacity>
 
      <View style={[styles.moldura, { borderColor: corBorda }]}>
        <CameraView
          style={styles.camera}
          barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
          onBarcodeScanned={handleBarcodeScanned}
        />
      </View>
 
      <View style={styles.rodape}>
        <Text style={styles.contador}>Marmitas: {qtdMarmitas}</Text>
 
        <TouchableOpacity style={styles.button} onPress={handleConfirmar}>
          <Text style={styles.buttonText}>Confirmar</Text>
        </TouchableOpacity>
 
        <Text style={styles.contador}>Refeições: {qtdRefeicoes}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        backgroundColor: '#000' 
    },

    back: { 
        position: 'absolute', 
        top: 50, 
        left: 20, 
        zIndex: 1 
    },

    backText: { 
        fontSize: 36, 
        color: '#fff' 
    },

    moldura: {
        flex: 1, 
        margin: 24, 
        marginTop: 100, 
        borderWidth: 6, 
        borderRadius: 16, 
        overflow: 'hidden'
  },

    camera: { 
        flex: 1 
    },

    rodape: {
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        paddingHorizontal: 24, 
        paddingBottom: 32, 
        paddingTop: 12
    },

    contador: { 
        color: '#fff', 
        fontWeight: 'bold', 
        fontSize: 14 
    },

    button: { 
        backgroundColor: '#2563eb', 
        borderRadius: 20, 
        paddingVertical: 12, 
        paddingHorizontal: 20 
    },

    buttonText: { 
        color: '#fff', 
        fontWeight: 'bold', 
        fontSize: 16 
    },

    aviso: { 
        color: '#fff', 
        textAlign: 'center', 
        marginBottom: 16, 
        paddingHorizontal: 24 
    },
});