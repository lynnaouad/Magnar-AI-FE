import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { DxDashboardControlModule } from 'devexpress-dashboard-angular';
import { DxButtonModule, DxFormModule } from 'devextreme-angular';
import { DxiItemModule } from 'devextreme-angular/ui/nested';
import { TextEditorComponent } from '../../shared/components/text-editor/text-editor.component';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss'],
  standalone: true,
  imports: [
    DxDashboardControlModule,
    DxFormModule,
    DxiItemModule,
    TranslateModule,
    DxButtonModule,
  ],
})
export class AdminDashboardComponent {
 
}
