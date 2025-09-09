import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors, ReactiveFormsModule } from '@angular/forms';
import { passwordPolicyValidator } from '../../util/modal.util';
import { CommonModule } from '@angular/common';
import { IConfirmCodePasswordRequestModel } from '../../models/users';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../auth-service';
import { AlertService } from '../../alert/alert-service';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.html',
  styleUrls: ['./reset-password.css'],
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
})
export class ResetPassword {
  resetPasswordFormGroup: FormGroup;

  constructor(private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private alertService: AlertService) {
    this.resetPasswordFormGroup = this.fb.group(
      {
        newPassword: ['', [Validators.required, Validators.minLength(8), passwordPolicyValidator]],
        confirmPassword: ['', [Validators.required]],
      },
      {
        validators: [this.matchPasswords('newPassword', 'confirmPassword')],
      }
    );
  }

  matchPasswords(passwordKey: string, confirmPasswordKey: string) {
    return (formGroup: AbstractControl): ValidationErrors | null => {
      const password = formGroup.get(passwordKey)?.value;
      const confirmPassword = formGroup.get(confirmPasswordKey)?.value;

      if (password !== confirmPassword) {
        formGroup.get(confirmPasswordKey)?.setErrors({ passwordMismatch: true });
      } else {
        const currentErrors = formGroup.get(confirmPasswordKey)?.errors;
        if (currentErrors && currentErrors['passwordMismatch']) {
          delete currentErrors['passwordMismatch'];
          if (Object.keys(currentErrors).length === 0) {
            formGroup.get(confirmPasswordKey)?.setErrors(null);
          }
        }
      }

      return null;
    };
  }

  updatePassword() {
    if (this.resetPasswordFormGroup.valid) {
      const newPassword = this.resetPasswordFormGroup.value.newPassword;
      var command: IConfirmCodePasswordRequestModel = {
        email: this.route.snapshot.queryParamMap.get('email') || '',
        password: newPassword,
        code: this.route.snapshot.queryParamMap.get('code') || ''
      };

      this.authService.confirm(command).subscribe({
        next: (value) => {
          if (value) {
            this.alertService.success('Senha atualizada com sucesso.');
            this.router.navigate(['/auth/login']);
          }
        },
        error: (err) => {
          this.alertService.error('Falha ao atualziar a senha, verifique os dados e tente novamente.');
        }
      })

    } else {
      this.resetPasswordFormGroup.markAllAsTouched();
    }
  }

  get newPassword() {
    return this.resetPasswordFormGroup.get('newPassword');
  }

  get confirmPassword() {
    return this.resetPasswordFormGroup.get('confirmPassword');
  }
}