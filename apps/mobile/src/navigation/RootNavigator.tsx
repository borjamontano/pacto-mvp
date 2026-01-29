import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuthStore } from '../stores/authStore';
import { LoginScreen } from '../screens/LoginScreen';
import { RegisterScreen } from '../screens/RegisterScreen';
import { HouseholdSelectScreen } from '../screens/HouseholdSelectScreen';
import { HouseholdCreateScreen } from '../screens/HouseholdCreateScreen';
import { HouseholdJoinScreen } from '../screens/HouseholdJoinScreen';
import { TodayScreen } from '../screens/TodayScreen';
import { InboxScreen } from '../screens/InboxScreen';
import { ActivityScreen } from '../screens/ActivityScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { PactDetailScreen } from '../screens/PactDetailScreen';
import { PactCreateScreen } from '../screens/PactCreateScreen';
import { PactEditScreen } from '../screens/PactEditScreen';

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  HouseholdSelect: undefined;
  HouseholdCreate: undefined;
  HouseholdJoin: undefined;
  MainTabs: undefined;
  PactDetail: { pactId: string };
  PactCreate: undefined;
  PactEdit: { pactId: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

function Tabs() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Today" component={TodayScreen} />
      <Tab.Screen name="Inbox" component={InboxScreen} />
      <Tab.Screen name="Activity" component={ActivityScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

export function RootNavigator() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const selectedHouseholdId = useAuthStore((state) => state.selectedHouseholdId);

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {!accessToken ? (
          <>
            <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Register" component={RegisterScreen} options={{ title: 'Crear cuenta' }} />
          </>
        ) : !selectedHouseholdId ? (
          <>
            <Stack.Screen
              name="HouseholdSelect"
              component={HouseholdSelectScreen}
              options={{ title: 'Tus hogares' }}
            />
            <Stack.Screen name="HouseholdCreate" component={HouseholdCreateScreen} options={{ title: 'Nuevo hogar' }} />
            <Stack.Screen name="HouseholdJoin" component={HouseholdJoinScreen} options={{ title: 'Unirte' }} />
          </>
        ) : (
          <>
            <Stack.Screen name="MainTabs" component={Tabs} options={{ headerShown: false }} />
            <Stack.Screen name="PactDetail" component={PactDetailScreen} options={{ title: 'Pacto' }} />
            <Stack.Screen name="PactCreate" component={PactCreateScreen} options={{ title: 'Nuevo pacto' }} />
            <Stack.Screen name="PactEdit" component={PactEditScreen} options={{ title: 'Editar pacto' }} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
