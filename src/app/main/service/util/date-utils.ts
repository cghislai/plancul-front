import moment from 'moment-es6';

export class DateUtils {

  private static readonly ISO_DATE_FORMAT = 'YYYY-MM-DD';

  static toIsoDateString(date: Date) {
    const dateMoment = moment(date);
    return dateMoment.format(this.ISO_DATE_FORMAT);
  }


}
