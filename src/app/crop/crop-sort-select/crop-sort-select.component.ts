import {Component, Input, OnInit, Output} from '@angular/core';
import {CROP_SORT_OPTIONS} from './crop-sort-options';
import {Sort} from '../../main/domain/sort';
import {Subject} from 'rxjs';

@Component({
  selector: 'pc-crop-sort-select',
  templateUrl: './crop-sort-select.component.html',
  styleUrls: ['./crop-sort-select.component.scss'],
})
export class CropSortSelectComponent implements OnInit {

  @Input()
  set sort(value: Sort) {
    this.sortValue = value;
  }

  @Output()
  private selectionChange = new Subject<Sort>();

  sortOptions = CROP_SORT_OPTIONS;
  sortValue: Sort;

  constructor() {
  }

  ngOnInit() {
  }

  onSortChange(event: any) {
    this.selectionChange.next(event.value);
  }

}
