import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import {
  DxPopupModule,
  DxFormModule,
  DxTextAreaModule,
  DxButtonModule,
  DxValidationGroupModule,
  DxFileUploaderModule,
  DxSelectBoxModule,
  DxLoadIndicatorModule,
  DxSwitchModule,
  DxFormComponent,
  DxToolbarModule,
  DxLoadPanelModule,
  DxTooltipModule,
  DxTextBoxModule,
  DxCheckBoxModule,
  DxValidatorModule,
} from 'devextreme-angular';
import {
  DxiButtonModule,
  DxoToolbarModule,
} from 'devextreme-angular/ui/nested';
import { finalize, Observable, of, switchMap, take, tap } from 'rxjs';
import { ScreenService } from '../../../../shared/services';
import { LanguageService } from '../../../../shared/services/language.service';
import { ProvidersService } from '../../../../shared/services/providers.service';
import { TypesService } from '../../../../shared/services/types.service';
import { ToastNotificationManager } from '../../../../shared/utils/toast-notification.service';
import {
  ApiParameterDto,
  ApiProviderDetailsDto,
  ProviderDetailsDto,
  ProviderDto,
} from '../../../../Dtos/ProviderDto';
import { ActivatedRoute, Params, Route, Router } from '@angular/router';
import { DxDataGridModule } from 'devextreme-angular/ui/data-grid';
import { TextEditorComponent } from '../../../../shared/components/text-editor/text-editor.component';
import { Utilities } from '../../../../shared/utils/utilities.service';

@Component({
  selector: 'app-provider-configuration',
  standalone: true,
  templateUrl: './provider-configuration.component.html',
  styleUrl: './provider-configuration.component.scss',
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
    DxSelectBoxModule,
    DxLoadIndicatorModule,
    DxSwitchModule,
    DxoToolbarModule,
    DxDataGridModule,
    DxTooltipModule,
    TextEditorComponent,
    DxTextBoxModule,
    DxCheckBoxModule,
    DxValidatorModule,
  ],
})
export class ProviderConfigurationComponent implements OnInit {
  nextLoading: boolean = false;
  providerTypes: any[] = [];
  data: ProviderDto = new ProviderDto();
  isCreateForm: boolean = true;
  displayLoader: boolean = false;

  showApiPopup: boolean = false;
  submitApiLoading: boolean = false;
  newApiRecord: ApiProviderDetailsDto = new ApiProviderDetailsDto();

  apiParameterLocation: any[] = [];
  httpMethods: any[] = [];
  apiParameterTypes: any[] = [];
  authTypes: any[] = [];

  parameters: ApiParameterDto[] = [];

  isEditingApi: boolean = false;
  editIndex: number = -1;

  @ViewChild('createProviderForm', { static: false })
  form!: DxFormComponent;

  @ViewChild('createApiForm', { static: false })
  apiForm!: DxFormComponent;

  constructor(
    protected screen: ScreenService,
    private typesService: TypesService,
    private languageService: LanguageService,
    private providerService: ProvidersService,
    private toastNoatification: ToastNotificationManager,
    private router: Router,
    private route: ActivatedRoute,
    private utilities: Utilities
  ) {}

  ngOnInit(): void {
    this.getApiParameterLocation().subscribe();
    this.getHttpMethods().subscribe();
    this.getApiParameterTypes().subscribe();
    this.getAuthTypes().subscribe();

    this.displayLoader = true;

    this.getProviderTypes()
      .pipe(
        switchMap(() => this.getAuthTypes()),
        switchMap(() => this.route.paramMap),
        switchMap((pm) => {
          const id = +(pm.get('id') ?? 0);

          if (id > 0) {
            this.isCreateForm = false;
            return this.getProvider(id);
          } else {
            this.isCreateForm = true;
            this.data = new ProviderDto();
            this.displayLoader = false;
            return of(null);
          }
        })
      )
      .subscribe();
  }

  getProvider(id: number): Observable<ProviderDto> {
    return this.providerService.get(id).pipe(
      finalize(() => (this.displayLoader = false)),
      tap((p) => {
        this.data = p;
        this.data.type = this.providerTypes.find(
          (x) => x.name === this.data.type
        ).id;

        if (this.data?.details?.apiProviderAuthDetails != null) {
          this.data.details.apiProviderAuthDetails.authType =
            this.authTypes.find(
              (x) =>
                x.name === this.data.details?.apiProviderAuthDetails?.authType
            ).id;
        }
      })
    );
  }

  getApiParameterLocation(): Observable<any[]> {
    return this.typesService
      .get('ApiParameterLocation')
      .pipe(tap((res) => (this.apiParameterLocation = res)));
  }

  getHttpMethods(): Observable<any[]> {
    return this.typesService
      .get('HttpMethods')
      .pipe(tap((res) => (this.httpMethods = res)));
  }

  getApiParameterTypes(): Observable<any[]> {
    return this.typesService
      .get('ApiParameterDataType')
      .pipe(tap((res) => (this.apiParameterTypes = res)));
  }

  getAuthTypes(): Observable<any[]> {
    return this.typesService.get('AuthType').pipe(
      tap(
        (res) =>
          (this.authTypes = res.map((item: any) => {
            item.nameTranslated = this.languageService.translateInstant(
              item.name
            );
            return item;
          }))
      )
    );
  }

  getProviderTypes(): Observable<any[]> {
    return this.typesService.get('ProviderTypes').pipe(
      tap(
        (types) =>
          (this.providerTypes = types.map((item: any) => {
            item.nameTranslated = this.languageService.translateInstant(
              item.name
            );
            return item;
          }))
      )
    );
  }

  next() {
    this.nextLoading = true;
    if (!this.form?.instance?.validate().isValid) {
      this.nextLoading = false;
      return;
    }
    // SQL Provider
    if (this.data.type === 1) {
      this.testConnection();
      return;
    }
  }

  testConnection() {
    this.providerService
      .TestConnection(this.data)
      .pipe(
        tap(
          (res) => {
            if (res) {
              this.createProvider();
            } else {
              this.nextLoading = false;
              this.toastNoatification.warning('Errors.ConnectionFailed');
            }
          },
          () => {
            this.nextLoading = false;
          }
        )
      )
      .subscribe();
  }

  cancel() {
    this.router.navigate(['..'], { relativeTo: this.route });
  }

  createProvider() {
    this.providerService
      .create(this.data)
      .pipe(finalize(() => (this.nextLoading = false)))
      .subscribe((res: number) => {
        if (res) {
          this.data.id = res;

          if (this.data.type == 1) {
            this.goToDatabaseSchema();
          } else {
            this.toastNoatification.success(
              'ToastNotifications.RecordCreatedSuccessfully'
            );
            this.router.navigate(['.'], { relativeTo: this.route.parent });
          }
        }
      });
  }

  defaultCreateProvider() {
    this.nextLoading = true;
    if (!this.form?.instance?.validate().isValid) {
      this.nextLoading = false;
      return;
    }

    this.createProvider();
  }

  updateProvider() {
    this.nextLoading = true;

    this.providerService
      .update(this.data)
      .pipe(finalize(() => (this.nextLoading = false)))
      .subscribe((res: number) => {
        this.toastNoatification.success(
          'ToastNotifications.RecordUpdatedSuccessfully'
        );
        this.router.navigate(['.'], { relativeTo: this.route.parent });
      });
  }

  goToDatabaseSchema() {
    console.log(this.data);

    this.router.navigate([`providers/${this.data.id}/database-schema`], {
      relativeTo: this.route.parent,
    });
  }

  onAddingNewApiRecord() {
    this.showApiPopup = true;
    this.newApiRecord = new ApiProviderDetailsDto();
  }

  onEditApiRecord(apiRecord: ApiProviderDetailsDto) {
    this.isEditingApi = true;
    this.showApiPopup = true;
    this.editIndex = this.data.apiProviderDetails.indexOf(apiRecord);

    // Clone record so you don’t bind directly to the grid’s object
    this.newApiRecord = { ...apiRecord };

    // Parse parameters back from JSON into array
    this.parameters = apiRecord.parameters ?? [];
  }

  onDeleteApiRecord(cellInfo: any) {
    const index = cellInfo.rowIndex;

    if (index >= 0) {
      this.data.apiProviderDetails.splice(index, 1);
      this.toastNoatification.success('API record removed');
    }
  }

  closeApiPopup() {
    this.isEditingApi = false;
    this.editIndex = -1;
    this.newApiRecord = new ApiProviderDetailsDto();
    this.parameters = [];
    this.showApiPopup = false;
    this.utilities.resetFormData(this.apiForm);
  }

  async onApiSubmit(event: Event) {
    event.preventDefault();

    if (!this.apiForm?.instance?.validate().isValid) {
      return;
    }

    const dto = {
      ...this.newApiRecord,
      parameters: this.parameters,
    };

    if (this.isEditingApi && this.editIndex >= 0) {
      // Replace existing record
      this.data.apiProviderDetails[this.editIndex] = dto;
      this.toastNoatification.success(
        'ToastNotifications.RecordUpdatedSuccessfully'
      );
    } else {
      // Add new record
      this.data.apiProviderDetails.push(dto);
      this.toastNoatification.success(
        'ToastNotifications.RecordAddedSuccessfully'
      );
    }

    this.closeApiPopup();
  }

  addParam() {
    var param = new ApiParameterDto();
    param.name = '';
    param.description = '';

    this.parameters.push(param);
  }

  removeParam(index: number) {
    this.parameters.splice(index, 1);
  }
}
