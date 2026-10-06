
import { useState, useEffect } from 'react';
import { Modal, TextInput, View, Pressable, Text, StyleSheet } from 'react-native';
import { useFichas, TIPOS } from '../context/FichasContext';



const PopupFichas = () => {
    const [modalVisible, setModalVisible] = useState(false);
    const { adicionarFicha } = useFichas();
    const [registroTexto, setRegistroTexto] = useState('');
    const [erro, setErro] = useState('');
    const [sucesso, setSucesso] = useState(false);

    function fecharPopup() {
        setRegistroTexto('');
        setErro('');
        setModalVisible(false);
    }

    function mudarTexto(texto) {
        setRegistroTexto(texto);
        setErro('');
    }

    async function registrarFicha(tipo) {
        const quantidade = Number(registroTexto);

        if (!Number.isInteger(quantidade) || quantidade <= 0) {
            setErro('Digite um número inteiro maior que zero.');
            return;
        }

        try {
            await adicionarFicha(tipo, quantidade);
            setSucesso(true);
            fecharPopup();
        } catch (error) {
            console.log('Erro ao registrar ficha:', error);
            setErro('Não foi possível salvar a ficha.');
        }
    }

    useEffect(() => {
        if (!sucesso) return;
        const temporizador = setTimeout(() => setSucesso(false), 2500);
        return () => clearTimeout(temporizador);
    }, [sucesso]);


    return (
        <View>
            <Pressable style={styles.botaoAbrir} onPress={() => setModalVisible(true)}>
                <Text style={styles.textoBotao}>Registrar fichas</Text>
            </Pressable>

            {sucesso && <Text style={styles.textoSucesso}>Ficha registrada com sucesso!</Text>}

            <Modal
                visible={modalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={fecharPopup}
            >
                <View style={styles.fundo}>
                    <View style={styles.cartao}>
                        <Text style={styles.titulo}>Quantidade de fichas</Text>

                        <TextInput
                            style={[styles.campo, erro !== '' && styles.campoComErro]}
                            value={registroTexto}
                            onChangeText={mudarTexto}
                            keyboardType="numeric"
                            placeholder="Ex.: 3"
                        />

                        {erro !== '' && <Text style={styles.textoErro}>{erro}</Text>}

                        <View style={styles.linhaBotoes}>
                            <Pressable
                                style={[styles.botaoTipo, styles.botaoMarmita]}
                                onPress={() => registrarFicha(TIPOS.MARMITA)}
                            >
                                <Text style={styles.textoBotao}>Marmita</Text>
                            </Pressable>

                            <Pressable
                                style={[styles.botaoTipo, styles.botaoRefeicao]}
                                onPress={() => registrarFicha(TIPOS.REFEICAO)}
                            >
                                <Text style={styles.textoBotao}>Refeição</Text>
                            </Pressable>
                        </View>

                        <Pressable style={styles.botaoCancelar} onPress={fecharPopup}>
                            <Text style={styles.textoCancelar}>Cancelar</Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    botaoAbrir: {
        backgroundColor: '#1F5F4A',
        padding: 14,
        borderRadius: 8,
        alignItems: 'center',
    },
    fundo: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    cartao: {
        width: '85%',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 20,
    },
    titulo: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 12,
        color: '#222222',
    },
    campo: {
        borderWidth: 1,
        borderColor: '#999999',
        borderRadius: 8,
        padding: 12,
        fontSize: 18,
    },
    campoComErro: {
        borderColor: '#B3261E',
    },
    textoErro: {
        color: '#B3261E',
        marginTop: 8,
    },
    linhaBotoes: {
        flexDirection: 'row',
        marginTop: 16,
        gap: 12,
    },
    botaoTipo: {
        flex: 1,
        padding: 14,
        borderRadius: 8,
        alignItems: 'center',
    },
    botaoMarmita: {
        backgroundColor: '#1F5F4A',
    },
    botaoRefeicao: {
        backgroundColor: '#8A4B14',
    },
    textoBotao: {
        color: '#FFFFFF',
        fontWeight: '600',
        fontSize: 16,
    },
    botaoCancelar: {
        marginTop: 12,
        padding: 12,
        alignItems: 'center',
    },
    textoCancelar: {
        color: '#555555',
        fontSize: 16,
    },
    textoSucesso: {
        color: '#0B02BD',
        fontSize: 20,
    },
});

export default PopupFichas;
