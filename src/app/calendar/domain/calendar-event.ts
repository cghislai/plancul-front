import {CalendarEventType} from './calendar-event-type';
import {WsCulture, WsRef} from '@charlyghislain/plancul-api';
import * as moment from 'moment';

export interface CalendarEvent<T = any> {
  type: CalendarEventType;
  cultureRef: WsRef<WsCulture>;
  date: moment.Moment;
  data?: T;
}
