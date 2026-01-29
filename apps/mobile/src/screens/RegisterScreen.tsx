import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput } from 'react-native';
import { ScreenContainer } from '../components/ScreenContainer';
import { authApi } from '../services/api';
import { useAuthStore } from '../stores/authStore';

export function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const setTokens = useAuthStore((state) => state.setTokens);
  const setUser = useAuthStore((state) => state.setUser);

  const handleRegister = async () => {
    setError('');
    try {
      const response = await authApi.register({ name, email, password });
      await setTokens(response.data.accessToken, response.data.refreshToken);
      setUser({ id: response.data.user.id, email: response.data.user.email });
    } catch (err) {
      setError('No pudimos registrarte.');
    }
  };

  return (
    <ScreenContainer>
      <Text style={styles.title}>Crear cuenta</Text>
      <TextInput style={styles.input} placeholder="Nombre" value={name} onChangeText={setName} />
      <TextInput style={styles.input} placeholder="Email" autoCapitalize="none" value={email} onChangeText={setEmail} />
      <TextInput style={styles.input} placeholder="Contraseña" secureTextEntry value={password} onChangeText={setPassword} />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Pressable style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>Registrarme</Text>
      </Pressable>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 24, fontWeight: '700', marginBottom: 16 },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#111827',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontWeight: '600' },
  error: { color: '#EF4444', marginBottom: 8 },
});
