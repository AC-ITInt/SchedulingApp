// Sidebar.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';

const { width } = Dimensions.get('window');
const DRAWER_WIDTH = Math.min(320, width * 0.8);

export default function Sidebar() {
  const [prompt, setPrompt] = useState('');
  const [open, setOpen] = useState(false);
  const translateX = useState(new Animated.Value(DRAWER_WIDTH))[0];
  const router = useRouter();

  // 1) pull eventsByDate from redux
  const eventsByDate = useSelector((state: RootState) => state.events.eventsByDate);
  // 2) flatten into a single array
  const timelineEvents = Object.values(eventsByDate).flat();

  const openDrawer = () => {
    setOpen(true);
    Animated.timing(translateX, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
    }).start();
  };

  const closeDrawer = () => {
    Animated.timing(translateX, {
      toValue: DRAWER_WIDTH,
      duration: 250,
      useNativeDriver: true,
    }).start(() => setOpen(false));
  };

  const handleSubmit = () => {
    // send redux events instead of imported ones
    router.push({
      pathname: '/create-task',
      params: {
        prompt,
        timelineEvents: encodeURIComponent(JSON.stringify(timelineEvents)),
      },
    });
    closeDrawer();
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    })}`;
  };

  const now = Date.now();
  const in24h = 24 * 60 * 60 * 1000;

  return (
    <>
      <TouchableOpacity style={styles.drawerToggle} onPress={openDrawer}>
        <Text style={styles.toggleText}>☰</Text>
      </TouchableOpacity>
      {open && (
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={closeDrawer} />
      )}
      <Animated.View style={[styles.drawer, { transform: [{ translateX }] }]}>
        <View>
          <Text style={styles.title}>Create a Task</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Enter task like 'Meeting with Boss at 3pm tomorrow'"
            placeholderTextColor="#9ca3af"
            value={prompt}
            onChangeText={setPrompt}
          />
          <TouchableOpacity style={styles.button} onPress={handleSubmit}>
            <Text style={styles.buttonText}>Create Task</Text>
          </TouchableOpacity>
        </View>

        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Upcoming Events</Text>
          <ScrollView
            style={{ flex: 1 }}
            showsVerticalScrollIndicator
            persistentScrollbar
          >
            {timelineEvents
              .filter(ev => {
                const start = new Date(ev.start).getTime();
                return start > now && start - now <= in24h;
              })
              .map((ev, i) => (
                <View
                  key={i}
                  style={{
                    marginBottom: 8,
                    padding: 8,
                    backgroundColor: '#e5e7eb',
                    borderRadius: 4,
                  }}
                >
                  <Text style={{ marginBottom: 8, color: '#374151' }}>
                    {ev.title}
                    {'\n'}
                    {formatDateTime(ev.start)}
                  </Text>
                </View>
              ))}
          </ScrollView>
        </View>

        <View>
          <TouchableOpacity
            style={[styles.button, { alignSelf: 'flex-end' }]}
            onPress={closeDrawer}
          >
            <Text style={styles.buttonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  drawerToggle: {
    position: 'absolute',
    top: 10,
    right: 16,
    zIndex: 100,
    borderRadius: 20,
    padding: 8,
    elevation: 4,
  },
  toggleText: {
    color: '#000',
    fontSize: 32,
    fontWeight: 'bold',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.2)',
    zIndex: 9998,
  },
  drawer: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: DRAWER_WIDTH,
    backgroundColor: '#f9fafb',
    borderRightWidth: 1,
    borderRightColor: '#e5e7eb',
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 9999,
    justifyContent: 'space-between',
    height: '100%',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
    color: '#374151',
  },
  textInput: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#d1d5db',
    padding: 12,
    borderRadius: 4,
    fontSize: 16,
    marginBottom: 16,
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
