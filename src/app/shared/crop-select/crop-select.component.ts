import {Component, OnInit} from '@angular/core';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';
import {BehaviorSubject, forkJoin, Observable, of} from 'rxjs';
import {WsCrop, WsCropFilter, WsCropSortField, WsRef, WsSortOrder} from '@charlyghislain/plancul-ws-api';
import {SelectItem} from 'primeng/api';
import {map, publishReplay, refCount, switchMap} from 'rxjs/operators';
import {CropClientService} from '../../main/service/crop-client.service';
import {AgrovocPlantClientService} from '../../main/service/agrovoc-plant-client.service';
import {Pagination} from '../../main/domain/pagination';

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

  value: Observable<SelectItem>;
  suggestions: SelectItem[];

  private changeFunction: Function;
  private touchedFunction: Function;
  private valueSource = new BehaviorSubject<WsRef<WsCrop>>(null);


  constructor(private cropClient: CropClientService,
              private agroPlantClient: AgrovocPlantClientService) {
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
    this.changeFunction(item.value);
  }

  search(event) {
    const filter: WsCropFilter = {
      namesQuery: event.query,
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
        switchMap(list => this.createItemList(list)),
      ).subscribe(list => this.suggestions = list);
  }

  onBlur() {
    this.touchedFunction();
  }

  private createSelectItem(ref: WsRef<WsCrop>): Observable<SelectItem> {
    if (ref == null) {
      return of(null);
    }
    return this.cropClient.getCrop(ref.id)
      .pipe(
        switchMap(crop => this.createSelectItemWithCrop(crop)),
      );
  }

  private createSelectItemWithCrop(crop: WsCrop): Observable<SelectItem> {
    return this.agroPlantClient.getAgrovocPlant(crop.agrovocPlantWsRef.id)
      .pipe(
        map(plant => plant.preferedLabel),
        map(label => this.createSelectItemWithLabel(crop, label)),
      );
  }

  private createSelectItemWithLabel(crop: WsCrop, taxon: string): SelectItem {
    const label = `${taxon} '${crop.cultivar}'`;
    return {
      label: label,
      value: <WsRef<WsCrop>>{id: crop.id},
    };
  }

  private createItemList(list: WsRef<WsCrop>[]): Observable<SelectItem[]> {
    const taskList = list.map(ref => this.createSelectItem(ref));
    return taskList.length === 0 ? of([]) : forkJoin(taskList);
  }
}
