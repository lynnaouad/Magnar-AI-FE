import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Router } from '@angular/router';
import { Utilities } from '../utils/utilities.service';

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

  getTables(): Observable<any[]> {
    return this.http
      .get<any[]>(`${this.apiUrl}/tables`)
      .pipe(catchError(this.utilities.handleErrorGlobal));
  }

  getTableInfo(schemaName: string, tableName: string): Observable<any[]> {
    return this.http
      .get<any[]>(`${this.apiUrl}/tables/${schemaName}/${tableName}`)
      .pipe(catchError(this.utilities.handleErrorGlobal));
  }

  annotate(requests: any[]) {
    return this.http
      .post(`${this.apiUrl}/annotate`, requests)
      .pipe(catchError(this.utilities.handleErrorGlobal));
  }

  readSelected() {
    return this.http
      .get(`${this.apiUrl}/selected`)
      .pipe(catchError(this.utilities.handleErrorGlobal));
  }
}
