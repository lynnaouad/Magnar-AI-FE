import { inject } from '@angular/core';
import {
  HttpRequest,
  HttpInterceptorFn,
  HttpHandlerFn,
  HttpErrorResponse,
} from '@angular/common/http';
import { AuthService } from '../shared/services';
import {
  BehaviorSubject,
  catchError,
  filter,
  switchMap,
  take,
  tap,
  throwError,
} from 'rxjs';
import { jwtDecode } from 'jwt-decode';
import { MagnarApiAnonymousEndpoints } from '../shared/constants/constants';
import { select, Store } from '@ngrx/store';

let workspaceId: number = 0;

const isRefreshing = new BehaviorSubject<boolean>(false);
const refreshTokenSubject = new BehaviorSubject<string | null>(null);

export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
) => {
  if (MagnarApiAnonymousEndpoints.includes(req.url.split('api')[1])) {
    return next(req);
  }

  const authService = inject(AuthService);
  const store = inject(Store);

  store.pipe(select("workspace")).subscribe((workspace) => {
    workspaceId = workspace?.workspaceId ?? 0
    });

  const token = sessionStorage.getItem('access_token');
  // Check if the access token is expired before making the request
  if (token && isTokenExpired()) {
    return refreshToken(authService, req, next);
  }

  return next(addAuthHeader(req)).pipe(
    catchError((err: any) => {
      if (err instanceof HttpErrorResponse && err.status === 401) {
        return refreshToken(authService, req, next);
      }
      return throwError(() => err);
    })
  );
};

function refreshToken(
  authService: AuthService,
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
) {
  if (!isRefreshing.value) {
    isRefreshing.next(true);
    return authService.refreshToken().pipe(
      tap((res: any) => {
        sessionStorage.setItem('access_token', res.access_token);
        sessionStorage.setItem('refresh_token', res.refresh_token);
        refreshTokenSubject.next(res.access_token);
      }),
      switchMap(() => {
        isRefreshing.next(false);
        return next(addAuthHeader(req)); // Retry the original request
      })
    );
  } else {
    // Wait until the refresh process is completed before retrying
    return refreshTokenSubject.pipe(
      filter((token) => token !== null),
      take(1),
      switchMap(() => next(addAuthHeader(req))) // Retry the original request
    );
  }
}

/**
 * Helper function to check if the access token is expired.
 */
function isTokenExpired(offsetSeconds: number = 30): boolean {
  const token = sessionStorage.getItem('access_token');
  if (!token) return true;

  try {
    const decoded: any = jwtDecode(token);
    const currentTime = Math.floor(Date.now() / 1000); // Convert milliseconds to seconds
    return decoded.exp <= currentTime + offsetSeconds;
  } catch (e) {
    return true; // Treat as expired if decoding fails
  }
}

/**
 * Adds Authorization header if the access token is available.
 */
function addAuthHeader(req: HttpRequest<unknown>) {
  const token = sessionStorage.getItem('access_token');
  let lang = getCookie('language') || 'en';

  if (token) {
    return req.clone({
      setHeaders: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        'Accept-Language': lang,
      },
      url: workspaceId == 0 || hasWorkspaceIdSegment(req.url) ? req.url : req.url.replace('api/',`api/${(workspaceId).toString()}/`)
    });
  }
  return req.clone({
    setHeaders: {
      'Accept-Language': lang,
    },
  });
}

function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? match[2] : null;
}

function hasWorkspaceIdSegment(url: string): boolean {
  const regex = /\/api\/\d+\//;
  return regex.test(url);
}
