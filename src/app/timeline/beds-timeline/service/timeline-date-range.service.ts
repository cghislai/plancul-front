import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';
import {distinctUntilChanged, filter, publishReplay, refCount, scan} from 'rxjs/operators';
import moment from 'moment-es6';
import {DateUtils} from '../../../main/service/util/date-utils';
import {WsDateRange} from '@charlyghislain/plancul-api';

@Injectable()
export class TimelineDateRangeService {

  private cachedRangeMaxDayLength = 720;

  private displayedRange$ = new BehaviorSubject<WsDateRange | null>(null);
  private searchFilterRange$: Observable<WsDateRange>;

  constructor() {
    this.searchFilterRange$ = this.displayedRange$.pipe(
      filter(range => range != null),
      scan((cur, next) => this.checkNewDisplayedRange$(cur, next), null),
      distinctUntilChanged((a, b) => DateUtils.isSameRange(a, b)),
      publishReplay(1), refCount(),
    );
  }

  setDisplayRange(range: WsDateRange) {
    this.displayedRange$.next(range);
  }

  getSearchFilterRange$() {
    return this.searchFilterRange$;
  }

  getDisplayedRange$() {
    return this.displayedRange$;
  }

  private checkNewDisplayedRange$(cur: WsDateRange | null, next: WsDateRange): WsDateRange {
    if (cur == null) {
      return this.adjustFromDisplayedRange(next);
    }
    const curFrom = moment(cur.start);
    const curTo = moment(cur.end);
    const nextFrom = moment(next.start);
    const nextTo = moment(next.end);
    if (nextFrom.isBefore(curFrom) || nextTo.isAfter(curTo)) {
      return this.adjustFromDisplayedRange(next);
    }
    // within actual range
    const curLength = curTo.diff(curFrom, 'day');
    const nextMinLength = nextTo.add(4, 'month').diff(nextFrom, 'day');
    if (curLength > nextMinLength && curLength > this.cachedRangeMaxDayLength) {
      // we want to shrink range, keeping it centered on the next one
      // keeping 2 months buffering on each side, see adjustFromDisplayedRange
      const minLength = Math.max(this.cachedRangeMaxDayLength, nextMinLength);
      const extraDays = minLength - nextMinLength;

      const newStart = nextFrom.clone().add(-extraDays / 2, 'day');
      const newEnd = nextTo.clone().add(extraDays / 2, 'day');
      return {
        start: DateUtils.toIsoDateString(newStart),
        end: DateUtils.toIsoDateString(newEnd),
      };
    }
    // next range is within cur one, and cur one is small enough
    return cur;
  }

  private adjustFromDisplayedRange(next: WsDateRange): WsDateRange {
    const newStart = moment(next.start).add(-2, 'month');
    const newEnd = moment(next.end).add(2, 'month');
    return {
      start: DateUtils.toIsoDateString(newStart),
      end: DateUtils.toIsoDateString(newEnd),
    };
  }
}
