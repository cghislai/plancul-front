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
  showProduct = true;

  @Input()
  set id(value: number) {
    this.idSource.next(value);
  }

  private idSource = new ReplaySubject<number>(1);

  taxon: Observable<string>;
  cultivar: Observable<string>;
  productName: Observable<string>;

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
    this.taxon = crop.pipe(
      map(c => c.agrovocPlantWsRef),
      switchMap(ref => this.agrovocPlantClient.getAgrovocPlant(ref.id)),
      map(plant => plant.preferedLabel),
      publishReplay(1), refCount(),
    );
    this.cultivar = crop.pipe(
      map(c => c.cultivar),
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
