import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {WsCrop, WsCropCreationRequest, WsRef, WsTenant} from '@charlyghislain/plancul-api';
import {SelectedTenantService} from '../../main/service/selected-tenant.service';
import {NotificationMessageService} from '../../main/service/notification-message.service';
import {RequestService} from '../../main/service/request.service';
import {CropClientService} from '../../main/service/crop-client.service';
import {AgrovocPlantClientService} from '../../main/service/agrovoc-plant-client.service';
import {filter, map, publishReplay, refCount, take} from 'rxjs/operators';
import {LocalizationService} from '../../main/service/localization.service';
import {MessageKeys} from '../../main/service/util/message-keys';
import {forkJoin, Observable} from 'rxjs';
import {ErrorKeys} from '../../main/service/util/error-keys';

@Component({
  selector: 'pc-new-crop-route',
  templateUrl: './new-crop-route.component.html',
  styleUrls: ['./new-crop-route.component.scss'],
})
export class NewCropRouteComponent implements OnInit {

  crop: WsCropCreationRequest;
  agrovocQuery$: Observable<string>;

  private ROUTE_REDIRECT_PARAM = 'redirect';
  private ROUTE_AGROVOC_QUERY_PARAM = 'agrovocQuery';
  private routeRedirectParamValue$: Observable<string>;

  constructor(private router: Router,
              private activatedRoute: ActivatedRoute,
              private localizationService: LocalizationService,
              private tenantSelectionService: SelectedTenantService,
              private notificationService: NotificationMessageService,
              private requestService: RequestService,
              private agrovocClient: AgrovocPlantClientService,
              private cropClient: CropClientService) {
  }


  ngOnInit() {
    const routeParams$ = this.activatedRoute.params.pipe(publishReplay(1), refCount());
    this.routeRedirectParamValue$ = routeParams$.pipe(
      map(params => params[this.ROUTE_REDIRECT_PARAM]),
      publishReplay(1), refCount(),
    );
    this.agrovocQuery$ = routeParams$.pipe(
      map(params => params[this.ROUTE_AGROVOC_QUERY_PARAM]),
      publishReplay(1), refCount(),
    );
    this.tenantSelectionService.getSelectedTenantRef()
      .pipe(filter(t => t != null), take(1))
      .subscribe(ref => this.crop = this.createCropRequest(ref));
  }

  onSubmit(crop: WsCropCreationRequest) {
    this.cropClient.createCrop(crop)
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
    this.localizationService.getTranslation(MessageKeys.SAVED_TITLE)
      .subscribe(msg => this.notificationService.addInfo(msg));
    this.navigateOut();
  }

  private onCreationError(error: any) {
    if (this.requestService.isBadRequestError(error)) {
      forkJoin(
        this.localizationService.getTranslation(MessageKeys.ERROR_TITLE),
        this.localizationService.getTranslation(ErrorKeys.INVALID_FORM),
      ).subscribe(msgs => this.notificationService.addError(msgs[0], msgs[1]));
    } else {
      forkJoin(
        this.localizationService.getTranslation(MessageKeys.ERROR_TITLE),
        this.localizationService.getTranslation(ErrorKeys.UNEXPECTED_ERROR),
      ).subscribe(msgs => this.notificationService.addError(msgs[0], msgs[1]));
    }
  }

  private navigateOut() {
    this.routeRedirectParamValue$.subscribe(redirectParam => {
      if (redirectParam == null) {
        this.router.navigate(['/crops/_/list']);
      } else {
        this.router.navigateByUrl(redirectParam);
      }
    });
  }
}
