import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';


export default function Settings() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogoutPress = () => {
        setLoading(true);
            (async () => {
              try {
                const token = await AsyncStorage.getItem('token');
                if (!token) throw new Error('No auth token');
        
                const res = await fetch(
                  'http://devcs1.central.edu/ScheduleAppAC/logout.php',
                  {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      'Authorization': `Bearer ${token}`,
                    }
                  }
                );
                const data = await res.json();
                if (res.ok) {
                    if (data.success) {
                        await AsyncStorage.removeItem('token');
                        router.dismissAll();
                        router.replace('/login');
                    }
                } else {
                    throw new Error(data.error || 'Failed to logout');
                }
              } catch (e: any) {
                setError(e.message);
              } finally {
                setLoading(false);
              }
            })();
    }

    if (loading) {
        return (
            <View style={styles.container}>
                <Text>Loading…</Text>
            </View>
        );
    }
    
    return (
    <View style={styles.container}>
        <Text style={styles.title}>Settings</Text>
        {!!error && <Text style={styles.error}>{error}</Text>}
        <TouchableOpacity style={[styles.button, {backgroundColor: 'red'}]} onPress={handleLogoutPress}>
            <Text style={styles.buttonText}>Log Out</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => router.back()}>
            <Text  style={styles.buttonText}>Go Back</Text>
        </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
    container: {
        flex: 1, 
        padding: 24, 
        justifyContent: 'center', 
        backgroundColor: '#fff' 
    },
    title: { 
        fontSize: 28, 
        marginBottom: 16, 
        textAlign: 'center' 
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 6,
        padding: 10,
        marginBottom: 12,
    },
    error: { 
        color: 'red', 
        marginBottom: 12, 
        textAlign: 'center' 
    },
    footer: { 
        flexDirection: 'row', 
        justifyContent: 'center', 
        marginTop: 16 
    },
    button: {
      width: '100%',
      backgroundColor: '#3b82f6',
      padding: 12,
      borderRadius: 4,
      alignItems: 'center',
      marginBottom: 16,
    },
    buttonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '500',
    },
});