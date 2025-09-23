import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { DxDashboardControlModule } from 'devexpress-dashboard-angular';
import {
  DxFormModule,
  DxButtonModule,
  DxTextAreaModule,
  DxLoadIndicatorModule,
  DxPopupModule,
  DxSelectBoxModule,
} from 'devextreme-angular';
import { DxiItemModule } from 'devextreme-angular/ui/nested';
import { TextEditorComponent } from '../../shared/components/text-editor/text-editor.component';
import { PromptsService } from '../../shared/services/prompts.service';
import { finalize } from 'rxjs';
import { WorkspaceIdObserver } from '../../app-store/Observables/WorkspaceIdObserver.service';

@Component({
  selector: 'app-prompt',
  standalone: true,
  templateUrl: './prompt.component.html',
  styleUrl: './prompt.component.scss',
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
export class PromptComponent implements OnInit {
  data: any = {};
  generateLoading: boolean = false;
  result: any;
  messages: any;
  latest: any;
  workspaceId: number = 0;

  constructor(
    private promptService: PromptsService,
    private workspaceObserver: WorkspaceIdObserver
  ) {}

  ngOnInit(): void {
    this.workspaceObserver.workspaceId$.subscribe((id) => {
      this.workspaceId = id ?? 0;
    });
  }

  onPromptSubmit(e: Event) {
    e.preventDefault();

    this.generateLoading = true;

    this.promptService
      .executePrompt(this.data, this.workspaceId)
      .pipe(finalize(() => (this.generateLoading = false)))
      .subscribe((res) => {
        this.messages = res.messages; // whole history
        this.latest = res.latestResult; // most recent
      });
  }
}
