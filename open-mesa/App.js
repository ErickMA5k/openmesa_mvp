import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from './screens/LoginScreen';
import HomeScreen from './screens/HomeScreen';
import AddFichasScreen from './screens/AddFichasScreen';
import ConfirmExitScreen from './screens/ConfirmExitScreen';
import ConfirmAddFichasScreen from './screens/ConfirmAddFichasScreen';
import AddFichasSuccessScreen from './screens/AddFichasSuccessScreen';
import HistoricoScreen from './screens/HistoricoScreen';
import RegistroScreen from './screens/RegistroScreen';
import QrCodeScreen from './screens/QrCodeScreen';

const Stack = createNativeStackNavigator();
 
export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false}}>
        <Stack.Screen 
         name="Login" 
         component={LoginScreen} />

        <Stack.Screen 
         name="Home" 
         component={HomeScreen} />

        <Stack.Screen 
        name="Historico" 
        component={HistoricoScreen} />

        <Stack.Screen 
        name="Registro" 
        component={RegistroScreen} />

        <Stack.Screen 
        name="QrCode" 
        component={QrCodeScreen} />

        <Stack.Screen 
         name="AddFichas" 
         component={AddFichasScreen} 
         options={{ 
          presentation: 'transparentModal',
          animation: 'fade' }} />

        <Stack.Screen 
         name="ConfirmExit" 
         component={ConfirmExitScreen} 
         options={{ 
          presentation: 'transparentModal', 
          animation: 'fade' }} />

        <Stack.Screen 
         name="ConfirmAddFichas" 
         component={ConfirmAddFichasScreen} 
         options={{ 
          presentation: 'transparentModal', 
          animation: 'fade' }} />

        <Stack.Screen
         name="AddFichasSuccess"
         component={AddFichasSuccessScreen}
          options={{ 
            presentation: 'transparentModal', 
            animation: 'fade' }} />
         
      </Stack.Navigator>
    </NavigationContainer>
  );
}
