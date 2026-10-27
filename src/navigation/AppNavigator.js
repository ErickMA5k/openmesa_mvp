import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import { cores } from '../theme';
import LoginScreen from '../screens/LoginScreen';
import HomeScreen from '../screens/HomeScreen';
import AdicionarFichaScreen from '../screens/AdicionarFichaScreen';
import HistoricoScreen from '../screens/HistoricoScreen';
import CalendarioScreen from '../screens/CalendarioScreen';
import QRCodeScreen from '../screens/QRCodeScreen';
import EmBreveScreen from '../screens/EmBreveScreen';
import RequisitarConvenioScreen from '../screens/RequisitarConvenioScreen';
import HistoricoConveniosScreen from '../screens/HistoricoConveniosScreens';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { usuario } = useAuth();

  return (
    <Stack.Navigator screenOptions={{ contentStyle: { backgroundColor: cores.fundo } }}>
      {usuario ? (
        <>
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="AdicionarFicha" component={AdicionarFichaScreen} options={{ title: 'Adicionar Ficha' }} />
          <Stack.Screen name="Historico" component={HistoricoScreen} />
          <Stack.Screen name="Calendario" component={CalendarioScreen} options={{ title: 'Calendário' }} />
          <Stack.Screen name="QRCode" component={QRCodeScreen} options={{ headerShown: false }} />
          <Stack.Screen name="MarmitasConvenio" component={HistoricoConveniosScreen} options={{ title: 'Marmitas de convênio' }} />
          <Stack.Screen name="Relatorios" component={EmBreveScreen} options={{ title: 'Relatórios' }} />
          <Stack.Screen name="PagamentosConvenios" component={EmBreveScreen} options={{ title: 'Pagamentos de convênios' }} />
          <Stack.Screen name="FazerPedido" component={RequisitarConvenioScreen} options={{ title: 'Fazer pedido' }} />
          <Stack.Screen name="HistoricoPedidos" component={HistoricoConveniosScreen} options={{ title: 'Histórico de pedidos' }} />
        </>
      ) : (
          <Stack.Screen name="Login" component={LoginScreen} />
      )}
    </Stack.Navigator>
  );
}