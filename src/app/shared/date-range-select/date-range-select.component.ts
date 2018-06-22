import {Component, Input, OnInit} from '@angular/core';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';
import {DateRange} from '../../main/domain/date-range';
import {BehaviorSubject, Observable} from 'rxjs';
import {DateAsString} from '@charlyghislain/plancul-ws-api';
import {filter, map, publishReplay, refCount} from 'rxjs/operators';
import moment from 'moment-es6';

@Component({
  selector: 'pc-date-range-select',
  templateUrl: './date-range-select.component.html',
  styleUrls: ['./date-range-select.component.scss'],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: DateRangeSelectComponent,
    multi: true,
  }],
})
export class DateRangeSelectComponent implements OnInit, ControlValueAccessor {

  @Input()
  fromRequired = true;
  @Input()
  toRequired = true;

  fromDate: Observable<DateAsString>;
  toDate: Observable<DateAsString>;
  valid = true;

  private valueSource = new BehaviorSubject<DateRange>(null);
  private changeFunction: Function;
  private touchedFunction: Function;

  constructor() {
  }

  ngOnInit() {
    this.fromDate = this.valueSource.pipe(
      filter(v => v != null),
      map(range => range.from),
      publishReplay(1), refCount(),
    );
    this.toDate = this.valueSource.pipe(
      filter(v => v != null),
      map(range => range.to),
      publishReplay(1), refCount(),
    );
  }

  writeValue(obj: any): void {
    this.valueSource.next(obj);
  }

  registerOnChange(fn: any): void {
    this.changeFunction = fn;
  }

  registerOnTouched(fn: any): void {
    this.touchedFunction = fn;
  }

  onFromDateChange(value: string) {
    this.fireChange({
      from: value,
    });
  }

  onToDateChange(value: string) {
    this.fireChange({
      to: value,
    });
  }

  onBlur() {
    this.touchedFunction();
  }

  private fireChange(change: Partial<DateRange>) {
    const newValue = Object.assign({}, this.valueSource.getValue(), change);
    this.valueSource.next(newValue);
    this.valid = this.isValid(newValue);

    this.touchedFunction();
    if (this.valid) {
      this.changeFunction(newValue);
    }
  }

  private isValid(newValue: DateRange) {
    if (this.fromRequired && newValue.from == null) {
      return false;
    }
    if (this.toRequired && newValue.to == null) {
      return false;
    }
    if (!moment(newValue.from).isBefore(newValue.to)) {
      return false;
    }
    return true;
  }
}
