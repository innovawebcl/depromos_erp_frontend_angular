import { Component, OnInit } from '@angular/core';
import { CommonModule, NgStyle } from '@angular/common';
import { ActivatedRoute, Route, Router, RouterLink } from '@angular/router';

import { DomSanitizer, type SafeUrl } from '@angular/platform-browser';

import {
  RowComponent,
  ColComponent,
  CardComponent,
  CardHeaderComponent,
  CardBodyComponent,
  ContainerComponent,
  CardGroupComponent,
} from '@coreui/angular-pro';

import { firstValueFrom, Subject } from 'rxjs';

import type {
  IForgotPasswordInput,
  ILoginInput,
} from '@core-ports/inputs/login';

import { AuthManager } from '@infra-adapters/services/auth.service';
import { ManagerLogin } from '@infra-adapters/services/login.service';

import { FormLoginComponent } from './form/form.component';
import { HttpClientModule } from '@angular/common/http';
import { ForgotPasswordComponent } from '@infra-ui/views/pages/login/forgot-password/forgot-password.component';
import { ValidateCodeComponent } from '@infra-ui/views/pages/login/validate-code/validate-code.component';
import { ResetPasswordComponent } from '@infra-ui/views/pages/login/reset-password/reset-password.component';

enum AuthScreen {
  LOGIN = 'login',
  REQUEST_PASSWORD = 'forgot-password',
  VALIDATE_CODE = 'validate-code',
  RESET_PASSWORD = 'reset-password',
}

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: true,
  imports: [
    ContainerComponent,
    RowComponent,
    ColComponent,
    CardGroupComponent,
    CardComponent,
    CardHeaderComponent,
    CardBodyComponent,
    NgStyle,
    CommonModule,

    FormLoginComponent,
    ForgotPasswordComponent,
    ValidateCodeComponent,
    ResetPasswordComponent,

    RouterLink,
  ],
})
export class LoginComponent implements OnInit {
  customStylesValidated: boolean = false;
  logo: SafeUrl;
  isLoading: Subject<boolean> = new Subject();

  pageStyle: string =
    'background: bg-light dark:bg-transparent min-vh-100 d-flex flex-row align-items-center';

  authScreen: AuthScreen = AuthScreen.LOGIN;
  recoveryEmail: string = '';
  successMessage: string = '';
  isFirstLogin: boolean = false;

  constructor(
    private loginService: ManagerLogin,
    private authService: AuthManager,
    private domSanitizer: DomSanitizer,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.logo = domSanitizer.bypassSecurityTrustUrl(
      'assets/images/logo-vertical.png'
    );
  }

  ngOnInit(): void {
    const lastRouteSegment = this.route.snapshot.url[0].path;
    const email = this.route.snapshot.queryParams['email'];
    this.isFirstLogin = this.authService.UserSessionData()?.first_login ?? true;
    switch (lastRouteSegment) {
      case 'login':
        this.authScreen = AuthScreen.LOGIN;
        break;
      case 'forgot-password':
        this.authScreen = AuthScreen.REQUEST_PASSWORD;
        break;
      case 'validate-code':
        this.authScreen = AuthScreen.VALIDATE_CODE;
        if (!email) {
          this.router.navigate(['/login']);
          break;
        }
        this.recoveryEmail = email;
        break;
      case 'reset-password':
        this.authScreen = AuthScreen.RESET_PASSWORD;
        break;
      default:
        this.router.navigate(['/login']);
        break;
    }
  }

  async onSubmit(input: ILoginInput) {
    try {
      this.isLoading.next(true);
      const observable = await this.loginService.loginRequest(input);
      const session = await firstValueFrom(observable);

      this.authService.setSession(session.data.token);
      this.isLoading.next(false);
      this.router.navigate(['/dashboard']);
    } catch (error: any) {
      this.isLoading.next(false);
      this.setFormError();
    }
  }

  async onForgotPasswordSubmit(input: IForgotPasswordInput) {
    try {
      this.isLoading.next(true);
      const observable = await this.loginService.forgotPasswordRequest(input);
      const response = await firstValueFrom(observable);

      this.isLoading.next(false);
      this.successMessage =
        'Se ha enviado un correo con el código de recuperación';
      setTimeout(() => {
        this.successMessage = '';
        this.router.navigate(['/validate-code'], {
          queryParams: { email: input.email },
        });
      }, 5000);
    } catch (error: any) {
      this.isLoading.next(false);
    }
  }

  async onValidateCodeSubmit(code: string) {
    if (!this.recoveryEmail) {
      this.router.navigate(['/login']);
      return;
    }
    try {
      this.isLoading.next(true);
      const observable = await this.loginService.validateCodeRequest(
        this.recoveryEmail,
        code
      );
      const temporalSession = await firstValueFrom(observable);
      this.authService.setSession(temporalSession.data.token);
      this.isLoading.next(false);
      this.router.navigate(['/reset-password']);
    } catch (error: any) {
      this.isLoading.next(false);
    }
  }

  async onResetPasswordSubmit(newPassword: string) {
    try {
      this.isLoading.next(true);
      const observable = await this.loginService.resetPasswordRequest(
        newPassword
      );
      const session = await firstValueFrom(observable);

      this.authService.setSession(session.data.token);
      this.isLoading.next(false);
      this.router.navigate(['/dashboard']);
    } catch (error: any) {
      this.isLoading.next(false);
    }
  }

  logout() {
    this.authService.cleanSession();
    this.router.navigate(['/login']);
  }

  private setFormError() {
    const usernameControl = this.loginService.loginForm.get('username');
    const usernameCurrentErrors = usernameControl?.errors || {};
    usernameControl?.setErrors({
      ...usernameCurrentErrors,
      serverError: true,
    });

    const passwordControl = this.loginService.loginForm.get('password');
    const passwordCurrentErrors = passwordControl?.errors || {};
    passwordControl?.setErrors({
      ...passwordCurrentErrors,
      serverError: true,
    });
  }
}
