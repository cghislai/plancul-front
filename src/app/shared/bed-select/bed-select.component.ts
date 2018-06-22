import {Component, OnInit} from '@angular/core';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';
import {WsBed, WsBedFilter, WsBedSortField, WsRef, WsSortOrder} from '@charlyghislain/plancul-ws-api';
import {map, publishReplay, refCount, switchMap} from 'rxjs/operators';
import {BehaviorSubject, forkJoin, Observable, of} from 'rxjs';
import {Pagination} from '../../main/domain/pagination';
import {SelectItem} from 'primeng/api';
import {BedClientService} from '../../main/service/bed-client.service';

@Component({
  selector: 'pc-bed-select',
  templateUrl: './bed-select.component.html',
  styleUrls: ['./bed-select.component.scss'],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: BedSelectComponent,
    multi: true,
  }],
})
export class BedSelectComponent implements OnInit, ControlValueAccessor {


  value: Observable<SelectItem>;
  suggestions: SelectItem[];

  private changeFunction: Function;
  private touchedFunction: Function;
  private valueSource = new BehaviorSubject<WsRef<WsBed>>(null);

  constructor(private bedClient: BedClientService) {
  }

  ngOnInit() {
    this.value = this.valueSource.pipe(
      switchMap(ref => this.createSelectItem(ref)),
      publishReplay(1), refCount(),
    );
  }

  writeValue(obj: any): void {
    this.valueSource.next(obj);
  }

  registerOnChange(fn: any): void {
    this.changeFunction = fn;
  }

  registerOnTouched(fn: any): void {
    this.touchedFunction = fn;
  }

  onChange(item: SelectItem) {
    this.touchedFunction();
    this.changeFunction(item.value);
  }

  search(event) {
    const filter: WsBedFilter = {
      nameQuery: event.query,
    };
    this.searchWithFilter(filter);
  }

  searchAll() {
    this.searchWithFilter({});
  }

  onBlur() {
    this.touchedFunction();
  }


  private searchWithFilter(filter: WsBedFilter) {
    const pagination: Pagination = {
      offset: 0,
      length: 10,
      sorts: [{
        field: WsBedSortField.NAME,
        order: WsSortOrder.ASC,
      }],
    };
    this.bedClient.searchBeds(filter, pagination)
      .pipe(
        map(results => results.list),
        switchMap(list => this.createItemList(list)),
      ).subscribe(list => this.suggestions = list);
  }


  private createSelectItem(ref: WsRef<WsBed>): Observable<SelectItem> {
    if (ref == null) {
      return of(null);
    }
    return this.bedClient.getBed(ref.id)
      .pipe(
        map(bed => this.createSelectItemWithBed(bed)),
      );
  }

  private createSelectItemWithBed(bed: WsBed): SelectItem {
    const label = bed.name;
    return {
      label: label,
      value: <WsRef<WsBed>>{id: bed.id},
    };
  }


  private createItemList(list: WsRef<WsBed>[]): Observable<SelectItem[]> {
    const taskList = list.map(ref => this.createSelectItem(ref));
    return taskList.length === 0 ? of([]) : forkJoin(taskList);
  }
}
