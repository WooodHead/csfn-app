import {
  validateOrReject,
  ValidationArguments,
  ValidationError,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidatorOptions
} from 'class-validator'
import FormError from '@/types/errors/FormError'
import FieldError from '@/types/errors/FieldError'
import User from '@/types/User'

export default class Validator {
  public static validate(object: any,
                         options?: ValidatorOptions): Promise<void | FormError> {
    return validateOrReject(object, options)
      .catch((errors) => this.handleRejection(errors))
  }

  private static handleRejection(errors) {
    return Promise.reject(this.getFormError(errors))
  }

  private static getFormError(errors: ValidationError[]): FormError {
    return new FormError(errors.map(e => this.getFieldError(e)).flat())
  }

  private static getFieldError(error: ValidationError): FieldError[] {
    return [new FieldError(error.property, error.constraints && Object.values(error.constraints)[0]),
            ...(error.children?.length ? error.children.map(e => this.getFieldError(e)).flat() : [])]
  }
}

@ValidatorConstraint({name: 'passwordConfirmation', async: false})
export class PasswordConfirmation implements ValidatorConstraintInterface {
  validate(value: any,
           validationArguments?: ValidationArguments): Promise<boolean> | boolean {
    return value === (validationArguments.object as User).password
  }
}
