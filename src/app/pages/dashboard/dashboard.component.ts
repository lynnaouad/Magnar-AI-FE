import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { DxDashboardControlModule } from 'devexpress-dashboard-angular';
import {
  DxButtonModule,
  DxFormModule,
  DxLoadIndicatorModule,
  DxPopupModule,
  DxSelectBoxModule,
  DxTextAreaModule,
} from 'devextreme-angular';
import { DxiItemModule } from 'devextreme-angular/ui/nested';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { TextEditorComponent } from '../../shared/components/text-editor/text-editor.component';
import { TypesService } from '../../shared/services/types.service';
import { DashboardService } from '../../shared/services/dashboard.service';
import { environment } from '../../../environments/environment';
import { take } from 'lodash';
import { finalize } from 'rxjs';
import { CommonModule } from '@angular/common';
import { ScreenService } from '../../shared/services';
import { WorkspaceIdObserver } from '../../app-store/Observables/WorkspaceIdObserver.service';
import { ProvidersService } from '../../shared/services/providers.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  imports: [
    DxDashboardControlModule,
    DxFormModule,
    DxiItemModule,
    TextEditorComponent,
    TranslateModule,
    DxButtonModule,
    DxTextAreaModule,
    DxLoadIndicatorModule,
    CommonModule,
    DxPopupModule,
    DxSelectBoxModule,
  ],
})
export class DashboardComponent implements OnInit {
  generateLoading: boolean = false;

  private dashboardControl: any;
  data: any = { selectedChartType: 1, prompt: '', providerId: 0 };

  chartTypes: any[] = [];

  backendUrl = environment.apiUrl + '/api/dashboard';
  workspaceId: number = 0;

  providers: any[] = [];

  @ViewChild('dashboard', { static: true }) dashboard!: ElementRef<any>;

  constructor(
    private typesService: TypesService,
    private dashboardService: DashboardService,
    public screen: ScreenService,
    public workspaceObserver: WorkspaceIdObserver,
    public translateService: TranslateService,
    public providerService: ProvidersService
  ) {}

  ngOnInit(): void {
    this.workspaceObserver.workspaceId$.subscribe((id) => {
      this.workspaceId = id ?? 0;

      this.getProviders(this.workspaceId);
    });

    this.getDahsboardTypes();
  }

  getProviders(workspaceId: number) {
    this.providerService.getAll(workspaceId, 1).subscribe((res) => {
      if (res) {
        this.providers = res;

        let defaultProvider = this.providers.filter(
          (x) => x.isDefault == 1
        )?.[0];

        this.data.providerId = defaultProvider.id;
      }
    });
  }

  onBeforeRender(e: any) {
    this.dashboardControl = e.component;

    // attach auth header for every dashboard request
    this.dashboardControl.remoteService.headers = {
      Authorization: `Bearer ${sessionStorage.getItem('access_token')}`,
      'X-Workspace-Id': this.workspaceId,
    };
  }

  getDahsboardTypes() {
    this.typesService.get('DashboardTypes').subscribe((res) => {
      this.chartTypes = res.map((x: any) => {
        x.nameTranslated = this.translateService.instant(x.name);
        return x;
      });
    });
  }

  async onPromptSubmit(e: Event) {
    e.preventDefault();
    this.dashboardControl.unloadDashboard();

    if (!this.data.prompt || this.data.prompt.trim() === '') {
      return;
    }

    this.generateLoading = true;

    let data = {
      Prompt: this.data.prompt,
      ChartType: this.data.selectedChartType,
      WorkspaceId: this.workspaceId,
      ProviderId: this.data.providerId
    };

    this.dashboardService
      .generateDashboard(data)
      .pipe(finalize(() => (this.generateLoading = false)))
      .subscribe((res: any) => {
        if (this.dashboardControl) {
          this.dashboardControl.loadDashboard(res.dashboardId);
        }
      });
  }

  onChangeDashboardType() {
    if (this.data.selectedChartType == null) {
      return;
    }

    let data = {
      ChartType: this.data.selectedChartType,
      WorkspaceId: this.workspaceId,
    };

    this.dashboardService
      .changeDashboardType(data)
      .pipe(finalize(() => {}))
      .subscribe((res: any) => {
        if (this.dashboardControl && res.dashboardId) {
          this.dashboardControl.loadDashboard(res.dashboardId);
        }
      });
  }
}
