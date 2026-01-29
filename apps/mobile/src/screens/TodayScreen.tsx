import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ScreenContainer } from '../components/ScreenContainer';
import { PactCard } from '../components/PactCard';
import { usePacts } from '../services/queries';
import { useAuthStore } from '../stores/authStore';

export function TodayScreen({ navigation }: { navigation: any }) {
  const householdId = useAuthStore((state) => state.selectedHouseholdId) ?? '';
  const overdue = usePacts(householdId, 'overdue');
  const today = usePacts(householdId, 'today');
  const tomorrow = usePacts(householdId, 'tomorrow');

  return (
    <ScreenContainer>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Hoy</Text>
        <Pressable style={styles.newButton} onPress={() => navigation.navigate('PactCreate')}>
          <Text style={styles.newButtonText}>Nuevo pacto</Text>
        </Pressable>
      </View>
      <ScrollView>
        <Text style={styles.sectionTitle}>Urgente</Text>
        {overdue.data?.map((pact: any) => (
          <PactCard
            key={pact.id}
            title={pact.title}
            assignedTo={pact.assignedToUserId}
            dueAt={pact.dueAt}
            requiresConfirmation={pact.requiresConfirmation}
            status={pact.status}
            onPress={() => navigation.navigate('PactDetail', { pactId: pact.id })}
          />
        ))}
        <Text style={styles.sectionTitle}>Hoy</Text>
        {today.data?.map((pact: any) => (
          <PactCard
            key={pact.id}
            title={pact.title}
            assignedTo={pact.assignedToUserId}
            dueAt={pact.dueAt}
            requiresConfirmation={pact.requiresConfirmation}
            status={pact.status}
            onPress={() => navigation.navigate('PactDetail', { pactId: pact.id })}
          />
        ))}
        <Text style={styles.sectionTitle}>Mañana</Text>
        {tomorrow.data?.map((pact: any) => (
          <PactCard
            key={pact.id}
            title={pact.title}
            assignedTo={pact.assignedToUserId}
            dueAt={pact.dueAt}
            requiresConfirmation={pact.requiresConfirmation}
            status={pact.status}
            onPress={() => navigation.navigate('PactDetail', { pactId: pact.id })}
          />
        ))}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 20, fontWeight: '700' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  newButton: { backgroundColor: '#111827', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  newButtonText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginTop: 12, marginBottom: 8 },
});
