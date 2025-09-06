import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { IUpdateUserRequestModel, IUser } from '../../models/users';
import { closeModalById, passwordPolicyValidator } from '../../util/modal.util';
import { UserAuthService } from '../../shared/user-auth-service';
import { CommonModule } from '@angular/common';

const _modalId = 'update_user_modal';
@Component({
  selector: 'app-update-user',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './update-user.html',
  styleUrl: './update-user.css'
})
export class UpdateUser implements OnChanges, OnInit {

  @Input() user!: IUpdateUserRequestModel;
  @Output() onSubmit: EventEmitter<any> = new EventEmitter();
  public updateUserForm!: FormGroup;
  public previewImage: string | ArrayBuffer | null = null;
  public selectedFile: File | null = null;
  public userCurrent?: IUser;

  constructor(private formBuilder: FormBuilder, private userAuthService: UserAuthService) {
    this.updateUserForm = this.formBuilder.group({
      id: ['', [Validators.required]],
      fullName: ['', [Validators.required, Validators.maxLength(80)]],
      gender: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.maxLength(100)]],
      password: ['', [Validators.required, Validators.maxLength(8), passwordPolicyValidator]],
      confirmPassword: ['', Validators.required],
      photo: [null]
    },
      { validators: this.passwordsMatchValidator });
  }

  ngOnInit(): void {
    this.userCurrent = this.userAuthService.getUser();

    if (!this.userCurrent) return;

    this.#loadUserData();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['user'] && changes['user'].currentValue) {
      this.userCurrent = changes['user'].currentValue;
      this.#loadUserData();
    }
  }

  passwordsMatchValidator(form: AbstractControl) {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  #loadUserData() {
    this.updateUserForm.patchValue({
      id: this.userCurrent?.id,
      fullName: this.userCurrent?.fullName,
      gender: this.userCurrent?.gender,
      email: this.userCurrent?.email,
      password: null,
      photo: this.userCurrent?.photo
    });

    if (this.userCurrent?.photo) {
      this.previewImage = `data:image/jpeg;base64,${this.userCurrent?.photo}`;
    }
  }

  loadImage() {
    if (this.userCurrent?.photo == null || this.userCurrent?.photo == undefined || this.userCurrent?.photo == '') {
      return "assets/SemFoto.jpg";
    } else {
      return `data:image/jpeg;base64,${this.userCurrent?.photo}`;
    }
  }

  updateUser() {
    this.updateUserForm.markAllAsTouched();
    if (this.updateUserForm.invalid) return;

    const fv = this.updateUserForm.value;
    const formData = new FormData();

    formData.append('id', fv.id.toString());
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

    this.onSubmit.emit({ id: fv.id, data: formData });
    this.closeModal();
  }

  closeModal() {
    this.updateUserForm.reset();
    closeModalById(_modalId);
  }

  triggerFileInput() {
    const fileInput = document.getElementById('photoInput') as HTMLInputElement;
    fileInput.click();
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const reader = new FileReader();
      reader.onload = () => this.previewImage = reader.result;
      reader.readAsDataURL(input.files[0]);

      this.updateUserForm.patchValue({
        photo: input.files[0]
      });
    }
  }


}
