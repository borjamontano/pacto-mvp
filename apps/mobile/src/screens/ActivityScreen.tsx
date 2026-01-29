import { FlatList, StyleSheet, Text, View } from 'react-native';
import { ScreenContainer } from '../components/ScreenContainer';
import { useActivity } from '../services/queries';
import { useAuthStore } from '../stores/authStore';

const typeLabels: Record<string, string> = {
  CREATED: 'creó un pacto',
  UPDATED: 'actualizó un pacto',
  ASSIGNED: 'asignó un pacto',
  UNASSIGNED: 'liberó un pacto',
  STATUS_CHANGED: 'cambió el estado',
  DONE: 'marcó hecho',
  CONFIRMED: 'confirmó',
  COMMENT: 'comentó',
};

export function ActivityScreen() {
  const householdId = useAuthStore((state) => state.selectedHouseholdId) ?? '';
  const { data } = useActivity(householdId);

  return (
    <ScreenContainer>
      <Text style={styles.title}>Actividad</Text>
      <FlatList
        data={data?.items ?? []}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.message}>
              {item.byUser?.name ?? 'Alguien'} {typeLabels[item.type] ?? 'actualizó'} {item.pact?.title}
            </Text>
            <Text style={styles.time}>{new Date(item.createdAt).toLocaleString()}</Text>
          </View>
        )}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 20, fontWeight: '700', marginBottom: 12 },
  card: {
    padding: 12,
    borderRadius: 10,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 10,
  },
  message: { fontSize: 14, color: '#111827' },
  time: { fontSize: 12, color: '#6B7280', marginTop: 4 },
});
