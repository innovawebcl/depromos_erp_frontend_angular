import { inject } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';
import {
  HttpRequest,
  HttpHandlerFn,
  HttpEvent,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { AuthManager } from '@infra-adapters/services/auth.service';
import { ToastrService } from 'ngx-toastr';
export const authErrorInterceptor: HttpInterceptorFn = (
  req: HttpRequest<any>,
  next: HttpHandlerFn
): Observable<HttpEvent<any>> => {
  const authService = inject(AuthManager);
  const toastAlertService = inject(ToastrService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const errorMessage =
        error.error?.message ??
        error.error?.error ??
        'Error desconocido';

      toastAlertService.error(errorMessage);

      if (error.status === 401) {
        const currentUrl = router.url;
        authService.cleanSession();
        router.navigate(['/login'], { queryParams: { returnUrl: currentUrl } });
      }
      return throwError(() => error);
    })
  );
};
