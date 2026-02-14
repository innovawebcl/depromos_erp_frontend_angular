import { HttpInterceptorFn } from '@angular/common/http';
import { HttpRequest, HttpHandlerFn, HttpEvent } from '@angular/common/http';
import { StorageKeys } from '@core-interfaces/global';
import { Observable } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<any>,
  next: HttpHandlerFn
): Observable<HttpEvent<any>> => {
  const token = sessionStorage.getItem(StorageKeys.session_token);
  const institution_id = sessionStorage.getItem(StorageKeys.institution_id);

  if (token) {
    const clonedRequest = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
        'x-institution': institution_id ?? '0',
      },
      withCredentials: true,
    });
    return next(clonedRequest);
  }

  return next(req.clone({ withCredentials: true }));
};
