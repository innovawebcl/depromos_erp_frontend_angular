import { CommonModule, NgStyle } from '@angular/common';
import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

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

import type { ILoginInput } from '@core-ports/inputs/login';
import type { IloginFormInput } from '@core-services/login';
import type { ISessionResponse } from '@core-ports/outputs/session';

import { ManagerLogin } from '@infra-adapters/services/login.service';
import { AuthManager } from '@infra-adapters/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-form',
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
  templateUrl: './form.component.html',
  styleUrl: './form.component.scss',
})
export class FormLoginComponent implements OnInit {
  @Input() isLoading: Observable<boolean> = new Observable();
  @Output() formSubmit = new EventEmitter<ILoginInput>();

  constructor(
    private loginService: ManagerLogin,
    private authService: AuthManager,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loginService.loginForm.reset();
  }

  onSubmit() {
    if (this.form.valid) {
      const credentials = {
        username: this.form.value.username!,
        password: this.form.value.password!,
      };

      this.loginService.loginRequest(credentials).then((observable) => {
        observable.subscribe({
          next: (response: ISessionResponse) => {
            this.authService.setSession(response.data.token);
            this.router.navigate(['/dashboard']);
          },
          error: (error) => {
            this.form.get('password')?.enable();
            this.form.patchValue({ password: '' });
          },
        });
      });
    }
  }

  getErrorMessage(controlName: keyof IloginFormInput): string | null {
    return this.loginService.getErrorMessage(controlName);
  }

  get form() {
    return this.loginService.loginForm;
  }
}
