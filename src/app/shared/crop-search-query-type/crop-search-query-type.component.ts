import {Component, Input, OnInit} from '@angular/core';
import {QueryType} from './query-type';

@Component({
  selector: 'pc-crop-search-query-type',
  templateUrl: './crop-search-query-type.component.html',
  styleUrls: ['./crop-search-query-type.component.scss'],
})
export class CropSearchQueryTypeComponent implements OnInit {

  @Input()
  type: QueryType;

  constructor() {
  }

  ngOnInit() {
  }

}
