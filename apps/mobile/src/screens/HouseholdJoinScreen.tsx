import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput } from 'react-native';
import { ScreenContainer } from '../components/ScreenContainer';
import { useJoinHousehold } from '../services/queries';
import { useAuthStore } from '../stores/authStore';

export function HouseholdJoinScreen() {
  const [inviteCode, setInviteCode] = useState('');
  const mutation = useJoinHousehold();
  const setSelectedHouseholdId = useAuthStore((state) => state.setSelectedHouseholdId);

  const handleJoin = async () => {
    const result = await mutation.mutateAsync({ inviteCode });
    if (result?.householdId) {
      await setSelectedHouseholdId(result.householdId);
    }
  };

  return (
    <ScreenContainer>
      <Text style={styles.title}>Unirme con código</Text>
      <TextInput style={styles.input} placeholder="Código de invitación" value={inviteCode} onChangeText={setInviteCode} />
      <Pressable style={styles.button} onPress={handleJoin}>
        <Text style={styles.buttonText}>Unirme</Text>
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
