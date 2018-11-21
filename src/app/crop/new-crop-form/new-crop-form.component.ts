import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {WsAgrovocPlantProduct, WsCrop, WsCropCreationRequest, WsRef, WsTenant} from '@charlyghislain/plancul-api';
import {SelectedTenantService} from '../../main/service/selected-tenant.service';
import {NotificationMessageService} from '../../main/service/notification-message.service';
import {RequestService} from '../../main/service/request.service';
import {CropClientService} from '../../main/service/crop-client.service';
import {AgrovocPlantClientService} from '../../main/service/agrovoc-plant-client.service';
import {filter, take} from 'rxjs/operators';

@Component({
  selector: 'pc-new-crop-form',
  templateUrl: './new-crop-form.component.html',
  styleUrls: ['./new-crop-form.component.scss'],
})
export class NewCropFormComponent implements OnInit {

  crop: WsCropCreationRequest;

  constructor(private router: Router,
              private tenantSelectionService: SelectedTenantService,
              private notificationService: NotificationMessageService,
              private requestService: RequestService,
              private agrovocClient: AgrovocPlantClientService,
              private cropClient: CropClientService) {
  }


  ngOnInit() {
    this.tenantSelectionService.getSelectedTenantRef()
      .pipe(filter(t => t != null), take(1))
      .subscribe(ref => this.crop = this.createCropRequest(ref));
  }

  onPlanProductTupleChange(tuple: WsAgrovocPlantProduct) {
    if (tuple == null) {
      this.crop.agrovocPlantURI = null;
      this.crop.agrovocProductURI = null;
      return;
    }
    this.agrovocClient.searchPlantData(tuple.plantURI)
      .subscribe(plantData => {
        this.crop.displayName = tuple.matchedTerm;
        this.crop.agrovocPlantURI = tuple.plantURI;
        this.crop.agrovocProductURI = tuple.productURI;
        this.crop.family = plantData.familyName;
        this.crop.species = plantData.speciesName;
        this.crop.subSpecies = plantData.subSpeciesName;
      });
  }


  onSubmit() {
    this.cropClient.createCrop(this.crop)
      .subscribe(ref => this.onCreationSuccess(ref),
        error => this.onCreationError(error));
  }

  onCancel() {
    this.navigateOut();
  }

  private createCropRequest(tenantRef: WsRef<WsTenant>): WsCropCreationRequest {
    return {
      displayName: null,
      family: null,
      species: null,
      tenantRef: tenantRef,
      shared: false,
      subSpecies: null,
      cultivar: null,
      agrovocPlantURI: null,
      agrovocProductURI: null,
    };
  }

  private onCreationSuccess(ref: WsRef<WsCrop>) {
    this.notificationService.addInfo('Saved');
    this.navigateOut();
  }

  private onCreationError(error: any) {
    if (this.requestService.isBadRequestError(error)) {
      this.notificationService.addError('Error', 'The form is invalid');
    } else {
      this.notificationService.addError('Error', 'Unexpected error');
    }
  }

  private navigateOut() {
    this.router.navigate(['/crops/_/list']);
  }
}
