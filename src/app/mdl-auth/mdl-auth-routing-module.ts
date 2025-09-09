import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Login } from './login/login';
import { Registern } from './registern/registern';
import { RecoverPassword } from './recover-password/recover-password';
import { ResetPassword } from './reset-password/reset-password';

const routes: Routes = [ {
  path: '', 
  children: [ 
    {
      path: 'login',
      component: Login
    },
    {
      path: 'register',
      component: Registern
    },
    {
      path: 'recoverPassword',
      component: RecoverPassword
    },
    {
      path:'resetPassword',
      component: ResetPassword
    }
  ]
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MdlAuthRoutingModule { }
