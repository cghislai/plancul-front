import {Component, Input, OnInit, Output} from '@angular/core';
import {Sort} from '../../main/domain/sort';
import {BehaviorSubject, combineLatest, Observable} from 'rxjs';
import {WsCultureSortField, WsSortOrder} from '@charlyghislain/plancul-api';
import {distinctUntilChanged, filter, map, publishReplay, refCount} from 'rxjs/operators';
import {CULTURE_SORT_OPTIONS} from './culture-fiels-options';
import {SelectItem} from 'primeng/api';
import {SortComparator} from '../../main/domain/sort-comparator';
import {LocalizationService} from '../../main/service/localization.service';
import {CROP_FIELD_OPTIONS} from '../../crop/crop-sort-select/crop-field-options';
import {CssClassConstants} from '../../main/service/util/css-class-constants';

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

  fieldOptions$: Observable<SelectItem[]>;
  fieldValue = new BehaviorSubject<WsCultureSortField>(null);
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
    this.fieldOptions$ = this.localizationService.getSelectItemTranslations(CULTURE_SORT_OPTIONS).pipe(
      map(options => options.sort(this.sortFieldOption)),
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
