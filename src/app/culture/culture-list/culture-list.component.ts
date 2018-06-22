import {Component, OnInit} from '@angular/core';
import {WsCropFilter, WsCulture, WsCultureFilter, WsCultureSortField, WsSortOrder} from '@charlyghislain/plancul-ws-api';
import {Observable} from 'rxjs';
import {ListHolderHelper} from '../../main/service/util/list-holder-helper';
import {CultureClientService} from '../../main/service/culture-client.service';
import {Sort} from '../../main/domain/sort';
import {Router} from '@angular/router';
import {LazyLoadEvent} from 'primeng/api';
import {DateUtils} from '../../main/service/util/date-utils';

@Component({
  selector: 'pc-culture-list',
  templateUrl: './culture-list.component.html',
  styleUrls: ['./culture-list.component.scss'],
})
export class CultureListComponent implements OnInit {

  cultureResults: Observable<WsCulture[]>;
  resultCount: Observable<number>;
  resultLoading: Observable<boolean>;
  sort: Observable<Sort>;
  filter: Observable<WsCultureFilter>;
  sortField: Observable<string>;
  sortOrder: Observable<number>;

  private helper: ListHolderHelper<WsCulture, WsCultureFilter>;


  constructor(private cultureClient: CultureClientService,
              private router: Router) {
  }

  ngOnInit() {
    this.helper = new ListHolderHelper(
      (filter, pagination) => this.cultureClient.searchCultures(filter, pagination),
      (id) => this.cultureClient.getCulture(id),
    );
    this.cultureResults = this.helper.getResults();
    this.resultCount = this.helper.getResultCount();
    this.resultLoading = this.helper.getResultsLoading();
    this.sort = this.helper.getSort();
    this.sortField = this.helper.getSortField();
    this.sortOrder = this.helper.getSOrtOrder();
    this.filter = this.helper.getFilter();

    this.helper.setSort(this.createInitialSort());
    this.helper.setFilter(this.createInitialFilter());
  }


  onFilterChanged(searchFilter: WsCropFilter) {
    this.helper.setFilter(searchFilter);
  }

  onSortChange(sort: Sort) {
    this.helper.setSort(sort);
  }

  onLazyLoad(event: LazyLoadEvent) {
    this.helper.applyLazyLoad(event);
  }

  onNewCultureClicked() {
    this.router.navigate(['/cultures/_/new']);
  }

  onRemoveCultureClick(culture: WsCulture, event: MouseEvent) {
    this.cultureClient.deleteCulture(culture)
      .subscribe(() => this.helper.reload());
    event.stopImmediatePropagation();
    event.preventDefault();
  }

  private createInitialFilter(): WsCultureFilter {
    const now = new Date();
    return {
      bedOccupancyEndDate: {
        notBefore: DateUtils.toIsoDateString(now),
      },
      cropFilter: {
        namesQuery: '',
      },
    };
  }

  private createInitialSort(): Sort {
    return {
      field: WsCultureSortField.SOWING_DATE,
      order: WsSortOrder.ASC,
    };
  }
}
