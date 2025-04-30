// app/create-account.tsx
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

export default function CreateAccountScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleCreate = async () => {
    setErrorMsg('');
    try {
      const response = await fetch(
        'http://devcs1.central.edu/ScheduleAppAC/create_account.php',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        }
      );
      const data = await response.json();

      if (response.ok && data.success && data.token) {
        await AsyncStorage.setItem('token', data.token);
        router.replace('/');
      } else {
        setErrorMsg(data.error || 'Account creation failed');
      }
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign Up</Text>
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
        placeholder="Password (min 6 chars)"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <Button title="Create Account" onPress={handleCreate} />
      <View style={styles.footer}>
        <Text>Already have an account? </Text>
        <Link href="/login" asChild>
          <TouchableOpacity>
            <Text style={styles.link}>Log In</Text>
          </TouchableOpacity>
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: 'center' },
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
