import React from 'react';
import { View, StyleSheet, Text, Dimensions } from 'react-native';
import CalendarView from '@/components/CalendarView';
import Sidebar from '@/components/Sidebar';

export default function App() {
  return (
    <View style={styles.container}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', margin: 16, color: '#374151', textAlign: 'center' }}>
        Schedule App
      </Text>
      <Sidebar />
      <CalendarView />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 55,
    display: 'flex', //Flex: 1 is not working in expo go
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height - 55,
    backgroundColor: '#fff',
  },
  mainContent: {
    padding: 16,
  },
});