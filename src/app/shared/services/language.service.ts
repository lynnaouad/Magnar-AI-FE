import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  InterpolatableTranslationObject,
  TranslateService,
} from '@ngx-translate/core';
import { EMPTY, Observable } from 'rxjs';
import { LanguageObserver } from '../../Observables/LanguageObserver.service';
import { locale, loadMessages } from 'devextreme/localization';
import arMessages from '../../../assets/i18n/dx-ar.json';
import enMessages from '../../../assets/i18n/dx-en.json';

@Injectable({
  providedIn: 'root',
})
export class LanguageService {
  constructor(
    private http: HttpClient,
    private translate: TranslateService,
    private languageObserver: LanguageObserver
  ) {}

  translateInstant(value: string){
    return this.translate.instant(value);
  }

  getSupportedLanguages() {
    return this.http.get('assets/supported-languages.json');
  }

  getTranslationFile(filePath: string) {
    return this.http.get(filePath);
  }

  getCurrentLanguage(): string {
    return this.getCookie('language') || 'en';
  }

  getCurrentCuluture(): string {
    return this.getCookie('culture') || '';
  }

  setDxTranslation(langCode: string, culture: string) {
    if (langCode === 'ar') {
      if (!culture || culture === 'LB') {
        locale('ar-LB');
      } else if (culture === 'SA') {
        locale('ar');
      }
    } else if (!culture) {
      locale(langCode);
    } else {
      locale(`${langCode}-${culture}`);
    }

    this.loadDxTranslationFiles(langCode);
  }

  loadDxTranslationFiles(langCode: string) {
    if (langCode === 'ar') {
      loadMessages(arMessages);
      return;
    }

    loadMessages(enMessages);
  }

  setCurrentLanguage(lang: string) {
    if (lang == null) {
      return;
    }
    this.setCookie('language', lang, 365); // Store language for 1 year
  }

  setCurrentCulture(culture: string) {
    if (culture == null) {
      return;
    }
    this.setCookie('culture', culture, 365); // Store language for 1 year
  }

  setAsDefaultLanguage(lang: string) {
    if (lang == null) {
      return;
    }
    this.translate.setDefaultLang(lang);
  }

  getBrowserLanguage() {
    return this.translate.getBrowserLang() ?? '';
  }

  getLocale() {
    const langCode = this.getCurrentLanguage();
    const culture = this.getCurrentCuluture();

    return `${langCode}-${culture}`;
  }

  useLanguage(lang: string): Observable<InterpolatableTranslationObject> {
    if (lang == null) {
      return EMPTY;
    }

    return this.translate.use(lang);
  }

  setDirection(lang: string) {
    if (lang == null) {
      return;
    }
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    this.languageObserver.setLanguage(lang);
  }

  getDirection() {
    return this.getCurrentLanguage() === 'ar' ? 'rtl' : 'ltr';
  }

  isRtl(): boolean {
    return this.getCurrentLanguage() === 'ar';
  }

  getTranslation(name: string): Promise<string> {
    return new Promise((resolve) => {
      this.translate.get(name).subscribe((res) => {
        resolve(res);
      });
    });
  }

  getTranslations(keys: string[]): Observable<{ [key: string]: string }> {
    return this.translate.get(keys);
  }

  // Helper method to set a cookie
  private setCookie(name: string, value: string, days: number) {
    const expires = new Date();
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000); // Convert days to milliseconds
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
  }

  // Helper method to get a cookie
  private getCookie(name: string): string | null {
    const match = document.cookie.match(
      new RegExp('(^| )' + name + '=([^;]+)')
    );
    return match ? match[2] : null;
  }
}
