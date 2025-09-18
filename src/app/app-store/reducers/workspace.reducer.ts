import { createReducer, on } from '@ngrx/store';
import { setWorkspace } from '../actions/workspace.actions';


export interface WorkspaceState {
  workspaceId: number;
}

export const initialState: WorkspaceState = {
  workspaceId: 0,
};

export const reducer = createReducer(
  initialState,
  on(setWorkspace, (state, { workspaceId }) => ({ ...state, workspaceId }))
);
