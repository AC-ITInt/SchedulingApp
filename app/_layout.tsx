import { Slot, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
    <View style={{ flex: 1 }}>
      <Slot />
      {checkingAuth && (
        <View style={{
          ...StyleSheet.absoluteFillObject,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'rgba(255,255,255,0.7)'
        }}>
          <ActivityIndicator size="large" />
        </View>
      )}
    </View>
  );
}