import {Component, Input, OnInit, ViewChild} from '@angular/core';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';
import {AgrovocPlantClientService} from '../../main/service/agrovoc-plant-client.service';
import {Pagination} from '../../main/domain/pagination';
import {WsAgrovocPlantProduct, WsPlantProductTupleFilter} from '@charlyghislain/plancul-api';
import {AutoComplete} from 'primeng/primeng';

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

  @Input()
  showClearButton = true;
  @Input()
  autofocus: boolean;

  @Input()
  set query(value: string) {
    console.log(value);
    if (value != null) {
      this.setAutoCompleteQuery(value);
    }
  }

  changeFunction: Function;
  touchedFunction: Function;

  selection: WsAgrovocPlantProduct;
  suggestions: (WsAgrovocPlantProduct & { id: number })[] = [];

  @ViewChild('autoComplete')
  private autoCompleteComponent: AutoComplete;

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
      .subscribe(results => this.setSuggestions(results),
        error => this.onSearchError(error));
  }

  onClearClick() {
    this.selection = this.createNullOption();
    this.suggestions = [];
    this.touchedFunction();
    this.changeFunction(null);
  }

  private createNullOption(): WsAgrovocPlantProduct & { id: number } {
    return {
      id: null,
      matchedTerm: null,
      plantURI: null,
      productURI: null,
      language: null,
      plantPreferredLabel: null,
      productPreferredLabel: null,
    };
  }

  private setSuggestions(results: WsAgrovocPlantProduct[]) {
    let id = 0;
    // Append an id for the autocomplete selection
    this.suggestions = results
      .map(p => {
        const newTuple = Object.assign({}, p, {id: id});
        id += 1;
        return newTuple;
      });
  }

  onSelectionChange(tuple: WsAgrovocPlantProduct) {
    if (this.touchedFunction) {
      this.touchedFunction();
    }
    if (this.changeFunction) {
      this.changeFunction(tuple);
    }
  }

  private onSearchError(error: any) {
    this.suggestions = [];
  }

  private setAutoCompleteQuery(value: string) {
    if (this.autoCompleteComponent) {
      setTimeout(() => {
        this.autoCompleteComponent.inputFieldValue = value;
        this.autoCompleteComponent.ngDoCheck();
        this.autoCompleteComponent.search(null, value);
      }, 100);
    }
  }
}
