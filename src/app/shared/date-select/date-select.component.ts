import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';
import {DateAsString} from '@charlyghislain/plancul-ws-api';

@Component({
  selector: 'pc-date-select',
  templateUrl: './date-select.component.html',
  styleUrls: ['./date-select.component.scss'],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: DateSelectComponent,
    multi: true,
  }],
})
export class DateSelectComponent implements OnInit, ControlValueAccessor {

  value: DateAsString;

  @Input()
  invalid: boolean;

  private changeFunction: Function;
  private touchedFunction: Function;

  @Output()
  private blur = new EventEmitter<any>();

  constructor() {
  }

  ngOnInit() {
  }

  writeValue(obj: DateAsString): void {
    this.value = obj;
  }

  registerOnChange(fn: any): void {
    this.changeFunction = fn;
  }

  registerOnTouched(fn: any): void {
    this.touchedFunction = fn;
  }

  onDateStringChange(value: string) {
    this.changeFunction(value);
  }

  onBlur() {
    this.touchedFunction();
    this.blur.emit(true);
  }
}
