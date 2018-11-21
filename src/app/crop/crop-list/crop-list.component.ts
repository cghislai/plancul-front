import {Component, OnInit} from '@angular/core';
import {WsCrop, WsCropFilter, WsCropSortField, WsSortOrder} from '@charlyghislain/plancul-api';
import {LazyLoadEvent} from 'primeng/api';
import {Router} from '@angular/router';
import {CropClientService} from '../../main/service/crop-client.service';
import {Sort} from '../../main/domain/sort';
import {ListHolderHelper} from '../../main/service/util/list-holder-helper';
import {Observable} from 'rxjs';
import {delay} from 'rxjs/operators';

@Component({
  selector: 'pc-crop-list',
  templateUrl: './crop-list.component.html',
  styleUrls: ['./crop-list.component.scss'],
})
export class CropListComponent implements OnInit {

  cropResults: Observable<WsCrop[]>;
  resultCount: Observable<number>;
  resultLoading: Observable<boolean>;
  sort: Observable<Sort>;
  filter: Observable<WsCropFilter>;
  sortField: Observable<string>;
  sortOrder: Observable<number>;

  private helper: ListHolderHelper<WsCrop, WsCropFilter>;

  constructor(private cropClient: CropClientService,
              private router: Router) {
    this.helper = new ListHolderHelper(
      (filter, pagination) => this.cropClient.searchCrops(filter, pagination),
      (id) => this.cropClient.getCrop(id),
    );
  }

  ngOnInit() {
    this.cropResults = this.helper.getResults();
    this.resultCount = this.helper.getResultCount();
    this.resultLoading = this.helper.getResultsLoading();
    // Delay avoid dependency check thinking we are looping
    this.sort = this.helper.getSort().pipe(delay(0));
    this.sortField = this.helper.getSortField().pipe(delay(0));
    this.sortOrder = this.helper.getSOrtOrder().pipe(delay(0));
    this.filter = this.helper.getFilter();

    this.helper.setFilter(this.createInitialFilter());
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

  onNewCropClicked() {
    this.router.navigate(['/crops/_/new']);
  }

  private createInitialFilter(): WsCropFilter {
    return {
      namesQuery: '',
    };
  }

  private createInitialSort(): Sort {
    return {
      field: WsCropSortField.DISPLAY_NAME,
      order: WsSortOrder.ASC,
    };
  }
}
