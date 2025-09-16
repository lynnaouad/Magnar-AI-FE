import { Component, inject, OnInit, signal } from '@angular/core';
import { SchemaService } from '../../shared/services/schema.service';
import {
  SelectedTableBlock,
  TableAnnotationRequest,
  TableInfoDto,
} from '../../Dtos/TableInfoDto';
import {
  DxButtonModule,
  DxDataGridModule,
  DxListModule,
  DxLoadIndicatorModule,
  DxPopupModule,
  DxTextAreaModule,
  DxTextBoxModule,
  DxToolbarModule,
} from 'devextreme-angular';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { TranslateModule } from '@ngx-translate/core';
import { ScreenService } from '../../shared/services';
import { DxiToolbarItemModule } from 'devextreme-angular/ui/nested';
import CustomStore from 'devextreme/data/custom_store';
import { OdataUtilityService } from '../../shared/services/odata-utility.service';
import { LanguageService } from '../../shared/services/language.service';
import { forkJoin } from 'rxjs';
import { ToastNotificationManager } from '../../shared/utils/toast-notification.service';

@Component({
  selector: 'app-database-schema',
  templateUrl: './database-schema.component.html',
  styleUrls: ['./database-schema.component.scss'],
  imports: [
    DxTextBoxModule,
    DxPopupModule,
    DxListModule,
    DxDataGridModule,
    DxTextAreaModule,
    DxButtonModule,
    CommonModule,
    TranslateModule,
    DxToolbarModule,
    DxiToolbarItemModule,
    DxLoadIndicatorModule,
  ],
})
export class DatabaseSchemaComponent implements OnInit {
  constructor(
    private schemaService: SchemaService,
    private sanitizer: DomSanitizer,
    private toastNotificationManager: ToastNotificationManager,
    private languageService: LanguageService,
    public screen: ScreenService
  ) {}

  selectedAvailableKeys: string[] = [];

  addTableLoading: boolean = false;

  availableTables = signal<string[]>([]);
  selectedBlocks = signal<SelectedTableBlock[]>([]);

  // popup state
  isPopupVisible = signal(false);
  currentTableInfo = signal<TableInfoDto | null>(null);
  tableDescription = signal('');
  columnComments = signal<Record<string, string | null>>({});

  ngOnInit() {
    this.refresh();
  }

  refresh() {
    forkJoin({
      allTables: this.schemaService.getTables(),
      selected: this.schemaService.readSelected(),
    }).subscribe(({ allTables, selected }) => {
      const selectedBlocks = Array.isArray(selected)
        ? (selected as SelectedTableBlock[])
        : [];
      this.selectedBlocks.set(selectedBlocks);

      const selectedNames = selectedBlocks.map((b) => b.fullTableName);

      const filtered = allTables.filter(
        (x) => !selectedNames.includes(x.fullName)
      );

      this.availableTables.set(filtered);
    });
  }

  openTable(full: string) {
    const m = /\[(.*?)\]\.\[(.*?)\]/.exec(full)!;
    const schema = m[1],
      table = m[2];

    this.schemaService.getTableInfo(schema, table).subscribe((info) => {
      const tableInfo = Array.isArray(info) ? info[0] : info;

      if (!tableInfo || !tableInfo.columns) {
        console.error('No columns in tableInfo:', tableInfo);
        return;
      }

      this.currentTableInfo.set(tableInfo);

      const init: Record<string, string | null> = {};
      tableInfo.columns.forEach((c: any) => (init[c.columnName] = ''));
      this.columnComments.set(init);

      this.tableDescription.set('');
      this.isPopupVisible.set(true);
    });
  }

  formatExample(): SafeHtml {
    const i = this.currentTableInfo();
    if (!i) return '';

    const lines: string[] = [];
    lines.push(`Table: <b>${i.fullName}`);
    lines.push(
      this.tableDescription()
        ? `<span style="color:#1856FA;"><i>${this.tableDescription()}</i></span><br>`
        : `<span style="color:#828a93;"><i>[[Description]]</i></span><br>`
    );

    lines.push('Columns:');

    // build FK lookup map
    const fkMap: Record<string, string> = {};
    for (const fk of i.foreignKeys) {
      fkMap[
        fk.columnName
      ] = `FK -> [${fk.referencedSchema}].[${fk.referencedTable}](${fk.referencedColumn})`;
    }

    // iterate columns, check if also FK
    for (const c of i.columns) {
      const desc = this.columnComments()[c.columnName];

      const displayDesc = desc
        ? `<span style="color:#1856FA;"><i>${desc}</i></span>`
        : '<span style="color:#828a93;"><i>[[Description]]</i></span>';

      const fkInfo = fkMap[c.columnName] ? `, ${fkMap[c.columnName]}` : '';

      lines.push(
        `- <b>[${c.columnName}]</b> <span>(${c.dataType}${
          c.isPrimaryKey ? ', PK' : ''
        }${!c.isNullable ? '' : ', nullable'}${fkInfo}) </span>`
      );

      lines.push(displayDesc + '<br>');
    }

    return this.sanitizer.bypassSecurityTrustHtml(lines.join('<br>'));
  }

  save() {
    const i = this.currentTableInfo();
    if (!i) return;

    const req: TableAnnotationRequest = {
      fullTableName: i.fullName,
      tableDescription: this.tableDescription(),
      columnComments: this.columnComments(),
    };

    this.schemaService.annotate([req]).subscribe(() => {
      this.isPopupVisible.set(false);
      this.toastNotificationManager.success(
        'ToastNotifications.SchemaUpdatedSuccessfully'
      );
      this.refresh();
    });
  }

  updateColumnComment(columnName: string, value: string) {
    const current = { ...this.columnComments() };
    current[columnName] = value;
    this.columnComments.set(current);
  }

  closePopup() {
    this.isPopupVisible.set(false);
  }

  openSelected(block: SelectedTableBlock) {
    const m = /\[(.*?)\]\.\[(.*?)\]/.exec(block.fullTableName)!;
    const schema = m[1],
      table = m[2];

    this.schemaService.getTableInfo(schema, table).subscribe((info) => {
      const tableInfo = Array.isArray(info) ? info[0] : info;

      if (!tableInfo || !tableInfo.columns) {
        console.error('No columns in tableInfo:', tableInfo);
        return;
      }

      // --- Parse saved column comments (multi-line) ---
      const comments: Record<string, string> = {};
      const lines = block.rawBlockText.split(/\r?\n/);

      let currentCol: string | null = null;
      let buffer: string[] = [];

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();

        // New column start
        const colMatch = /^- \[(.+?)\]$/.exec(line);
        if (colMatch) {
          // Save previous
          if (currentCol) {
            comments[currentCol] = buffer.join('\n').trim();
          }
          currentCol = colMatch[1];
          buffer = [];
          continue;
        }

        // Description line or continuation
        if (currentCol) {
          if (/^Description\s*:?(.*)$/i.test(line)) {
            const desc = line.substring(line.indexOf(':') + 1).trim();
            buffer.push(desc);
          } else {
            buffer.push(line);
          }
        }
      }

      // Save last column
      if (currentCol) {
        comments[currentCol] = buffer.join('\n').trim();
      }

      // --- Merge DB columns with parsed comments ---
      const merged: Record<string, string> = {};
      tableInfo.columns.forEach((c: any) => {
        merged[c.columnName] = comments[c.columnName] ?? '';
      });

      this.currentTableInfo.set(tableInfo);
      this.columnComments.set(merged);

      // --- Parse table description safely (multi-line until "Columns:") ---
      const tableDescMatch = /^Description:\s*([\s\S]*?)(?=^\s*Columns:)/m.exec(
        block.rawBlockText
      );

      let desc = tableDescMatch ? tableDescMatch[1].trim() : '';
      this.tableDescription.set(desc);

      this.isPopupVisible.set(true);
    });
  }

  onTableDescriptionChanged(e: any) {
    let value: string = e.value ?? '';

    value = this.sanitizeMultiline(value);

    this.tableDescription.set(value);

     e.component?.option('value', value);
  }

  onCommentDescriptionChanged(columnName: any, e: any) {
    let value: string = e ?? '';

    value = this.sanitizeMultiline(value);

    this.updateColumnComment(columnName, e);

    e.component?.option('value', value);
  }

  // Reuse everywhere (table + columns)
private sanitizeMultiline(input: string | null | undefined): string {
  let v = (input ?? '').replace(/\r\n/g, '\n');

  // If it's only whitespace/newlines (incl. a single "\n"), clear it
  if (/^\s*$/.test(v)) return '';

  // Collapse 2+ consecutive newlines into a single newline
  v = v.replace(/\n{2,}/g, '\n');

  // Optional: remove leading newlines (avoid starting with a blank line)
  v = v.replace(/^\n+/, '');

  // Remove trailing newlines
  v = v.replace(/\n+$/, '');

  return v;
}


  hasCommentsDisplay = (row: any) => {
    return row.hasComments
      ? this.languageService.translateInstant('Yes')
      : this.languageService.translateInstant('No');
  };

  addSelectedTables() {
    if (!this.selectedAvailableKeys.length) return;

    const requests = this.selectedAvailableKeys.map((x: any) => {
      return {
        fullTableName: x.fullName,
        tableDescription: '', // no description
        columnComments: {}, // no comments
      };
    });

    this.schemaService.annotate(requests).subscribe(() => {
      this.isPopupVisible.set(false);
      this.toastNotificationManager.success(
        'ToastNotifications.SchemaUpdatedSuccessfully'
      );
      this.refresh();
    });
  }
}
