import { View, Text } from 'react-native';
import PopupFichas from '../components/popupFichas';
import { useFichas } from '../context/FichasContext';



export default function AdicionarFichaScreen() {
  const { fichas, totalGeral, receitaTotal } = useFichas();
  console.log(fichas, totalGeral(),receitaTotal());
  return (
    <View>
      <Text>Adicionar Ficha</Text>
      <PopupFichas />
    </View>
  );
