import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { ScreenContainer } from '../components/ScreenContainer';
import { useHouseholds } from '../services/queries';
import { useAuthStore } from '../stores/authStore';

export function HouseholdSelectScreen({ navigation }: { navigation: any }) {
  const { data } = useHouseholds();
  const setSelectedHouseholdId = useAuthStore((state) => state.setSelectedHouseholdId);

  return (
    <ScreenContainer>
      <Text style={styles.title}>¿Quién se encarga?</Text>
      <Text style={styles.subtitle}>Elige tu hogar para coordinar.</Text>
      <FlatList
        data={data ?? []}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Pressable style={styles.card} onPress={() => setSelectedHouseholdId(item.id)}>
            <Text style={styles.cardTitle}>{item.name}</Text>
            <Text style={styles.cardSubtitle}>{item.members?.length ?? 0} miembros</Text>
          </Pressable>
        )}
      />
      <View style={styles.actions}>
        <Pressable style={styles.secondaryButton} onPress={() => navigation.navigate('HouseholdCreate')}>
          <Text style={styles.secondaryText}>Crear hogar</Text>
        </Pressable>
        <Pressable style={styles.secondaryButton} onPress={() => navigation.navigate('HouseholdJoin')}>
          <Text style={styles.secondaryText}>Unirme con código</Text>
        </Pressable>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 24, fontWeight: '700' },
  subtitle: { color: '#6B7280', marginBottom: 16 },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 12,
  },
  cardTitle: { fontSize: 16, fontWeight: '600' },
  cardSubtitle: { fontSize: 12, color: '#6B7280' },
  actions: { marginTop: 12, gap: 8 },
  secondaryButton: {
    padding: 12,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  secondaryText: { color: '#111827', fontWeight: '600' },
});
