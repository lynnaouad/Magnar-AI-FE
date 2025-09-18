import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd, RouterModule } from '@angular/router';

import { DxTreeViewTypes } from 'devextreme-angular/ui/tree-view';
import { DxDrawerTypes } from 'devextreme-angular/ui/drawer';
import {
  DxScrollViewModule,
  DxScrollViewComponent,
} from 'devextreme-angular/ui/scroll-view';

import { HeaderComponent } from '../../shared/components';
import { AuthService, ScreenService } from '../../shared/services';
import { FooterComponent } from '../../shared/components/footer/footer.component';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageService } from '../../shared/services/language.service';
import {
  DxButtonModule,
  DxPopupModule,
  DxRadioGroupModule,
} from 'devextreme-angular';
import { take } from 'rxjs';

@Component({
  selector: 'app-nav-bar',
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.scss'],
  standalone: true,
  imports: [
    HeaderComponent,
    DxScrollViewModule,
    CommonModule,
    RouterModule,
    FooterComponent,
    TranslateModule,
    DxPopupModule,
    DxButtonModule,
    DxRadioGroupModule,
  ],
})
export class NavBarComponent implements OnInit {
  @ViewChild(DxScrollViewComponent, { static: true })
  scrollView!: DxScrollViewComponent;
  selectedRoute = '';

  menuOpened!: boolean;
  temporaryMenuOpened = false;

  @Input()
  title!: string;

  menuMode: DxDrawerTypes.OpenedStateMode = 'shrink';
  menuRevealMode: DxDrawerTypes.RevealMode = 'expand';
  minMenuSize = 0;
  shaderEnabled = false;
  swatchClassName = 'dx-swatch-additional';
  menuItems: any[] = [];
  navItems: any[] = [];

  recruiterMenuItems: any[] = [];
  defaultMenuItems: any[] = [];

  constructor(
    protected screen: ScreenService,
    private router: Router,
    private authService: AuthService,
    private languageService: LanguageService,
  ) {
    let translations = [
      'SignOut',
    ];

    this.languageService
      .getTranslations(translations)
      .subscribe((translations) => {
        this.defaultMenuItems = [
          {
            text: translations['SignOut'],
            icon: 'runner',
            code: 'SignOut',
            click: () => {
              this.authService.logOut();
              this.navigateTo('/login');
            },
          },
        ];

        this.setMenuItems();
      });
  }

  async ngOnInit() {
    this.menuOpened = this.screen.sizes['screen-large'];

    this.router.events.subscribe((val) => {
      if (val instanceof NavigationEnd) {
        this.selectedRoute = val.urlAfterRedirects.split('?')[0];
      }
    });

    this.screen.changed.subscribe(() => this.updateDrawer());

    this.updateDrawer();
  }

  async setMenuItems() {
    let isLoggedIn = this.authService.loggedIn;

    if (!isLoggedIn) {
      this.menuItems = [];
      return;
    }
  }

  updateDrawer() {
    const isXSmall = this.screen.sizes['screen-x-small'];
    const isLarge = this.screen.sizes['screen-large'];

    this.menuMode = isLarge ? 'shrink' : 'overlap';
    this.menuRevealMode = isXSmall ? 'slide' : 'expand';
    this.minMenuSize = isXSmall ? 0 : 60;
    this.shaderEnabled = !isLarge;
  }

  get hideMenuAfterNavigation() {
    return this.menuMode === 'overlap' || this.temporaryMenuOpened;
  }

  get showMenuAfterClick() {
    return !this.menuOpened;
  }

  navigationChanged(event: DxTreeViewTypes.ItemClickEvent) {
    const path = (event.itemData as any).path;
    const pointerEvent = event.event;

    if (path && this.menuOpened) {
      if (event.node?.selected) {
        pointerEvent?.preventDefault();
      } else {
        this.router.navigate([path]);
        this.scrollView.instance.scrollTo(0);
      }

      if (this.hideMenuAfterNavigation) {
        this.temporaryMenuOpened = false;
        this.menuOpened = false;
        pointerEvent?.stopPropagation();
      }
    } else {
      pointerEvent?.preventDefault();
    }
  }

  navigationClick() {
    if (this.showMenuAfterClick) {
      this.temporaryMenuOpened = true;
      this.menuOpened = true;
    }
  }

  navigateTo(route: string) {
    this.router.navigate([route]);
  }
}
