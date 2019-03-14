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
} from '@charlyghislain/plancul-api';
import {CultureClientService} from '../../main/service/culture-client.service';
import {combineLatest, forkJoin, Observable, Subscription} from 'rxjs';
import {map, switchMap, take} from 'rxjs/operators';
import {FormValidationHelper} from '../../main/service/util/form-validation-helper';
import {ValidatedFormProperty} from '../../main/domain/validated-form-property';
import {DateUtils} from '../../main/service/util/date-utils';
import {MessageKeys} from '../../main/service/util/message-keys';
import {LocalizationService} from '../../main/service/localization.service';
import {ErrorKeys} from '../../main/service/util/error-keys';
import {CultureService} from '../../main/service/culture.service';

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
  sowingDateValue: Observable<DateAsString>;
  seedSurfaceQuantity: Observable<ValidatedFormProperty<WsCulture, 'seedSurfaceQuantity'>>;

  daysUntilGermination: Observable<ValidatedFormProperty<WsCulture, 'daysUntilGermination'>>;
  daysUntilGerminationValue: Observable<number>;
  daysUntilFirstHarvest: Observable<ValidatedFormProperty<WsCulture, 'daysUntilFirstHarvest'>>;
  harvestDayDuration: Observable<ValidatedFormProperty<WsCulture, 'harvestDaysDuration'>>;
  germinationDateValue: Observable<DateAsString>;
  firstHarvestDateValue: Observable<DateAsString>;
  lastHarvestDateValue: Observable<DateAsString>;
  harvestSurfaceQuantity: Observable<ValidatedFormProperty<WsCulture, 'harvestSurfaceQuantity'>>;

  hasNursing: Observable<boolean>;
  nursingDuration: Observable<ValidatedFormProperty<WsCultureNursing, 'dayDuration'>>;
  nursingEndDate: Observable<DateAsString>;

  hasBedPreparation: Observable<boolean>;
  bedPreparationType: Observable<ValidatedFormProperty<WsBedPreparation, 'type'>>;
  bedPreparationDuration: Observable<ValidatedFormProperty<WsBedPreparation, 'dayDuration'>>;

  htmlNotes: Observable<ValidatedFormProperty<WsCulture, 'htmlNotes'>>;
  bedOccupancyStartValue: Observable<DateAsString>;
  bedOccupancyEndValue: Observable<DateAsString>;
  totalSeedQuantityValue: Observable<number>;
  totalHarvestQuantityValue: Observable<number>;

  hasValidationErrors: Observable<boolean>;
  unboundErrorMessages: Observable<string[]>;

  private formHelper: FormValidationHelper<WsCulture>;
  private subscription: Subscription;

  constructor(private router: Router,
              private localizationService: LocalizationService,
              private activatedRoute: ActivatedRoute,
              private tenantSelectionService: SelectedTenantService,
              private notificationService: NotificationMessageService,
              private requestService: RequestService,
              private cultureService: CultureService,
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
    this.subscription.add(routeDataSubscription);

    this.cropRef = this.formHelper.getPropertyModel('cropWsRef');
    this.bedRef = this.formHelper.getPropertyModel('bedWsRef');
    this.sowingDate = this.formHelper.getPropertyModel('sowingDate');
    this.sowingDateValue = this.formHelper.getPropertyValue('sowingDate');
    this.seedSurfaceQuantity = this.formHelper.getPropertyModel('seedSurfaceQuantity');

    this.daysUntilGermination = this.formHelper.getPropertyModel('daysUntilGermination');
    this.daysUntilGerminationValue = this.formHelper.getPropertyValue('daysUntilGermination');
    this.daysUntilFirstHarvest = this.formHelper.getPropertyModel('daysUntilFirstHarvest');

    this.harvestDayDuration = this.formHelper.getPropertyModel('harvestDaysDuration');
    this.harvestSurfaceQuantity = this.formHelper.getPropertyModel('harvestSurfaceQuantity');

    this.germinationDateValue = this.formHelper.getPropertyValue('germinationDate');
    this.firstHarvestDateValue = this.formHelper.getPropertyValue('firstHarvestDate');
    this.lastHarvestDateValue = this.formHelper.getPropertyValue('lastHarvestDate');

    this.hasNursing = this.formHelper.mapPropertyValue<boolean>('cultureNursing', n => n != null);
    this.nursingDuration = this.formHelper.getWrappedPropertyModel('cultureNursing', 'dayDuration');
    this.nursingEndDate = this.formHelper.getWrappedPropertyValue('cultureNursing', 'endDate');

    this.hasBedPreparation = this.formHelper.mapPropertyValue<boolean>('bedPreparation', p => p != null);
    this.bedPreparationType = this.formHelper.getWrappedPropertyModel('bedPreparation', 'type');
    this.bedPreparationDuration = this.formHelper.getWrappedPropertyModel('bedPreparation', 'dayDuration');

    this.htmlNotes = this.formHelper.getPropertyModel('htmlNotes');
    this.bedOccupancyStartValue = this.formHelper.getPropertyValue('bedOccupancyStartDate');
    this.bedOccupancyEndValue = this.formHelper.getPropertyValue('bedOccupancyEndDate');
    this.totalSeedQuantityValue = this.formHelper.getPropertyValue('seedTotalQuantity');
    this.totalHarvestQuantityValue = this.formHelper.getPropertyValue('harvestTotalQuantity');

    this.hasValidationErrors = this.formHelper.isInvalid();

    this.unboundErrorMessages = this.formHelper.getUnboundErrors();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  onCropChange(cropRef: WsRef<WsCrop>) {
    this.tenantSelectionService.getSelectedTenantRef().pipe(
      take(1),
      switchMap(tenantRef => this.cultureService.findLastCultureOverwritesForCrop(tenantRef, cropRef)),
      map(overwites => Object.assign({}, overwites, <Partial<WsCulture>>{
        cropWsRef: cropRef,
      })),
    ).subscribe(update => this.updateModel(update));
  }

  onBedChange(value: WsRef<WsBed>) {
    this.updateModel({
      bedWsRef: value,
    });
  }

  onSeedSurfaceQuantityChange(value: number) {
    this.updateModel({
      seedSurfaceQuantity: value,
    });
  }

  onSowingDateChange(value: DateAsString) {
    this.updateModel({
      sowingDate: value,
    });
  }

  onDaysUntilGerminationChange(value: number) {
    this.updateModel({
      daysUntilGermination: value,
    });
  }


  onGerminationDateChange(value: DateAsString) {
    this.sowingDateValue.pipe(
      take(1),
    ).subscribe(sowingDate => {
      const duration = DateUtils.getDayDiff(sowingDate, value);
      if (duration <= 0) {
        return;
      }
      this.updateModel({
        daysUntilGermination: duration,
      });
    });
  }


  onDaysUntilFirstHarvestChange(value: number) {
    this.updateModel({
      daysUntilFirstHarvest: value,
    });
  }

  onFirstHarvestDateChange(value: DateAsString) {
    combineLatest(this.sowingDateValue, this.daysUntilGerminationValue)
      .pipe(take(1))
      .subscribe(results => {
        const sowingDate = results[0];
        const daysUntilGermination = results[1];
        const duration = DateUtils.getDayDiff(sowingDate, value);
        if (duration <= daysUntilGermination) {
          return;
        }
        this.updateModel({
          daysUntilFirstHarvest: duration,
        });
      });
  }


  onHarvestDurationChange(value: number) {
    this.updateModel({
      harvestDaysDuration: value,
    });
  }

  onHarvestSurfaceQuantityChange(value: number) {
    this.updateModel({
      harvestSurfaceQuantity: value,
    });
  }

  onLastHarvestDateChange(value: DateAsString) {
    this.firstHarvestDateValue
      .pipe(take(1))
      .subscribe(firstHarvestDate => {
        const duration = DateUtils.getDayDiff(firstHarvestDate, value);
        if (duration <= 0) {
          return;
        }
        this.updateModel({
          harvestDaysDuration: duration,
        });
      });
  }


  onNursingChanged(nursing: boolean) {
    if (nursing) {
      this.updateModel({
        cultureNursing: {
          id: null,
          dayDuration: 1,
          endDate: null,
          startDate: null,
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

  private onCreationSuccess(ref: WsRef<WsCulture>) {
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
