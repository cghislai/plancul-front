import {Component, Input, OnInit} from '@angular/core';
import {Observable, ReplaySubject} from 'rxjs';
import {DateAsString, WsBedPreparation, WsBedPreparationType} from '@charlyghislain/plancul-api';
import {map, publishReplay, refCount} from 'rxjs/operators';

@Component({
  selector: 'pc-bed-preparation',
  templateUrl: './bed-preparation.component.html',
  styleUrls: ['./bed-preparation.component.scss'],
})
export class BedPreparationComponent implements OnInit {

  @Input()
  showIcon = true;
  @Input()
  showDuration = true;
  @Input()
  showDates = false;

  @Input()
  set bedPreparation(value: WsBedPreparation) {
    if (value != null) {
      this.valueSource.next(value);
    }
  }

  private valueSource = new ReplaySubject<WsBedPreparation>(1);

  type: Observable<WsBedPreparationType>;
  start: Observable<DateAsString>;
  end: Observable<DateAsString>;
  duration: Observable<number>;

  constructor() {
  }

  ngOnInit() {
    this.type = this.valueSource.pipe(
      map(prep => prep.type),
      publishReplay(1), refCount(),
    );
    this.start = this.valueSource.pipe(
      map(prep => prep.startDate),
      publishReplay(1), refCount(),
    );
    this.end = this.valueSource.pipe(
      map(prep => prep.endDate),
      publishReplay(1), refCount(),
    );
    this.duration = this.valueSource.pipe(
      map(prep => prep.dayDuration),
      publishReplay(1), refCount(),
    );
  }

}
