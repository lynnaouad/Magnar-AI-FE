import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { catchError } from 'rxjs';
import { Utilities } from '../utils/utilities.service';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  backEndUrl: string = environment.apiUrl + '/api/CustomDashboard';

  constructor(
    private http: HttpClient,
    private router: Router,
    private utilities: Utilities
  ) {}

  generateDashboard(data: any) {
    return this.http
      .post(this.backEndUrl, data)
      .pipe(catchError(this.utilities.handleErrorGlobal));
  }

  changeDashboardType(data: any) {
    return this.http
      .post(this.backEndUrl + `/change-type`, data)
      .pipe(catchError(this.utilities.handleErrorGlobal));
  }
}
