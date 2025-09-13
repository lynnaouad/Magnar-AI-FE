import { AfterViewInit, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ValidationCallbackData } from 'devextreme-angular/common';
import { AuthService } from '../../services';
import { DxFormModule, DxLoadIndicatorModule, DxScrollViewModule } from 'devextreme-angular';
import { CommonModule, NgIf } from '@angular/common';
import { catchError, finalize, map, Observable, of, take } from 'rxjs';
import { ToastNotificationManager } from '../../utils/toast-notification.service';
import { ConfigurationService } from '../../services/configuration.service';
import { CardAuthComponent } from "../card-auth/card-auth.component";
import { TranslateModule, TranslateService } from '@ngx-translate/core';


@Component({
  selector: 'app-create-account-form',
  templateUrl: './create-account-form.component.html',
  styleUrls: ['./create-account-form.component.scss'],
  standalone: true,
  imports: [DxFormModule, DxLoadIndicatorModule, NgIf, CommonModule, DxScrollViewModule, CardAuthComponent, TranslateModule]
})
export class CreateAccountFormComponent implements OnInit, AfterViewInit  {
  loading = false;
  formData: any = {};
  captchaToken: string | null = null;
  siteKey$: Observable<string> = of('');
  accountCreated = false;
  createdUserId: any;

  constructor(private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private configurationService: ConfigurationService,
    private toastNotificationManager: ToastNotificationManager) { }

    
  ngOnInit(): void {
    this.siteKey$ = of(this.configurationService.getGoogleRecaptchaConfiguration()?.siteKey);

    this.loadRecaptchaCallback();
  }

  loadRecaptchaCallback() {
    (window as any).onRecaptchaSuccess = (token: string) => {
      this.captchaToken = token;
    };
  }

  ngAfterViewInit() {
    this.siteKey$.subscribe((siteKey: string) => {
      if (!siteKey) {
        console.error('Site key is missing');
        return;
      }

      const renderRecaptcha = () => {
        if ((window as any).grecaptcha) {
          (window as any).grecaptcha.render('recaptcha-container', {
            sitekey: siteKey,
            callback: (response: string) => {
              this.captchaToken = response;
            },
            'expired-callback': () => {
              this.resetRecaptcha();
            },
          });
        } else {
          setTimeout(renderRecaptcha, 500);
        }
      };

      renderRecaptcha();
    });
  }

  onCancel(){
    this.navigateWithReturnUrl('/login');
  }

  navigateWithReturnUrl(route: any){
    this.route.queryParams.subscribe((params: any) => {
      const returnUrl = params['returnUrl'];

      if (returnUrl != null) {
        this.router.navigate([route], {
          relativeTo: this.route,
          queryParams: { returnUrl: returnUrl },
          queryParamsHandling: 'merge',
        });
      } else {
        this.router.navigate([route]);
      }
    });
  }

  async onSubmit(e: Event) {
    e.preventDefault();

    const saveObject = Object.assign({}, this.formData);
    saveObject.recaptchaToken = this.captchaToken;
    saveObject.active = true;
    
    this.loading = true;

    this.authService
    .createUser(saveObject)
    .pipe(
      take(1),
      finalize(() =>  {this.loading = false;  this.resetRecaptcha();}),
    )
    .subscribe(res => {
      this.accountCreated = true;
      this.createdUserId = res;
      this.toastNotificationManager.success("ToastNotifications.SendConfirmationEmailToYou");
    });
  }

  resetRecaptcha() {
    if ((window as any).grecaptcha) {
      // Reset the reCAPTCHA widget
      (window as any).grecaptcha.reset();
      this.captchaToken = null; // Clear the stored token
    }
  }

  confirmPassword = (e: ValidationCallbackData) => {
    return e.value === this.formData.password;
  }

  navigateTo(route: string){
    this.router.navigate([route]);
  }

  resendEmailConfirmation(){
    if(!this.accountCreated || this.createdUserId == null){
      return;
    }

    this.loading = true;

    this.authService
    .SendConfirmationEmail(this.createdUserId)
    .pipe(
      take(1),
      finalize(() => this.loading = false),
    )
    .subscribe(res => {
      this.toastNotificationManager.success("ToastNotifications.SendConfirmationEmailToYou");
    });
  }
}