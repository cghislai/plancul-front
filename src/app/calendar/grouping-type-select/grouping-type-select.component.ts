import {Component, Input, OnInit} from '@angular/core';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';
import {GroupingType} from '../domain/grouping-type';
import {BehaviorSubject, Observable} from 'rxjs';
import {SelectItem} from 'primeng/api';
import {CultureCalendarService} from '../culture-calendar-service';

@Component({
  selector: 'pc-grouping-type-select',
  templateUrl: './grouping-type-select.component.html',
  styleUrls: ['./grouping-type-select.component.scss'],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: GroupingTypeSelectComponent,
    multi: true,
  }],
})
export class GroupingTypeSelectComponent implements OnInit, ControlValueAccessor {

  @Input()
  disabled: boolean;

  value$ = new BehaviorSubject<GroupingType>(null);

  items$: Observable<SelectItem[]>;

  private onChange: Function;
  private onTouched: Function;

  constructor(private calendarService: CultureCalendarService) {
  }

  ngOnInit() {
    this.items$ = this.calendarService.createGroupingTypeSelectItems$();
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  writeValue(obj: any): void {
    this.value$.next(obj);
  }

  onTypeChange(value: GroupingType) {
    this.value$.next(value);
    this.fireChanges(value);
  }

  private fireChanges(value: GroupingType) {
    if (this.onTouched) {
      this.onTouched();
    }
    if (this.onChange) {
      this.onChange(value);
    }
  }
}
