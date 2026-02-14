import { CommonModule, NgStyle } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { IResetPasswordInput } from '@core-ports/inputs/login';
import {
  ButtonDirective,
  ColComponent,
  FormDirective,
  FormFeedbackComponent,
  FormLabelDirective,
  InputGroupComponent,
  InputGroupTextDirective,
  RowComponent,
  TextColorDirective,
  FormControlDirective,
  SpinnerComponent,
} from '@coreui/angular-pro';
import { IconDirective } from '@coreui/icons-angular';
import { Observable } from 'rxjs';


@Component({
  selector: 'reset-password',
  standalone: true,
  imports: [
    NgStyle,
    ReactiveFormsModule,
    FormsModule,
    CommonModule,

    RowComponent,
    ColComponent,
    InputGroupComponent,
    FormFeedbackComponent,
    SpinnerComponent,

    FormDirective,
    TextColorDirective,
    InputGroupTextDirective,
    IconDirective,
    FormControlDirective,
    ButtonDirective,
    FormLabelDirective,
  ],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss'
})
export class ResetPasswordComponent implements OnInit {
  @Input() isLoading: Observable<boolean> = new Observable();
  @Output() formSubmit = new EventEmitter<string>();

  resetPasswordForm!: FormGroup;
  error: string = '';

  constructor(
    private fb: FormBuilder,
  ) { }

  ngOnInit() {
    this.resetPasswordForm = this.fb.group({
      password: ['', Validators.required],
      confirmPassword: ['', Validators.required],
    });
  }

  onSubmit() {
    if (this.resetPasswordForm.get('password')?.value !== this.resetPasswordForm.get('confirmPassword')?.value) {
      this.error = 'Las contraseñas no coinciden.';
      return;
    }
    if (this.resetPasswordForm.valid) {
      this.error = '';
      this.formSubmit.emit(this.resetPasswordForm.get('password')?.value);
    }
  }
}
