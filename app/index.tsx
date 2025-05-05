import React, { useEffect } from 'react';
import { View, StyleSheet, Text, Dimensions } from 'react-native';
import CalendarView from '@/components/NewCalendarView';
import Sidebar from '@/components/Sidebar';
import { useDispatch } from 'react-redux';
import { loadEventsFromStorage } from '../store/eventsSlice';
import type { AppDispatch } from '../store';

export default function App() {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(loadEventsFromStorage());
  }, [dispatch]);

  return (
    <View style={styles.container}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', margin: 16, color: '#374151', textAlign: 'center' }}>
        Tasker
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
});