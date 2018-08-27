import {Component, Input, OnInit} from '@angular/core';
import {DateAsString} from '@charlyghislain/plancul-api';

@Component({
  selector: 'pc-date-range',
  templateUrl: './date-range.component.html',
  styleUrls: ['./date-range.component.scss'],
})
export class DateRangeComponent implements OnInit {

  @Input()
  start: DateAsString;
  @Input()
  end: DateAsString;

  constructor() {
  }

  ngOnInit() {
  }

}
