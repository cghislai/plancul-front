import {Component, OnInit, Output} from '@angular/core';
import {BehaviorSubject, combineLatest, Observable} from 'rxjs';
import {WsBedFilter, WsRef, WsTenant} from '@charlyghislain/plancul-api';
import {debounceTime, map, publishReplay, refCount} from 'rxjs/operators';
import {SelectedTenantService} from '../../main/service/selected-tenant.service';

@Component({
  selector: 'pc-bed-filter',
  templateUrl: './bed-filter.component.html',
  styleUrls: ['./bed-filter.component.scss'],
})
export class BedFilterComponent implements OnInit {

  searchQuery = new BehaviorSubject<string>(null);
  patch = new BehaviorSubject<string>(null);

  @Output()
  filterChanged: Observable<WsBedFilter>;

  constructor(private selectedTenantService: SelectedTenantService) {
    this.filterChanged = combineLatest(
      this.searchQuery.pipe(debounceTime(200)),
      this.patch,
      this.selectedTenantService.getSelectedTenantRef(),
    ).pipe(
      map(results => this.createFilter(results[0], results[1], results[2])),
      publishReplay(1), refCount(),
    );
  }

  ngOnInit() {
  }

  onQueryChanged(query: string) {
    this.searchQuery.next(query);
  }

  onPatchChanged(patch: string) {
    this.patch.next(patch);
  }

  private createFilter(query: string, patch: string, tenantRef: WsRef<WsTenant>): WsBedFilter {
    const filter: WsBedFilter = {};
    if (tenantRef != null) {
      filter.tenantWsRef = tenantRef;
    }
    if (query != null) {
      filter.nameQuery = query;
    }
    if (patch != null) {
      filter.patch = patch;
    }
    return filter;
  }
}
