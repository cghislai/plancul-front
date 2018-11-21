import {Component, Input, OnInit, Output} from '@angular/core';
import {BED_SORT_OPTIONS} from './bed-sort-options';
import {Sort} from '../../main/domain/sort';
import {Observable, of, Subject} from 'rxjs';
import {SelectItem} from 'primeng/api';
import {LocalizationService} from '../../main/service/localization.service';
import {concatMap, map, publishReplay, refCount, toArray} from 'rxjs/operators';
import {UntranslatedSelectItem} from '../../main/service/util/untranslated-select-item';

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

  sortOptions: Observable<SelectItem[]>;
  sortValue: Sort;

  constructor(private localizationService: LocalizationService) {
  }

  ngOnInit() {
    this.sortOptions = this.localizationService.getSelectItemTranslations(BED_SORT_OPTIONS);
  }

  onSortChange(event: any) {
    this.selectionChange.next(event.value);
  }
}
