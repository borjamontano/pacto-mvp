import { Pressable, StyleSheet, Text, View } from 'react-native';
import { PactStatus } from '@pacto/shared';

export type PactCardProps = {
  title: string;
  assignedTo?: string | null;
  dueAt?: string | null;
  requiresConfirmation?: boolean;
  status: PactStatus;
  onPress?: () => void;
  actionLabel?: string;
  onActionPress?: () => void;
};

export function PactCard({
  title,
  assignedTo,
  dueAt,
  requiresConfirmation,
  status,
  onPress,
  actionLabel,
  onActionPress,
}: PactCardProps) {
  return (
    <Pressable onPress={onPress} style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {requiresConfirmation ? <Text style={styles.confirmBadge}>Confirmación</Text> : null}
      </View>
      <View style={styles.meta}>
        <Text style={styles.metaText}>{assignedTo ? `Asignado` : 'Sin asignar'}</Text>
        {dueAt ? <Text style={styles.metaText}>{new Date(dueAt).toLocaleString()}</Text> : null}
      </View>
      <View style={styles.footer}>
        <Text style={styles.status}>{status}</Text>
        {actionLabel && onActionPress ? (
          <Pressable onPress={onActionPress} style={styles.actionButton}>
            <Text style={styles.actionText}>{actionLabel}</Text>
          </Pressable>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E4E4E7',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  confirmBadge: {
    fontSize: 12,
    color: '#7C3AED',
    fontWeight: '600',
  },
  meta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  metaText: {
    fontSize: 12,
    color: '#6B7280',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    alignItems: 'center',
  },
  status: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '600',
  },
  actionButton: {
    backgroundColor: '#111827',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  actionText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
});
