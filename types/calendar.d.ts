export {};

declare global {
  interface CalendarEvent {
    color: string;
    date: string;
    description?: string;
    endTime: string;
    id: string;
    startTime: string;
    title: string;
  }
}
