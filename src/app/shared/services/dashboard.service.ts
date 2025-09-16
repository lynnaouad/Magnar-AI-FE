import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { catchError } from 'rxjs';
import { Utilities } from '../utils/utilities.service';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  backEndUrl: string = environment.apiUrl + '/api/custom-dashboard';

  constructor(
    private http: HttpClient,
    private router: Router,
    private utilities: Utilities
  ) {}

  get(data: any) {
    return this.http
      .post(this.backEndUrl, data)
      .pipe(catchError(this.utilities.handleErrorGlobal));
  }

  changeType(data: any) {
    return this.http
      .post(this.backEndUrl + `/change-type`, data)
      .pipe(catchError(this.utilities.handleErrorGlobal));
  }
}
