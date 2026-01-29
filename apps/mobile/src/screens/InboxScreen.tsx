import { ScrollView, StyleSheet, Text } from 'react-native';
import { ScreenContainer } from '../components/ScreenContainer';
import { PactCard } from '../components/PactCard';
import { useAssignToMe, usePacts } from '../services/queries';
import { useAuthStore } from '../stores/authStore';

function InboxCard({ pact, householdId, navigation }: { pact: any; householdId: string; navigation: any }) {
  const assignMutation = useAssignToMe(householdId, pact.id);
  return (
    <PactCard
      title={pact.title}
      assignedTo={pact.assignedToUserId}
      dueAt={pact.dueAt}
      requiresConfirmation={pact.requiresConfirmation}
      status={pact.status}
      onPress={() => navigation.navigate('PactDetail', { pactId: pact.id })}
      actionLabel="Me encargo"
      onActionPress={() => assignMutation.mutate()}
    />
  );
}

export function InboxScreen({ navigation }: { navigation: any }) {
  const householdId = useAuthStore((state) => state.selectedHouseholdId) ?? '';
  const { data } = usePacts(householdId, 'unassigned');

  return (
    <ScreenContainer>
      <Text style={styles.title}>Inbox</Text>
      <ScrollView>
        {data?.map((pact: any) => (
          <InboxCard key={pact.id} pact={pact} householdId={householdId} navigation={navigation} />
        ))}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 20, fontWeight: '700', marginBottom: 12 },
});
