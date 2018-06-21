import {Component, Input, OnInit, Output} from '@angular/core';
import {BED_SORT_OPTIONS} from './bed-sort-options';
import {Sort} from '../../main/domain/sort';
import {Subject} from 'rxjs';

@Component({
  selector: 'pc-bed-sort-select',
  templateUrl: './bed-sort-select.component.html',
  styleUrls: ['./bed-sort-select.component.scss'],
})
export class BedSortSelectComponent implements OnInit {

  @Input()
  set sort(value: Sort) {
    this.sortValue = value;
  }

  @Output()
  private selectionChange = new Subject<Sort>();

  sortOptions = BED_SORT_OPTIONS;
  sortValue: Sort;

  constructor() {
  }

  ngOnInit() {
  }

  onSortChange(event: any) {
    this.selectionChange.next(event.value);
  }

}
