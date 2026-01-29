import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { ScreenContainer } from '../components/ScreenContainer';
import { useAssignToMe, useConfirmPact, useDeletePact, useMarkDone, usePact } from '../services/queries';
import { useAuthStore } from '../stores/authStore';

export function PactDetailScreen({ route, navigation }: { route: any; navigation: any }) {
  const householdId = useAuthStore((state) => state.selectedHouseholdId) ?? '';
  const { pactId } = route.params;
  const { data } = usePact(householdId, pactId);
  const assignMutation = useAssignToMe(householdId, pactId);
  const markDoneMutation = useMarkDone(householdId, pactId);
  const confirmMutation = useConfirmPact(householdId, pactId);
  const deleteMutation = useDeletePact(householdId, pactId);

  if (!data) {
    return (
      <ScreenContainer>
        <Text>Cargando...</Text>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <Text style={styles.title}>{data.title}</Text>
      <Text style={styles.meta}>Estado: {data.status}</Text>
      {data.dueAt ? <Text style={styles.meta}>Vence: {new Date(data.dueAt).toLocaleString()}</Text> : null}
      {data.notes ? <Text style={styles.notes}>{data.notes}</Text> : null}
      <View style={styles.buttons}>
        <Pressable style={styles.button} onPress={() => assignMutation.mutate()}>
          <Text style={styles.buttonText}>Me encargo</Text>
        </Pressable>
        {data.status !== 'DONE' ? (
          <Pressable style={styles.button} onPress={() => markDoneMutation.mutate()}>
            <Text style={styles.buttonText}>Marcar como hecho</Text>
          </Pressable>
        ) : null}
        {data.requiresConfirmation && data.status === 'DONE' && !data.confirmedAt ? (
          <Pressable style={styles.button} onPress={() => confirmMutation.mutate()}>
            <Text style={styles.buttonText}>Confirmar</Text>
          </Pressable>
        ) : null}
        <Pressable style={styles.secondary} onPress={() => navigation.navigate('PactEdit', { pactId })}>
          <Text style={styles.secondaryText}>Editar</Text>
        </Pressable>
        <Pressable
          style={styles.delete}
          onPress={() =>
            Alert.alert('Eliminar pacto', '¿Seguro que deseas eliminarlo?', [
              { text: 'Cancelar', style: 'cancel' },
              {
                text: 'Eliminar',
                style: 'destructive',
                onPress: async () => {
                  await deleteMutation.mutateAsync();
                  navigation.goBack();
                },
              },
            ])
          }
        >
          <Text style={styles.deleteText}>Eliminar</Text>
        </Pressable>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 24, fontWeight: '700', marginBottom: 8 },
  meta: { color: '#6B7280', marginBottom: 4 },
  notes: { marginTop: 8, marginBottom: 12 },
  buttons: { gap: 10 },
  button: {
    backgroundColor: '#111827',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontWeight: '600' },
  secondary: {
    padding: 12,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  secondaryText: { color: '#111827', fontWeight: '600' },
  delete: {
    padding: 12,
    borderRadius: 10,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
  },
  deleteText: { color: '#B91C1C', fontWeight: '600' },
});
