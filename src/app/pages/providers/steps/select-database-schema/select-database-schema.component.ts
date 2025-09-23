import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  signal,
  ViewChild,
} from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import {
  DxButtonModule,
  DxDataGridModule,
  DxFormModule,
  DxListModule,
  DxLoadIndicatorModule,
  DxPopupModule,
  DxTextAreaModule,
  DxTextBoxModule,
  DxToolbarModule,
  DxTreeViewComponent,
  DxTreeViewModule,
} from 'devextreme-angular';
import { DxiToolbarItemModule } from 'devextreme-angular/ui/nested';
import { finalize, forkJoin, tap } from 'rxjs';
import { ScreenService, AuthService } from '../../../../shared/services';
import { SchemaService } from '../../../../shared/services/schema.service';
import { ProviderDto } from '../../../../Dtos/ProviderDto';
import { ProvidersService } from '../../../../shared/services/providers.service';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { ToastNotificationManager } from '../../../../shared/utils/toast-notification.service';
import { WorkspaceIdObserver } from '../../../../app-store/Observables/WorkspaceIdObserver.service';

class TableDto {
  schemaName: string = '';
  tableName: string = '';
  fullName: string = '';
  tableDescription: string = '';
  isSelected: boolean = false;
  columns: ColumnInfoDto[] = [];
}

class ColumnInfoDto {
  columnName: string = '';
  dataType: string = '';
  isNullable: boolean = false;
  isPrimaryKey: boolean = false;
  isForeignKey: boolean = false;
  columnDescription: string = '';
  foreignKeyReferencedTable?: string = '';
}

interface TreeItem {
  id: string;
  parentId?: string;
  name: string;
  type: 'table' | 'column';
  data: any;
  selected?: boolean;
}

@Component({
  selector: 'app-select-database-schema',
  templateUrl: './select-database-schema.component.html',
  styleUrl: './select-database-schema.component.scss',
  standalone: true,
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
    DxTreeViewModule,
    DxFormModule,
  ],
})
export class SelectDatabaseSchemaComponent implements OnInit {
  configuration: ProviderDto = new ProviderDto();

  nextLoading: boolean = false;
  displayLoader: boolean = true;
  workspaceId: number = 0;

  tables: TableDto[] = [];
  allTreeItems: TreeItem[] = [];
  filteredTreeItems: TreeItem[] = [];

  selectedTables: any[] = [];

  searchText: string = '';
  tablePopupVisible: boolean = false;
  columnPopupVisible: boolean = false;

  selectedTable?: TableDto;
  selectedColumn?: ColumnInfoDto;

  @ViewChild(DxTreeViewComponent, { static: false })
  tree!: DxTreeViewComponent;
  constructor(
    private schemaService: SchemaService,
    public screen: ScreenService,
    protected router: Router,
    protected route: ActivatedRoute,
    protected providerService: ProvidersService,
    protected toastNotificationManager: ToastNotificationManager,
    protected workspaceObserver: WorkspaceIdObserver
  ) {}

  ngOnInit() {
    this.workspaceObserver.workspaceId$.subscribe((id) => {
      this.workspaceId = id ?? 0;
    });

    this.route.params
      .pipe(
        tap((params: Params) => {
          const id = params['id'];

          if (id > 0) {
            this.getProvider(id);
          }
        })
      )
      .subscribe();
  }

  getProvider(id: number) {
    this.providerService.get(id).subscribe((res: any) => {
      if (res) {
        this.configuration = res;
        this.getTables();
      }
    });
  }

  getTables() {
    this.displayLoader = true;
    this.schemaService
      .getSelctedTables(this.configuration.id)
      .pipe(
        finalize(() => (this.displayLoader = false)),
        tap((res) => {
          if (res) {
            this.tables = res;
            this.allTreeItems = this.buildTree(this.tables);
            this.filteredTreeItems = [...this.allTreeItems];
          }
        })
      )
      .subscribe();
  }

  buildTree(tables: TableDto[]): TreeItem[] {
    const items: TreeItem[] = [];
    for (const t of tables) {
      const tableId = t.fullName;

      items.push({
        id: tableId,
        name: tableId,
        type: 'table',
        data: t,
        selected: t.isSelected ?? false,
      });

      for (const c of t.columns) {
        items.push({
          id: `${tableId}.${c.columnName}`,
          parentId: tableId,
          name: c.columnName,
          type: 'column',
          data: c,
          selected: t.isSelected ?? false,
        });
      }
    }
    return items;
  }

  filterTree() {
    if (!this.searchText) {
      this.filteredTreeItems = this.allTreeItems;
      return;
    }

    const term = this.searchText.toLowerCase();
    const matchingTableIds = this.allTreeItems
      .filter((i) => i.type === 'table' && i.name.toLowerCase().includes(term))
      .map((i) => i.id);

    this.filteredTreeItems = this.allTreeItems.filter(
      (i) =>
        matchingTableIds.includes(i.id) ||
        matchingTableIds.includes(i.parentId!)
    );
  }

  closeTablePopup() {
    this.tablePopupVisible = false;
  }

  closeColumnPopup() {
    this.columnPopupVisible = false;
  }

  onItemClick(e: any) {
    const item = e.itemData;
    if (item.type === 'table') {
      this.selectedTable = item.data;
      this.selectedColumn = new ColumnInfoDto();
      this.tablePopupVisible = true;
    } else if (item.type === 'column') {
      this.selectedColumn = item.data;
      this.selectedTable = new TableDto();
      this.columnPopupVisible = true;
    }
  }

  onSelectionChanged(e: any) {
    // keep only selected tables
    this.selectedTables = e.component
      .getSelectedNodes()
      .map((n: any) => n.itemData)
      .filter((i: any) => i.type === 'table');
  }

  submit() {
    this.displayLoader = true;
    var selectedTables = this.selectedTables.map((x) => x.data);

    this.schemaService
      .annotate(selectedTables, this.configuration.id)
      .pipe(finalize(() => (this.displayLoader = false)))
      .subscribe((res) => {
        this.toastNotificationManager.success(
          'ToastNotifications.SchemaUpdatedSuccessfully'
        );

        this.getTables();
      });
  }

  cancel() {
    this.router.navigate(['..'], { relativeTo: this.route });
  }

  // call this once after initial render or after you rebind items (e.g., after a filter)
  primeSelection() {
    const tv = this.tree?.instance;
    if (!tv) return;

    const nodes = tv.getSelectedNodes(); // includes preselected items

    this.selectedTables = nodes
      .map((n: any) => n.itemData)
      .filter((i: any) => i.type === 'table');
  }
}
