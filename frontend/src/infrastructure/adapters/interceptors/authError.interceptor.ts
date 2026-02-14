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
import { exceptionType } from '@core-interfaces/global';
export const authErrorInterceptor: HttpInterceptorFn = (
  req: HttpRequest<any>,
  next: HttpHandlerFn
): Observable<HttpEvent<any>> => {
  const authService = inject(AuthManager);
  const toastAlertService = inject(ToastrService);
  const router = inject(Router);

  const validateExceptionMessage = (message: string) => {
    if (message === exceptionType.institutionIDForSA) {
      return 'No se ha seleccionado institución. Por favor, seleccione una';
    }
    return message;
  };

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const errorMessage =
        error.error?.message ??
        validateExceptionMessage(error.error?.error) ??
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
