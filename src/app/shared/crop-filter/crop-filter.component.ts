import {Component, Input, OnInit, Output} from '@angular/core';
import {BehaviorSubject, combineLatest, Observable} from 'rxjs';
import {WsCropFilter, WsRef, WsTenant} from '@charlyghislain/plancul-ws-api';
import {SelectedTenantService} from '../../main/service/selected-tenant.service';
import {filter, map, publishReplay, refCount, take} from 'rxjs/operators';
import {QueryType} from '../crop-search-query-type/query-type';

@Component({
  selector: 'pc-crop-filter',
  templateUrl: './crop-filter.component.html',
  styleUrls: ['./crop-filter.component.scss'],
})
export class CropFilterComponent implements OnInit {

  searchQuery: Observable<string>;
  queryType: Observable<QueryType>;
  privateCrops: Observable<boolean>;

  queryTypeOptions: QueryType[] = [
    QueryType.ALL,
    QueryType.PLANT,
    QueryType.CULTIVAR,
  ];

  @Input()
  set filter(value: WsCropFilter) {
    this.filterSource.next(value);
  }

  @Output()
  filterChanged: Observable<WsCropFilter>;

  private filterSource = new BehaviorSubject<WsCropFilter>(null);

  constructor(private selectedTenantService: SelectedTenantService) {
    const nonNullFilter = this.filterSource.pipe(
      filter(f => f != null),
      publishReplay(1), refCount(),
    );
    this.filterChanged = nonNullFilter;

    this.queryType = nonNullFilter.pipe(
      map(f => this.extractQueryType(f)),
      publishReplay(1), refCount(),
    );
    this.searchQuery = combineLatest(nonNullFilter, this.queryType)
      .pipe(
        map(results => this.extractSearchQuery(results[0], results[1])),
        publishReplay(1), refCount(),
      );
    this.privateCrops = nonNullFilter.pipe(
      map(f => f.shared === false && f.tenantWsRef != null),
      publishReplay(1), refCount(),
    );
  }

  ngOnInit() {
  }

  onQueryChanged(query: string) {
    this.queryType.pipe(
      take(1),
      map(type => this.createQueryUpdate(type, query)),
    ).subscribe(update => this.updateFilter(update));
  }

  onQueryTypeChange(type: QueryType) {
    this.searchQuery.pipe(
      take(1),
      map(query => this.createQueryUpdate(type, query)),
    ).subscribe(update => this.updateFilter(update));
  }

  onPrivateCropsChanged(privateCrops: boolean) {
    this.selectedTenantService.getSelectedTenantRef()
      .pipe(
        take(1),
        map(ref => this.createSharedUpdate(privateCrops, ref)),
      ).subscribe(update => this.updateFilter(update));
  }

  private updateFilter(update: Partial<WsCropFilter>) {
    const newFilter = Object.assign({}, this.filterSource.getValue(), update);
    this.filterSource.next(newFilter);
  }


  private extractQueryType(searchFilter: WsCropFilter): QueryType {
    if (searchFilter.namesQuery != null) {
      return QueryType.ALL;
    } else if (searchFilter.plantQuery != null) {
      return QueryType.PLANT;
    } else if (searchFilter.cultivarQuery != null) {
      return QueryType.CULTIVAR;
    } else {
      return null;
    }
  }


  private extractSearchQuery(searchFilter: WsCropFilter, queryType: QueryType) {
    if (queryType == null) {
      return null;
    }
    switch (queryType) {
      case QueryType.ALL:
        return searchFilter.namesQuery;
      case  QueryType.CULTIVAR:
        return searchFilter.cultivarQuery;
      case QueryType.PLANT:
        return searchFilter.plantQuery;
    }
    return null;
  }

  private createQueryUpdate(type: QueryType, query: string): Partial<WsCropFilter> {
    const update: Partial<WsCropFilter> = {};
    if (query != null && type != null) {
      switch (type) {
        case QueryType.ALL:
          update.namesQuery = query;
          update.cultivarQuery = undefined;
          update.plantQuery = undefined;
          break;
        case  QueryType.CULTIVAR:
          update.namesQuery = undefined;
          update.cultivarQuery = query;
          update.plantQuery = undefined;
          break;
        case QueryType.PLANT:
          update.namesQuery = undefined;
          update.cultivarQuery = undefined;
          update.plantQuery = query;
          break;
      }
    }
    return update;
  }

  private createSharedUpdate(privateCrops: boolean, tenantRef: WsRef<WsTenant>): Partial<WsCropFilter> {
    if (privateCrops) {
      return {
        shared: false,
        tenantWsRef: tenantRef,
      };
    } else {
      return {
        shared: null,
        tenantWsRef: null,
      };
    }
  }
}
