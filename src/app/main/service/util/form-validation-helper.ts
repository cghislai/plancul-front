import {BehaviorSubject, merge, Observable, of, throwError} from 'rxjs';
import {WsContraintViolation, WsDomainEntity, WsValidationError} from '@charlyghislain/plancul-api';
import {ValidatedFormModel} from '../../domain/validated-form-model';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  filter,
  map,
  publishReplay,
  refCount,
  switchMap,
  take,
  tap,
  withLatestFrom,
} from 'rxjs/operators';
import {ValidatedFormProperty} from '../../domain/validated-form-property';
import {RequestService} from '../request.service';


export class FormValidationHelper<E extends WsDomainEntity> {

  private valueSource = new BehaviorSubject<E>(null);
  private modelSource = new BehaviorSubject<ValidatedFormModel<E>>(null);

  private modelWithValidation: Observable<ValidatedFormModel<E>>;

  constructor(private requestService: RequestService,
              private validator: (obj: E) => Observable<E>,
  ) {
    const updatedModelWithValue = this.valueSource
      .pipe(
        withLatestFrom(this.modelSource),
        map(results => this.updateModelOnNewValue(results[1], results[0])),
        publishReplay(1), refCount(),
      );

    const validatedModel = updatedModelWithValue.pipe(
      filter(m => m != null),
      distinctUntilChanged(this.modelJsonEqual),
      debounceTime(500),
      switchMap(model => this.validateModel(model)),
      tap(e => this.modelSource.next(e)),
      publishReplay(1), refCount(),
    );

    this.modelWithValidation = merge(updatedModelWithValue, validatedModel)
      .pipe(
        publishReplay(1), refCount(),
      );
  }

  setValue(value: E) {
    this.valueSource.next(value);
  }

  updateValue(changes: Partial<E>) {
    this.modelWithValidation.pipe(
      take(1),
    ).subscribe(model => {
      const newValue = Object.assign({}, model.value, changes);
      this.valueSource.next(newValue);
    });
  }


  updateChildValue<K extends keyof E = keyof E>(key: K, changes: Partial<E[K]>) {
    this.modelWithValidation.pipe(
      take(1),
    ).subscribe(model => {
      const curValue = model.value[key];
      const newValue = Object.assign({}, curValue, changes);
      const modelChanges: Partial<E> = {};
      modelChanges[key] = newValue;
      this.updateValue(modelChanges);
    });
  }

  getModel(): Observable<ValidatedFormModel<E>> {
    return this.modelWithValidation;
  }

  getCurrentValue(): E {
    return this.modelSource.getValue().value;
  }

  getUnboundErrors(): Observable<string[]> {
    return this.modelWithValidation.pipe(
      map(model => model.unboundErrors),
      publishReplay(1), refCount(),
    );
  }

  isValid(): Observable<boolean> {
    return this.modelWithValidation.pipe(
      map(model => model.valid),
      publishReplay(1), refCount(),
    );
  }

  isInvalid(): Observable<boolean> {
    return this.modelWithValidation.pipe(
      map(model => !model.valid),
      publishReplay(1), refCount(),
    );
  }

  getPropertyModel<K extends keyof E= keyof E>(key: K): Observable<ValidatedFormProperty<E, K>> {
    return this.modelWithValidation.pipe(
      map(model => this.findPropertyModel(model, key)),
      publishReplay(1), refCount(),
    );
  }

  getPropertyErrors<K extends keyof E= keyof E>(key: K): Observable<string[]> {
    return this.modelWithValidation.pipe(
      map(model => this.findPropertyModel(model, key)),
      map(propModel => propModel.validationErrors),
      publishReplay(1), refCount(),
    );
  }

  getPropertyValue<K extends keyof E= keyof E>(key: K): Observable<E[K]> {
    return this.modelWithValidation.pipe(
      map(model => this.findPropertyModel(model, key)),
      map(propModel => propModel.propertyValue),
      publishReplay(1), refCount(),
    );
  }

  // TODO: typings?
  mapPropertyValue<T>(key: keyof E, mapper: (val: any) => T): Observable<T> {
    return this.modelWithValidation.pipe(
      map(model => this.findPropertyModel(model, key)),
      map(propModel => propModel.propertyValue),
      map(value => mapper(value)),
      publishReplay(1), refCount(),
    );
  }

  isPropertyValid(key: keyof E): Observable<boolean> {
    return this.modelWithValidation.pipe(
      map(model => this.findPropertyModel(model, key)),
      map(propModel => propModel.validationErrors.length === 0 && propModel.childrenViolations.length === 0),
      publishReplay(1), refCount(),
    );
  }

  wrapPropertyValue<K extends keyof E= keyof E>(key: K): Observable<ValidatedFormModel<E[K]>> {
    return this.getPropertyModel(key).pipe(
      filter(m => m.propertyValue != null),
      filter(m => typeof m.propertyValue === 'object'),
      map(m => this.createFormModelFromPropertyModel(m)),
      publishReplay(1), refCount(),
    );
  }

  // TODO typings
  getWrappedPropertyModel<K extends keyof E= keyof E, H extends keyof E[K] = keyof E[K]>
  (key1: K, key2: H): Observable<ValidatedFormProperty<E[K], any>> {
    return this.wrapPropertyValue(key1).pipe(
      map(model => model.properties[key2]),
      publishReplay(1), refCount(),
    );
  }

  getWrappedPropertyValue<K extends keyof E= keyof E, H extends keyof E[K] = keyof E[K]>
  (key1: K, key2: H): Observable<any> {
    return this.wrapPropertyValue(key1).pipe(
      map(model => model.properties[key2]),
      filter(model => model != null),
      map(model => model.propertyValue),
      publishReplay(1), refCount(),
    );
  }

  private updateModelOnNewValue(cur: ValidatedFormModel<E>, next: E): ValidatedFormModel<E> {
    if (cur == null) {
      return this.createValidationModel(next);
    } else {
      const newProperties = this.updatePropertiesValues(cur.properties, next);
      const newModel = Object.assign({}, cur, <Partial<ValidatedFormModel<E>>>{
        value: next,
        properties: newProperties,
        validationInProgress: true,
      });
      return newModel;
    }
  }

  private updatePropertiesValues(properties: { [K in keyof E]: ValidatedFormProperty<E, K> },
                                 next: E,
                                 resetErrors?: boolean): { [K in keyof E]: ValidatedFormProperty<E, K> } {
    const newProperties = <{ [K in keyof E]: ValidatedFormProperty<E, K> }>  {};
    Object.getOwnPropertyNames(properties)
      .forEach(key => this.updatePropertyValue(<keyof E>key, properties, newProperties, next, resetErrors));
    return newProperties;
  }

  private updatePropertyValue<H extends keyof E = keyof E>(key: H,
                                                           properties: { [K in keyof E]: ValidatedFormProperty<E, K> },
                                                           newProperties: { [K in keyof E]: ValidatedFormProperty<E, K> },
                                                           next: E,
                                                           resetErrors?: boolean,
  ) {
    const curModel: ValidatedFormProperty<E, H> = properties[key];
    const newValue: E[H] = next[key];
    const modelUpdate: Partial<ValidatedFormProperty<E, H>> = {
      propertyValue: newValue,
    };
    if (resetErrors === true) {
      modelUpdate.validationErrors = [];
      modelUpdate.childrenViolations = [];
    }
    const newPropertyModel = Object.assign({}, curModel, modelUpdate);
    newProperties[key] = newPropertyModel;
  }

  private createValidationModel<F = E>(entity: F): ValidatedFormModel<F> {
    const properties = <{ [K in keyof F]: ValidatedFormProperty<F, K> }>{};
    Object.getOwnPropertyNames(entity)
      .map(key => this.createPropertyModel(entity, <keyof F>key))
      .forEach(propModel => properties[propModel.property] = propModel);

    return {
      properties: properties,
      value: entity,
      unboundErrors: [],
      valid: true,
      validationInProgress: true,
    };
  }

  private createPropertyModel<F = E, K extends keyof F = keyof F>(entity: F, key: K): ValidatedFormProperty<F, K> {
    const model: ValidatedFormProperty<F, K> = {
      property: key,
      propertyValue: entity[key],
      validationErrors: [],
      childrenViolations: [],
    };
    return model;
  }

  private validateModel(model: ValidatedFormModel<E>): Observable<ValidatedFormModel<E>> {
    const value = model.value;
    return this.validator(value).pipe(
      map(entity => this.updateModelOnValidationSuccess(entity, model)),
      catchError(e => this.handleValidationError(e, model)),
    );
  }

  private updateModelOnValidationSuccess(entity: E, model: ValidatedFormModel<E>): ValidatedFormModel<E> {
    const newProperties = this.updatePropertiesValues(model.properties, entity, true);
    const newModel = Object.assign({}, model, <Partial<ValidatedFormModel<E>>>{
      value: entity,
      properties: newProperties,
      validationInProgress: false,
      unboundErrors: [],
      valid: true,
    });
    return newModel;
  }

  private handleValidationError(error: any, model: ValidatedFormModel<E>): Observable<ValidatedFormModel<E>> {
    const validationError = this.requestService.isHttpErrorWithStatusCodeStartingWith(error, 406);
    if (!validationError) {
      return throwError(error);
    }
    const errorBody = this.requestService.parseHttpErrorJsonBody<WsValidationError>(error);

    const updatedValue: E = <E> errorBody.entity;
    const updatedProperties = this.updatePropertiesErrors(model.properties, errorBody.errors, updatedValue);
    const unboundErrors = this.getUnboundErrorMessages(errorBody.errors);

    const newModel = Object.assign({}, model, <Partial<ValidatedFormModel<E>>>{
      value: updatedValue,
      properties: updatedProperties,
      validationInProgress: false,
      unboundErrors: unboundErrors,
      valid: false,
    });
    return of(newModel);
  }


  private updatePropertiesErrors<F = E>(properties: { [K in keyof F]: ValidatedFormProperty<F, K> },
                                        errors: WsContraintViolation[],
                                        entity: F): { [K in keyof F]: ValidatedFormProperty<F, K> } {
    const newProperties = <{ [K in keyof F]: ValidatedFormProperty<F, K> }>  Object.assign({}, properties);

    const missingProperties = this.getUnmatchedProperties<F>(errors, newProperties);
    missingProperties.map(prop => this.createPropertyModel<F>(entity, <keyof F>prop))
      .forEach(model => newProperties[model.property] = model);

    Object.getOwnPropertyNames(newProperties)
      .map(key => this.updatePropertyErrors<F>(<keyof F>key, newProperties, errors, entity))
      .forEach(model => newProperties[model.property] = model);
    return newProperties;
  }

  private updatePropertyErrors<F = E, H extends keyof F = keyof F>
  (key: H,
   properties: { [K in keyof F]: ValidatedFormProperty<F, K> },
   errors: WsContraintViolation[],
   entity: F): ValidatedFormProperty<F, H> {
    const curModel: ValidatedFormProperty<F, H> = properties[key];
    const newValue = entity[key];
    const errorMessages = this.getPropertyErrorMessages<F>(errors, key);
    const childErrors = this.getChildrenPropertyErrors<F>(errors, key);
    const modelUpdate = <Partial<ValidatedFormProperty<F, H>>> {
      propertyValue: newValue,
      validationErrors: errorMessages,
      childrenViolations: childErrors,
    };

    return Object.assign({}, curModel, modelUpdate);
  }

  private getPropertyErrorMessages<F = E>(errors: WsContraintViolation[], key: keyof F): string[] {
    const propName = <string>key;
    const exactPattern = new RegExp(`${propName}`);
    return errors.filter(e => exactPattern.test(e.propertyName))
      .map(error => error.message);
  }

  private getChildrenPropertyErrors<F = E>(errors: WsContraintViolation[], key: keyof F): WsContraintViolation[] {
    const propName = <string>key;
    const childrenPattern = new RegExp(`${propName}\\\.(.*)`);
    return errors.filter(e => childrenPattern.test(e.propertyName))
      .map(e => {
        const childPath = childrenPattern.exec(e.propertyName)[1];
        return <WsContraintViolation>{
          propertyName: childPath,
          message: e.message,
        };
      });
  }

  private getUnboundErrorMessages(errors: WsContraintViolation[]): string[] {
    return errors.filter(e => e.propertyName == null || e.propertyName.length === 0)
      .map(error => error.message);
  }

  private getUnmatchedProperties<F = E>(errors: WsContraintViolation[], properties: { [K in keyof F]: ValidatedFormProperty<F, K> }): string[] {
    return errors.map(e => e.propertyName)
      .filter(name => name != null && name.length > 0)
      .map(name => name.split('.')[0])
      .filter(name => !this.isPropertyPresent<F>(properties, name));
  }

  private findPropertyModel<F = E, K extends keyof F = keyof F>(model: ValidatedFormModel<F>, property: K): ValidatedFormProperty<F, K> {
    const existingModel = model.properties[property];
    if (existingModel != null) {
      return existingModel;
    }
    const newModel = this.createPropertyModel(model.value, property);
    model.properties[property] = newModel;
    return newModel;
  }

  private isPropertyPresent<F = E>(properties: { [K in keyof F]: ValidatedFormProperty<F, K> }, propName: string) {
    return Object.getOwnPropertyNames(properties)
      .find(name => name === propName) != null;
  }

  private createFormModelFromPropertyModel<F = E, K extends keyof F = keyof F, H extends keyof K = keyof K>
  (model: ValidatedFormProperty<F, K>): ValidatedFormModel<F[K]> {
    const value = model.propertyValue;
    const formModel = this.createValidationModel<F[K]>(value);

    formModel.properties = this.updatePropertiesErrors(formModel.properties, model.childrenViolations, value);
    formModel.valid = model.childrenViolations.length === 0 && model.validationErrors.length === 0;
    formModel.unboundErrors = model.validationErrors;
    return formModel;
  }

  private modelJsonEqual(modelA: ValidatedFormModel<E>, modelB: ValidatedFormModel<E>) {
    const jsonA = JSON.stringify(modelA.value);
    const jsonB = JSON.stringify(modelB.value);
    return jsonA === jsonB;
  }
}
