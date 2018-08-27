import {Component, Input, OnInit, Output} from '@angular/core';
import {Sort} from '../../main/domain/sort';
import {BehaviorSubject, combineLatest, Observable} from 'rxjs';
import {WsCultureSortField, WsSortOrder} from '@charlyghislain/plancul-api';
import {filter, map, publishReplay, refCount} from 'rxjs/operators';
import {CULTURE_SORT_OPTIONS} from './culture-fiels-options';
import {SelectItem} from 'primeng/api';

@Component({
  selector: 'pc-culture-sort-select',
  templateUrl: './culture-sort-select.component.html',
  styleUrls: ['./culture-sort-select.component.scss'],
})
export class CultureSortSelectComponent implements OnInit {

  @Input()
  set sort(value: Sort) {
    this.fieldValue.next(value.field);
    this.orderValue.next(value.order);
  }

  @Output()
  private selectionChange: Observable<Sort>;

  fieldOptions = CULTURE_SORT_OPTIONS.sort(this.sortFieldOption);
  fieldValue = new BehaviorSubject<WsCultureSortField>(null);
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

  onFieldChange(value: WsCultureSortField) {
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
