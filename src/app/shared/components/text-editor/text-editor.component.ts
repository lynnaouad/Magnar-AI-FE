import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  input,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { DxHtmlEditorModule, DxButtonModule } from 'devextreme-angular';

@Component({
  selector: 'text-editor',
  templateUrl: './text-editor.component.html',
  styleUrl: './text-editor.component.scss',
  standalone: true,
  imports: [DxHtmlEditorModule, CommonModule, DxButtonModule, TranslateModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TextEditorComponent implements OnChanges, OnInit {
  @Input() value: string | null | undefined = null;
  @Input() readonly: boolean = false;
  @Input() height: string = '300px';
  @Input() disableOptions: boolean = false;
  @Input() placeholder: string = '';
  @Input() canGenerateWithAI: boolean = false;

  @Output() valueChange = new EventEmitter<string | null>();
  @Output() onGenerateWithAI = new EventEmitter<boolean>();

  toolbarItems: any[] = [];

  constructor(
    private cdr: ChangeDetectorRef,
    private translateService: TranslateService
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    this.toolbarItems = [
      {
        widget: 'dxButton',
        location: 'before',
        visible: this.canGenerateWithAI,
        options: {
          icon: 'fa-solid fa-wand-magic-sparkles',
          text: this.translateService.instant('Generate'),
          type: 'default',
          useSubmitBehavior: false,
          onClick: () => this.generateWithAI(),
        },
      },
      'undo',
      'redo',
      'separator',
      {
        name: 'size',
        acceptedValues: ['8pt', '10pt', '12pt', '14pt', '18pt', '24pt', '36pt'],
        options: {
          inputAttr: { 'aria-label': 'Font size' },
        },
      },
      {
        name: 'font',
        acceptedValues: [
          'Arial',
          'Courier New',
          'Georgia',
          'Impact',
          'Lucida Console',
          'Tahoma',
          'Times New Roman',
          'Verdana',
        ],
        options: {
          inputAttr: { 'aria-label': 'Font family' },
        },
      },
      'separator',
      'bold',
      'italic',
      'strike',
      'underline',
      'separator',
      'alignLeft',
      'alignCenter',
      'alignRight',
      'alignJustify',
      'separator',
      'orderedList',
      'bulletList',
      'separator',
      {
        name: 'header',
        acceptedValues: [false, 1, 2, 3, 4, 5],
        options: {
          inputAttr: { 'aria-label': 'Header' },
        },
      },
      'separator',
      'color',
      'background',
      'separator',
      'link',
      'separator',
      'clear',
      'codeBlock',
      'blockquote',
    ];
  }

  ngOnInit(): void {}

  generateWithAI() {
    this.onGenerateWithAI.emit(this.canGenerateWithAI);
  }

  getJsonOnly(html: string | null | undefined): string {
    if (!html) return '';

    // Convert HTML → text (preserves JSON characters)
    const div = document.createElement('div');
    div.innerHTML = html;

    const text = div.textContent || div.innerText || '';

    // Trim extra spaces/newlines outside JSON
    return text.trim();
  }
}
