import {Component, Input, OnInit} from '@angular/core';
import {Observable, ReplaySubject} from 'rxjs';
import {map, publishReplay, refCount, switchMap} from 'rxjs/operators';
import {CultureClientService} from '../../main/service/culture-client.service';

@Component({
  selector: 'pc-culture',
  templateUrl: './culture.component.html',
  styleUrls: ['./culture.component.scss'],
})
export class CultureComponent implements OnInit {

  @Input()
  showIcon = true;

  @Input()
  set id(value: number) {
    this.idSource.next(value);
  }

  private idSource = new ReplaySubject<number>(1);

  cropId: Observable<number>;

  constructor(private cultureClient: CultureClientService) {
  }

  ngOnInit() {
    const culture = this.idSource.pipe(
      switchMap(id => this.cultureClient.getCulture(id)),
      publishReplay(1), refCount(),
    );
    this.cropId = culture.pipe(
      map(c => c.cropWsRef),
      map(ref => ref.id),
      publishReplay(1), refCount(),
    );
  }


}
