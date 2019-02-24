import {Component, OnInit} from '@angular/core';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';
import {WsBedPreparationType} from '@charlyghislain/plancul-api';
import {SelectItem} from 'primeng/api';

@Component({
  selector: 'pc-bed-preparation-type-select',
  templateUrl: './bed-preparation-type-select.component.html',
  styleUrls: ['./bed-preparation-type-select.component.scss'],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: BedPreparationTypeSelectComponent,
    multi: true,
  }],
})
export class BedPreparationTypeSelectComponent implements OnInit, ControlValueAccessor {

  value: WsBedPreparationType;
  options: SelectItem[] = [{
    value: WsBedPreparationType.COVER,
  }, {
    value: WsBedPreparationType.PRESOWING,
  }];

  private changeFunction: Function;
  private touchedFunction: Function;

  constructor() {
  }

  ngOnInit() {
  }

  writeValue(obj: any): void {
    this.value = obj;
  }

  registerOnChange(fn: any): void {
    this.changeFunction = fn;
  }

  registerOnTouched(fn: any): void {
    this.touchedFunction = fn;
  }

  onChange(value: WsBedPreparationType) {
    this.value = value;
    this.touchedFunction();
    this.changeFunction(value);
  }
}
