import {
  Component,
  NgModule,
  Output,
  Input,
  EventEmitter,
  ViewChild,
  ElementRef,
  AfterViewInit,
  OnDestroy,
  OnChanges,
  SimpleChanges,
  OnInit,
  inject,
} from '@angular/core';
import {
  DxTreeViewModule,
  DxTreeViewComponent,
  DxTreeViewTypes,
} from 'devextreme-angular/ui/tree-view';

import * as events from 'devextreme/events';
import { LanguageService } from '../../services/language.service';
import { cloneDeep, forEach } from 'lodash';
import { BehaviorSubject, filter } from 'rxjs';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { AppState } from '../../../app-store/states/app.state';
import { WorkspaceIdObserver } from '../../../app-store/Observables/WorkspaceIdObserver.service';

@Component({
  selector: 'app-side-navigation-menu',
  templateUrl: './side-navigation-menu.component.html',
  styleUrls: ['./side-navigation-menu.component.scss'],
  standalone: true,
  imports: [DxTreeViewModule, CommonModule],
})
export class SideNavigationMenuComponent
  implements OnInit, AfterViewInit, OnDestroy, OnChanges
{
  @ViewChild(DxTreeViewComponent, { static: true })
  menu!: DxTreeViewComponent;

  @Input() sidebarMenuItems: any[] = [];

  @Output() selectedItemChanged =
    new EventEmitter<DxTreeViewTypes.ItemClickEvent>();

  @Output() openMenu = new EventEmitter<any>();

  private _selectedItem!: String;
  @Input()
  set selectedItem(value: String) {
    this._selectedItem = value;
    if (!this.menu.instance) {
      return;
    }

    this.menu.instance.selectItem(value);
  }

  workspaceId: number = 0;
  selectedId: any = null;

  // BehaviorSubject to store menu items
  private menuItemsSubject = new BehaviorSubject<any[]>([]);
  menuItems$ = this.menuItemsSubject.asObservable();

  constructor(
    private elementRef: ElementRef,
    private languageService: LanguageService,
    private router: Router,
    private companyObserver: WorkspaceIdObserver
  ) {
    this.companyObserver.workspaceId$.subscribe((id) => {
      this.workspaceId = id ?? 0;
      this.updateMenuItems();
    });
  }

  private _compactMode = false;
  @Input()
  get compactMode() {
    return this._compactMode;
  }
  set compactMode(val) {
    this._compactMode = val;

    if (!this.menu.instance) {
      return;
    }

    if (val) {
      this.menu.instance.collapseAll();
    } else {
      this.menu.instance.expandItem(this._selectedItem);
    }
  }

  private updateMenuItems() {
    let menuItems = cloneDeep(this.sidebarMenuItems);

    if (menuItems.length > 0) {
      const updatedItems: any[] = menuItems.map((item) => {
        if (item.path) {
          let parts: any[] = item.path.split('/');

          if (parts.includes(':workspaceId')) {
            parts[2] = this.workspaceId;
            item.path = parts.join('/');
          }
        }

        item.text = this.languageService.translateInstant(item.text);
        item.selected = item.id === this.selectedId;

        if (item.items != null && item.items.length > 0) {
          item.items.map((innerMenu: any) => {
            if (innerMenu.path) {
              let parts: any[] = innerMenu.path.split('/');
              console.log(parts);
              // if (parts.includes('workspaces')) {
              //   parts[2] = this.companyId;
              //   innerMenu.path = parts.join('/');
              // }
            }

            innerMenu.text = this.languageService.translateInstant(
              innerMenu.text
            );
            innerMenu.selected = innerMenu.id === this.selectedId;
          });
        }

        return { ...item, expanded: !this._compactMode };
      });

      // Ensure we never pass null
      this.menuItemsSubject.next(updatedItems ?? []);
    } else {
      this.menuItemsSubject.next([]); // Always emit an empty array instead of null
    }
  }

  onItemClick(event: DxTreeViewTypes.ItemClickEvent) {
    const selectedItem = event.itemData;

    this.selectedId = selectedItem?.id; // Update the selected ID

    this.updateMenuItems();
    this.selectedItemChanged.emit(event);
  }

  ngOnInit() {}

  ngAfterViewInit() {
    events.on(this.elementRef.nativeElement, 'dxclick', (e: Event) => {
      this.openMenu.next(e);
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes && changes['sidebarMenuItems'] && this.sidebarMenuItems) {
      this.updateMenuItems();

      this.updateSelectedIdFromRoute();
    }
  }

  ngOnDestroy() {
    events.off(this.elementRef.nativeElement, 'dxclick');
  }

  updateSelectedIdFromRoute() {
    let parts = this.router.url.split('/');
    let lastRoute = parts[parts.length - 1];

    let selectedItem = this.sidebarMenuItems.find((item) => {
      let x = item.path.split('/');
      let y = x[x.length - 1];

      return lastRoute == y;
    });

    if (selectedItem == null) {
      this.sidebarMenuItems.map((item) => {
        if (item.items != null && item.items.length > 0) {
          selectedItem = item.items.find((innerMenu: any) => {
            let x = innerMenu.path.split('/');
            let y = x[x.length - 1];

            return lastRoute == y;
          });
        }
      });
    }

    this.selectedId = selectedItem ? selectedItem.id : null;

    this.updateMenuItems();
  }
}
