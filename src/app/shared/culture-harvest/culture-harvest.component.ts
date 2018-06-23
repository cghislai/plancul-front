import {Component, Input, OnInit} from '@angular/core';
import {Observable, ReplaySubject} from 'rxjs';
import {DateAsString, WsCulture} from '@charlyghislain/plancul-ws-api';
import {map, publishReplay, refCount} from 'rxjs/operators';

@Component({
  selector: 'pc-culture-harvest',
  templateUrl: './culture-harvest.component.html',
  styleUrls: ['./culture-harvest.component.scss'],
})
export class CultureHarvestComponent implements OnInit {

  @Input()
  showIcon = true;
  @Input()
  showDuration = false;
  @Input()
  showDates = true;

  @Input()
  set culture(value: WsCulture) {
    if (value != null) {
      this.valueSource.next(value);
    }
  }

  private valueSource = new ReplaySubject<WsCulture>(1);

  start: Observable<DateAsString>;
  end: Observable<DateAsString>;
  duration: Observable<number>;

  constructor() {
  }

  ngOnInit() {
    this.start = this.valueSource.pipe(
      map(nursing => nursing.firstHarvestDate),
      publishReplay(1), refCount(),
    );
    this.end = this.valueSource.pipe(
      map(nursing => nursing.lastHarvestDate),
      publishReplay(1), refCount(),
    );
    this.duration = this.valueSource.pipe(
      map(nursing => nursing.harvestDaysDuration),
      publishReplay(1), refCount(),
    );
  }

}
