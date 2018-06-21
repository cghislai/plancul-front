import {Component, OnDestroy, OnInit} from '@angular/core';
import {NotificationMessageService} from '../../main/service/notification-message.service';
import {SelectedTenantService} from '../../main/service/selected-tenant.service';
import {RequestService} from '../../main/service/request.service';
import {ActivatedRoute, Data, Router} from '@angular/router';
import {WsCulture, WsRef} from '@charlyghislain/plancul-ws-api';
import {CultureClientService} from '../../main/service/culture-client.service';
import {Subscription} from 'rxjs';

@Component({
  selector: 'pc-culture-form',
  templateUrl: './culture-form.component.html',
  styleUrls: ['./culture-form.component.scss']
})
export class CultureFormComponent implements OnInit, OnDestroy {

  culture: WsCulture;

  subscription: Subscription;

  constructor(private router: Router,
              private activatedRoute: ActivatedRoute,
              private tenantSelectionService: SelectedTenantService,
              private notificationService: NotificationMessageService,
              private requestService: RequestService,
              private cultureClient: CultureClientService) {
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
    this.cultureClient.saveCulture(this.culture)
      .subscribe(ref => this.onCreationSuccess(ref),
        error => this.onCreationError(error));
  }

  onCancel() {
    this.navigateOut();
  }

  private onCreationSuccess(ref: WsRef<WsCulture>) {
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
    this.culture = data.culture;
  }


  private navigateOut() {
    this.router.navigate(['/cultures/_/list']);
  }

}
