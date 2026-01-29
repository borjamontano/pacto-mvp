import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput } from 'react-native';
import { ScreenContainer } from '../components/ScreenContainer';
import { useCreateHousehold } from '../services/queries';
import { useAuthStore } from '../stores/authStore';

export function HouseholdCreateScreen() {
  const [name, setName] = useState('');
  const mutation = useCreateHousehold();
  const setSelectedHouseholdId = useAuthStore((state) => state.setSelectedHouseholdId);

  const handleCreate = async () => {
    const result = await mutation.mutateAsync({ name });
    if (result?.id) {
      await setSelectedHouseholdId(result.id);
    }
  };

  return (
    <ScreenContainer>
      <Text style={styles.title}>Nuevo hogar</Text>
      <TextInput style={styles.input} placeholder="Nombre del hogar" value={name} onChangeText={setName} />
      <Pressable style={styles.button} onPress={handleCreate}>
        <Text style={styles.buttonText}>Crear</Text>
      </Pressable>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 24, fontWeight: '700', marginBottom: 12 },
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
});
