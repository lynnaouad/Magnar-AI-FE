import { Routes } from '@angular/router';
import { AuthGuardService } from './shared/Guards/AuthGuard.service';
import { workspaceResolver } from './app-store/resolvers/workspace.resolver';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./layouts/login-layout/nav-bar.component').then((m) => m.NavBarComponent),
    children: [
      { path: 'login', loadComponent: () => import('./shared/components/login-form/login-form.component').then((m) => m.LoginFormComponent), canActivate: [ AuthGuardService ]},
      { path: 'reset-password', loadComponent: () => import('./shared/components/reset-password-form/reset-password-form.component').then((m) => m.ResetPasswordFormComponent), canActivate: [ AuthGuardService ]},
      { path: 'create-account', loadComponent: () => import('./shared/components/create-account-form/create-account-form.component').then((m) => m.CreateAccountFormComponent), canActivate: [ AuthGuardService ]},
      { path: 'change-password/:userId', loadComponent: () => import('./shared/components/change-password-form/change-password-form.component').then((m) => m.ChangePasswordFormComponent), canActivate: [ AuthGuardService ]},
      { path: 'confirm-email/:userId', loadComponent: () => import('./shared/components/confirmation-form/confirmation-form.component').then((m) => m.ConfirmationFormComponent), canActivate: [ AuthGuardService ]},
      { path: '', redirectTo: 'login', pathMatch: 'full' }, 
    ]
  },
  {
    path: 'workspaces',
    canActivate: [AuthGuardService],
    loadComponent: () => import('./layouts/login-layout/nav-bar.component').then((m) => m.NavBarComponent),
    children: [
       { path: '', loadComponent: () => import('./pages/workspaces/workspaces.component').then((m) => m.WorkspacesComponent)},
    ]
  },

  {
    path: 'workspaces/:workspaceId',
    resolve: [workspaceResolver],
    loadComponent: () => import('./layouts/admin-layout/side-nav-outer-toolbar.component').then((m) => m.SideNavOuterToolbarComponent),
    canActivate: [AuthGuardService],
    children: [
      { path: 'providers', loadComponent: () => import('./pages/providers/providers-list.component').then((m) => m.ProvidersListComponent)},
      { path: 'providers/create', loadComponent: () => import('./pages/providers/steps/provider-configuration/provider-configuration.component').then((m) => m.ProviderConfigurationComponent)},
      { path: 'providers/:id', loadComponent: () => import('./pages/providers/steps/provider-configuration/provider-configuration.component').then((m) => m.ProviderConfigurationComponent)},
      { path: 'providers/:id/database-schema', loadComponent: () => import('./pages/providers/steps/select-database-schema/select-database-schema.component').then((m) => m.SelectDatabaseSchemaComponent)},
     
      { path: 'prompt', loadComponent: () => import('./pages/prompt/prompt.component').then((m) => m.PromptComponent)},
      
      { path: 'dashboard', loadComponent: () => import('./pages/dashboard/dashboard.component').then((m) => m.DashboardComponent)},
      
      { path: '', redirectTo: 'providers', pathMatch: 'full' },
    ]
  },
  { path: '**', redirectTo: 'login'},
 
];