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
    lines.push(`Table: <b>${i.fullName}</b>`);
    lines.push(
      this.tableDescription()
        ? `<span style="color:#1856FA;"><i>${this.tableDescription()}</i></span>`
        : '<span style="color:#828a93;</i></span>'
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
        }${!c.isNullable ? '' : ', nullable'}${fkInfo}) </span>: ${displayDesc}`
      );
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

      // Parse saved comments from RawBlockText
      const comments: Record<string, string | null> = {};
      const lines = block.rawBlockText.split(/\r?\n/);
      for (const line of lines) {
        const colMatch = /^- \[(.+?)\](?: ?: (.*))?$/.exec(line.trim());
        if (colMatch) {
          comments[colMatch[1]] = colMatch[2] ?? '';
        }
      }

      // Merge DB columns with parsed comments
      const merged: Record<string, string | null> = {};
      tableInfo.columns.forEach((c: any) => {
        merged[c.columnName] = comments[c.columnName] ?? '';
      });

      this.currentTableInfo.set(tableInfo);
      this.columnComments.set(merged);

      // Parse table description safely
      const descMatch = /^Description:\s*(.*)$/m.exec(block.rawBlockText);
      let desc = descMatch ? descMatch[1].trim() : '';
      if (!desc || /^columns:?$/i.test(desc)) {
        desc = '';
      }
      this.tableDescription.set(desc);

      this.isPopupVisible.set(true);
    });
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
