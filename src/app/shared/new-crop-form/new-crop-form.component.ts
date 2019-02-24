import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {WsAgrovocPlantProduct, WsCropCreationRequest} from '@charlyghislain/plancul-api';
import {NotificationMessageService} from '../../main/service/notification-message.service';
import {RequestService} from '../../main/service/request.service';
import {AgrovocPlantClientService} from '../../main/service/agrovoc-plant-client.service';
import {LocalizationService} from '../../main/service/localization.service';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';

@Component({
  selector: 'pc-new-crop-form',
  templateUrl: './new-crop-form.component.html',
  styleUrls: ['./new-crop-form.component.scss'],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: NewCropFormComponent,
    multi: true,
  }],
})
export class NewCropFormComponent implements OnInit, ControlValueAccessor {

  @Input()
  disabled: boolean;
  @Input()
  agrovocQuery: string;

  @Output()
  cancel = new EventEmitter<any>();
  @Output()
  submit = new EventEmitter<any>();

  private changeFunction: Function;
  private touchedFunction: Function;

  newCrop: WsCropCreationRequest;

  constructor(private localizationService: LocalizationService,
              private notificationService: NotificationMessageService,
              private requestService: RequestService,
              private agrovocClient: AgrovocPlantClientService) {
  }

  ngOnInit() {
  }


  writeValue(obj: any): void {
    this.newCrop = obj;
  }

  registerOnChange(fn: any): void {
    this.changeFunction = fn;
  }

  registerOnTouched(fn: any): void {
    this.touchedFunction = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }


  onPlanProductTupleChange(tuple: WsAgrovocPlantProduct) {
    if (tuple == null) {
      this.newCrop.agrovocPlantURI = null;
      this.newCrop.agrovocProductURI = null;
      this.onChange();
      return;
    }
    this.agrovocClient.searchPlantData(tuple.plantURI)
      .subscribe(plantData => {
        this.newCrop.displayName = tuple.matchedTerm;
        this.newCrop.agrovocPlantURI = tuple.plantURI;
        this.newCrop.agrovocProductURI = tuple.productURI;
        this.newCrop.family = plantData.familyName;
        this.newCrop.species = plantData.speciesName;
        this.newCrop.subSpecies = plantData.subSpeciesName;
        this.onChange();
      });
  }

  onChange() {
    if (this.touchedFunction) {
      this.touchedFunction();
    }
    if (this.changeFunction) {
      this.changeFunction(this.newCrop);
    }
  }

  onSubmit() {
    this.submit.next(this.newCrop);
  }

  onCancel() {
    this.cancel.next(true);
  }

}
