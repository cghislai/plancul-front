import {Component, Input, OnInit} from '@angular/core';
import {DateAsString} from '@charlyghislain/plancul-ws-api';

@Component({
  selector: 'pc-culture-transplanting',
  templateUrl: './culture-transplanting.component.html',
  styleUrls: ['./culture-transplanting.component.scss']
})
export class CultureTransplantingComponent implements OnInit {

  @Input()
  showIcon = true;
  @Input()
  date: DateAsString;

  constructor() { }

  ngOnInit() {
  }

}
