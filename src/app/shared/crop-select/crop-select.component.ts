import {Component, Input, OnInit} from '@angular/core';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';
import {BehaviorSubject, forkJoin, Observable, of} from 'rxjs';
import {WsCrop, WsCropFilter, WsCropSortField, WsRef, WsSortOrder} from '@charlyghislain/plancul-api';
import {SelectItem} from 'primeng/api';
import {map, publishReplay, refCount, switchMap} from 'rxjs/operators';
import {CropClientService} from '../../main/service/crop-client.service';
import {Pagination} from '../../main/domain/pagination';
import {Router} from '@angular/router';
import {CropSelectItem} from './crop-select-item';

@Component({
  selector: 'pc-crop-select',
  templateUrl: './crop-select.component.html',
  styleUrls: ['./crop-select.component.scss'],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: CropSelectComponent,
    multi: true,
  }],
})
export class CropSelectComponent implements OnInit, ControlValueAccessor {

  @Input()
  private showCreateNewCropItem = true;

  value: Observable<CropSelectItem>;
  suggestions: CropSelectItem[];

  private changeFunction: Function;
  private touchedFunction: Function;
  private valueSource = new BehaviorSubject<WsRef<WsCrop>>(null);


  constructor(private cropClient: CropClientService,
              private router: Router) {
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

  onChange(item: CropSelectItem) {
    if (item == null) {
      return;
    }
    if (item.createNewCropItem) {
      const curUrl = this.router.url;
      const nextUrl = `/crops/_/new`;
      this.router.navigate([nextUrl, {
        redirect: curUrl,
        agrovocQuery: item.createNewCropQuery,
      }]);
    } else {
      this.changeFunction(item.value);
    }
  }

  search(event) {
    const searchQuery = event.query;
    const filter: WsCropFilter = {
      namesQuery: searchQuery,
    };
    const pagination: Pagination = {
      offset: 0,
      length: 10,
      sorts: [{
        field: WsCropSortField.PLANT_NAME,
        order: WsSortOrder.ASC,
      }],
    };
    this.cropClient.searchCrops(filter, pagination)
      .pipe(
        map(results => results.list),
        switchMap(list => this.createItemList(list, searchQuery)),
      ).subscribe(list => this.suggestions = list);
  }

  onBlur() {
    this.touchedFunction();
  }

  private createSelectItem(ref: WsRef<WsCrop>): Observable<CropSelectItem> {
    if (ref == null) {
      return of(null);
    }
    return this.cropClient.getCrop(ref.id)
      .pipe(
        map(crop => this.createSelectItemWithCrop(crop)),
      );
  }

  private createSelectItemWithCrop(crop: WsCrop): CropSelectItem {
    const label = `${crop.displayName}`;
    return {
      label: label,
      value: <WsRef<WsCrop>>{id: crop.id},
    };
  }

  private createItemList(list: WsRef<WsCrop>[], searchQuery: string): Observable<CropSelectItem[]> {
    const taskList = list.map(ref => this.createSelectItem(ref));
    return taskList.length === 0 ? of(this.createEmptyResultItemList(searchQuery)) : forkJoin(taskList);
  }

  private createEmptyResultItemList(query: string): CropSelectItem[] {
    if (this.showCreateNewCropItem) {
      const newCropItem: CropSelectItem = {
        createNewCropItem: true,
        createNewCropQuery: query,
        value: null,
      };
      return [newCropItem];
    } else {
      return [];
    }
  }
}
