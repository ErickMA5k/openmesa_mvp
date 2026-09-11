import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
 
export default function LoginScreen({ navigation }) {
  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');
 
  function handleLogin() {
    
    navigation.replace('Home');
  }
 
  return (
    <View style={styles.container}>
      <View style={styles.logoCircle}>
        <Text style={styles.logoText}>Open{'\n'}Mesa</Text>
      </View>
 
      <Text style={styles.label}>Usuário:</Text>
      <TextInput style={styles.input} value={usuario} onChangeText={setUsuario} />
 
      <Text style={styles.label}>Digite sua senha:</Text>
      <TextInput style={styles.input} value={senha} onChangeText={setSenha} secureTextEntry />
 
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>
    </View>
  );
}
 
const styles = StyleSheet.create({
  container: {
     flex: 1, 
     justifyContent: 'center', 
     padding: 24, 
     backgroundColor: '#fdf7f0' 
    },
    
  logoCircle: {
     width: 140, 
     height: 140, 
     borderRadius: 70, 
     backgroundColor: '#1d3f7a',
     alignSelf: 'center', 
     justifyContent: 'center', 
     alignItems: 'center', 
     marginBottom: 48,
  },

  logoText: { 
    color: '#fff', 
    fontSize: 22, 
    fontWeight: 'bold', 
    textAlign: 'center' 
  },

  label: { 
    marginBottom: 6, 
    color: '#333' 
  },

  input: {
    borderWidth: 1, 
    borderColor: '#ccc', 
    borderRadius: 6, 
    padding: 10, 
    marginBottom: 20, 
    backgroundColor: '#fff',
  },

  button: { 
    backgroundColor: '#2563eb', 
    borderRadius: 20, 
    paddingVertical: 12, 
    alignItems: 'center' 
  },

  buttonText: { 
    color: '#fff', 
    fontWeight: 'bold', 
    fontSize: 16 
  },
});
 