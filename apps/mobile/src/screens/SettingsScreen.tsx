import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ScreenContainer } from '../components/ScreenContainer';
import { useHouseholds } from '../services/queries';
import { useAuthStore } from '../stores/authStore';

export function SettingsScreen() {
  const { data } = useHouseholds();
  const setSelectedHouseholdId = useAuthStore((state) => state.setSelectedHouseholdId);
  const logout = useAuthStore((state) => state.logout);

  return (
    <ScreenContainer>
      <Text style={styles.title}>Settings</Text>
      <Text style={styles.section}>Hogares</Text>
      {data?.map((household: any) => (
        <Pressable key={household.id} style={styles.household} onPress={() => setSelectedHouseholdId(household.id)}>
          <Text>{household.name}</Text>
        </Pressable>
      ))}
      <View style={styles.footer}>
        <Pressable style={styles.logoutButton} onPress={() => logout()}>
          <Text style={styles.logoutText}>Cerrar sesión</Text>
        </Pressable>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 20, fontWeight: '700', marginBottom: 12 },
  section: { fontSize: 14, fontWeight: '600', marginBottom: 8 },
  household: {
    padding: 12,
    borderRadius: 10,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 8,
  },
  footer: { marginTop: 16 },
  logoutButton: {
    backgroundColor: '#EF4444',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  logoutText: { color: '#fff', fontWeight: '600' },
});
