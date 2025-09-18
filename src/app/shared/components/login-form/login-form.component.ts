import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services';
import {
  DxFormModule,
  DxLoadIndicatorModule,
  DxScrollViewModule,
  DxTextBoxModule,
} from 'devextreme-angular';
import { CommonModule, NgIf } from '@angular/common';
import { finalize, Observable, take, tap } from 'rxjs';
import { CardAuthComponent } from '../card-auth/card-auth.component';
import { PasswordTextBoxComponent } from '../password-text-box/password-text-box.component';
import { ValidationRule } from 'devextreme/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-login-form',
  templateUrl: './login-form.component.html',
  styleUrls: ['./login-form.component.scss'],
  standalone: true,
  imports: [
    DxFormModule,
    DxLoadIndicatorModule,
    NgIf,
    DxScrollViewModule,
    CardAuthComponent,
    PasswordTextBoxComponent,
    TranslateModule,
    DxTextBoxModule,
    CommonModule,
  ],
})
export class LoginFormComponent implements OnInit {
  loading = false;
  formData: any = {};
  accessCode?: string;
  nonce?: string;

  passwordValidators: ValidationRule[] = [];

  @ViewChild('passwordTextBox') passwordTextBox!: PasswordTextBoxComponent;

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private translate: TranslateService
  ) {
    this.passwordValidators = [
      {
        type: 'required',
        message: this.translate.instant('ValidationRules.RequiredField'),
      },
    ];
  }

  ngOnInit(): void {}

  onRegister() {
    this.route.queryParams.subscribe((params: any) => {
      const returnUrl = params['returnUrl'];

      if (returnUrl != null) {
        this.router.navigate(['/create-account'], {
          relativeTo: this.route,
          queryParams: { returnUrl: returnUrl },
          queryParamsHandling: 'merge',
        });
      } else {
        this.router.navigate(['/create-account']);
      }
    });
  }

  async onSubmit(e: Event) {
    e.preventDefault();

    const isValid = this.passwordTextBox.validate();
    if (!isValid) {
      return;
    }

    const { email, password } = this.formData;
    this.loading = true;

    this.authService
      .logIn(email, password)
      .pipe(
        take(1),
        finalize(() => (this.loading = false))
      )
      .subscribe((res: any) => {
        this.setSessionStorageItems(res);

        this.route.queryParams.subscribe((params: any) => {
          const returnUrl = params['returnUrl'];

          if (returnUrl != null) {
            this.router.navigateByUrl(returnUrl);
          } else {
            this.router.navigate(['workspaces']);
          }
        });
      });
  }

  onCreateAccountClick = () => {
    this.router.navigate(['/create-account']);
  };

  setSessionStorageItems(res: any) {
    sessionStorage.setItem('access_token', res.access_token);
    sessionStorage.setItem('refresh_token', res.refresh_token);
    sessionStorage.setItem('usernameOrEmail', res.usernameOrEmail);
    sessionStorage.setItem('userId', res.userId);
  }
}
