import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { IApiResponse, IUser } from '../../models/users';
import { UserAuthService } from '../../shared/user-auth-service';
import { AlertService } from '../../alert/alert-service';
import { UserService } from '../user-service';
import { openModalById } from '../../util/modal.util';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UpdateUser } from '../update-user/update-user';
import { ChartConfiguration, ChartOptions } from 'chart.js';
import { DashboardService } from './dashboard-service';
import { IAccountBalanceCategoryInfoAgreggate, IAccountMinMaxInfoAgreggate } from '../../models/dashboard';
import { BaseChartDirective, NgChartsModule } from 'ng2-charts';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, RouterModule, ReactiveFormsModule, FormsModule, UpdateUser, NgChartsModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css'] // Corrigido para styleUrls (plural)
})
export class Dashboard implements OnInit {
  @ViewChild('barChart') barChart?: BaseChartDirective;
  @ViewChild('pieChart') pieChart?: BaseChartDirective;

  public userCurrent?: IUser;
  public menuOpen = false;
  public isLoged: boolean = false;

  public barChartData: ChartConfiguration<'bar'>['data'] = {
    labels: [],
    datasets: []
  };
  public barChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    scales: {
      y: {
        beginAtZero: false,
        ticks: {
          callback: (value) => `R$ ${value.toLocaleString('pt-BR')}`
        }
      }
    },
    plugins: {
      legend: { display: true }
    }
  };

  public pieChartData: ChartConfiguration<'pie'>['data'] = {
    labels: [],
    datasets: []
  };
  public pieChartOptions: ChartConfiguration<'pie'>['options'] = {
    responsive: true,
    plugins: {
      legend: { display: true, position: 'top' }
    }
  };

  constructor(
    private userAuthService: UserAuthService,
    private alertService: AlertService,
    private userService: UserService,
    private dashboardService: DashboardService
  ) { }

  ngOnInit(): void {
    this.userAuthService.isLoggedIn().subscribe(__isLoged => (this.isLoged = __isLoged));
    this.userCurrent = this.userAuthService.getUser();

    // Teste com dados estáticos - descomente para testar se gráficos funcionam
    // this.loadStaticTestData();

    // Dados dinâmicos
    this.getAccounts();
    this.getBalances();
  }

  logout() {
    this.userAuthService.clearToken();
  }

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  loadImage() {
    if (!this.userCurrent?.photo) {
      return 'assets/SemFoto.jpg';
    } else {
      return `data:image/jpeg;base64,${this.userCurrent.photo}`;
    }
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event) {
    const target = event.target as HTMLElement;
    const insideMenu = target.closest('.user-menu');
    if (!insideMenu) {
      this.menuOpen = false;
    }
  }

  openUpdateUserModal() {
    openModalById('update_user_modal');
  }

  onSubmitUpdateUser(command: any) {
    this.userService.update(command.id, command.data).subscribe({
      next: (value: IApiResponse<any>) => {
        if (value.success) {
          this.alertService.success('Usuário atualizado com sucesso.');
        } else {
          const errosObj = value.errors as Record<string, any>;
          const listaDeErros: string[] = Object.values(errosObj).map(err => {
            if (Array.isArray(err)) return err.join(', ');
            if (typeof err === 'string') return err;
            return JSON.stringify(err);
          });

          const mensagemUnica = listaDeErros.join('; ');

          this.alertService.warning(mensagemUnica);
        }
      },
      error: err => {
        this.alertService.error('Falha ao editar usuário, verifique os dados e tente novamente.');
      }
    });
  }

  private getAccounts() {
    this.dashboardService.getAccounts().subscribe({
      next: (response: IAccountMinMaxInfoAgreggate[]) => {
        if (response && response.length) {
          const labels = response.map(x => `Conta ${x.accountKey}`);
          const values = response.map(x => x.among);
          const colors = values.map(val => val >= 0 ? '#50C1BF' : '#F0625F');

          const minValue = Math.min(...values);
          const maxValue = Math.max(...values);

          this.barChartData = {
            labels,
            datasets: [
              {
                label: 'Valor',
                data: values,
                backgroundColor: colors
              }
            ]
          };

          // Atualiza as opções Y conforme os dados
          this.barChartOptions = {
            ...this.barChartOptions,
            scales: {
              y: {
                beginAtZero: false,
                min: minValue * 1.1,
                max: maxValue * 1.1,
                ticks: {
                  callback: (value) => `R$ ${value.toLocaleString('pt-BR')}`
                }
              }
            }
          };

          setTimeout(() => this.barChart?.update(), 0);
        }
      },
      error: (err) => console.error('Erro gráfico barras:', err)
    });
  }

  private getBalances() {
    this.dashboardService.getBalances().subscribe({
      next: (response: IAccountBalanceCategoryInfoAgreggate[]) => {
        if (response && response.length) {
          const labels = response.map(x => x.category);
          const data = response.map(x => +x.percentage.toFixed(2));
          const colors = ['#4CAF50', '#FFC107', '#F44336'];

          this.pieChartData = {
            labels,
            datasets: [
              {
                data,
                backgroundColor: colors
              }
            ]
          };

          setTimeout(() => this.pieChart?.update(), 0);
        }
      },
      error: (err) => console.error('Erro gráfico pizza:', err)
    });
  }

  // Método para testar dados estáticos - opcional
  private loadStaticTestData() {
    this.barChartData = {
      labels: ['Conta 9000000001', 'Conta 8000000002'],
      datasets: [
        {
          label: 'Valor',
          data: [1400000000, -150000000],
          backgroundColor: ['#50C1BF', '#F0625F']
        }
      ]
    };

    this.pieChartData = {
      labels: ['Maior que Zero', 'Igual a Zero', 'Menor que Zero'],
      datasets: [
        {
          data: [10, 90, 3],
          backgroundColor: ['#4CAF50', '#FFC107', '#F44336']
        }
      ]
    };
  }
}
