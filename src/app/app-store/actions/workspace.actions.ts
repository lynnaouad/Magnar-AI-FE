import { createAction, props } from '@ngrx/store';

export const setWorkspace = createAction(
    '[workspace Page] selectWorkspace',
    props<{ workspaceId: 0 }|any>(),
)
