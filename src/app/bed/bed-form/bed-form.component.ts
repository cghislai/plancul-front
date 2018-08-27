import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, Data, Router} from '@angular/router';
import {WsBed, WsRef} from '@charlyghislain/plancul-api';
import {SelectedTenantService} from '../../main/service/selected-tenant.service';
import {NotificationMessageService} from '../../main/service/notification-message.service';
import {RequestService} from '../../main/service/request.service';
import {Subscription} from 'rxjs';
import {BedClientService} from '../../main/service/bed-client.service';

@Component({
  selector: 'pc-bed-form',
  templateUrl: './bed-form.component.html',
  styleUrls: ['./bed-form.component.scss'],
})
export class BedFormComponent implements OnInit, OnDestroy {

  bed: WsBed;

  subscription: Subscription;

  constructor(private router: Router,
              private activatedRoute: ActivatedRoute,
              private tenantSelectionService: SelectedTenantService,
              private notificationService: NotificationMessageService,
              private requestService: RequestService,
              private bedClient: BedClientService) {
  }


  ngOnInit() {
    this.subscription = new Subscription();
    const routeDataSubscription = this.activatedRoute.data
      .subscribe(data => this.onRouteData(data));
    this.subscription.add(routeDataSubscription);
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  onSubmit() {
    this.bedClient.saveBed(this.bed)
      .subscribe(ref => this.onCreationSuccess(ref),
        error => this.onCreationError(error));
  }

  onCancel() {
    this.navigateOut();
  }

  private onCreationSuccess(ref: WsRef<WsBed>) {
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

  private onRouteData(data: Data) {
    this.bed = data.bed;
  }


  private navigateOut() {
    this.router.navigate(['/beds/_/list']);
  }
}
