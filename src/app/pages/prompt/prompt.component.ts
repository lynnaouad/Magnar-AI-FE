import { CommonModule } from '@angular/common';
import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  AfterViewChecked,
} from '@angular/core';
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
import { finalize, Subscription } from 'rxjs';
import { WorkspaceIdObserver } from '../../app-store/Observables/WorkspaceIdObserver.service';
import { Utilities } from '../../shared/utils/utilities.service';

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
export class PromptComponent implements OnInit, AfterViewChecked {
  data: any = { prompt: '' };
  generateLoading = false;
  messages: { role: 'user' | 'assistant'; content: string }[] = [];
  workspaceId = 0;
  private currentRequestSub?: Subscription;

  @ViewChild('messagesWindow') private messagesWindow!: ElementRef;

  constructor(
    private promptService: PromptsService,
    private workspaceObserver: WorkspaceIdObserver,
    protected utilityService: Utilities
  ) {}

  ngOnInit(): void {
    this.workspaceObserver.workspaceId$.subscribe((id) => {
      this.workspaceId = id ?? 0;
      this.messages = [];
    });
  }

  private lastMessageCount = 0;

  ngAfterViewChecked(): void {
    if (this.messages.length !== this.lastMessageCount) {
      this.scrollToBottom();
      this.lastMessageCount = this.messages.length;
    }
  }

  onPromptSubmit(e: Event) {
    e.preventDefault();
    if (!this.data.prompt?.trim() || this.generateLoading) return;

    // 1. Optimistic UI: add user message immediately
    const userMsg: any = { role: 'user', content: this.data.prompt };
    this.messages.push(userMsg);

    const payload = {
      prompt: this.data.prompt,
      history: this.messages, // full chat so AI has context
    };

    this.data.prompt = '';
    this.generateLoading = true;

    this.currentRequestSub = this.promptService
      .executePrompt(payload, this.workspaceId)
      .pipe(finalize(() => (this.generateLoading = false)))
      .subscribe({
        next: (res) => {
          if (res && res.length > 0) {
            // 2. Get last assistant message only
            const lastAssistant = [...res]
              .reverse()
              .find((m) => m.role === 'assistant');

            if (lastAssistant) {
              // 3. Prevent duplicates (check last message in UI)
              const lastDisplayed = this.messages[this.messages.length - 1];
              if (
                !lastDisplayed ||
                lastDisplayed.content !== lastAssistant.content
              ) {
                this.messages.push(lastAssistant);
              }
            }
          }
        },
        error: () => {
          this.generateLoading = false;
        },
        complete: () => {
          this.currentRequestSub = undefined;
        },
      });
  }

  onStop() {
    if (this.currentRequestSub) {
      this.currentRequestSub.unsubscribe();
      this.currentRequestSub = undefined;
      this.generateLoading = false;
      this.messages.push({ role: 'assistant', content: '[Stopped by user]' });
    }
  }

  private scrollToBottom() {
    try {
      this.messagesWindow.nativeElement.scrollTop =
        this.messagesWindow.nativeElement.scrollHeight;
    } catch {}
  }
}
