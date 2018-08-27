import {Component, Input, OnInit} from '@angular/core';
import {Observable, ReplaySubject} from 'rxjs';
import {filter, map, publishReplay, refCount, switchMap} from 'rxjs/operators';
import {CultureClientService} from '../../main/service/culture-client.service';
import {DateAsString, WsBedPreparation, WsCulture, WsCultureNursing} from '@charlyghislain/plancul-api';

@Component({
  selector: 'pc-culture',
  templateUrl: './culture.component.html',
  styleUrls: ['./culture.component.scss'],
})
export class CultureComponent implements OnInit {

  @Input()
  showIcon = true;
  @Input()
  showBed = true;
  @Input()
  showBedPreparation = true;
  @Input()
  showSowing = true;
  @Input()
  showNursing = false;
  @Input()
  showTransplanting = true;
  @Input()
  showHarvest = true;

  @Input()
  set id(value: number) {
    this.idSource.next(value);
  }

  private idSource = new ReplaySubject<number>(1);

  cultureValue: Observable<WsCulture>;
  cropId: Observable<number>;
  bedId: Observable<number>;
  bedPreparation: Observable<WsBedPreparation>;
  nursing: Observable<WsCultureNursing>;
  sowingDate: Observable<DateAsString>;
  transplantingDate: Observable<DateAsString>;

  constructor(private cultureClient: CultureClientService) {
  }

  ngOnInit() {
    const culture = this.idSource.pipe(
      switchMap(id => this.cultureClient.getCulture(id)),
      publishReplay(1), refCount(),
    );
    this.cultureValue = culture;


    this.cropId = culture.pipe(
      map(c => c.cropWsRef),
      map(ref => ref.id),
      publishReplay(1), refCount(),
    );
    this.bedId = culture.pipe(
      map(c => c.bedWsRef),
      map(ref => ref.id),
      publishReplay(1), refCount(),
    );

    this.bedPreparation = culture.pipe(
      map(c => c.bedPreparation),
      publishReplay(1), refCount(),
    );
    this.nursing = culture.pipe(
      map(c => c.cultureNursing),
      publishReplay(1), refCount(),
    );

    this.sowingDate = culture.pipe(
      map(c => c.sowingDate),
      publishReplay(1), refCount(),
    );
    this.transplantingDate = this.nursing.pipe(
      filter(n => n != null),
      map(n => n.endDate),
      publishReplay(1), refCount(),
    );

  }


}
