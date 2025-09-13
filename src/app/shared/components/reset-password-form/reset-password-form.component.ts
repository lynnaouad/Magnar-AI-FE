import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services';
import {
  DxFormModule,
  DxLoadIndicatorModule,
  DxScrollViewModule,
} from 'devextreme-angular';
import { NgIf } from '@angular/common';
import { catchError, finalize, of, take } from 'rxjs';
import { ToastNotificationManager } from '../../utils/toast-notification.service';
import { CardAuthComponent } from '../card-auth/card-auth.component';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-reset-password-form',
  templateUrl: './reset-password-form.component.html',
  styleUrls: ['./reset-password-form.component.scss'],
  standalone: true,
  imports: [
    TranslateModule,
    DxFormModule,
    DxLoadIndicatorModule,
    NgIf,
    DxScrollViewModule,
    CardAuthComponent,
  ],
})
export class ResetPasswordFormComponent {
  loading = false;
  formData: any = {};

  constructor(private authService: AuthService, private router: Router,  private toastNotificationManager: ToastNotificationManager) {}

  async onSubmit(e: Event) {
    e.preventDefault();
    const { email } = this.formData;
    this.loading = true;

    this.authService
      .recoverPassword(email)
      .pipe(
        take(1),
        finalize(() => (this.loading = false))
      )
      .subscribe(() => {
        this.router.navigate(['/login']);
        this.toastNotificationManager.success(
          'ToastNotifications.SendResetLink'
        );
      });
  }
}
