import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { IRegisterUserRequestModel } from '../../models/users';
import { CommonModule } from '@angular/common';
import { closeModalById, passwordPolicyValidator } from '../../util/modal.util';

const _modalId = 'create_user_modal';
@Component({
  selector: 'app-registern',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './registern.html',
  styleUrl: './registern.css'
})
export class Registern implements OnInit {

  @Input() user!: IRegisterUserRequestModel;
  @Output() onSubmit: EventEmitter<any> = new EventEmitter();
  public userFormGroup!: FormGroup;
  public previewUrl: string | ArrayBuffer | null = null;
  public selectedFile: File | null = null;

  constructor(private formBuilder: FormBuilder) {

  }

  ngOnInit(): void {
    this.userFormGroup = this.formBuilder.group({
      fullName: ['', [Validators.required, Validators.maxLength(80)]],
      gender: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.maxLength(100)]],
      password: ['', [Validators.required, Validators.maxLength(8), passwordPolicyValidator]],
      photo: [null]
    });
  }

  insertUser() {
    this.userFormGroup.markAllAsTouched();
    if (this.userFormGroup.invalid) return;

    const fv = this.userFormGroup.value;
    const formData = new FormData();

    formData.append('fullName', fv.fullName);
    formData.append('gender', fv.gender);
    formData.append('email', fv.email);
    formData.append('password', fv.password);

    const pic = fv.photo;
    if (pic instanceof File) {
      formData.append('photo', pic, pic.name);
    } else {
      console.warn('photo não é um File válido:', pic);
    }

    this.onSubmit.emit({ data: formData });
    this.closeModal();
  }

  closeModal() {
    this.userFormGroup.reset();
    closeModalById(_modalId);
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const file = input.files[0];

    this.userFormGroup.patchValue({ photo: file });
    this.userFormGroup.get('photo')!.updateValueAndValidity();
  }






}
