import {Component, Input, OnInit} from '@angular/core';
import {DateAsString} from '@charlyghislain/plancul-ws-api';

@Component({
  selector: 'pc-culture-sowing',
  templateUrl: './culture-sowing.component.html',
  styleUrls: ['./culture-sowing.component.scss'],
})
export class CultureSowingComponent implements OnInit {

  @Input()
  showIcon = true;
  @Input()
  date: DateAsString;

  constructor() {
  }

  ngOnInit() {
  }

}
