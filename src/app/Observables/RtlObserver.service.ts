import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class RtlObserver {
  private isRtlSubject = new BehaviorSubject<boolean>(false);
  isRtl$ = this.isRtlSubject.asObservable();

  constructor() {}

  setRtl(isRtl: boolean) {
    this.isRtlSubject.next(isRtl);
  }
}