import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import CalendarView from '@/components/CalendarView';
import Sidebar from '@/components/Sidebar';

export default function App() {
  return (
    <View>
      <View style={styles.container}>
        <Sidebar />
        <CalendarView />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    display: 'flex', //Flex: 1 is not working in expo go
    width: '100%',
    minWidth: 100,
    minHeight: 900,
  },
  mainContent: {
    padding: 16,
  },
});