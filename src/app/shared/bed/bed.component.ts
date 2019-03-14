import {Component, Input, OnInit} from '@angular/core';
import {Observable, ReplaySubject} from 'rxjs';
import {map, publishReplay, refCount, switchMap} from 'rxjs/operators';
import {BedClientService} from '../../main/service/bed-client.service';

@Component({
  selector: 'pc-bed',
  templateUrl: './bed.component.html',
  styleUrls: ['./bed.component.scss'],
})
export class BedComponent implements OnInit {

  @Input()
  showIcon = true;
  @Input()
  showPatch = true;
  @Input()
  showSurface = true;

  @Input()
  set id(value: number) {
    this.idSource.next(value);
  }

  private idSource = new ReplaySubject<number>(1);

  name: Observable<string>;
  patch: Observable<string>;
  surface: Observable<number>;

  constructor(private bedClient: BedClientService) {
  }

  ngOnInit() {
    const bed = this.idSource.pipe(
      switchMap(id => this.bedClient.getBed(id)),
      publishReplay(1), refCount(),
    );
    this.name = bed.pipe(
      map(b => b.name),
      publishReplay(1), refCount(),
    );
    this.surface = bed.pipe(
      map(b => b.surface),
      publishReplay(1), refCount(),
    );
    this.patch = bed.pipe(
      map(b => b.patch),
      publishReplay(1), refCount(),
    );
  }

}
