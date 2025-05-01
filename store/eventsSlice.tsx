import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Alert } from 'react-native';
import { CalendarUtils } from 'react-native-calendars';

// Helper to get formatted date
const getDate = (offset = 0) => {
  const today = new Date();
  return CalendarUtils.getCalendarDateString(
    new Date(today.setDate(today.getDate() + offset))
  );
};

// Your initial flat list of events
const initialEvents = [
  {
    id: '1',
    start: `${getDate()} 09:20:00`, 
    end:   `${getDate()} 13:00:00`, 
    title: 'Merge Request',
    summary: 'React Native Calendars',
    color: '#e6add8',
  },
  {
    id: '2',
    start: `${getDate(1)} 09:15:00`, 
    end:   `${getDate(1)} 10:30:00`, 
    title: 'Meeting A',
    summary: 'Summary for meeting A',
    color: '#e6add8',
  },
  {
    id: '3',
    start: `${getDate(1)} 09:30:00`, 
    end:   `${getDate(1)} 10:30:00`, 
    title: 'Meeting B',
    summary: 'Summary for meeting B',
    color: '#e6add8',
  },
  {
    id: '4',
    start: `${getDate(1)} 10:40:00`, 
    end:   `${getDate(1)} 11:10:00`, 
    title: 'Meeting D',
    summary: 'Summary for meeting D',
    color: '#e6add8',
  },
];

// Group events by date string (YYYY-MM-DD)
const groupByDate = (events) =>
  events.reduce((acc, event) => {
    const date = event.start.split(' ')[0];
    if (!acc[date]) acc[date] = [];
    acc[date].push(event);
    return acc;
  }, {} as Record<string, typeof initialEvents>);

const initialState = {
  eventsByDate: groupByDate(initialEvents),
};

const eventsSlice = createSlice({
  name: 'events',
  initialState,
  reducers: {
    setEventsByDate(state, action: PayloadAction<Record<string, typeof initialEvents>>) {
      state.eventsByDate = action.payload;
    },
    addEvent(state, action: PayloadAction<any>) {
      const event = action.payload;
      Alert.alert(event.title, 'Task created successfully!');
      const date = event.start.split(' ')[0];
      if (!state.eventsByDate[date]) state.eventsByDate[date] = [];
      state.eventsByDate[date].push(event);
    },
    updateEvent(state, action: PayloadAction<any>) {
      const event = action.payload;
      const date = event.start.split(' ')[0];
      state.eventsByDate[date] = state.eventsByDate[date].map(e =>
        e.id === event.id ? event : e
      );
    },
    removeEvent(state, action: PayloadAction<{ id: string; date: string }>) {
      const { id, date } = action.payload;
      state.eventsByDate[date] = state.eventsByDate[date].filter(e => e.id !== id);
    },
  },
});

export const { setEventsByDate, addEvent, updateEvent, removeEvent } = eventsSlice.actions;
export default eventsSlice.reducer;
