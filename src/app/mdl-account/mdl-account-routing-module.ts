import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Index } from './index';
import { Protect } from './protect/protect';
import { AuthGuard } from '../shared/authGuard';
import { ReportLog } from './report-log/report-log';
import { Dashboard } from './dashboard/dashboard';

const routes: Routes = [
  {
    path: '',            // agora corresponde diretamente a '/account'
    children: [
      { path: '', redirectTo: 'index', pathMatch: 'full' },
      { path: 'index', component: Index },
      { path: 'protect', component: Protect, canActivate: [AuthGuard] },
      { path: 'report', component: ReportLog, canActivate: [AuthGuard] },
      { path: 'dashboard', component: Dashboard, canActivate: [AuthGuard] }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MdlAccountRoutingModule { }
