import {Component, Input, OnInit} from '@angular/core';
import {Observable, ReplaySubject} from 'rxjs';
import {map, publishReplay, refCount, switchMap} from 'rxjs/operators';
import {AgrovocPlantClientService} from '../../main/service/agrovoc-plant-client.service';
import {CropClientService} from '../../main/service/crop-client.service';
import {AgrovocProductClientService} from '../../main/service/agrovoc-product-client.service';

@Component({
  selector: 'pc-crop',
  templateUrl: './crop.component.html',
  styleUrls: ['./crop.component.scss'],
})
export class CropComponent implements OnInit {

  @Input()
  showIcon = true;
  @Input()
  showTaxon = true;

  @Input()
  set id(value: number) {
    this.idSource.next(value);
  }

  private idSource = new ReplaySubject<number>(1);

  family: Observable<string>;
  species: Observable<string>;
  subspecies: Observable<string>;
  cultivar: Observable<string>;
  productName: Observable<string>;
  displayName: Observable<string>;

  constructor(private cropClient: CropClientService,
              private agrovocPlantClient: AgrovocPlantClientService,
              private agrovocProductClient: AgrovocProductClientService,
  ) {
  }

  ngOnInit() {
    const crop = this.idSource.pipe(
      switchMap(id => this.cropClient.getCrop(id)),
      publishReplay(1), refCount(),
    );
    this.family = crop.pipe(
      map(c => c.family),
      publishReplay(1), refCount(),
    );
    this.species = crop.pipe(
      map(c => c.species),
      publishReplay(1), refCount(),
    );
    this.subspecies = crop.pipe(
      map(c => c.cultivar),
      publishReplay(1), refCount(),
    );
    this.cultivar = crop.pipe(
      map(c => c.cultivar),
      publishReplay(1), refCount(),
    );
    this.displayName = crop.pipe(
      map(c => c.displayName),
      publishReplay(1), refCount(),
    );
    this.productName = crop.pipe(
      map(c => c.agrovocProductWsRef),
      switchMap(ref => this.agrovocProductClient.getAgrovocProduct(ref.id)),
      map(product => product.preferedLabel),
      publishReplay(1), refCount(),
    );
  }

}
