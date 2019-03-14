import {Component, Input, OnInit} from '@angular/core';
import {CalendarEvent} from '../domain/calendar-event';
import {LocalizationService} from '../../main/service/localization.service';
import {BehaviorSubject, Observable} from 'rxjs';
import {filter, map, publishReplay, refCount, switchMap} from 'rxjs/operators';
import {WsCulture, WsRef} from '@charlyghislain/plancul-api';

@Component({
  selector: 'pc-calendar-event',
  templateUrl: './calendar-event.component.html',
  styleUrls: ['./calendar-event.component.scss'],
})
export class CalendarEventComponent implements OnInit {

  @Input()
  set event(value: CalendarEvent) {
    this.event$.next(value);
  }

  @Input()
  showCulture = true;

  event$ = new BehaviorSubject<CalendarEvent>(null);
  cultureRef$: Observable<WsRef<WsCulture>>;

  constructor(private localizationService: LocalizationService) {
  }

  ngOnInit() {
    this.cultureRef$ = this.event$.pipe(
      filter(e => e != null),
      map(e => e.cultureRef),
      publishReplay(1), refCount(),
    );
  }

}
