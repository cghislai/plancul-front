import {Component, OnDestroy, OnInit} from '@angular/core';
import {NotificationMessageService} from '../../main/service/notification-message.service';
import {SelectedTenantService} from '../../main/service/selected-tenant.service';
import {RequestService} from '../../main/service/request.service';
import {ActivatedRoute, Router} from '@angular/router';
import {
  DateAsString,
  WsBed,
  WsBedPreparation,
  WsBedPreparationType,
  WsCrop,
  WsCulture,
  WsCultureNursing,
  WsRef,
} from '@charlyghislain/plancul-ws-api';
import {CultureClientService} from '../../main/service/culture-client.service';
import {combineLatest, Observable, Subscription} from 'rxjs';
import {DateRange} from '../../main/domain/date-range';
import {map, publishReplay, refCount} from 'rxjs/operators';
import {Message} from 'primeng/api';
import {FormValidationHelper} from '../../main/service/util/form-validation-helper';
import {ValidatedFormProperty} from '../../main/domain/validated-form-property';

@Component({
  selector: 'pc-culture-form',
  templateUrl: './culture-form.component.html',
  styleUrls: ['./culture-form.component.scss'],
})
export class CultureFormComponent implements OnInit, OnDestroy {

  // hasCulture: Observable<boolean>;
  cropRef: Observable<ValidatedFormProperty<WsCulture, 'cropWsRef'>>;
  bedRef: Observable<ValidatedFormProperty<WsCulture, 'bedWsRef'>>;
  sowingDate: Observable<ValidatedFormProperty<WsCulture, 'sowingDate'>>;
  germinationDate: Observable<ValidatedFormProperty<WsCulture, 'germinationDate'>>;
  harvestDateRange: Observable<ValidatedFormProperty<any, any>>;

  hasNursing: Observable<boolean>;
  nursingDuration: Observable<ValidatedFormProperty<WsCultureNursing, 'dayDuration'>>;
  nursingEndDate: Observable<DateAsString>;

  hasBedPreparation: Observable<boolean>;
  bedPreparationType: Observable<ValidatedFormProperty<WsBedPreparation, 'type'>>;
  bedPreparationDuration: Observable<ValidatedFormProperty<WsBedPreparation, 'dayDuration'>>;

  htmlNotes: Observable<ValidatedFormProperty<WsCulture, 'htmlNotes'>>;
  bedOccupancyStart: Observable<DateAsString>;
  bedOccupancyEnd: Observable<DateAsString>;

  hasValidationErrors: Observable<boolean>;
  unboundErrorMessages: Observable<Message[]>;

  private formHelper: FormValidationHelper<WsCulture>;
  private subscription: Subscription;

  constructor(private router: Router,
              private activatedRoute: ActivatedRoute,
              private tenantSelectionService: SelectedTenantService,
              private notificationService: NotificationMessageService,
              private requestService: RequestService,
              private cultureClient: CultureClientService) {
    this.formHelper = new FormValidationHelper<WsCulture>(
      this.requestService, this.cultureClient.validateCulture,
    );
  }


  ngOnInit() {
    this.subscription = new Subscription();
    const routeDataSubscription = this.activatedRoute.data
      .pipe(
        map(data => data.culture),
      ).subscribe(value => this.formHelper.setValue(value));

    this.cropRef = this.formHelper.getPropertyModel('cropWsRef');
    this.bedRef = this.formHelper.getPropertyModel('bedWsRef');
    this.sowingDate = this.formHelper.getPropertyModel('sowingDate');
    this.germinationDate = this.formHelper.getPropertyModel('germinationDate');
    this.harvestDateRange = combineLatest(
      this.formHelper.getPropertyModel('firstHarvestDate'),
      this.formHelper.getPropertyModel('lastHarvestDate'),
    ).pipe(
      map(models => this.createHarvestDateRangeModel(models)),
      publishReplay(1), refCount(),
    );

    this.hasNursing = this.formHelper.mapPropertyValue<boolean>('cultureNursing', n => n != null);
    this.nursingDuration = this.formHelper.getWrappedPropertyModel('cultureNursing', 'dayDuration');
    this.nursingEndDate = this.formHelper.getWrappedPropertyValue('cultureNursing', 'endDate');

    this.hasBedPreparation = this.formHelper.mapPropertyValue<boolean>('bedPreparation', p => p != null);
    this.bedPreparationType = this.formHelper.getWrappedPropertyModel('bedPreparation', 'type');
    this.bedPreparationDuration = this.formHelper.getWrappedPropertyModel('bedPreparation', 'dayDuration');

    this.htmlNotes = this.formHelper.getPropertyModel('htmlNotes');
    this.bedOccupancyStart = this.formHelper.getPropertyValue('bedOccupancyStartDate');
    this.bedOccupancyEnd = this.formHelper.getPropertyValue('bedOccupancyEndDate');

    this.hasValidationErrors = this.formHelper.isInvalid();

    this.unboundErrorMessages = this.formHelper.getUnboundErrors().pipe(
      map(list => list.map(
        (error: string) => <Message>{
          summary: error,
          severity: 'error',
        }),
      ),
    );
  }

  ngOnDestroy() {
  }

  onCropChange(value: WsRef<WsCrop>) {
    this.updateModel({
      cropWsRef: value,
    });
  }

  onBedChange(value: WsRef<WsBed>) {
    this.updateModel({
      bedWsRef: value,
    });
  }

  onSowingDateChange(value: DateAsString) {
    this.updateModel({
      sowingDate: value,
    });
  }

  onGerminationDateChange(value: DateAsString) {
    this.updateModel({
      germinationDate: value,
    });
  }

  onHarvestRangeChanged(range: DateRange) {
    this.updateModel({
      firstHarvestDate: range.from,
      lastHarvestDate: range.to,
    });
  }

  onNursingChanged(nursing: boolean) {
    if (nursing) {
      this.updateModel({
        cultureNursing: {
          id: null,
          dayDuration: 1,
          endDate: null,
          startdate: null,
        },
      });
    } else {
      this.updateModel({
        cultureNursing: null,
      });
    }
  }

  onNursingDurationChange(value: number) {
    this.updateNursingModel({
      dayDuration: value,
    });
  }

  onPreparationChanged(preparation: boolean) {
    if (preparation) {
      this.updateModel({
        bedPreparation: {
          id: null,
          dayDuration: 1,
          endDate: null,
          startDate: null,
          type: WsBedPreparationType.COVER,
        },
      });
    } else {
      this.updateModel({
        bedPreparation: null,
      });
    }
  }

  onBedPreparationTypeChange(value: WsBedPreparationType) {
    this.updateBedPreparationModel({
      type: value,
    });
  }

  onBedPreparationDurationChange(value: number) {
    this.updateBedPreparationModel({
      dayDuration: value,
    });
  }

  onHtmlNotesChanged(value: string) {
    this.updateModel({
      htmlNotes: value,
    });
  }

  onSubmit() {
    const value = this.formHelper.getCurrentValue();
    this.cultureClient.saveCulture(value)
      .subscribe(ref => this.onCreationSuccess(ref),
        error => this.onCreationError(error));
  }

  onCancel() {
    this.navigateOut();
  }


  private createHarvestDateRangeModel(models: ValidatedFormProperty<WsCulture, any>[]): ValidatedFormProperty<any, any> {
    return {
      property: 'harvest-date-range',
      validationErrors: [...models[0].validationErrors, ...models[1].validationErrors],
      propertyValue: <DateRange>{
        from: models[0].propertyValue,
        to: models[1].propertyValue,
      },
      childrenViolations: [],
    };
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

  private navigateOut() {
    this.router.navigate(['/cultures/_/list']);
  }

  private updateModel(update: Partial<WsCulture>) {
    this.formHelper.updateValue(update);
  }

  private updateNursingModel(update: Partial<WsCultureNursing>) {
    this.formHelper.updateChildValue('cultureNursing', update);
  }

  private updateBedPreparationModel(update: Partial<WsBedPreparation>) {
    this.formHelper.updateChildValue('bedPreparation', update);
  }

}
