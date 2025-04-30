// app/login.tsx
import React, { useState } from 'react';
import {
  View,
  TextInput,
  Button,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, Link } from 'expo-router';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async () => {
    setErrorMsg('');
    try {
      const response = await fetch(
        'http://devcs1.central.edu/ScheduleAppAC/login.php',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        }
      );
      const data = await response.json();

      if (response.ok && data.token) {
        await AsyncStorage.setItem('token', data.token);
        // alert (AsyncStorage.getItem('token'));
        // Navigate to index (home) and prevent going back to login
        router.replace('/');
      } else {
        setErrorMsg(data.error || data.message || 'Login failed');
      }
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Log In</Text>
      {!!errorMsg && <Text style={styles.error}>{errorMsg}</Text>}
      <TextInput
        style={styles.input}
        placeholder="Email"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <Button title="Log In" onPress={handleLogin} />
      <View style={styles.footer}>
        <Text>Don't have an account? </Text>
        <Link href="/create-account" asChild>
          <TouchableOpacity>
            <Text style={styles.link}>Sign Up</Text>
          </TouchableOpacity>
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: 'center', backgroundColor: '#f9fafb' },
  title: { fontSize: 28, marginBottom: 16, textAlign: 'center' },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 10,
    marginBottom: 12,
  },
  error: { color: 'red', marginBottom: 12, textAlign: 'center' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 16 },
  link: { color: '#0066cc', fontWeight: '500' },
});
