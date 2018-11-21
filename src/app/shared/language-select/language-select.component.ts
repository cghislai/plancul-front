import {Component, Input, OnInit} from '@angular/core';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';
import {WsLanguage} from '@charlyghislain/plancul-api';

@Component({
  selector: 'pc-language-select',
  templateUrl: './language-select.component.html',
  styleUrls: ['./language-select.component.scss'],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: LanguageSelectComponent,
    multi: true,
  }],
})
export class LanguageSelectComponent implements OnInit, ControlValueAccessor {

  @Input()
  mode: 'button' | 'dropdown' = 'dropdown';
  @Input()
  showLabel = true;
  @Input()
  showDropdownLabel = true;


  value: WsLanguage;
  options = [WsLanguage.ENGLISH, WsLanguage.FRENCH];

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

  onChange(value: WsLanguage) {
    this.value = value;
    this.touchedFunction();
    this.changeFunction(value);
  }
}
