import { inject } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  ResolveFn,
} from '@angular/router';
import { Store } from '@ngrx/store';
import { AppState } from '../states/app.state';
import { setWorkspace } from '../actions/workspace.actions';

export const workspaceResolver: ResolveFn<void> = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
): void => {
  const store = inject(Store<AppState>);
  const workspaceId = route.paramMap.get('workspaceId');

  if (workspaceId) {
    store.dispatch(setWorkspace({ workspaceId: Number(workspaceId) }));
  }
};
