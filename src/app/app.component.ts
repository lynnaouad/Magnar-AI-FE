import { Component, HostBinding, OnInit } from '@angular/core';
import { AuthService, ScreenService, AppInfoService } from './shared/services';
import { Router, RouterModule } from '@angular/router';
import { UnauthenticatedContentComponent } from './unauthenticated-content';
import { NgIf } from '@angular/common';
import config from 'devextreme/core/config';
import { key } from '../../devextreme-license';
import { ConfigurationService } from './shared/services/configuration.service';
import { LanguageService } from './shared/services/language.service';
import { RtlObserver } from './Observables/RtlObserver.service';

config({
  licenseKey: key,
});
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: true,
  imports: [RouterModule, UnauthenticatedContentComponent, NgIf],
})
export class AppComponent implements OnInit {
  @HostBinding('class') get getClass() {
    return Object.keys(this.screen.sizes)
      .filter((cl) => this.screen.sizes[cl])
      .join(' ');
  }

  constructor(
    private authService: AuthService,
    private screen: ScreenService,
    public appInfo: AppInfoService,
    private configurationService: ConfigurationService,
    private languageService: LanguageService,
    private rtlObserver: RtlObserver
  ) {
    this.configurationService.getClientConfiguration();

    this.languageService.setAsDefaultLanguage('en');

    const browserLang = this.languageService.getBrowserLanguage();
    const defaultLang = browserLang.match(/en|ar/) ? browserLang : 'en';

    let language = this.languageService.getCurrentLanguage();
    let currentCulture = this.languageService.getCurrentCuluture();
    if (!currentCulture && language === 'en') {
      currentCulture = 'US';
    }

    if (language == null) {
      language = defaultLang;
    }

    this.languageService.useLanguage(language).subscribe(() => {
      this.languageService.setCurrentLanguage(language);
      this.languageService.setCurrentCulture(currentCulture);
      this.languageService.setDirection(language);
    });
  }

  ngOnInit(): void {
    this.rtlObserver.isRtl$.subscribe((isRtl) => {
      // Enable RTL globally for all DevExtreme components
      config({ rtlEnabled: isRtl });
    });

    this.handleLanguage();
  }

  isAuthenticated() {
    return this.authService.loggedIn;
  }

  handleLanguage() {
    const currentLanguage = this.languageService.getCurrentLanguage();
		let currentCulture =  this.languageService.getCurrentCuluture();
		
    this.languageService.setDxTranslation(currentLanguage, currentCulture);
  }
}
