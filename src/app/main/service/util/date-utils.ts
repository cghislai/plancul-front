import moment from 'moment-es6';
import {DateAsString} from '@charlyghislain/plancul-ws-api';

export class DateUtils {

  private static readonly ISO_DATE_FORMAT = 'YYYY-MM-DD';

  static toIsoDateString(date: Date) {
    const dateMoment = moment(date);
    return dateMoment.format(this.ISO_DATE_FORMAT);
  }

  static getDayDiff(start: DateAsString, end: DateAsString): number {
    const startMoment = moment(start);
    const endMoment = moment(end);

    return endMoment.diff(startMoment, 'day');
  }


}
