import { Stack, useRouter, usePathname } from 'expo-router';
import { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet, StatusBar, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Provider } from 'react-redux';
import { store } from '../store';

export default function RootLayout() {
  const router = useRouter();
  const pathname = usePathname();
  const [checkingAuth, setCheckingAuth] = useState(true);

  async function checkToken() {
    const token = await AsyncStorage.getItem('token');
    if (!token) {
      router.replace('/login');
      setCheckingAuth(false);
      return;
    }
    try {
      const response = await fetch('http://devcs1.central.edu/ScheduleAppAC/validate_token.php', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) {
        await AsyncStorage.removeItem('token');
        router.replace('/login');
      }
    } catch {
      await AsyncStorage.removeItem('token');
      router.replace('/login');
    }
    setCheckingAuth(false);
  }

  useEffect(() => {
    // Exclude starting screens from token checking
    if (pathname === '/create-account' || pathname === '/login') {
      setCheckingAuth(false);
      return;
    }
    checkToken();
  }, [pathname]);

  return (
    <Provider store={store}>
      <View style={{ flex: 1 }}>
        <StatusBar barStyle="dark-content" />
        <Stack>
          <Stack.Screen name="login" options={{ headerShown: false }} />
          <Stack.Screen name="create-account" options={{ headerShown: false }} />
          <Stack.Screen name="index" options={{ title: 'Home', headerShown: false }} />
          <Stack.Screen name="create-task" options={{ title: 'Create Task' }} />
          <Stack.Screen name="settings" options={{ title: 'Settings' }} />
        </Stack>
        {checkingAuth && (
          <View style={{
            ...StyleSheet.absoluteFillObject,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#fff'
          }}>
            <ActivityIndicator size="large" />
          </View>
        )}
      </View>
    </Provider>
  );
}