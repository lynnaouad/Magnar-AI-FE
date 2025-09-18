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
import { TranslateModule } from '@ngx-translate/core';
import { TextEditorComponent } from '../../shared/components/text-editor/text-editor.component';
import { TypesService } from '../../shared/services/types.service';
import { DashboardService } from '../../shared/services/dashboard.service';
import { environment } from '../../../environments/environment';
import { take } from 'lodash';
import { finalize } from 'rxjs';
import { CommonModule } from '@angular/common';
import { ScreenService } from '../../shared/services';

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
  data: any = { selectedChartType: 1, prompt: '' };

  chartTypes: any[] = [];

  backendUrl = environment.apiUrl + '/api/dashboard';

  @ViewChild('dashboard', { static: true }) dashboard!: ElementRef<any>;

  constructor(
    private typesService: TypesService,
    private dashboardService: DashboardService,
    public screen: ScreenService
  ) {}

  ngOnInit(): void {
    this.getDahsboardTypes();
  }

  onBeforeRender(e: any) {
    this.dashboardControl = e.component;

    // attach auth header for every dashboard request
    this.dashboardControl.remoteService.headers = {
      Authorization: `Bearer ${sessionStorage.getItem('access_token')}`,
    };
  }

  getDahsboardTypes() {
    this.typesService.get('DashboardTypes').subscribe((res) => {
      this.chartTypes = res;
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
    };

    this.dashboardService
      .get(data)
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
    };

    this.dashboardService
      .changeType(data)
      .pipe(finalize(() => {}))
      .subscribe((res: any) => {
        if (this.dashboardControl && res.dashboardId) {
          this.dashboardControl.loadDashboard(res.dashboardId);
        }
      });
  }
}
