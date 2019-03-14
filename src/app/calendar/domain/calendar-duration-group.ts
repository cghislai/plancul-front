import * as moment from 'moment';
import {GroupingType} from './grouping-type';
import {CalendarEvents} from './calendar-events';

export interface CalendarDurationGroup {
  start: moment.Moment;
  end: moment.Moment;
  groupingType: GroupingType;

  label: string;
  items: CalendarEvents;
}
