import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  HostListener,
  OnDestroy,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';

import { AuthService, IUser, ScreenService } from '../../services';
import { UserPanelComponent } from '../user-panel/user-panel.component';
import { DxButtonModule } from 'devextreme-angular/ui/button';
import { DxToolbarModule } from 'devextreme-angular/ui/toolbar';
import { Router, RouterModule } from '@angular/router';
import { DxSelectBoxModule } from 'devextreme-angular';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageService } from '../../services/language.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  templateUrl: 'header.component.html',
  styleUrls: ['./header.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    DxButtonModule,
    UserPanelComponent,
    DxToolbarModule,
    RouterModule,
    DxSelectBoxModule,
    TranslateModule,
  ],
})
export class HeaderComponent implements OnInit, OnDestroy, OnChanges {
  @Output()
  menuToggle = new EventEmitter<boolean>();

  @Input()
  menuToggleEnabled = false;

  @Input()
  menuItems: any[] = [];

  @Input()
  navItems: any[] = [];

  user: IUser = {
    userId: '',
    usernameOrEmail: '',
  };

  isLoggedIn = false;
  isHomeRoute = true;
  isMobile: boolean = true;
  selectedNavItem: any;
  imageUrl: any = '';
  defaultLogo: string = '/Magnarlogo.png';
  companyLogo: any = this.defaultLogo;

  languages = [];

  CompanyName = '';

  selectedLanguage: string = 'en';

  constructor(
    private authService: AuthService,
    private router: Router,
    protected languageService: LanguageService,
  ) {
    this.checkIfMobile();
    this.getLanguages();
  }

  async ngOnInit() {
    this.user = this.authService.CurrentUser;

    this.isLoggedIn = this.authService.loggedIn;
  }

  ngOnChanges(changes: SimpleChanges): void {
  }

  ngOnDestroy(): void {
  }

  getLanguages() {
    this.languageService.getSupportedLanguages().subscribe((res: any) => {
      this.languages = res;

      this.selectedLanguage = this.languageService.getLocale();
    });
  }

  changeLanguage(selected: string) {
    let parts = selected.split('-');
    let selectedLang = parts[0];
    let selectedCulture = parts[1];

    var currentLang = this.languageService.getCurrentLanguage();
    var currentCulture = this.languageService.getCurrentCuluture();

    if (currentLang == selectedLang && currentCulture == selectedCulture) {
      return;
    }

    this.languageService.setCurrentLanguage(selectedLang);
    this.languageService.setCurrentCulture(selectedCulture);

    this.languageService.useLanguage(selectedLang).subscribe(() => {
      this.languageService.setDirection(selectedLang);
      this.languageService.setDxTranslation(selectedLang, selectedCulture);
    });

    this.selectedLanguage = this.languageService.getLocale();

    window.location.reload();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.checkIfMobile();
  }

  checkIfMobile() {
    this.isMobile = window.innerWidth < 500; // Adjust the breakpoint as needed
  }

  toggleMenu = () => {
    this.menuToggle.emit();
  };

  onNavItemSelected(event: any) {
    const selectedLink = event.value;
    if (selectedLink) {
      this.router.navigate([selectedLink]);
    }
  }

  signIn() {
    this.selectedNavItem = null;
    this.router.navigate(['/login']);
  }
}
