import { NgIf } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ValidationRule } from 'devextreme-angular/common';
import { DxFormModule } from 'devextreme-angular/ui/form';
import { DxLoadIndicatorModule } from 'devextreme-angular/ui/load-indicator';
import { AuthService } from '../../services';
import { catchError, finalize, of, take } from 'rxjs';
import { ToastNotificationManager } from '../../utils/toast-notification.service';
import {
  DxScrollViewModule,
  DxTooltipModule,
  DxValidationGroupComponent,
  DxValidationGroupModule,
  DxValidatorComponent,
} from 'devextreme-angular';
import { CardAuthComponent } from '../card-auth/card-auth.component';
import { PasswordTextBoxComponent } from '../password-text-box/password-text-box.component';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-change-passsword-form',
  templateUrl: './change-password-form.component.html',
  styleUrls: ['./change-password-form.component.scss'],
  standalone: true,
  imports: [
    DxFormModule,
    DxLoadIndicatorModule,
    NgIf,
    DxScrollViewModule,
    CardAuthComponent,
    PasswordTextBoxComponent,
    DxValidationGroupModule,
    DxTooltipModule,
    TranslateModule,
  ],
})
export class ChangePasswordFormComponent implements OnInit {
  loading = false;
  formData: any = {};
  recoveryCode: string = '';
  userId: string = '';

  @ViewChild('confirmField', { static: true })
  confirmField!: PasswordTextBoxComponent;

  @ViewChild('validationGroup', { static: true })
  validationGroup!: DxValidationGroupComponent;
  isSaveDisabled = true;

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private toastNotificationManager: ToastNotificationManager
  ) {}

  confirmPasswordValidators: ValidationRule[] = [
    {
      type: 'compare',
      message: 'Passwords do not match',
      comparisonTarget: () => this.formData['password'],
    },
  ];

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      this.userId = params.get('userId') || '';
    });

    this.route.queryParams.subscribe((params) => {
      this.recoveryCode = params['token'] || '';
    });
  }

  async onSubmit(e: Event) {
    e.preventDefault();

    if (this.isSaveDisabled) {
      return;
    }

    const { password } = this.formData;
    this.loading = true;

    this.authService
      .resetPassword(password, this.recoveryCode, this.userId)
      .pipe(
        take(1),
        finalize(() => {
          this.loading = false;
          this.resetValidation();
        })
      )
      .subscribe((res) => {
        this.toastNotificationManager.success(
          'ToastNotifications.PasswordUpdated'
        );
        this.router.navigate(['/login']);
      });
  }

  checkConfirm(): void {
    this.confirmField.validate();
  }

  onNewPasswordChanged() {
    this.checkConfirm();
    this.onFieldChanged();
  }

  async onFieldChanged() {
    const formValues = Object.entries(this.formData);

    this.isSaveDisabled = await (formValues.length != 2 ||
      !!formValues.find(([_, value]) => !value) ||
      !this.isValid());
  }

  resetValidation() {
    this.validationGroup.instance.reset();
  }

  isValid() {
    return this.validationGroup.instance.validate().isValid;
  }
}
