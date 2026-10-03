import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/LoginScreen';
import HomeScreen from '../screens/HomeScreen';
import AdicionarFichaScreen from '../screens/AdicionarFichaScreen';
import HistoricoScreen from '../screens/HistoricoScreen';
import CalendarioScreen from '../screens/CalendarioScreen';
import { cores } from '../theme';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator initialRouteName="Login" screenOptions={{ contentStyle: { backgroundColor: cores.fundo } }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="AdicionarFicha" component={AdicionarFichaScreen} />
      <Stack.Screen name="Historico" component={HistoricoScreen} />
      <Stack.Screen name="Calendario" component={CalendarioScreen} />
    </Stack.Navigator>
  );
}