import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { RtlObserver } from './RtlObserver.service';

@Injectable({ providedIn: 'root' })
export class LanguageObserver {
  languageSubject$ = new BehaviorSubject<any>(null);

  constructor(private rtlObserver: RtlObserver) {}

  setLanguage(language: any) {
    this.languageSubject$.next(language);
    this.rtlObserver.setRtl(language === 'ar'); // Example: Set RTL if language is Arabic
  }
}