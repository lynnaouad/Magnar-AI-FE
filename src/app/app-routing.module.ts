import { Routes } from '@angular/router';
import { AuthGuardService } from './shared/Guards/AuthGuard.service';

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
    path: 'admin',
    loadComponent: () => import('./layouts/admin-layout/side-nav-outer-toolbar.component').then((m) => m.SideNavOuterToolbarComponent),
    children: [
      { path: 'connections', loadComponent: () => import('./pages/connections/connections-list.component').then((m) => m.ConnectionsListComponent), data: { breadcrumb: 'Connections' }, canActivate: [ AuthGuardService ]},
      { path: 'database-schema', loadComponent: () => import('./pages/database-schema/database-schema.component').then((m) => m.DatabaseSchemaComponent), data: { breadcrumb: 'Database Schema' }, canActivate: [ AuthGuardService ]},
      { path: 'dashboard', loadComponent: () => import('./pages/dashboard/dashboard.component').then((m) => m.DashboardComponent), data: { breadcrumb: 'Dashboard' }, canActivate: [ AuthGuardService ]},
      
      { path: '', redirectTo: 'connections', pathMatch: 'full' },
    ]
  },
  { path: '**', redirectTo: 'login'},
 
];