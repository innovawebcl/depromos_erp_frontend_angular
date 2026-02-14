import { inject } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';
import {
  HttpRequest,
  HttpHandlerFn,
  HttpEvent,
  HttpResponse,
} from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
export const messageInterceptor: HttpInterceptorFn = (
  req: HttpRequest<any>,
  next: HttpHandlerFn
): Observable<HttpEvent<any>> => {
  const toastAlertService = inject(ToastrService);

  return next(req).pipe(
    tap((event: HttpEvent<any>) => {
      if (
        event instanceof HttpResponse &&
        (event.status === 200 || event.status === 201)
      ) {
        if (req.method !== 'GET' && req.method !== 'OPTIONS') {
          const message = event.body?.message || 'Operación exitosa';
          toastAlertService.success(message);
        }
      }
    })
  );
};
