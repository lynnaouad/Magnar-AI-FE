import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { select, Store } from '@ngrx/store';
import { setWorkspace } from '../actions/workspace.actions';
import { AppState } from '../states/app.state';


@Injectable({ providedIn: 'root' })
export class WorkspaceIdObserver {
  private workspaceIdSubject = new BehaviorSubject<number>(0);
  workspaceId$ = this.workspaceIdSubject.asObservable();

  constructor(private store: Store<AppState>) {
    this.store.pipe(select("workspace")).subscribe((workspace) => {
      this.workspaceIdSubject.next(workspace?.workspaceId ?? 0);
    });
  }

  setWorkspaceId(id: number) {
    this.store.dispatch(setWorkspace({ "workspaceId": id }));
  }
}
