import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Login } from './login/login';
import { Registern } from './registern/registern';
import { RecoverPassword } from './recover-password/recover-password';

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
    }
  ]
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MdlAuthRoutingModule { }
