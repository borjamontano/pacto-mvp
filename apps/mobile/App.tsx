import { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { RootNavigator } from './src/navigation/RootNavigator';
import { useAuthStore } from './src/stores/authStore';
import { devicesApi } from './src/services/api';

const queryClient = new QueryClient();

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

async function registerForPushNotifications() {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== 'granted') {
    return null;
  }
  const token = await Notifications.getExpoPushTokenAsync();
  return token.data;
}

export default function App() {
  const hydrate = useAuthStore((state) => state.hydrate);
  const accessToken = useAuthStore((state) => state.accessToken);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (!accessToken) return;
    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.DEFAULT,
      });
    }

    registerForPushNotifications().then((token) => {
      if (token) {
        devicesApi.register({
          expoPushToken: token,
          platform: Platform.OS === 'ios' ? 'ios' : 'android',
        });
      }
    });
  }, [accessToken]);

  return (
    <QueryClientProvider client={queryClient}>
      <RootNavigator />
    </QueryClientProvider>
  );
}
