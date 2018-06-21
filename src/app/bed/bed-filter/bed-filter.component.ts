import {Component, OnInit, Output} from '@angular/core';
import {BehaviorSubject, combineLatest, Observable} from 'rxjs';
import {WsBedFilter, WsRef, WsTenant} from '@charlyghislain/plancul-ws-api';
import {debounceTime, map, publishReplay, refCount} from 'rxjs/operators';
import {SelectedTenantService} from '../../main/service/selected-tenant.service';

@Component({
  selector: 'pc-bed-filter',
  templateUrl: './bed-filter.component.html',
  styleUrls: ['./bed-filter.component.scss'],
})
export class BedFilterComponent implements OnInit {

  searchQuery = new BehaviorSubject<string>(null);
  @Output()
  filterChanged: Observable<WsBedFilter>;

  constructor(private selectedTenantService: SelectedTenantService) {
    this.filterChanged = combineLatest(
      this.searchQuery.pipe(debounceTime(200)),
      this.selectedTenantService.getSelectedTenantRef(),
    ).pipe(
      map(results => this.createFilter(results[0], results[1])),
      publishReplay(1), refCount(),
    );
  }

  ngOnInit() {
  }

  onQueryChanged(query: string) {
    this.searchQuery.next(query);
  }

  private createFilter(query: string, tenantRef: WsRef<WsTenant>): WsBedFilter {
    const filter: WsBedFilter = {};
    if (tenantRef != null) {
      filter.tenantWsRef = tenantRef;
    }
    if (query != null) {
      filter.nameQuery = query;
    }
    return filter;
  }
}
