import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { DxButtonModule } from 'devextreme-angular/ui/button';
import { DxDataGridModule } from 'devextreme-angular/ui/data-grid';
import { DxFormModule } from 'devextreme-angular/ui/form';
import { DxLoadIndicatorModule } from 'devextreme-angular/ui/load-indicator';
import { DxLoadPanelModule } from 'devextreme-angular/ui/load-panel';
import { DxPopupModule } from 'devextreme-angular/ui/popup';
import { DxScrollViewModule } from 'devextreme-angular/ui/scroll-view';
import { DxToolbarModule } from 'devextreme-angular/ui/toolbar';
import { DxTooltipModule } from 'devextreme-angular/ui/tooltip';
import { CreateConnectionComponent } from './create-connection/create-connection.component';
import { cloneDeep } from 'lodash';
import { finalize, take } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { VerificationPopupFormComponent } from '../../shared/components/verification-popup-form/verification-popup-form.component';
import { ScreenService } from '../../shared/services';
import { ToastNotificationManager } from '../../shared/utils/toast-notification.service';
import { ConnectionsService } from '../../shared/services/connections.service';
import CustomStore from 'devextreme/data/custom_store';
import { OdataUtilityService } from '../../shared/services/odata-utility.service';
import { ConnectionDto } from '../../Dtos/ConnectionDto';
import { LanguageService } from '../../shared/services/language.service';

@Component({
  selector: 'app-connections-list',
  templateUrl: './connections-list.component.html',
  styleUrl: './connections-list.component.scss',
  standalone: true,
  imports: [
    DxButtonModule,
    DxDataGridModule,
    DxToolbarModule,
    DxLoadPanelModule,
    CommonModule,
    DxScrollViewModule,
    DxTooltipModule,
    DxFormModule,
    DxLoadIndicatorModule,
    DxPopupModule,
    TranslateModule,
    CreateConnectionComponent,
    VerificationPopupFormComponent,
  ],
})
export class ConnectionsListComponent implements OnInit {
  isLoading = false;
  deleteLoading = false;
  isPopupOpened = false;
  dataSource: any;

  newConnection: ConnectionDto = new ConnectionDto();
  totalCount = 0;

  tempIdToDelete = '';
  isDeletePopupOpened = false;

  constructor(
    protected screen: ScreenService,
    private connectionsService: ConnectionsService,
    private toastNotificationManager: ToastNotificationManager,
    private router: Router,
    private route: ActivatedRoute,
    private odataUtilityService: OdataUtilityService,
    private languageService: LanguageService
  ) {}

  ngOnInit() {
    this.loadData();
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

          this.connectionsService.getOdata(queryString).subscribe(
            (res: any) => {
              resolve({
                data: res?.value ?? [],
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

  isDefaultText = (rowData: any) => {
    return rowData.isDefault
      ? this.languageService.translateInstant('Yes')
      : this.languageService.translateInstant('No');
  };

  translateProvider = (rowData: any) => {
    return this.languageService.translateInstant(rowData.provider);
  };

  onAddingNewRecord() {
    this.reset();
    this.newConnection = new ConnectionDto();
    this.isPopupOpened = true;
  }

  onEditRecord(record: any) {
    this.newConnection = cloneDeep(record);
    this.isPopupOpened = true;

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { id: record.id },
      queryParamsHandling: 'merge',
    });
  }

  onDeleteRecord(record: any) {
    this.tempIdToDelete = record.row.data.id;
    this.isDeletePopupOpened = true;
  }

  deleteRecord() {
    this.isDeletePopupOpened = false;

    if (this.tempIdToDelete == null || this.tempIdToDelete == '') {
      return;
    }

    this.connectionsService
      .delete(this.tempIdToDelete)
      .pipe(
        take(1),
        finalize(() => (this.deleteLoading = false))
      )
      .subscribe((res: any) => {
        this.toastNotificationManager.success(
          'ToastNotifications.RecordDeletesSuccessfully'
        );

        this.tempIdToDelete = '';

        this.loadData();
      });
  }

  onSubmitPopup() {
    this.reset();
    this.loadData();
  }

  reset() {
    this.newConnection = new ConnectionDto();
  }
}
