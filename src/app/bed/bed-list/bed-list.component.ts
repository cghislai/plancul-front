import {Component, OnInit} from '@angular/core';
import {WsBed, WsBedFilter, WsBedSortField, WsCropFilter, WsSortOrder} from '@charlyghislain/plancul-ws-api';
import {Observable} from 'rxjs';
import {LazyLoadEvent} from 'primeng/api';
import {Router} from '@angular/router';
import {BedClientService} from '../../main/service/bed-client.service';
import {Sort} from '../../main/domain/sort';
import {ListHolderHelper} from '../../main/service/util/list-holder-helper';

@Component({
  selector: 'pc-bed-list',
  templateUrl: './bed-list.component.html',
  styleUrls: ['./bed-list.component.scss'],
})
export class BedListComponent implements OnInit {

  bedResults: Observable<WsBed[]>;
  resultCount: Observable<number>;
  resultLoading: Observable<boolean>;
  sort: Observable<Sort>;
  sortField: Observable<string>;
  sortOrder: Observable<number>;

  private helper: ListHolderHelper<WsBed, WsBedFilter>;


  constructor(private bedClient: BedClientService,
              private router: Router) {
  }

  ngOnInit() {
    this.helper = new ListHolderHelper(
      (filter, pagination) => this.bedClient.searchBeds(filter, pagination),
      (id) => this.bedClient.getBed(id),
    );
    this.bedResults = this.helper.getResults();
    this.resultCount = this.helper.getResultCount();
    this.resultLoading = this.helper.getResultsLoading();
    this.sort = this.helper.getSort();
    this.sortField = this.helper.getSortField();
    this.sortOrder = this.helper.getSOrtOrder();

    this.helper.setSort(this.createInitialSort());
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

  onNewBedClicked() {
    this.router.navigate(['/beds/_/new']);
  }

  onRemoveBedClick(bed: WsBed, event: MouseEvent) {
    this.bedClient.deleteBed(bed)
      .subscribe(() => this.helper.reload());
    event.stopImmediatePropagation();
    event.preventDefault();
  }

  private createInitialFilter(): WsBedFilter {
    return {};
  }

  private createInitialSort(): Sort {
    return {
      field: WsBedSortField.NAME,
      order: WsSortOrder.ASC,
    };
  }
}
