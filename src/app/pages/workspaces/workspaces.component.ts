import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import {
  DxButtonModule,
  DxContextMenuModule,
  DxFormComponent,
  DxFormModule,
  DxLoadIndicatorModule,
  DxPopupModule,
} from 'devextreme-angular';
import { ScreenService } from '../../shared/services';
import { TextEditorComponent } from '../../shared/components/text-editor/text-editor.component';
import { WorkspaceService } from '../../shared/services/workspace.service';
import { finalize, take } from 'rxjs';
import { ToastNotificationManager } from '../../shared/utils/toast-notification.service';
import { Utilities } from '../../shared/utils/utilities.service';
import { cloneDeep } from 'lodash';
import { VerificationPopupFormComponent } from '../../shared/components/verification-popup-form/verification-popup-form.component';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { setWorkspace } from '../../app-store/actions/workspace.actions';
import { WorkspaceIdObserver } from '../../app-store/Observables/WorkspaceIdObserver.service';

@Component({
  selector: 'app-workspaces',
  standalone: true,
  templateUrl: './workspaces.component.html',
  styleUrl: './workspaces.component.scss',
  imports: [
    CommonModule,
    TranslateModule,
    DxButtonModule,
    DxContextMenuModule,
    DxPopupModule,
    DxFormModule,
    DxLoadIndicatorModule,
    TextEditorComponent,
    VerificationPopupFormComponent,
  ],
})
export class WorkspacesComponent implements OnInit {
  menuItems: any[] = [];
  showPopup: boolean = false;
  submitLoading: boolean = false;
  displayLoader: boolean = true;
  newWorkspace: any = {};
  isDeletePopupOpened: boolean = false;
  deleteLoading: boolean = false;
  workspaces: any[] = [];
  tempIdToDelete: any = 0;

  @ViewChild('createWorkspaceForm', { static: false })
  form!: DxFormComponent;
  constructor(
    protected translateService: TranslateService,
    private workspaceService: WorkspaceService,
    private toastNotificationManager: ToastNotificationManager,
    private utilities: Utilities,
    protected router: Router,
    protected screen: ScreenService,
     private workspaceIdObserver: WorkspaceIdObserver,
  ) {
    this.menuItems = [
      {
        text: this.translateService.instant('Edit'),
        action: 'edit',
        template: 'editTemplate',
      },
      {
        text: this.translateService.instant('Delete'),
        action: 'delete',
        template: 'deleteTemplate',
      },
    ];
  }

  ngOnInit(): void {
    this.getWorkspaces();
  }

  getWorkspaces() {
    this.workspaceService
      .getAll()
      .pipe(
        finalize(() => {
          this.displayLoader = false;
        })
      )
      .subscribe((res) => {
        if (res) {
          this.workspaces = res;
        }
      });
  }

  addNewWorkspace() {
    this.newWorkspace = {};
    this.showPopup = true;
  }

  onMenuClick(e: any, item: any) {
    const action = e.itemData.action;

    if (action === 'edit') {
      this.editWorkspace(item);
    } else if (action === 'delete') {
      this.deleteWorkspace(item);
    }
  }

  closePopup() {
    this.utilities.resetFormData(this.form);
  }

  async onSubmit(e: Event) {
    e.preventDefault();

    if (!this.form?.instance?.validate().isValid) {
      return;
    }

    this.submitLoading = true;

    let id = this.newWorkspace?.id;

    if (id) {
      this.workspaceService
        .update(this.newWorkspace)
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

          this.getWorkspaces();
        });
    } else {
      this.workspaceService
        .create(this.newWorkspace)
        .pipe(
          take(1),
          finalize(() => (this.submitLoading = false))
        )
        .subscribe((res) => {
          this.toastNotificationManager.success(
            'ToastNotifications.RecordCreatedSuccessfully'
          );

          this.handleSubmitEvent();

          this.getWorkspaces();
        });
    }
  }

  handleSubmitEvent() {
    this.showPopup = false;
    this.utilities.resetFormData(this.form);
  }

  editWorkspace(item: any) {
    this.newWorkspace = cloneDeep(item);
    this.showPopup = true;
  }

  deleteWorkspace(item: any) {
    this.tempIdToDelete = item.id;
    this.isDeletePopupOpened = true;
  }

  deleteRecord() {
    this.isDeletePopupOpened = false;

    if (this.tempIdToDelete == null || this.tempIdToDelete === 0) {
      return;
    }

    this.workspaceService
      .delete(this.tempIdToDelete)
      .pipe(
        take(1),
        finalize(() => (this.deleteLoading = false))
      )
      .subscribe((res: any) => {
        this.toastNotificationManager.success(
          'ToastNotifications.RecordDeletedSuccessfully'
        );

        this.tempIdToDelete = 0;

        this.getWorkspaces();
      });
  }

  openWorkspace(item: any) {
    this.workspaceIdObserver.setWorkspaceId(0);

    this.router.navigate(['/workspaces', item.id]);
  }
}
