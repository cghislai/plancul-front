import {CalendarEvent} from './calendar-event';

export interface CalendarEvents {
  [type: string]: CalendarEvent[];
}
