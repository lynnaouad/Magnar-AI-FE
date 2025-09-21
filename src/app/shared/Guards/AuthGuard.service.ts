import { Injectable } from '@angular/core';
import {
  ActivatedRoute,
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
} from '@angular/router';
import { AuthService } from '../services';
import { WorkspaceService } from '../services/workspace.service';
import { catchError, map, of } from 'rxjs';

const defaultPath = '/workspaces';

@Injectable({ providedIn: 'root' })
export class AuthGuardService implements CanActivate {
  public state: any;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private workspaceService: WorkspaceService
  ) {}

  async canActivate(
    route: ActivatedRouteSnapshot,
    routerState: RouterStateSnapshot
  ): Promise<boolean> {
    const workspaceId = Number(route.paramMap.get('workspaceId'));
    const isLoggedIn = this.authService.loggedIn;

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

    if (workspaceId) {
      this.workspaceService.haveAccess(workspaceId).pipe(
        map((accessAllowed) => {
          if (accessAllowed) {
            return true;
          }

          this.router.navigate(['/workspaces']);
          return false;
        }),
        catchError(() => of(this.router.navigate(['/workspaces'])))
      ).subscribe();
    }

    if (!isLoggedIn && !isAuthForm) {
      this.router.navigate(['/login']);
      return false;
    }

    return true;
  }
}
