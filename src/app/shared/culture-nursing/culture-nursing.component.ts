import {Component, Input, OnInit} from '@angular/core';
import {DateAsString, WsCultureNursing} from '@charlyghislain/plancul-api';
import {Observable, ReplaySubject} from 'rxjs';
import {map, publishReplay, refCount} from 'rxjs/operators';

@Component({
  selector: 'pc-culture-nursing',
  templateUrl: './culture-nursing.component.html',
  styleUrls: ['./culture-nursing.component.scss'],
})
export class CultureNursingComponent implements OnInit {

  @Input()
  showIcon = true;
  @Input()
  showDuration = true;
  @Input()
  showDates = false;

  @Input()
  set nursing(value: WsCultureNursing) {
    if (value != null) {
      this.valueSource.next(value);
    }
  }

  private valueSource = new ReplaySubject<WsCultureNursing>(1);

  start: Observable<DateAsString>;
  end: Observable<DateAsString>;
  duration: Observable<number>;


  constructor() {
  }

  ngOnInit() {
    this.start = this.valueSource.pipe(
      map(nursing => nursing.startDate),
      publishReplay(1), refCount(),
    );
    this.end = this.valueSource.pipe(
      map(nursing => nursing.endDate),
      publishReplay(1), refCount(),
    );
    this.duration = this.valueSource.pipe(
      map(nursing => nursing.dayDuration),
      publishReplay(1), refCount(),
    );
  }

}
