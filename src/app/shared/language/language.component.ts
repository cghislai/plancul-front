import {Component, Input, OnInit} from '@angular/core';
import {WsLanguage} from '@charlyghislain/plancul-api';

@Component({
  selector: 'pc-language',
  templateUrl: './language.component.html',
  styleUrls: ['./language.component.scss'],
})
export class LanguageComponent implements OnInit {

  @Input()
  language: WsLanguage;

  constructor() {
  }

  ngOnInit() {
  }

}
