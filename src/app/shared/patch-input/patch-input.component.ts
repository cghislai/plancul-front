import {Component, Input, OnInit} from '@angular/core';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';
import {WsBedFilter} from '@charlyghislain/plancul-api';
import {BedClientService} from '../../main/service/bed-client.service';

@Component({
  selector: 'pc-patch-input',
  templateUrl: './patch-input.component.html',
  styleUrls: ['./patch-input.component.scss'],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: PatchInputComponent,
    multi: true,
  }],
})
export class PatchInputComponent implements OnInit, ControlValueAccessor {

  @Input()
  forceSelection: boolean;
  @Input()
  placeholder: string;

  value: string;
  suggestions: string[];

  private changeFunction: Function;
  private touchedFunction: Function;

  constructor(private bedClient: BedClientService) {
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

  onChange(value: string) {
    this.changeFunction(value);
  }

  onBlur() {
    this.touchedFunction();
  }

  onClear() {
    this.value = null;
    this.onChange(null);
  }

  search(event) {
    const filter: WsBedFilter = {
      patchQuery: event.query,
    };
    this.bedClient.searchBedPatches(filter)
      .subscribe(
        list => this.suggestions = list,
        error => this.suggestions = [],
      );
  }

  searchAll() {
    const filter: WsBedFilter = {};
    this.bedClient.searchBedPatches(filter)
      .subscribe(
        list => this.suggestions = list,
        error => this.suggestions = [],
      );
  }


}
