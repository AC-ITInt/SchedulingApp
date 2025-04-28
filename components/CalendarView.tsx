import React, { Component } from 'react';
import { Alert, Modal, View, Text, TextInput, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import {
  ExpandableCalendar,
  TimelineList,
  CalendarProvider,
  CalendarUtils,
} from 'react-native-calendars';

const EVENT_COLOR = '#e6add8';
const INITIAL_TIME = { hour: 9, minutes: 0 };

// Helper to get formatted date
const getDate = (offset = 0) => {
  const today = new Date();
  return CalendarUtils.getCalendarDateString(new Date(today.setDate(today.getDate() + offset)));
};

// Sample events
const timelineEvents = [
  { start: `${getDate(-1)} 09:20:00`, end: `${getDate(-1)} 13:00:00`, title: 'Merge Request', summary: 'React Native Calendars' },
  { start: `${getDate()} 09:15:00`, end: `${getDate()} 10:30:00`, title: 'Meeting A', summary: 'Summary for meeting A', color: EVENT_COLOR },
  { start: `${getDate()} 09:30:00`, end: `${getDate()} 10:30:00`, title: 'Meeting B', summary: 'Summary for meeting B', color: EVENT_COLOR },
  { start: `${getDate()} 10:40:00`, end: `${getDate()} 11:10:00`, title: 'Meeting D', summary: 'Summary for meeting D', color: EVENT_COLOR },
];

// Group events by date
const groupByDate = (events) =>
  events.reduce((acc, event) => {
    const date = event.start.split(' ')[0];
    acc[date] = acc[date] ? [...acc[date], event] : [event];
    return acc;
  }, {});

export default class TimelineCalendarScreen extends Component {
  state = {
    currentDate: getDate(),
    eventsByDate: groupByDate(timelineEvents),
    isModalVisible: false,
    draftEvent: null,
    eventTitle: '',
    eventSummary: '',
    selectedTime: new Date(),
    showTimePicker: false,
    selectedStartTime: new Date(),
    selectedEndTime: new Date(),
    startTimeSelected: true,
    isEditModalVisible: false,
    eventToEdit: null,
  };

  markedDates = {
    [getDate(-1)]: { marked: true },
    [getDate()]: { marked: true },
    [getDate(1)]: { marked: true },
  };

  handleDateChange = (date) => this.setState({ currentDate: date });

  createNewEvent = (timeString, timeObject) => {
    const { eventsByDate } = this.state;
    const newEvent = {
      id: 'draft',
      start: timeString,
      end: `${timeObject.date} ${String(timeObject.hour + 1).padStart(2, '0')}:${String(timeObject.minutes).padStart(2, '0')}:00`,
      title: 'New Event',
      summary: 'New Event Summary',
      color: 'white',
    };

    this.setState({
      eventsByDate: {
        ...eventsByDate,
        [timeObject.date]: [...(eventsByDate[timeObject.date] || []), newEvent],
      },
      isModalVisible: true,
      draftEvent: { date: timeObject.date, event: newEvent },
    });
  };

  approveNewEvent = () => {
    const { eventsByDate, draftEvent, eventTitle, eventSummary, selectedTime, selectedStartTime, selectedEndTime } = this.state;

    if (draftEvent) {
      const { date, event } = draftEvent;
      const updatedEvent = {
        ...event,
        id: Date.now().toString(),
        title: eventTitle || 'New Event',
        summary: eventSummary || 'New Event Summary',
        start: `${date} ${selectedStartTime.getHours().toString().padStart(2, '0')}:${selectedStartTime.getMinutes().toString().padStart(2, '0')}:00`,
        end: `${date} ${String(selectedEndTime.getHours()).padStart(2, '0')}:${selectedEndTime.getMinutes().toString().padStart(2, '0')}:00`,
        color: 'lightgreen',
      };

      this.setState({
        eventsByDate: {
          ...eventsByDate,
          [date]: eventsByDate[date].map((e) => (e.id === 'draft' ? updatedEvent : e)),
        },
        isModalVisible: false,
        draftEvent: null,
        eventTitle: '',
        eventSummary: '',
        selectedTime: new Date(),
      });
    }
  };

  cancelNewEvent = () => {
    const { eventsByDate, draftEvent } = this.state;

    if (draftEvent) {
      const { date } = draftEvent;
      this.setState({
        eventsByDate: {
          ...eventsByDate,
          [date]: eventsByDate[date].filter((e) => e.id !== 'draft'),
        },
        isModalVisible: false,
        draftEvent: null,
        eventTitle: '',
        eventSummary: '',
        selectedTime: new Date(),
      });
    }
  };

  updateEvent = () => {
    const { eventsByDate, eventToEdit, eventTitle, eventSummary, selectedStartTime, selectedEndTime } = this.state;
  
    if (eventToEdit) {
      const date = eventToEdit.start.split(' ')[0];
      const updatedEvent = {
        ...eventToEdit,
        title: eventTitle,
        summary: eventSummary,
        start: `${date} ${selectedStartTime.getHours().toString().padStart(2, '0')}:${selectedStartTime.getMinutes().toString().padStart(2, '0')}:00`,
        end: `${date} ${selectedEndTime.getHours().toString().padStart(2, '0')}:${selectedEndTime.getMinutes().toString().padStart(2, '0')}:00`,
      };
  
      this.setState({
        eventsByDate: {
          ...eventsByDate,
          [date]: eventsByDate[date].map((e) => (e.id === eventToEdit.id ? updatedEvent : e)),
        },
        isEditModalVisible: false,
        eventToEdit: null,
        eventTitle: '',
        eventSummary: '',
      });
    }
  };

  removeEvent = () => {
    const { eventsByDate, eventToEdit } = this.state;
  
    if (eventToEdit) {
      const date = eventToEdit.start.split(' ')[0];
      this.setState({
        eventsByDate: {
          ...eventsByDate,
          [date]: eventsByDate[date].filter((e) => e.id !== eventToEdit.id),
        },
        isEditModalVisible: false,
        eventToEdit: null,
        eventTitle: '',
        eventSummary: '',
      });
    }
  };

  openEditModal = (event) => {
    this.setState({
      isEditModalVisible: true,
      eventToEdit: event,
      eventTitle: event.title || '',
      eventSummary: event.summary || '',
      selectedStartTime: new Date(event.start),
      selectedEndTime: new Date(event.end),
    });
  };

  render() {
    const { currentDate, eventsByDate, isModalVisible, eventTitle, eventSummary, selectedTime, selectedStartTime, selectedEndTime, startTimeSelected, showTimePicker, isEditModalVisible, eventToEdit } = this.state;

    return (
      <CalendarProvider
        date={currentDate}
        onDateChanged={this.handleDateChange}
        showTodayButton
      >
        <ExpandableCalendar firstDay={1} markedDates={this.markedDates} />
        <TimelineList
          events={eventsByDate}
          timelineProps={{
            format24h: false,
            onBackgroundLongPress: this.createNewEvent,
            unavailableHours: [{ start: 0, end: 6 }, { start: 22, end: 24 }],
            onEventPress: (event) => this.openEditModal(event),
          }}
          initialTime={INITIAL_TIME}
          showNowIndicator
          scrollToFirst
        />

        {/* Modal for Event Creation */}
        <Modal visible={isModalVisible} transparent animationType="slide">
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>New Event</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter event title"
                placeholderTextColor="#9ca3af"
                value={eventTitle}
                onChangeText={(text) => this.setState({ eventTitle: text })}
              />
              <TextInput
                style={styles.textInput}
                placeholder="Enter event summary"
                placeholderTextColor="#9ca3af"
                value={eventSummary}
                onChangeText={(text) => this.setState({ eventSummary: text })}
              />
              <TouchableOpacity
                style={styles.timeButton}
                onPress={() => this.setState({ showTimePicker: !showTimePicker, startTimeSelected: true })}
              >
                <Text style={styles.timeButtonText}>
                  Start Time: {selectedStartTime.getHours().toString().padStart(2, '0')}:
                  {selectedStartTime.getMinutes().toString().padStart(2, '0')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.timeButton}
                onPress={() => this.setState({ showTimePicker: !showTimePicker, startTimeSelected: false })}
              >
                <Text style={styles.timeButtonText}>
                  End Time: {selectedEndTime.getHours().toString().padStart(2, '0')}:
                  {selectedEndTime.getMinutes().toString().padStart(2, '0')}
                </Text>
              </TouchableOpacity>
              {showTimePicker && (
                <DateTimePicker
                  value={ startTimeSelected ? selectedStartTime : selectedEndTime }
                  mode="time"
                  is24Hour={true}
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  textColor='#374151'
                  onChange={(event, date) => {
                    // this.setState({ showTimePicker: false });
                    if (date) this.setState(startTimeSelected ? { selectedStartTime: date } : { selectedEndTime: date });
                  }}
                />
              )}
              <View style={styles.modalButtons}>
                <TouchableOpacity style={styles.cancelButton} onPress={this.cancelNewEvent}>
                  <Text style={styles.buttonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.createButton} onPress={this.approveNewEvent}>
                  <Text style={styles.buttonText}>Create</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
          
        {/* Modal for Event Editing */}
        <Modal visible={isEditModalVisible} transparent animationType="slide">
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Edit Event</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter event title"
                placeholderTextColor="#9ca3af"
                value={eventTitle}
                onChangeText={(text) => this.setState({ eventTitle: text })}
              />
              <TextInput
                style={styles.textInput}
                placeholder="Enter event summary"
                placeholderTextColor="#9ca3af"
                value={eventSummary}
                onChangeText={(text) => this.setState({ eventSummary: text })}
              />
              <TouchableOpacity
                style={styles.timeButton}
                onPress={() => this.setState({ showTimePicker: true, startTimeSelected: true })}
              >
                <Text style={styles.timeButtonText}>
                  Start Time: {selectedStartTime.getHours().toString().padStart(2, '0')}:
                  {selectedStartTime.getMinutes().toString().padStart(2, '0')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.timeButton}
                onPress={() => this.setState({ showTimePicker: true, startTimeSelected: false })}
              >
                <Text style={styles.timeButtonText}>
                  End Time: {selectedEndTime.getHours().toString().padStart(2, '0')}:
                  {selectedEndTime.getMinutes().toString().padStart(2, '0')}
                </Text>
              </TouchableOpacity>
              {showTimePicker && (
                <DateTimePicker
                  value={startTimeSelected ? selectedStartTime : selectedEndTime}
                  mode="time"
                  is24Hour={true}
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  textColor='#374151'
                  onChange={(event, date) => {
                    // this.setState({ showTimePicker: false });
                    if (date) this.setState(startTimeSelected ? { selectedStartTime: date } : { selectedEndTime: date });
                  }}
                />
              )}
              <View style={styles.modalButtons}>
                <TouchableOpacity style={styles.cancelButton} onPress={() => this.setState({ isEditModalVisible: false })}>
                  <Text style={styles.buttonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.createButton} onPress={this.updateEvent}>
                  <Text style={styles.buttonText}>Update</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.removeButton} onPress={this.removeEvent}>
                  <Text style={styles.buttonText}>Remove</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </CalendarProvider>
    );
  }
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
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
    color: '#374151',
  },
  timeButton: {
    width: '100%',
    padding: 12,
    borderRadius: 4,
    backgroundColor: '#e5e7eb',
    alignItems: 'center',
    marginBottom: 16,
  },
  timeButtonText: {
    color: '#374151',
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#e5e7eb',
    padding: 12,
    borderRadius: 4,
    alignItems: 'center',
    marginRight: 8,
  },
  createButton: {
    flex: 1,
    backgroundColor: '#3b82f6',
    padding: 12,
    borderRadius: 4,
    alignItems: 'center',
  },
  removeButton: {
    flex: 1,
    backgroundColor: '#ef4444',
    padding: 12,
    borderRadius: 4,
    alignItems: 'center',
    marginLeft: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
});