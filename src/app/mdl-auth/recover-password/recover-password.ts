import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { IApiResponse, IForgotEmailRequestModel } from '../../models/users';
import { AlertService } from '../../alert/alert-service';
import { AuthService } from '../auth-service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-recover-password',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './recover-password.html',
  styleUrl: './recover-password.css'
})
export class RecoverPassword implements OnInit {
  public forgotFormGroup!: FormGroup;
  public email: string = '';
  public code: string = '';
  public canResendCode = false;
  public resendCountdown = 300; // 5 minutos (300 segundos)
  private countdownInterval: any;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private alertService: AlertService,
    private authService: AuthService
  ) {

  }

  ngOnInit(): void {
    this.email = this.route.snapshot.queryParamMap.get('email') || '';

    this.forgotFormGroup = this.fb.group({
      code: ['', [Validators.required, Validators.minLength(999999)]]
    });

    this.sendEmail();
    this.startCountdown();
  }

  formatCountdown(seconds: number): string {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }

  private startCountdown() {
    this.canResendCode = false;
    this.resendCountdown = 300; // 5 minutos

    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }

    this.countdownInterval = setInterval(() => {
      this.resendCountdown--;

      if (this.resendCountdown <= 0) {
        this.canResendCode = true;
        clearInterval(this.countdownInterval);
      }
    }, 1000);
  }

  resendCode() {
    if (!this.canResendCode) return;

    this.sendEmail();
    this.alertService.info('Um novo código foi enviado ao seu e-mail.');
    this.startCountdown(); 
  }
  
  confirmCode() {
    const codeEntered = this.forgotFormGroup.get('code')?.value;

    if (!codeEntered || codeEntered.trim() === '') {
      this.alertService.warning('Por favor, digite o código de verificação.');
      return;
    }

    if (codeEntered !== this.code) {
      this.alertService.warning('O código informado está incorreto. Verifique e tente novamente.');
      return;
    }

    this.router.navigate(['/auth/resetPassword'], {
      queryParams: { email: this.email, code: codeEntered }
    });
  }

  cancel() {
    this.router.navigate(['/auth/login']);
  }

  private sendEmail() {

    var command: IForgotEmailRequestModel = {
      email: this.email
    };

    this.authService.forgot(command).subscribe({
      next: (value: IApiResponse<string>) => {
        if (value.success) {
          this.alertService.success('E-mail enviado com sucesso.');
          this.code = value.data;
        } else {
          const errosObj = value.errors as Record<string, any>;

          const listaDeErros: string[] = Object.values(errosObj).map(err => {
            if (Array.isArray(err)) return err.join(', ');
            if (typeof err === 'string') return err;
            return JSON.stringify(err);
          });

          const mensagemUnica = listaDeErros.join('; ');
          this.alertService.warning(mensagemUnica);
        }
      },
      error: (err) => {
        this.alertService.error('Falha ao enviar e-mail, verifique os dados e tente novamente.');
      }
    });
  }
}
