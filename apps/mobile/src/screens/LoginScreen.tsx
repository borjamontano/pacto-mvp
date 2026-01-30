import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput } from 'react-native';
import { ScreenContainer } from '../components/ScreenContainer';
import { authApi } from '../services/api';
import { useAuthStore } from '../stores/authStore';

export function LoginScreen({ navigation }: { navigation: any }) {
  const [email, setEmail] = useState('demo@pacto.app');
  const [password, setPassword] = useState('demo1234');
  const [error, setError] = useState('');

  const setTokens = useAuthStore((state) => state.setTokens);
  const setUser = useAuthStore((state) => state.setUser);

  const handleLogin = async () => {
    setError('');

    try {
      const data = await authApi.login({ email, password });

      // ✅ Store tokens (assumes store signature: setTokens(access, refresh))
      setTokens(data.accessToken, data.refreshToken);

      // ✅ Store minimal user
      setUser({ id: data.user.id, email: data.user.email });
    } catch (err: any) {
      console.log('LOGIN ERROR:', err?.message ?? err);
      setError('No pudimos iniciar sesión.');
    }
  };

  return (
    <ScreenContainer>
      <Text style={styles.title}>PACTO</Text>
      <Text style={styles.subtitle}>Tasks that get confirmed, not assumed.</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        style={styles.input}
        placeholder="Contraseña"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Pressable style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Entrar</Text>
      </Pressable>

      <Pressable onPress={() => navigation.navigate('Register')}>
        <Text style={styles.link}>Crear cuenta</Text>
      </Pressable>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 28, fontWeight: '700', marginBottom: 8 },
  subtitle: { color: '#6B7280', marginBottom: 24 },
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
    marginBottom: 12,
  },
  buttonText: { color: '#fff', fontWeight: '600' },
  link: { color: '#2563EB', marginTop: 8 },
  error: { color: '#EF4444', marginBottom: 8 },
});
