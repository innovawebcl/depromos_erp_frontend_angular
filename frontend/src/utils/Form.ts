import { FormBuilder, FormControl, FormGroup } from "@angular/forms";



export function cloneFormGroup(form: FormGroup): FormGroup {
    const newFb = new FormBuilder();
  
    return newFb.group(
      Object.keys(form.controls).reduce((acc, key) => {
        const control = form.controls[key];
  
        acc[key] = control instanceof FormGroup
          ? cloneFormGroup(control)
          : new FormControl(control.value, control.validator, control.asyncValidator); // Clona los controles individuales
        
        return acc;
      }, {} as any)
    );
  }