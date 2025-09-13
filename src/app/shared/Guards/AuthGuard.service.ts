import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
} from '@angular/router';
import { AuthService } from '../services';

const defaultPath = '/';

@Injectable({ providedIn: 'root' })
export class AuthGuardService implements CanActivate {
  public state: any;

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  async canActivate(
    route: ActivatedRouteSnapshot,
    routerState: RouterStateSnapshot
  ): Promise<boolean> {
    const isLoggedIn = this.authService.loggedIn;

    let routerUrl = routerState.url;
    let parts = routerUrl.split('/');

    const isAuthForm = [
      'login',
      'reset-password',
      'create-account',
      'change-password/:userId',
      'confirm-email/:userId',
    ].includes(route.routeConfig?.path || defaultPath);

    if (isLoggedIn && isAuthForm) {
      this.authService.lastAuthenticatedPath = defaultPath;
      this.router.navigate([defaultPath]);
      return false;
    }

    if (!isLoggedIn && !isAuthForm) {
      this.redirectToLogin();
    }

    return isLoggedIn || isAuthForm;
  }

  private redirectToLogin(): void {
    this.router.navigate(['/login']);
  }
}
