import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import {
  DxButtonModule,
  DxFileUploaderComponent,
  DxFileUploaderModule,
  DxFormComponent,
  DxFormModule,
  DxLoadIndicatorModule,
  DxPopupModule,
  DxSelectBoxModule,
  DxSwitchModule,
  DxTextAreaModule,
  DxValidationGroupModule,
} from 'devextreme-angular';
import { CommonModule } from '@angular/common';
import { finalize, take } from 'rxjs';
import { DxiButtonModule } from 'devextreme-angular/ui/nested';
import { ActivatedRoute, Router } from '@angular/router';
import { TextEditorComponent } from '../../../shared/components/text-editor/text-editor.component';
import { ScreenService, AuthService } from '../../../shared/services';
import { LanguageService } from '../../../shared/services/language.service';
import { ToastNotificationManager } from '../../../shared/utils/toast-notification.service';
import { Utilities } from '../../../shared/utils/utilities.service';
import { ProvidersService } from '../../../shared/services/providers.service';
import { TypesService } from '../../../shared/services/types.service';
import { ProviderDto as ProviderDto } from '../../../Dtos/ProviderDto';
import { tap } from 'lodash';
import { PasswordTextBoxComponent } from '../../../shared/components/password-text-box/password-text-box.component';

@Component({
  selector: 'create-provider',
  templateUrl: './create-provider.component.html',
  styleUrl: './create-provider.component.scss',
  standalone: true,
  imports: [
    TranslateModule,
    DxPopupModule,
    CommonModule,
    DxFormModule,
    DxTextAreaModule,
    DxButtonModule,
    DxValidationGroupModule,
    DxFileUploaderModule,
    DxiButtonModule,
    TextEditorComponent,
    DxSelectBoxModule,
    DxLoadIndicatorModule,
    DxSwitchModule,
    PasswordTextBoxComponent,
  ],
})
export class CreateProviderComponent implements OnInit, OnChanges {
  submitLoading = false;
  testConnLoading = false;
  providerTypes: any[] = [];

  @Input() showPopup: boolean = false;
  @Input() data!: ProviderDto;

  @Output() showPopupChange = new EventEmitter<boolean>();
  @Output() OnClose = new EventEmitter<boolean>();
  @Output() OnSubmit = new EventEmitter<boolean>();

  @ViewChild('createProviderForm', { static: false })
  form!: DxFormComponent;

  @ViewChild('popupRef') popupRef: any;
  constructor(
    protected screen: ScreenService,
    private toastNotificationManager: ToastNotificationManager,
    private authService: AuthService,
    private utilities: Utilities,
    private typesService: TypesService,
    private router: Router,
    private languageService: LanguageService,
    private route: ActivatedRoute,
    private providerService: ProvidersService
  ) {}

  ngOnInit(): void {
    this.getProviderTypes();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['showPopup'] && this.showPopup) {
      if (this.data && this.data.type) {
        this.data.type = this.providerTypes.find(
          (pt) => pt.name === this.data.type
        )?.id;
      }
    }
  }

  getProviderTypes() {
    this.typesService
      .get('ProviderTypes')
      .pipe(take(1))
      .subscribe((res: any) => {
        this.providerTypes = res.map((item: any) => {
          item.nameTranslated = this.languageService.translateInstant(
            item.name
          );
          return item;
        });
      });
  }

  closePopup() {
    this.showPopup = false;
    this.utilities.resetFormData(this.form);
    this.showPopupChange.emit(false);
    this.removeIdFromRouteParam();
  }

  async onSubmit(e: Event) {
    e.preventDefault();

    if (!this.form?.instance?.validate().isValid) {
      return;
    }

    this.submitLoading = true;

    let id = this.data?.id;

    if (
      this.data.type !== 1 &&
      this.data?.details?.sqlServerConfiguration
    ) {
      this.data.details.sqlServerConfiguration = null;
    }

    if (id) {
      // Update

      this.providerService
        .update(this.data)
        .pipe(
          take(1),
          finalize(() => {
            this.submitLoading = false;
          })
        )
        .subscribe((res) => {
          this.toastNotificationManager.success(
            'ToastNotifications.RecordUpdatedSuccessfully'
          );

          this.handleSubmitEvent();
        });
    } else {
      // Insert

      this.providerService
        .create(this.data)
        .pipe(
          take(1),
          finalize(() => (this.submitLoading = false))
        )
        .subscribe((res) => {
          this.toastNotificationManager.success(
            'ToastNotifications.RecordCreatedSuccessfully'
          );

          this.handleSubmitEvent();
        });
    }
  }

  TestConnection() {
    if (!this.form?.instance?.validate().isValid) {
      return;
    }

    this.testConnLoading = true;
    this.providerService
      .TestConnection(this.data)
      .pipe(
        take(1),
        finalize(() => (this.testConnLoading = false))
      )
      .subscribe((res) => {
        if (res === true) {
          this.toastNotificationManager.success('Errors.ConnectionSuccessful');
        } else {
          this.toastNotificationManager.error('Errors.ConnectionFailed');
        }
      });
  }

  removeIdFromRouteParam() {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { id: null },
      queryParamsHandling: 'merge',
    });
  }

  handleSubmitEvent() {
    this.showPopup = false;
    this.utilities.resetFormData(this.form);
    this.OnSubmit.emit(true);
    this.removeIdFromRouteParam();
  }
}
