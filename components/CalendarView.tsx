import React, { useState } from 'react';
import { Alert, Modal, View, Text, TextInput, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import {
  ExpandableCalendar,
  TimelineList,
  CalendarProvider,
  CalendarUtils,
} from 'react-native-calendars';
import { useSelector, useDispatch } from 'react-redux';
import { addEvent, updateEvent, removeEvent } from '../store/eventsSlice';
import type { RootState } from '../store';

const EVENT_COLOR = '#e6add8';
const INITIAL_TIME = { hour: 9, minutes: 0 };

const getDate = (offset = 0) => {
  const today = new Date();
  return CalendarUtils.getCalendarDateString(
    new Date(today.setDate(today.getDate() + offset))
  );
};

export default function TimelineCalendarScreen() {
  const eventsByDate = useSelector((state: RootState) => state.events.eventsByDate);
  const dispatch = useDispatch();

  React.useEffect(() => {
    console.log('🔄 eventsByDate updated:', eventsByDate);
  }, [eventsByDate]);

  const [currentDate, setCurrentDate] = useState(getDate());
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [draftEvent, setDraftEvent] = useState(null);
  const [eventTitle, setEventTitle] = useState('');
  const [eventSummary, setEventSummary] = useState('');
  const [selectedStartTime, setSelectedStartTime] = useState(new Date());
  const [selectedEndTime, setSelectedEndTime] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [startTimeSelected, setStartTimeSelected] = useState(true);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [eventToEdit, setEventToEdit] = useState(null);

  const markedDates = {
    [getDate(-1)]: { marked: true },
    [getDate()]: { marked: true },
    [getDate(1)]: { marked: true },
  };

  const handleDateChange = date => setCurrentDate(date);

  const createNewEvent = (timeString, timeObject) => {
    const newEvent = {
      id: Date.now().toString(),
      start: timeString,
      end: `${timeObject.date} ${String(timeObject.hour + 1).padStart(2, '0')}:${String(
        timeObject.minutes
      ).padStart(2, '0')}:00`,
      title: 'New Event',
      summary: 'New Event Summary',
      color: 'white',
    };
    setDraftEvent({ date: timeObject.date, event: newEvent });
    setIsModalVisible(true);
  };

  const approveNewEvent = () => {
    if (draftEvent) {
      const { date, event } = draftEvent;
      const updated = {
        ...event,
        title: eventTitle || event.title,
        summary: eventSummary || event.summary,
        start: `${date} ${selectedStartTime.getHours().toString().padStart(2, '0')}:${selectedStartTime
          .getMinutes()
          .toString()
          .padStart(2, '0')}:00`,
        end: `${date} ${String(selectedEndTime.getHours()).padStart(2, '0')}:${selectedEndTime
          .getMinutes()
          .toString()
          .padStart(2, '0')}:00`,
        color: 'lightgreen',
      };
      dispatch(addEvent(updated));
      resetModal();
    }
  };

  const cancelNewEvent = () => {
    if (draftEvent) {
      dispatch(removeEvent({ id: draftEvent.event.id, date: draftEvent.date }));
      resetModal();
    }
  };

  const openEditModal = (event) => {
    setEventToEdit(event);
    setEventTitle(event.title);
    setEventSummary(event.summary);
    setSelectedStartTime(new Date(event.start));
    setSelectedEndTime(new Date(event.end));
    setIsEditModalVisible(true);
  };

  const handleUpdate = () => {
    if (eventToEdit) {
      const date = eventToEdit.start.split(' ')[0];
      const updated = {
        ...eventToEdit,
        title: eventTitle,
        summary: eventSummary,
        start: `${date} ${selectedStartTime.getHours().toString().padStart(2, '0')}:${selectedStartTime
          .getMinutes()
          .toString()
          .padStart(2, '0')}:00`,
        end: `${date} ${String(selectedEndTime.getHours()).padStart(2, '0')}:${selectedEndTime
          .getMinutes()
          .toString()
          .padStart(2, '0')}:00`,
      };
      dispatch(updateEvent(updated));
      setIsEditModalVisible(false);
    }
  };

  const handleRemove = () => {
    if (eventToEdit) {
      const date = eventToEdit.start.split(' ')[0];
      dispatch(removeEvent({ id: eventToEdit.id, date }));
      setIsEditModalVisible(false);
    }
  };

  const resetModal = () => {
    setIsModalVisible(false);
    setDraftEvent(null);
    setEventTitle('');
    setEventSummary('');
    setShowTimePicker(false);
  };

  return (
    <CalendarProvider date={currentDate} onDateChanged={handleDateChange} showTodayButton>
      <ExpandableCalendar firstDay={1} markedDates={markedDates} />
      <TimelineList
        key={JSON.stringify(eventsByDate)}
        events={eventsByDate}
        timelineProps={{
          format24h: false,
          onBackgroundLongPress: createNewEvent,
          unavailableHours: [
            { start: 0, end: 6 },
            { start: 22, end: 24 },
          ],
          onEventPress: (event) => openEditModal(event),
        }}
        initialTime={INITIAL_TIME}
        showNowIndicator
        scrollToNow
      />

      {/* Creation Modal */}
      <Modal visible={isModalVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>New Event</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Enter event title"
              placeholderTextColor="#9ca3af"
              value={eventTitle}
              onChangeText={setEventTitle}
            />
            <TextInput
              style={styles.textInput}
              placeholder="Enter event summary"
              placeholderTextColor="#9ca3af"
              value={eventSummary}
              onChangeText={setEventSummary}
            />
            <TouchableOpacity
              style={styles.timeButton}
              onPress={() => { setShowTimePicker(true); setStartTimeSelected(true); }}
            >
              <Text style={styles.timeButtonText}>
                Start Time: {selectedStartTime.getHours().toString().padStart(2,'0')}:{selectedStartTime.getMinutes().toString().padStart(2,'0')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.timeButton}
              onPress={() => { setShowTimePicker(true); setStartTimeSelected(false); }}
            >
              <Text style={styles.timeButtonText}>
                End Time: {selectedEndTime.getHours().toString().padStart(2,'0')}:{selectedEndTime.getMinutes().toString().padStart(2,'0')}
              </Text>
            </TouchableOpacity>
            {showTimePicker && (
              <DateTimePicker
                value={startTimeSelected ? selectedStartTime : selectedEndTime}
                mode="time"
                is24Hour={true}
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                textColor="#374151"
                onChange={(e, date) => {
                  if(date) startTimeSelected? setSelectedStartTime(date): setSelectedEndTime(date);
                }}
              />
            )}
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelButton} onPress={cancelNewEvent}>
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.createButton} onPress={approveNewEvent}>
                <Text style={styles.buttonText}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Edit Modal */}
      <Modal visible={isEditModalVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Event</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Enter event title"
              placeholderTextColor="#9ca3af"
              value={eventTitle}
              onChangeText={setEventTitle}
            />
            <TextInput
              style={styles.textInput}
              placeholder="Enter event summary"
              placeholderTextColor="#9ca3af"
              value={eventSummary}
              onChangeText={setEventSummary}
            />
            <TouchableOpacity
              style={styles.timeButton}
              onPress={() => { setShowTimePicker(true); setStartTimeSelected(true); }}
            >
              <Text style={styles.timeButtonText}>
                Start Time: {selectedStartTime.getHours().toString().padStart(2,'0')}:{selectedStartTime.getMinutes().toString().padStart(2,'0')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.timeButton}
              onPress={() => { setShowTimePicker(true); setStartTimeSelected(false); }}
            >
              <Text style={styles.timeButtonText}>
                End Time: {selectedEndTime.getHours().toString().padStart(2,'0')}:{selectedEndTime.getMinutes().toString().padStart(2,'0')}
              </Text>
            </TouchableOpacity>
            {showTimePicker && (
              <DateTimePicker
                value={startTimeSelected ? selectedStartTime : selectedEndTime}
                mode="time"
                is24Hour={true}
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                textColor="#374151"
                onChange={(e, date) => {
                  if(date) startTimeSelected? setSelectedStartTime(date): setSelectedEndTime(date);
                }}
              />
            )}
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelButton} onPress={()=>setIsEditModalVisible(false)}>
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.createButton} onPress={handleUpdate}>
                <Text style={styles.buttonText}>Update</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.removeButton} onPress={handleRemove}>
                <Text style={styles.buttonText}>Remove</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </CalendarProvider>
  );
}

const styles = StyleSheet.create({
  modalContainer: { 
    flex:1, 
    justifyContent:'center', 
    alignItems:'center', 
    backgroundColor:'rgba(0,0,0,0.5)' 
  },
  modalContent: { 
    width:'80%', 
    backgroundColor:'#fff', 
    borderRadius:8, 
    padding:16, 
    alignItems:'center' 
  },
  modalTitle: { 
    fontSize:18, 
    fontWeight:'bold', 
    marginBottom:16, 
    color:'#374151' 
  },
  textInput: { 
    width:'100%', 
    borderWidth:1, 
    borderColor:'#d1d5db', 
    padding:12, 
    borderRadius:4, 
    fontSize:16, 
    marginBottom:16, 
    color:'#374151' 
  },
  timeButton: { 
    width:'100%', 
    padding:12, 
    borderRadius:4, 
    backgroundColor:'#e5e7eb', 
    alignItems:'center', 
    marginBottom:16 
  },
  timeButtonText: { 
    color:'#374151', 
    fontSize:16 
  },
  modalButtons: { 
    flexDirection:'row', 
    justifyContent:'space-between', 
    width:'100%' 
  },
  cancelButton: { 
    flex:1, 
    backgroundColor:'#e5e7eb', 
    padding:12, 
    borderRadius:4, 
    alignItems:'center', 
    marginRight:8 
  },
  createButton: { 
    flex:1, 
    backgroundColor:'#3b82f6', 
    padding:12, 
    borderRadius:4, 
    alignItems:'center' 
  },
  removeButton: { 
    flex:1, 
    backgroundColor:'#ef4444', 
    padding:12, 
    borderRadius:4, 
    alignItems:'center', 
    marginLeft:8 
  },
  buttonText: { 
    color:'#fff', 
    fontSize:16, 
    fontWeight:'500' 
  },
});
