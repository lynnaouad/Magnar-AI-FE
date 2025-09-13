import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, map, Observable, of, take } from 'rxjs';
import { ConfigurationService } from './configuration.service';
import { ToastNotificationManager } from '../utils/toast-notification.service';
import { saveAs } from 'file-saver-es';
import { Utilities } from '../utils/utilities.service';

export interface IUser {
  userId: string;
  usernameOrEmail: string;
}

const defaultPath = '/';

@Injectable({ providedIn: 'root' })
export class AuthService {
  controllerUrl: string;

  private _lastAuthenticatedPath: string = defaultPath;
  set lastAuthenticatedPath(value: string) {
    this._lastAuthenticatedPath = value;
  }

  constructor(
    private router: Router,
    private http: HttpClient,
    private configurationService: ConfigurationService,
    private utilities: Utilities
  ) {
    this.controllerUrl = this.configurationService.apiUri + '/api/accounts/';
  }

  get loggedIn(): boolean {
    return !!sessionStorage.getItem('access_token');
  }

  get token(): string | null {
    return sessionStorage.getItem('access_token');
  }

  get CurrentUser(): IUser {
    return {
      userId: sessionStorage.getItem('userId') ?? '',
      usernameOrEmail: sessionStorage.getItem('usernameOrEmail') ?? '',
    };
  }

  logIn(email: string, password: string, code: string = '') {
    return this.http
      .post(this.controllerUrl + 'access-token', {
        username: email,
        password: password,
        grantType: 'credentials',
      })
      .pipe(catchError(this.utilities.handleErrorGlobal));
  }

  async logOut() {
    this.resetSessionStorage();
  }

  refreshToken() {
    return this.http
      .post(this.controllerUrl + 'refresh-token', {
        token: sessionStorage.getItem('refresh_token'),
      })
      .pipe(
        take(1),
        catchError(() => {
          this.resetSessionStorage();
          this.router.navigate(['login']);
          return of();
        })
      );
  }

  getUser(userId: any) {
    return this.http
      .get(this.controllerUrl + `users/${userId}`)
      .pipe(catchError(this.utilities.handleErrorGlobal));
  }

  recoverPassword(email: string) {
    return this.http
      .post(this.controllerUrl + `users/${email}/password`, {})
      .pipe(catchError(this.utilities.handleErrorGlobal));
  }

  resetPassword(newPassword: string, recoveryCode: string, userId: string) {
    return this.http
      .patch(this.controllerUrl + `users/${userId}/password/reset`, {
        ResetToken: recoveryCode,
        NewPassword: newPassword,
      })
      .pipe(catchError(this.utilities.handleErrorGlobal));
  }

  confirmEmail(token: string, userId: string) {
    return this.http
      .patch(this.controllerUrl + `users/${userId}/email/confirmed`, {
        Token: token,
      })
      .pipe(catchError(this.utilities.handleErrorGlobal));
  }

  SendConfirmationEmail(userId: string) {
    return this.http
      .post(this.controllerUrl + `users/${userId}/email/confirmation`, {})
      .pipe(catchError(this.utilities.handleErrorGlobal));
  }

  export(exportData: any, fileName: string) {
    return this.http
      .post(this.controllerUrl + 'users/export', exportData, {
        responseType: 'blob',
      })
      .subscribe((blob: Blob) => {
        saveAs(blob, `${fileName}.${exportData.format}`);
      });
  }

  createUser(data: any) {
    return this.http
      .post(this.controllerUrl + 'users', {
        ApplicationUserDto: data,
      })
      .pipe(catchError(this.utilities.handleErrorGlobal));
  }

  resetSessionStorage() {
    sessionStorage.setItem('access_token', '');
    sessionStorage.setItem('refresh_token', '');
    sessionStorage.setItem('userId', '');
    sessionStorage.setItem('usernameOrEmail', '');
    sessionStorage.setItem('profile-picture', '');
  }
}
