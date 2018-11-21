import {Component, Input, OnInit, Output} from '@angular/core';
import {Sort} from '../../main/domain/sort';
import {BehaviorSubject, combineLatest, Observable} from 'rxjs';
import {WsCropSortField, WsSortOrder} from '@charlyghislain/plancul-api';
import {distinctUntilChanged, filter, map, publishReplay, refCount, tap} from 'rxjs/operators';
import {SelectItem} from 'primeng/api';
import {CROP_FIELD_OPTIONS} from './crop-field-options';
import {SortComparator} from '../../main/domain/sort-comparator';
import {LocalizationService} from '../../main/service/localization.service';
import {CssClassConstants} from '../../main/service/util/css-class-constants';

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

  fieldOptions$: Observable<SelectItem[]>;
  fieldValue = new BehaviorSubject<WsCropSortField>(null);
  orderValue = new BehaviorSubject<WsSortOrder>(WsSortOrder.ASC);
  orderIcon: Observable<string>;

  constructor(private localizationService: LocalizationService) {
    this.selectionChange = combineLatest(this.fieldValue, this.orderValue)
      .pipe(
        filter(r => r[0] != null && r[1] != null),
        map(results => <Sort>{field: results[0], order: results[1]}),
        distinctUntilChanged(SortComparator.equal),
        publishReplay(1), refCount(),
      );
    this.orderIcon = this.orderValue.pipe(
      map(order => order === WsSortOrder.ASC ? CssClassConstants.FA_SORT_ASC_ICON : CssClassConstants.FA_SORT_DESC_ICON),
      map(icon => `fa ${icon}`),
      publishReplay(1), refCount(),
    );
    this.fieldOptions$ = this.localizationService.getSelectItemTranslations(CROP_FIELD_OPTIONS).pipe(
      map(options => options.sort(this.sortFieldOption)),
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
