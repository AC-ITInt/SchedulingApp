// app/create-task.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, useRouter } from 'expo-router';
// import the global timelineEvents
import { timelineEvents } from '../components/CalendarView';

interface TaskEvent {
  title: string;
  summary: string;
  start: string;
  end: string;
}

export default function CreateTaskScreen() {
  const { prompt } = useLocalSearchParams();
  // use the imported timelineEvents directly
  const initialEvents: TaskEvent[] = Array.isArray(timelineEvents)
    ? timelineEvents
    : [];
  const [events, setEvents] = useState<TaskEvent[]>(initialEvents);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    (async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (!token) throw new Error('No auth token');

        const res = await fetch(
          'http://devcs1.central.edu/ScheduleAppAC/create_task.php',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
              userPrompt: prompt,
              timelineEvents: initialEvents,
            }),
          }
        );
        const data = await res.json();
        if (res.ok && Array.isArray(data)) {
          setEvents(data);
        } else {
          throw new Error(data.error || 'Failed to fetch events');
        }
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const updateEvent = (idx: number, key: keyof TaskEvent, val: string) => {
    const copy = [...events];
    copy[idx] = { ...copy[idx], [key]: val };
    setEvents(copy);
  };

  const removeEvent = (idx: number) => {
    setEvents(events.filter((_, i) => i !== idx));
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <Text>Loading suggestions…</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {!!error && <Text style={styles.error}>{error}</Text>}

      {events.map((ev, i) => (
        <View key={i} style={styles.card}>
          <TextInput
            style={styles.input}
            value={ev.title}
            onChangeText={(t) => updateEvent(i, 'title', t)}
          />
          <TextInput
            style={styles.input}
            value={ev.summary}
            onChangeText={(t) => updateEvent(i, 'summary', t)}
          />
          <TextInput
            style={styles.input}
            value={ev.start}
            onChangeText={(t) => updateEvent(i, 'start', t)}
          />
          <TextInput
            style={styles.input}
            value={ev.end}
            onChangeText={(t) => updateEvent(i, 'end', t)}
          />
          <TouchableOpacity onPress={() => removeEvent(i)}>
            <Text style={styles.remove}>Remove</Text>
          </TouchableOpacity>
        </View>
      ))}

      <View style={styles.buttons}>
        <Button title="Cancel" onPress={() => router.back()} />
        <Button
          title="Confirm"
          onPress={() => {
            // you could POST the edited `events` back to your API here
            router.replace('/');
          }}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  error: { color: 'red', marginBottom: 16 },
  card: {
    borderWidth: 1,
    borderRadius: 6,
    padding: 12,
    marginBottom: 12,
  },
  input: {
    borderBottomWidth: 1,
    marginBottom: 8,
    padding: 4,
  },
  remove: { color: 'red', marginTop: 4 },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
});
