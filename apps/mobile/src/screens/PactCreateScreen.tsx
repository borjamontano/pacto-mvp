import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { ScreenContainer } from '../components/ScreenContainer';
import { useCreatePact } from '../services/queries';
import { useAuthStore } from '../stores/authStore';

export function PactCreateScreen({ navigation }: { navigation: any }) {
  const householdId = useAuthStore((state) => state.selectedHouseholdId) ?? '';
  const mutation = useCreatePact(householdId);
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [requiresConfirmation, setRequiresConfirmation] = useState(false);

  const handleCreate = async () => {
    await mutation.mutateAsync({ title, notes, requiresConfirmation });
    navigation.goBack();
  };

  return (
    <ScreenContainer>
      <Text style={styles.title}>Nuevo pacto</Text>
      <TextInput style={styles.input} placeholder="Título" value={title} onChangeText={setTitle} />
      <TextInput style={styles.input} placeholder="Notas" value={notes} onChangeText={setNotes} />
      <View style={styles.toggleRow}>
        <Text>Requiere confirmación</Text>
        <Pressable
          style={[styles.toggle, requiresConfirmation ? styles.toggleOn : styles.toggleOff]}
          onPress={() => setRequiresConfirmation((prev) => !prev)}
        >
          <Text style={styles.toggleText}>{requiresConfirmation ? 'Sí' : 'No'}</Text>
        </Pressable>
      </View>
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
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  toggle: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  toggleOn: { backgroundColor: '#111827' },
  toggleOff: { backgroundColor: '#E5E7EB' },
  toggleText: { color: '#fff' },
  button: {
    backgroundColor: '#111827',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontWeight: '600' },
});
