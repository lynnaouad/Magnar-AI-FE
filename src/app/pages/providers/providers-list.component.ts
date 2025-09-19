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
import { cloneDeep } from 'lodash';
import { finalize, take } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { VerificationPopupFormComponent } from '../../shared/components/verification-popup-form/verification-popup-form.component';
import { ScreenService } from '../../shared/services';
import { ToastNotificationManager } from '../../shared/utils/toast-notification.service';
import { ProvidersService } from '../../shared/services/providers.service';
import CustomStore from 'devextreme/data/custom_store';
import { OdataUtilityService } from '../../shared/services/odata-utility.service';
import { LanguageService } from '../../shared/services/language.service';

@Component({
  selector: 'app-providers-list',
  templateUrl: './providers-list.component.html',
  styleUrl: './providers-list.component.scss',
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
    VerificationPopupFormComponent,
  ],
})
export class ProvidersListComponent implements OnInit {
  isLoading = false;
  deleteLoading = false;
  dataSource: any;

  totalCount = 0;

  tempIdToDelete = '';
  isDeletePopupOpened = false;

  constructor(
    protected screen: ScreenService,
    private providersService: ProvidersService,
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

          this.providersService.getOdata(queryString).subscribe(
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

  translateProvider = (rowData: any) => {
    return this.languageService.translateInstant(rowData.type);
  };

  onAddingNewRecord() {
    this.router.navigate(['./create'], { relativeTo: this.route})
  }

  onEditRecord(record: any) {
     this.router.navigate([`./${record.id}`], { relativeTo: this.route})

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

    this.providersService
      .delete(this.tempIdToDelete)
      .pipe(
        take(1),
        finalize(() => (this.deleteLoading = false))
      )
      .subscribe((res: any) => {
        this.toastNotificationManager.success(
          'ToastNotifications.RecordDeletedSuccessfully'
        );

        this.tempIdToDelete = '';

        this.loadData();
      });
  }
}
