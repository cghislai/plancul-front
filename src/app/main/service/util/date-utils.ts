import moment from 'moment-es6';
import {DateAsString} from '@charlyghislain/plancul-api';

export class DateUtils {

  private static readonly ISO_DATE_FORMAT = 'YYYY-MM-DD';
  private static readonly ISO_LOCAL_DATE_TIME_FORMAT = 'YYYY-MM-DDTHH:mm:ss';

  static toIsoDateString(date: Date) {
    const dateMoment = moment(date);
    return dateMoment.format(this.ISO_DATE_FORMAT);
  }

  static fromIsoDateString(dateString: string): moment.Moment {
    return moment(dateString, this.ISO_DATE_FORMAT);
  }

  static toIsoLocalDateTimeString(date: moment.MomentInput) {
    const dateMoment = moment(date);
    return dateMoment.format(this.ISO_LOCAL_DATE_TIME_FORMAT);
  }

  static fromIsoUTCLocalDateTimeString(dateString: string): moment.Moment {
    return moment.utc(dateString, this.ISO_LOCAL_DATE_TIME_FORMAT);
  }

  static getDayDiff(start: DateAsString, end: DateAsString): number {
    const startMoment = moment(start);
    const endMoment = moment(end);

    return endMoment.diff(startMoment, 'day');
  }


}
