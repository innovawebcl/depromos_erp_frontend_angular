import {
  ApplicationConfig,
  LOCALE_ID,
  importProvidersFrom,
} from '@angular/core';

import { provideAnimations } from '@angular/platform-browser/animations';

import {
  provideRouter,
  withEnabledBlockingInitialNavigation,
  withHashLocation,
  withInMemoryScrolling,
  withRouterConfig,
  withViewTransitions,
} from '@angular/router';

import { DropdownModule, SidebarModule } from '@coreui/angular-pro';
import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from '@infra-adapters/interceptors/auth.interceptor';
import { authErrorInterceptor } from '@infra-adapters/interceptors/authError.interceptor';
import { registerLocaleData } from '@angular/common';
import { provideToastr } from 'ngx-toastr';
import { messageInterceptor } from '@infra-adapters/interceptors/message.interceptor';
import localeEs from '@angular/common/locales/es';

registerLocaleData(localeEs);

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(
      routes,
      withRouterConfig({
        onSameUrlNavigation: 'reload',
      }),
      withInMemoryScrolling({
        scrollPositionRestoration: 'top',
        anchorScrolling: 'enabled',
      }),
      withEnabledBlockingInitialNavigation(),
      withViewTransitions(),
      withHashLocation()
    ),
    provideAnimations(),
    provideToastr({ preventDuplicates: true, timeOut: 5000 }),
    provideHttpClient(
      withInterceptors([
        authInterceptor,
        messageInterceptor,
        authErrorInterceptor,
      ])
    ),
    importProvidersFrom(SidebarModule, DropdownModule),
    { provide: LOCALE_ID, useValue: 'es' },
  ],
};
