import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput } from 'react-native';
import { ScreenContainer } from '../components/ScreenContainer';
import { usePact, useUpdatePact } from '../services/queries';
import { useAuthStore } from '../stores/authStore';

export function PactEditScreen({ route, navigation }: { route: any; navigation: any }) {
  const householdId = useAuthStore((state) => state.selectedHouseholdId) ?? '';
  const { pactId } = route.params;
  const { data } = usePact(householdId, pactId);
  const mutation = useUpdatePact(householdId, pactId);
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (data) {
      setTitle(data.title ?? '');
      setNotes(data.notes ?? '');
    }
  }, [data]);

  const handleSave = async () => {
    await mutation.mutateAsync({ title, notes });
    navigation.goBack();
  };

  return (
    <ScreenContainer>
      <Text style={styles.title}>Editar pacto</Text>
      <TextInput style={styles.input} placeholder="Título" value={title} onChangeText={setTitle} />
      <TextInput style={styles.input} placeholder="Notas" value={notes} onChangeText={setNotes} />
      <Pressable style={styles.button} onPress={handleSave}>
        <Text style={styles.buttonText}>Guardar</Text>
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
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontWeight: '600' },
});
