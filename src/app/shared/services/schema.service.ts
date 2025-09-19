import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Router } from '@angular/router';
import { Utilities } from '../utils/utilities.service';
import { ProviderDto } from '../../Dtos/ProviderDto';

@Injectable({
  providedIn: 'root',
})
export class SchemaService {
  apiUrl: string = environment.apiUrl + '/api/DatabaseSchema';
  constructor(
    private http: HttpClient,
    private router: Router,
    private utilities: Utilities
  ) {}

  getTablesFromDatabase(configuration: ProviderDto): Observable<any[]> {
    return this.http
      .post(`${this.apiUrl}/tables`, configuration)
      .pipe(catchError(this.utilities.handleErrorGlobal));
  }

  annotate(requests: any[], providerId: number) {
    return this.http
      .post(`${this.apiUrl}/annotate?providerId=${providerId}`, requests)
      .pipe(catchError(this.utilities.handleErrorGlobal));
  }

  getSelctedTables( providerId: number) {
    return this.http
      .get(`${this.apiUrl}/selected?providerId=${providerId}`)
      .pipe(catchError(this.utilities.handleErrorGlobal));
  }
}
