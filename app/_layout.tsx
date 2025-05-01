import { Slot, Stack, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet, StatusBar, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Provider } from 'react-redux';
import { store } from '../store';

export default function RootLayout() {
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    async function checkToken() {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        // Alert.alert('No token found', 'Please log in again.');
        router.replace('/login');
        setCheckingAuth(false);
        return;
      }
      try {
        const response = await fetch('http://devcs1.central.edu/ScheduleAppAC/validate_token.php', {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!response.ok) {
          // Alert.alert('Token Invalid', 'Please log in again.');
          await AsyncStorage.removeItem('token');
          router.replace('/login');
        }
      } catch {
        await AsyncStorage.removeItem('token');
        router.replace('/login');
      }
      setCheckingAuth(false);
    }
    checkToken();
  }, []);

  return (
    <Provider store={store}>
      <View style={{ flex: 1 }}>
        <StatusBar barStyle="dark-content" />
        <Stack>
          <Stack.Screen name="login" options={{ headerShown: false }} />
          <Stack.Screen name="create-account" options={{ headerShown: false }} />
          <Stack.Screen name="index" options={{ title: 'Schedule App', headerShown: false }} />
          <Stack.Screen name="create-task" options={{ title: 'Create Task' }} />
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