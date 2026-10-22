
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import { cores } from '../theme';

import LoginScreen from '../screens/LoginScreen';
import HomeScreen from '../screens/HomeScreen';
import AdicionarFichaScreen from '../screens/AdicionarFichaScreen';
import HistoricoScreen from '../screens/HistoricoScreen';
import CalendarioScreen from '../screens/CalendarioScreen';
import RequisitarConvenioScreen from '../screens/RequisitarConvenioScreen';
import HistoricoConveniosScreen from '../screens/HistoricoConveniosScreens';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { usuario } = useAuth();

  const ehCaixa = usuario?.perfil === 'caixa';
  const ehConvenio = usuario?.perfil === 'convenio';
  const ehFiscal = usuario?.perfil === 'fiscal';

  return (
    <Stack.Navigator
      screenOptions={{
        contentStyle: { backgroundColor: cores.fundo },
      }}
    >
      {usuario ? (
        <>
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{ title: 'Open Mesa' }}
          />

          {ehCaixa && (
            <>
              <Stack.Screen
                name="AdicionarFicha"
                component={AdicionarFichaScreen}
                options={{ title: 'Adicionar Ficha' }}
              />
              <Stack.Screen
                name="Historico"
                component={HistoricoScreen}
                options={{ title: 'Histórico' }}
              />
              <Stack.Screen
                name="Calendario"
                component={CalendarioScreen}
                options={{ title: 'Calendário' }}
              />
            </>
          )}

          {ehFiscal && (
            <>
              <Stack.Screen
                name="Historico"
                component={HistoricoScreen}
                options={{ title: 'Histórico' }}
              />
              <Stack.Screen
                name="Calendario"
                component={CalendarioScreen}
                options={{ title: 'Calendário' }}
              />
            </>
          )}

          {ehConvenio && (
            <>
              <Stack.Screen
                name="RequisitarConvenio"
                component={RequisitarConvenioScreen}
                options={{ title: 'Requisitar Convênio' }}
              />
              <Stack.Screen
                name="HistoricoConvenios"
                component={HistoricoConveniosScreen}
                options={{ title: 'Histórico de Convênios' }}
              />
            </>
          )}
        </>
      ) : (
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ title: 'Entrar' }}
        />
      )}
    </Stack.Navigator>
  );
}
