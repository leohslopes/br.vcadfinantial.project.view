import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { IApiResponse, IForgotEmailRequestModel } from '../../models/users';
import { AlertService } from '../../alert/alert-service';
import { AuthService } from '../auth-service';

@Component({
  selector: 'app-recover-password',
  imports: [ReactiveFormsModule],
  templateUrl: './recover-password.html',
  styleUrl: './recover-password.css'
})
export class RecoverPassword implements OnInit {
  public forgotFormGroup!: FormGroup;
  public email: string = '';
  public code: string = '';

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
  }

  confirmCode() {
    const code = this.forgotFormGroup.get('code')?.value;
    console.log(`Código informado para ${this.email}:`, code);

    // Aqui você pode chamar o serviço de validação
    // Exemplo:
    // this.authService.confirmCode(this.email, code).subscribe(...);

    // Após confirmação, redirecionar para redefinir senha
    this.router.navigate(['/nova-senha'], { queryParams: { email: this.email, code } });
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
            this.alertService.error('Falha ao criar usuário, verifique os dados e tente novamente.');
          }
        });
  }
}
