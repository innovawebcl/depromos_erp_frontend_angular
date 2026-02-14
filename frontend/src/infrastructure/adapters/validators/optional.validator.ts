import type { AbstractControl, ValidatorFn } from '@angular/forms';

export default function optionalValidator(validator: ValidatorFn): ValidatorFn {
  return (control: AbstractControl) => {
    if (
      control.value === null ||
      control.value === undefined ||
      control.value === ''
    ) {
      return null;
    }
    return validator(control);
  };
}
