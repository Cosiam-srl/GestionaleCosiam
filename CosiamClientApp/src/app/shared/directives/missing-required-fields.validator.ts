import { AbstractControl, FormControl, FormGroup } from '@angular/forms';

// custom validator to check that form has populated required field fields
export function MissingRequiredFields(requiredFieldsNames: string[]) {
    return (formGroup: FormGroup) => {
        let toCheck: AbstractControl[] = [];
        for(var c of requiredFieldsNames) {
            var ctrl = formGroup.controls[c]
            if (!ctrl) continue;
            toCheck.push(ctrl);
        }
        var checked = toCheck.filter(c => !c.value);

        if (formGroup.errors && !formGroup.errors.missingRequiredFields) {
            // return if another validator has already found an error on the matchingControl
            return;
        }

        // set error on matchingControl if validation fails
        if (checked && checked.length > 0) {
            formGroup.setErrors({ missingRequiredFields: checked });
        } else {
            formGroup.setErrors(null);
        }
    }
}
