import {Component, Input, OnInit, Output} from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';
import {WsCropFilter, WsCultureFilter} from '@charlyghislain/plancul-ws-api';
import {filter, map, publishReplay, refCount} from 'rxjs/operators';

@Component({
  selector: 'pc-culture-filter',
  templateUrl: './culture-filter.component.html',
  styleUrls: ['./culture-filter.component.scss'],
})
export class CultureFilterComponent implements OnInit {

  cropFilter: Observable<WsCropFilter>;

  @Input()
  set filter(value: WsCultureFilter) {
    this.filterSource.next(value);
  }

  @Output()
  filterChanged: Observable<WsCultureFilter>;

  private filterSource = new BehaviorSubject<WsCultureFilter>(null);

  constructor() {
    const nonNullFilter = this.filterSource.pipe(
      filter(f => f != null),
      publishReplay(1), refCount(),
    );
    this.filterChanged = nonNullFilter;

    this.cropFilter = nonNullFilter.pipe(
      map(f => f.cropFilter),
      publishReplay(1), refCount(),
    );
  }

  ngOnInit() {
  }

  onCropFilterChange(cropFilter: WsCropFilter) {
    this.updateFilter({
      cropFilter: cropFilter,
    });
  }

  private updateFilter(event: Partial<WsCultureFilter>) {
    const newFilter = Object.assign({}, this.filterSource.getValue(), event);
    this.filterSource.next(newFilter);
  }
}
