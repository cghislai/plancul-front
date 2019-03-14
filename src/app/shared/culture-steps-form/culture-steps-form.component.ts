import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {MenuItem} from 'primeng/api';
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
import {BehaviorSubject, combineLatest, Observable} from 'rxjs';
import {ValidatedFormProperty} from '../../main/domain/validated-form-property';
import {FormValidationHelper} from '../../main/service/util/form-validation-helper';
import {ActivatedRoute, Router} from '@angular/router';
import {LocalizationService} from '../../main/service/localization.service';
import {SelectedTenantService} from '../../main/service/selected-tenant.service';
import {NotificationMessageService} from '../../main/service/notification-message.service';
import {RequestService} from '../../main/service/request.service';
import {CultureClientService} from '../../main/service/culture-client.service';
import {map, publishReplay, refCount, take} from 'rxjs/operators';
import {DateUtils} from '../../main/service/util/date-utils';
import {ValidatedFormModel} from '../../main/domain/validated-form-model';

@Component({
  selector: 'pc-culture-steps-form',
  templateUrl: './culture-steps-form.component.html',
  styleUrls: ['./culture-steps-form.component.scss'],
})
export class CultureStepsFormComponent implements OnInit {

  @Input()
  set culture(value: WsCulture) {
    this.formHelper.setValue(value);
  }

  @Output()
  validCultureChange = new EventEmitter<WsCulture>();

  STEP_ID_CULTURE = 'culture';
  STEP_ID_DATES = 'dates';
  STEP_ID_QUANTITIES = 'quantities';
  STEP_ID_PREPARATION = 'preparation';

  steps: MenuItem[];

  activeStepIndex$ = new BehaviorSubject<number>(0);
  activeStepId$: Observable<string>;
  activeStepValid$: Observable<boolean>;

  cropRef: Observable<ValidatedFormProperty<WsCulture, 'cropWsRef'>>;
  bedRef: Observable<ValidatedFormProperty<WsCulture, 'bedWsRef'>>;

  sowingDate: Observable<ValidatedFormProperty<WsCulture, 'sowingDate'>>;
  sowingDateValue: Observable<DateAsString>;
  sowingSurfaceQuantity: Observable<ValidatedFormProperty<WsCulture, 'seedSurfaceQuantity'>>;
  sowingTotalValue: Observable<number>;

  daysUntilGermination: Observable<ValidatedFormProperty<WsCulture, 'daysUntilGermination'>>;
  daysUntilGerminationValue: Observable<number>;
  daysUntilFirstHarvest: Observable<ValidatedFormProperty<WsCulture, 'daysUntilFirstHarvest'>>;
  harvestDayDuration: Observable<ValidatedFormProperty<WsCulture, 'harvestDaysDuration'>>;
  germinationDateValue: Observable<DateAsString>;
  firstHarvestDateValue: Observable<DateAsString>;
  lastHarvestDateValue: Observable<DateAsString>;
  harvestSurfaceQuantity: Observable<ValidatedFormProperty<WsCulture, 'harvestSurfaceQuantity'>>;
  harvestTotalValue: Observable<number>;

  hasNursing: Observable<boolean>;
  nursingDuration: Observable<ValidatedFormProperty<WsCultureNursing, 'dayDuration'>>;
  nursingEndDate: Observable<DateAsString>;

  hasBedPreparation: Observable<boolean>;
  bedPreparationType: Observable<ValidatedFormProperty<WsBedPreparation, 'type'>>;
  bedPreparationDuration: Observable<ValidatedFormProperty<WsBedPreparation, 'dayDuration'>>;

  private formHelper: FormValidationHelper<WsCulture>;

  constructor(private router: Router,
              private localizationService: LocalizationService,
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
    this.steps = this.createSteps();
    this.goToStep(this.STEP_ID_CULTURE);

    this.cropRef = this.formHelper.getPropertyModel('cropWsRef');
    this.bedRef = this.formHelper.getPropertyModel('bedWsRef');
    this.sowingDate = this.formHelper.getPropertyModel('sowingDate');
    this.sowingDateValue = this.formHelper.getPropertyValue('sowingDate');
    this.sowingSurfaceQuantity = this.formHelper.getPropertyModel('seedSurfaceQuantity');
    this.sowingTotalValue = this.formHelper.getPropertyValue('seedTotalQuantity');

    this.daysUntilGermination = this.formHelper.getPropertyModel('daysUntilGermination');
    this.daysUntilGerminationValue = this.formHelper.getPropertyValue('daysUntilGermination');
    this.daysUntilFirstHarvest = this.formHelper.getPropertyModel('daysUntilFirstHarvest');

    this.harvestDayDuration = this.formHelper.getPropertyModel('harvestDaysDuration');

    this.germinationDateValue = this.formHelper.getPropertyValue('germinationDate');
    this.firstHarvestDateValue = this.formHelper.getPropertyValue('firstHarvestDate');
    this.lastHarvestDateValue = this.formHelper.getPropertyValue('lastHarvestDate');
    this.harvestSurfaceQuantity = this.formHelper.getPropertyModel('harvestSurfaceQuantity');
    this.harvestTotalValue = this.formHelper.getPropertyValue('harvestTotalQuantity');

    this.hasNursing = this.formHelper.mapPropertyValue<boolean>('cultureNursing', n => n != null);
    this.nursingDuration = this.formHelper.getWrappedPropertyModel('cultureNursing', 'dayDuration');
    this.nursingEndDate = this.formHelper.getWrappedPropertyValue('cultureNursing', 'endDate');

    this.hasBedPreparation = this.formHelper.mapPropertyValue<boolean>('bedPreparation', p => p != null);
    this.bedPreparationType = this.formHelper.getWrappedPropertyModel('bedPreparation', 'type');
    this.bedPreparationDuration = this.formHelper.getWrappedPropertyModel('bedPreparation', 'dayDuration');

    this.activeStepId$ = this.activeStepIndex$.pipe(
      map(index => this.steps[index].id),
      publishReplay(1), refCount(),
    );
    this.activeStepValid$ = combineLatest(this.activeStepId$, this.formHelper.getModel()).pipe(
      map(results => this.checkValidFormStep(results[0], results[1])),
      publishReplay(1), refCount(),
    );

  }

  onActiveStepChange(index: number) {
    const step = this.steps[index];
    this.goToStep(step.id);
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


  onSowingSurfaceQuantityChange(value: number) {
    this.updateModel({
      seedSurfaceQuantity: value,
    });
  }


  onHarvestSurfaceQuantityChange(value: number) {
    this.updateModel({
      harvestSurfaceQuantity: value,
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

  validateStep() {
    const curIndex = this.activeStepIndex$.getValue();
    const curId = this.steps[curIndex].id;
    switch (curId) {
      case this.STEP_ID_CULTURE:
        this.goToStep(this.STEP_ID_DATES);
        return;
      case this.STEP_ID_DATES:
        this.goToStep(this.STEP_ID_QUANTITIES);
        return;
      case this.STEP_ID_QUANTITIES:
        this.goToStep(this.STEP_ID_PREPARATION);
        return;
      case this.STEP_ID_PREPARATION:
        const value = this.formHelper.getCurrentValue();
        this.validCultureChange.next(value);
        return;
    }
  }

  goToPrevStep() {
    const curIndex = this.activeStepIndex$.getValue();
    const curId = this.steps[curIndex].id;
    switch (curId) {
      case this.STEP_ID_CULTURE:
        return;
      case this.STEP_ID_DATES:
        this.goToStep(this.STEP_ID_CULTURE);
        return;
      case this.STEP_ID_QUANTITIES:
        this.goToStep(this.STEP_ID_DATES);
        return;
      case this.STEP_ID_PREPARATION:
        this.goToStep(this.STEP_ID_QUANTITIES);
        return;
    }
  }

  private createSteps(): MenuItem[] {
    return [
      {
        label: 'Culture',
        id: this.STEP_ID_CULTURE,
        disabled: true,
      },
      {
        label: 'Dates',
        id: this.STEP_ID_DATES,
        disabled: true,
      },
      {
        label: 'Quantities',
        id: this.STEP_ID_QUANTITIES,
        disabled: true,
      },
      {
        label: 'Preparation',
        id: this.STEP_ID_PREPARATION,
        disabled: true,
      },
    ];
  }

  private goToStep(stepId: string) {
    const stepIndex = this.steps.findIndex(step => step.id === stepId);
    if (stepIndex >= 0) {
      this.steps[stepIndex].disabled = false;
      this.activeStepIndex$.next(stepIndex);
    }
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

  private checkValidFormStep(stepId: string, form: ValidatedFormModel<WsCulture>) {
    switch (stepId) {
      case this.STEP_ID_CULTURE: {
        return this.isCultureStepValid(form);
      }
      case this.STEP_ID_DATES: {
        return this.isCultureStepValid(form)
          && this.isDatesStepValid(form);
      }
      case this.STEP_ID_QUANTITIES: {
        return this.isCultureStepValid(form)
          && this.isDatesStepValid(form)
          && this.isQuantityStepValid(form);
      }
      case this.STEP_ID_PREPARATION: {
        return this.isCultureStepValid(form)
          && this.isDatesStepValid(form)
          && this.isQuantityStepValid(form)
          && form.valid;
      }
    }
  }

  private isDatesStepValid(form: ValidatedFormModel<WsCulture>) {
    return this.isFormPartValid(form, 'sowingDate', 'germinationDate', 'firstHarvestDate', 'lastHarvestDate',
      'daysUntilFirstHarvest', 'daysUntilGermination', 'harvestDaysDuration');
  }

  private isQuantityStepValid(form: ValidatedFormModel<WsCulture>) {
    return this.isFormPartValid(form, 'seedSurfaceQuantity', 'harvestSurfaceQuantity');
  }

  private isCultureStepValid(form: ValidatedFormModel<WsCulture>) {
    return this.isFormPartValid(form, 'cropWsRef', 'bedWsRef');
  }

  private isFormPartValid(form: ValidatedFormModel<WsCulture>, ...properties: (keyof WsCulture)[]): boolean {
    if (form == null) {
      return false;
    }
    for (const propKey of properties) {
      const propertyModel = form.properties[propKey];
      if (propertyModel != null && propertyModel.validationErrors.length > 0) {
        return false;
      }
    }
    return true;
  }
}
