import {
  ExpandableCalendar,
  TimelineList,
  CalendarProvider,
  CalendarUtils,
} from 'react-native-calendars';

export default function CalendarView() {
  return (
    <CalendarProvider
      date={CalendarUtils.getCalendarDateString(new Date())}
      onDateChanged={(date) => console.log('Selected date:', date)}
      onMonthChange={(month) => console.log('Selected month:', month)}
    >
      <ExpandableCalendar firstDay={1} style={{backgroundColor: 'red', elevation:300}}/>
      <TimelineList
        events={[
          {
            id: '1',
            start: '2023-10-01 09:20:00',
            end: '2023-10-01 13:00:00',
            title: 'Meeting with Alex',
            summary: 'Discuss project updates',
            color: '#e6add8',
          },
        ]}
      />
    </CalendarProvider>
  )
}
