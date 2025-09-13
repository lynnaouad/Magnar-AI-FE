import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AppInfoService {
  constructor() {}

  public get title() {
    return 'Magnar Recruitment';
  }

  public get currentYear() {
    return new Date().getFullYear();
  }
}
