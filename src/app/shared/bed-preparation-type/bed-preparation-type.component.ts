import {Component, Input, OnInit} from '@angular/core';
import {WsBedPreparationType} from '@charlyghislain/plancul-ws-api';

@Component({
  selector: 'pc-bed-preparation-type',
  templateUrl: './bed-preparation-type.component.html',
  styleUrls: ['./bed-preparation-type.component.scss'],
})
export class BedPreparationTypeComponent implements OnInit {

  @Input()
  type: WsBedPreparationType;

  constructor() {
  }

  ngOnInit() {
  }

}
