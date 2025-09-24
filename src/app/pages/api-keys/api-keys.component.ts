import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import {
  DxButtonModule,
  DxDataGridModule,
  DxFormComponent,
  DxFormModule,
  DxLoadIndicatorModule,
  DxPopupModule,
  DxTextBoxModule,
  DxTooltipModule,
} from 'devextreme-angular';
import CustomStore from 'devextreme/data/custom_store';
import { OdataUtilityService } from '../../shared/services/odata-utility.service';
import { ApiKeysService } from '../../shared/services/api-keys.service';
import { ScreenService } from '../../shared/services';
import { Utilities } from '../../shared/utils/utilities.service';
import { WorkspaceService } from '../../shared/services/workspace.service';
import { finalize, take } from 'rxjs';
import { cloneDeep } from 'lodash';
import { ToastNotificationManager } from '../../shared/utils/toast-notification.service';
import { VerificationPopupFormComponent } from '../../shared/components/verification-popup-form/verification-popup-form.component';
import { Location } from '@angular/common';

@Component({
  selector: 'app-api-keys',
  standalone: true,
  templateUrl: './api-keys.component.html',
  styleUrl: './api-keys.component.scss',
  imports: [
    CommonModule,
    TranslateModule,
    DxButtonModule,
    DxDataGridModule,
    DxTooltipModule,
    DxPopupModule,
    DxFormModule,
    DxLoadIndicatorModule,
    DxTextBoxModule,
    VerificationPopupFormComponent,
  ],
})
export class ApiKeysComponent implements OnInit {
  dataSource: any;
  showPopup: boolean = false;
  newKey: any = {};
  submitLoading: boolean = false;
  isCreatePopup: boolean = true;
  workspaces: any[] = [];
  showSecretKeyPopup: boolean = false;
  isDeletePopupOpened: boolean = false;
  deleteLoading: boolean = false;
  tempIdToDelete: any = 0;

  secretKey: string = '';

  @ViewChild('createApiKeyForm', { static: false })
  apiKeyForm!: DxFormComponent;

  constructor(
    private odataUtilityService: OdataUtilityService,
    private apiKeysService: ApiKeysService,
    private utilities: Utilities,
    protected screen: ScreenService,
    protected workspacesService: WorkspaceService,
    protected toastNotificationManager: ToastNotificationManager,
    protected location: Location
  ) {}

  ngOnInit() {
    this.loadData();
    this.getWorkspaces();
  }

  getWorkspaces() {
    this.workspacesService.getAll().subscribe((res) => {
      if (res) {
        this.workspaces = res.map((x: any) => {
          x.id = x.id.toString();
          return x;
        });
      }
    });
  }

  loadData() {
    this.dataSource = new CustomStore({
      key: 'id',
      load: (loadOptions) =>
        new Promise((resolve, reject) => {
          let queryString = this.odataUtilityService.constructQueryString(
            loadOptions,
            []
          );

          this.apiKeysService.getOdata(queryString).subscribe(
            (res: any) => {
              resolve({
                data:
                  res?.value?.map((x: any) => {
                    x.workspaceName =
                      this.workspaces.find(
                        (y) => y.id?.toString() === x.tenantId
                      )?.name ?? '';
                    return x;
                  }) ?? [],
                totalCount: res?.totalCount ?? 0,
              });
            },
            (error) => {
              resolve({
                data: [],
                totalCount: 0,
              });
              console.error('Error occured while fetching data...');
            }
          );
        }),
    });
  }

  async onCreateApiKey(e: Event) {
    e.preventDefault();

    if (!this.apiKeyForm?.instance?.validate().isValid) {
      return;
    }

    this.submitLoading = true;

    if (this.newKey.id) {
      this.apiKeysService
        .update(this.newKey)
        .pipe(finalize(() => (this.submitLoading = false)))
        .subscribe((res) => {
          this.toastNotificationManager.success(
            'ToastNotifications.RecordUpdatedSuccessfully'
          );
          this.showPopup = false;
          this.loadData();
        });
    } else {
      let data = {
        name: this.newKey.name,
        tenantId: this.newKey.tenantId?.toString(),
      };

      this.apiKeysService
        .create(data)
        .pipe(finalize(() => (this.submitLoading = false)))
        .subscribe((res) => {
          if (res) {
            this.secretKey = res;

            this.showPopup = false;

            this.toastNotificationManager.success(
              'ToastNotifications.RecordCreatedSuccessfully'
            );

            this.showSecretKeyPopup = true;

            this.loadData();
          }
        });
    }
  }

  copySecretKey = () => {
    if (this.secretKey) {
      this.utilities.copyToClipBoard(this.secretKey);
    }
  };

  createNewSecretKey() {
    this.isCreatePopup = true;
    this.newKey = {};
    this.showPopup = true;
  }

  onEditRecord(e: any) {
    this.isCreatePopup = false;
    this.newKey = cloneDeep(e);

    this.showPopup = true;
  }

  onDeleteRecord(item: any) {
    this.tempIdToDelete = item.id;
   
    this.isDeletePopupOpened = true;
  }

  deleteRecord() {
    this.isDeletePopupOpened = false;

    if (this.tempIdToDelete == null || this.tempIdToDelete === 0) {
      return;
    }

    this.apiKeysService
      .revoke(this.tempIdToDelete)
      .pipe(
        take(1),
        finalize(() => (this.deleteLoading = false))
      )
      .subscribe(() => {
        this.toastNotificationManager.success(
          'ToastNotifications.ApiKeyRevokedSuccessfully'
        );

        this.tempIdToDelete = null;

        this.loadData();
      });
  }

  Cancel(){
    this.location.back();
  }
}
