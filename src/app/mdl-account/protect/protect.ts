import { Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserAuthService } from '../../shared/user-auth-service';
import { RouterModule } from '@angular/router';
import { AlertService } from '../../alert/alert-service';
import { openModalById } from '../../util/modal.util';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NonNullAssert } from '@angular/compiler';
import * as bootstrap from 'bootstrap';
import { IDocumentAccountInfoAgreggate, IResultSetImportArchive } from '../../models/accounts';
import { AccountService } from '../account-service';
import { IApiResponse, IUser } from '../../models/users';
import { UserService } from '../user-service';
import { UpdateUser } from '../update-user/update-user';


@Component({
  selector: 'app-protect',
  imports: [CommonModule, RouterModule, ReactiveFormsModule, FormsModule, UpdateUser],
  templateUrl: './protect.html',
  styleUrl: './protect.css'
})
export class Protect implements OnInit, OnDestroy {

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  public data: IDocumentAccountInfoAgreggate[] = [];
  public isLoged: boolean = false;
  public rowsPerPage = 5;
  public currentPage = 1;
  public paginatedData: any[] = [];
  public pages: number[] = [];
  public userCurrent?: IUser;
  public menuOpen = false;
  public accountNumber: number = 0;
  public overwriteMessage: string = '';
  public overwriteFile!: File;
  public overwriteFormData!: FormData;
  public overwriteModal?: bootstrap.Modal;

  constructor(
    private userAuthService: UserAuthService,
    private accountService: AccountService,
    private alertService: AlertService,
    private userService: UserService) {

  }

  ngOnDestroy(): void {

  }

  ngOnInit(): void {
    this.userAuthService.isLoggedIn().subscribe(__isLoged => this.isLoged = __isLoged);
    this.userCurrent = this.userAuthService.getUser();
    this.getAll();
  }

  logout() {
    this.userAuthService.clearToken();
  }

  getFilter() {
    if (this.accountNumber == 0) {
      this.alertService.warning('Favor digitar um número de conta.');
      return;
    }

    this.accountService.getByID(this.accountNumber).subscribe({
      next: (response: any) => {
        if (response.success && response.data) {
          this.data = response.data;
        } else {
          this.data = response;
        }

        console.log("Dados carregados:", this.data);

        this.updatePagination();
      },
      error: err => {
        console.log(err);
      }
    });
  }

  clear() {
    this.accountNumber = 0;
    this.getAll();
  }

  private getAll() {
    this.accountService.get().subscribe({
      next: (response: any) => {
        if (response.success && response.data) {
          this.data = response.data;
        } else {
          this.data = response;
        }

        console.log("Dados carregados:", this.data);

        this.updatePagination();
      },
      error: err => {
        console.log(err);
      }
    });
  }

  updatePagination() {
    if (!this.data || this.data.length === 0) {
      this.paginatedData = [];
      this.pages = [];
      return;
    }

    const start = (this.currentPage - 1) * this.rowsPerPage;
    const end = start + this.rowsPerPage;
    this.paginatedData = this.data.slice(start, end);

    const totalPages = Math.ceil(this.data.length / this.rowsPerPage);
    this.pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  goToPage(page: number) {
    this.currentPage = page;
    this.updatePagination();
  }

  goToPreviousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePagination();
    }
  }

  goToNextPage() {
    if (this.currentPage < this.pages.length) {
      this.currentPage++;
      this.updatePagination();
    }
  }

  loadImage() {
    if (this.userCurrent?.photo == null || this.userCurrent?.photo == undefined || this.userCurrent?.photo == '') {
      return "assets/SemFoto.jpg";
    } else {
      return `data:image/jpeg;base64,${this.userCurrent?.photo}`;
    }
  }

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event) {
    const target = event.target as HTMLElement;
    const insideMenu = target.closest('.user-menu');
    if (!insideMenu) {
      this.menuOpen = false;
    }
  }

  triggerFileInput() {
    this.fileInput.nativeElement.click();
  }

  handleFileInput(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    const formData = new FormData();
    formData.append('file', file);

    this.accountService.import(formData).subscribe({
      next: (value: IApiResponse<IResultSetImportArchive>) => {
        if (value.success) {
          const base64 = value.data.resultFileContent;
          const blob = this.base64ToBlob(base64, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
          const a = document.createElement('a');
          const url = window.URL.createObjectURL(blob);
          a.href = url;
          a.download = 'resultado-importacao.xlsx';
          a.click();
          window.URL.revokeObjectURL(url);


          if (value.data.countRows > 0) {
            this.alertService.success(`Conta(s) ${value.data.countRows} importada(s) com sucesso.`);
          } else {
            this.alertService.warning('Existe(m) crítica(s) na planilha de retorno.');
          }

          this.getAll();

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
        if (err.status === 409) {
          const errosObj = err?.error?.errors ?? {};
          const listaDeErros: string[] = Object.values(errosObj).map(err => {
            if (Array.isArray(err)) return err.join(', ');
            if (typeof err === 'string') return err;
            return JSON.stringify(err);
          });

          const mensagemUnica = listaDeErros.join('; ');
          this.openOverwriteModal(`${mensagemUnica}\nDeseja sobrescrever o arquivo existente?`, file, formData);
        } else {
          this.alertService.error('Falha ao importar o XML, verifique e tente novamente.');
        }
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

  openOverwriteModal(message: string, file: File, formData: FormData) {
    this.overwriteMessage = message;
    this.overwriteFile = file;
    this.overwriteFormData = formData;

    const modalElement = document.getElementById('confirmOverwriteModal');
    if (modalElement) {
      this.overwriteModal = new bootstrap.Modal(modalElement);
      this.overwriteModal.show();
    }
  }

  closeOverwriteModal() {
    this.overwriteModal?.hide();
  }

  confirmOverwrite() {
    this.accountService.import(this.overwriteFormData, true).subscribe({
      next: (value) => {
        this.closeOverwriteModal();

        const base64 = value.data.resultFileContent;
        const blob = this.base64ToBlob(base64, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'resultado-importacao.xlsx';
        a.click();
        window.URL.revokeObjectURL(url);

        if (value.data.countRows > 0) {
          this.alertService.success(`Conta(s) ${value.data.countRows} importada(s) com sucesso.`);
        } else {
          this.alertService.warning('Existe(m) crítica(s) na planilha de retorno.');
        }

        this.getAll();
      },
      error: () => {
        this.closeOverwriteModal();
        this.alertService.error('Erro ao sobrescrever o arquivo. Tente novamente.');
      }
    });
  }
}
