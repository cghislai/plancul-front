import {Attribute, Directive, forwardRef} from '@angular/core';
import {AbstractControl, NG_VALIDATORS, ValidationErrors, Validator} from '@angular/forms';

@Directive({
  selector: '[validateFieldEquality]',
  providers: [
    {provide: NG_VALIDATORS, useExisting: forwardRef(() => FieldEqualityValidator), multi: true},
  ],
})
export class FieldEqualityValidator implements Validator {
  constructor(@Attribute('validateFieldEquality') private controlNames: string) {
  }


  validate(formControl: AbstractControl): ValidationErrors | null {
    const controlNames = this.controlNames.split(',');
    const controls = controlNames.map(
      name => formControl.get(name),
    ).filter(c => c != null);

    let value = undefined;
    for (const control of controls) {
      const controlValue = control.value;
      if (value === undefined) {
        value = controlValue;
      } else {
        if (value !== controlValue) {
          const error = {
            validateFieldEquality: false,
          };
          return error;
        }
      }
    }
    return null;
  }

}
