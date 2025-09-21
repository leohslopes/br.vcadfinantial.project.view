import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { UserAuthService } from '../../shared/user-auth-service';
import { IApiResponse, IUser } from '../../models/users';
import { openModalById } from '../../util/modal.util';
import { AlertService } from '../../alert/alert-service';
import { UserService } from '../user-service';
import { RouterModule } from '@angular/router';
import { UpdateUser } from '../update-user/update-user';
import { CommonModule } from '@angular/common';
import { ReportService } from './report-service';
import { IDownloadReportLogRequestModel } from '../../models/accounts';
import { AccountService } from '../account-service';
import * as bootstrap from 'bootstrap';

@Component({
  selector: 'app-report-log',
  imports: [CommonModule, RouterModule, ReactiveFormsModule, FormsModule, UpdateUser],
  templateUrl: './report-log.html',
  styleUrl: './report-log.css'
})
export class ReportLog implements OnInit {
  @ViewChild('confirmLogoutModal', { static: false }) confirmLogoutModal!: ElementRef;
  public years: number[] = [];
  public months: { name: string, value: string }[] = [];
  public yearSelect: number | null = null;
  public monthSelect: string | null = null;
  public userCurrent?: IUser;
  public menuOpen = false;
  public isLoged: boolean = false;

  constructor(private userAuthService: UserAuthService,
    private alertService: AlertService,
    private userService: UserService,
    private reportService: ReportService,
    private accountService: AccountService) {

  }

  ngOnInit(): void {
    this.userAuthService.isLoggedIn().subscribe(__isLoged => this.isLoged = __isLoged);
    this.userCurrent = this.userAuthService.getUser();
    this.loadYears();
    this.loadMonths();
  }

  private loadYears() {
    const currentYear = new Date().getFullYear();
    this.years = Array.from({ length: 10 }, (_, i) => currentYear + i);
  }

  private loadMonths() {
    this.months = [
      { name: 'Janeiro', value: '01' },
      { name: 'Fevereiro', value: '02' },
      { name: 'Março', value: '03' },
      { name: 'Abril', value: '04' },
      { name: 'Maio', value: '05' },
      { name: 'Junho', value: '06' },
      { name: 'Julho', value: '07' },
      { name: 'Agosto', value: '08' },
      { name: 'Setembro', value: '09' },
      { name: 'Outubro', value: '10' },
      { name: 'Novembro', value: '11' },
      { name: 'Dezembro', value: '12' }
    ];
  }

  logout() {
    const modalElement = document.getElementById('confirmLogoutModal');
    if (modalElement) {
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
    }
  }

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  loadImage() {
    if (this.userCurrent?.photo == null || this.userCurrent?.photo == undefined || this.userCurrent?.photo == '') {
      return "assets/SemFoto.jpg";
    } else {
      return `data:image/jpeg;base64,${this.userCurrent?.photo}`;
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

          const mensagemUnica = listaDeErros.join('; ');

          this.alertService.warning(mensagemUnica);
        }
      },
      error: (err) => {
        this.alertService.error('Falha ao editar usuário, verifique os dados e tente novamente.');
      }
    });
  }

  download() {
    if (this.monthSelect == null && this.yearSelect == null) {
      this.alertService.warning('Favor selecionar o mês e o ano para baixar o relatório.');
      return;
    }

    var id: any = this.userCurrent?.id;
    var command: IDownloadReportLogRequestModel = {
      monthKey: this.yearSelect + '-' + this.monthSelect,
      userId: id
    };

    this.reportService.download(command).subscribe({
      next: (value: IApiResponse<string>) => {
        if (value.success) {
          const base64 = value.data;
          const blob = this.base64ToBlob(base64, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
          const a = document.createElement('a');
          const url = window.URL.createObjectURL(blob);
          a.href = url;
          a.download = 'relatorio-log-fila.xlsx';
          a.click();
          window.URL.revokeObjectURL(url);

          this.alertService.success("Relatório baixado com sucesso.");
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
        this.alertService.error('Falha ao baixar o relatório de log, verifique e tente novamente.');
      }
    });
  }

  private base64ToBlob(base64: string, contentType: string): Blob {
    const byteCharacters = atob(base64);
    const byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += 512) {
      const slice = byteCharacters.slice(offset, offset + 512);
      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }

    return new Blob(byteArrays, { type: contentType });
  }

  private inactiveDocument() {
    var id: any = this.userCurrent?.id;

    this.accountService.delete(id).subscribe({
      next: (value: IApiResponse<any>) => {
        if (value.success) {
          this.alertService.success('Documento excluído com sucesso.');
        } else {
          const errosObj = value.errors as Record<string, any>;
          const listaDeErros: string[] = Object.values(errosObj).map(err => {
            if (Array.isArray(err)) return err.join(', ');
            if (typeof err === 'string') return err;
            return JSON.stringify(err);
          });

          const mensagemUnica = listaDeErros.join('; ');
          this.alertService.error(mensagemUnica);
        }
      },
      error: (err) => {
        this.alertService.error('Falha ao excluir o documento, tente novamente.');
      }
    });
  }

  confirmLogout(deleteDocument: boolean) {
    if (deleteDocument) {
      this.inactiveDocument();
    }

    const modalEl = this.confirmLogoutModal.nativeElement;
    const modalInstance = bootstrap.Modal.getInstance(modalEl);
    modalInstance?.hide();

    this.userAuthService.clearToken();
  }

}
