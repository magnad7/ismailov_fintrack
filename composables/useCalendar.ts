// composables/useCalendar.ts
export const useCalendar = () => {
  const events = ref<CalendarEvent[]>([]);

  // Load events from localStorage
  const loadEvents = () => {
    if (import.meta.client) {
      const saved = localStorage.getItem("calendar-events");
      if (saved) {
        try {
          events.value = JSON.parse(saved);
        } catch (e) {
          console.error("Failed to load events:", e);
        }
      }
    }
  };

  // Save events to localStorage
  const saveEvents = () => {
    if (import.meta.client) {
      localStorage.setItem("calendar-events", JSON.stringify(events.value));
    }
  };

  // Add event
  const addEvent = (event: CalendarEvent) => {
    events.value.push(event);
    saveEvents();
  };

  // Update event
  const updateEvent = (id: string, updatedEvent: Partial<CalendarEvent>) => {
    const index = events.value.findIndex((e) => e.id === id);
    if (index > -1) {
      events.value[index] = { ...events.value[index], ...updatedEvent };
      saveEvents();
    }
  };

  // Delete event
  const deleteEvent = (id: string) => {
    const index = events.value.findIndex((e) => e.id === id);
    if (index > -1) {
      events.value.splice(index, 1);
      saveEvents();
    }
  };

  // Get events for a specific date
  const getEventsByDate = (date: string): CalendarEvent[] => {
    return events.value.filter((e) => e.date === date);
  };

  // Get events for a date range
  const getEventsByRange = (
    startDate: string,
    endDate: string
  ): CalendarEvent[] => {
    return events.value.filter((e) => e.date >= startDate && e.date <= endDate);
  };

  // Get events count for a month
  const getMonthEventsCount = (year: number, month: number): number => {
    return events.value.filter((event) => {
      const eventDate = new Date(event.date);
      return eventDate.getFullYear() === year && eventDate.getMonth() === month;
    }).length;
  };

  return {
    addEvent,
    deleteEvent,
    events,
    getEventsByDate,
    getEventsByRange,
    getMonthEventsCount,
    loadEvents,
    saveEvents,
    updateEvent,
  };
};
