import {Component, OnInit} from '@angular/core';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';
import {WsPlantProductResult, WsPlantProductTupleFilter} from '@charlyghislain/plancul-ws-api';
import {AgrovocPlantClientService} from '../../main/service/agrovoc-plant-client.service';
import {Pagination} from '../../main/domain/pagination';

@Component({
  selector: 'pc-agrovoc-plant-product-tuple-select',
  templateUrl: './agrovoc-plant-product-tuple-select.component.html',
  styleUrls: ['./agrovoc-plant-product-tuple-select.component.scss'],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: AgrovocPlantProductTupleSelectComponent,
    multi: true,
  }],
})
export class AgrovocPlantProductTupleSelectComponent implements OnInit, ControlValueAccessor {
  changeFunction: Function;
  touchedFunction: Function;

  selection: AgrovocPlantClientService;
  suggestions: WsPlantProductResult[] = [];

  constructor(private plantClient: AgrovocPlantClientService) {
  }

  ngOnInit() {
  }

  writeValue(obj: any): void {
    // TODO: Not supoprted in api yet
  }

  registerOnChange(fn: any): void {
    this.changeFunction = fn;
  }

  registerOnTouched(fn: any): void {
    this.touchedFunction = fn;
  }

  search(event: any) {
    const filter: WsPlantProductTupleFilter = {
      queryString: event.query,
    };
    const pagination: Pagination = {
      offset: 0,
      length: 10,
    };
    this.plantClient.searchPlantProductTuple(filter, pagination)
      .subscribe(results => this.suggestions = results);
  }

  onSelectionChange(tuple: WsPlantProductResult) {
    if (this.touchedFunction) {
      this.touchedFunction();
    }
    if (this.changeFunction) {
      this.changeFunction(tuple);
    }
  }
}
