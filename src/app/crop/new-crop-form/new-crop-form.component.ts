import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {WsCrop, WsCropCreationRequest, WsPlantProductResult, WsRef} from '@charlyghislain/plancul-ws-api';
import {SelectedTenantService} from '../../main/service/selected-tenant.service';
import {NotificationMessageService} from '../../main/service/notification-message.service';
import {RequestService} from '../../main/service/request.service';
import {CropClientService} from '../../main/service/crop-client.service';

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
              private cropClient: CropClientService) {
    this.crop = this.createCropRequest();
  }


  ngOnInit() {
  }

  onPlanProductTupleChange(tuple: WsPlantProductResult) {
    this.crop.agrovocProductUri = tuple.productAgrovocUri;
    this.crop.agrovocPlantUri = tuple.plantAgrovocUri;
  }

  onShareChanged() {
    this.tenantSelectionService.getSelectedTenantRef()
      .subscribe(ref => this.crop.tenantRestrictionRef = ref);
  }

  onSubmit() {
    this.cropClient.createCrop(this.crop)
      .subscribe(ref => this.onCreationSuccess(ref),
        error => this.onCreationError(error));
  }

  onCancel() {
    this.navigateOut();
  }

  private createCropRequest(): WsCropCreationRequest {
    return {
      agrovocPlantUri: null,
      agrovocProductUri: null,
      cultivar: null,
      tenantRestrictionRef: null,
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
