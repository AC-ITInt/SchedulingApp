import React from 'react';
import { View, StyleSheet } from 'react-native';
import CalendarView from '@/components/CalendarView';
import Sidebar from '@/components/Sidebar';

export default function App() {
  return (
    <View style={styles.container}>
      <Sidebar />
      <View style={styles.mainContent}>
        <CalendarView />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row', // Sidebar and main content side by side
    height: '100%',
  },
  mainContent: {
    flex: 1,
    padding: 16,
  },
});