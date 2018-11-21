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
  @Input()
  showLabel = true;

  constructor() {
  }

  ngOnInit() {
  }


  getIconPath() {
    if (this.language == null) {
      return null;
    }
    return `assets/icons/languages/${this.language.toLowerCase()}.svg`;
  }
}
