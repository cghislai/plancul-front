import {Component, OnInit, Output} from '@angular/core';
import {BehaviorSubject, combineLatest, Observable} from 'rxjs';
import {QueryType} from '../crop-search-query-type/query-type';
import {WsCropFilter, WsRef, WsTenant} from '@charlyghislain/plancul-ws-api';
import {debounceTime, map, publishReplay, refCount} from 'rxjs/operators';
import {SelectedTenantService} from '../../main/service/selected-tenant.service';

@Component({
  selector: 'pc-crop-filter',
  templateUrl: './crop-filter.component.html',
  styleUrls: ['./crop-filter.component.scss'],
})
export class CropFilterComponent implements OnInit {

  searchQuery = new BehaviorSubject<string>(null);
  queryType = new BehaviorSubject<QueryType>(QueryType.ALL);
  privateCrops = new BehaviorSubject<boolean>(null);

  queryTypeOptions: QueryType[] = [
    QueryType.ALL,
    QueryType.PLANT,
    QueryType.CULTIVAR,
  ];

  @Output()
  filterChanged: Observable<WsCropFilter>;

  constructor(private selectedTenantService: SelectedTenantService) {
    this.filterChanged = combineLatest(
      this.searchQuery.pipe(debounceTime(200)),
      this.queryType,
      this.privateCrops,
      this.selectedTenantService.getSelectedTenantRef(),
    ).pipe(
      map(results => this.createFilter(results[0], results[1], results[2], results[3])),
      publishReplay(1), refCount(),
    );
  }

  ngOnInit() {
  }

  onQueryChanged(query: string) {
    this.searchQuery.next(query);
  }

  onQueryTypeChange(type: QueryType) {
    this.queryType.next(type);
  }

  onPrivateCropsChanged(value: boolean) {
    this.privateCrops.next(value);
  }

  private createFilter(query: string, queryType: QueryType, privateCrops: boolean, tenantRef: WsRef<WsTenant>): WsCropFilter {
    const filter: WsCropFilter = {};
    if (query != null && queryType != null) {
      switch (queryType) {
        case QueryType.ALL:
          filter.namesQuery = query;
          break;
        case  QueryType.CULTIVAR:
          filter.cultivarQuery = query;
          break;
        case QueryType.PLANT:
          filter.plantQuery = query;
      }
    }
    if (privateCrops === true) {
      filter.tenantWsRef = tenantRef;
      filter.shared = false;
    }
    return filter;
  }
}
