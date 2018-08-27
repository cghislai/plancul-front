import {Component, Input, OnInit, Output} from '@angular/core';
import {Sort} from '../../main/domain/sort';
import {BehaviorSubject, combineLatest, Observable} from 'rxjs';
import {WsCropSortField, WsSortOrder} from '@charlyghislain/plancul-api';
import {filter, map, publishReplay, refCount} from 'rxjs/operators';
import {SelectItem} from 'primeng/api';
import {CROP_FIELD_OPTIONS} from './crop-field-options';

@Component({
  selector: 'pc-crop-sort-select',
  templateUrl: './crop-sort-select.component.html',
  styleUrls: ['./crop-sort-select.component.scss'],
})
export class CropSortSelectComponent implements OnInit {

  @Input()
  set sort(value: Sort) {
    if (value == null) {
      return;
    }
    this.fieldValue.next(value.field);
    this.orderValue.next(value.order);
  }

  @Output()
  private selectionChange: Observable<Sort>;

  fieldOptions = CROP_FIELD_OPTIONS.sort(this.sortFieldOption);
  fieldValue = new BehaviorSubject<WsCropSortField>(null);
  orderValue = new BehaviorSubject<WsSortOrder>(WsSortOrder.ASC);
  orderIcon: Observable<string>;

  constructor() {
    this.selectionChange = combineLatest(this.fieldValue, this.orderValue)
      .pipe(
        filter(r => r[0] != null && r[1] != null),
        map(results => <Sort>{field: results[0], order: results[1]}),
        publishReplay(1), refCount(),
      );
    this.orderIcon = this.orderValue.pipe(
      map(order => order === WsSortOrder.ASC ? 'fa-sort-amount-asc' : 'fa-sort-amount-desc'),
      map(icon => `fa ${icon}`),
      publishReplay(1), refCount(),
    );
  }

  ngOnInit() {
  }

  onFieldChange(value: WsCropSortField) {
    this.fieldValue.next(value);
  }

  onToggleOrder() {
    const curOrder = this.orderValue.getValue();
    const newOrder = curOrder === WsSortOrder.ASC ? WsSortOrder.DESC : WsSortOrder.ASC;
    this.orderValue.next(newOrder);
  }

  private sortFieldOption(optionA: SelectItem, optionB: SelectItem) {
    return optionA.label.localeCompare(optionB.label);
  }

}
