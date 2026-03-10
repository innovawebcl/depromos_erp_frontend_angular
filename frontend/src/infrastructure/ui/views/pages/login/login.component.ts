import { Component, OnInit } from '@angular/core';
import { CommonModule, NgStyle } from '@angular/common';
import { Router, RouterLink } from '@angular/router';

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

import type { ILoginInput } from '@core-ports/inputs/login';

import { AuthManager } from '@infra-adapters/services/auth.service';
import { ManagerLogin } from '@infra-adapters/services/login.service';

import { FormLoginComponent } from './form/form.component';

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

    RouterLink,
  ],
})
export class LoginComponent implements OnInit {
  customStylesValidated: boolean = false;
  logo: SafeUrl;
  isLoading: Subject<boolean> = new Subject();

  pageStyle: string =
    'background: bg-light dark:bg-transparent min-vh-100 d-flex flex-row align-items-center';

  constructor(
    private loginService: ManagerLogin,
    private authService: AuthManager,
    private domSanitizer: DomSanitizer,
    private router: Router,
  ) {
    this.logo = domSanitizer.bypassSecurityTrustUrl(
      'assets/images/logo-vertical.png'
    );
  }

  ngOnInit(): void {
    // Si ya tiene sesión activa, redirigir al dashboard
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/dashboard']);
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
