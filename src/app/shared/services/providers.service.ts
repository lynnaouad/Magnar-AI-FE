import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { catchError } from 'rxjs';
import { Utilities } from '../utils/utilities.service';

@Injectable({ providedIn: 'root' })
export class ProvidersService {
  backEndUrl: string = environment.apiUrl + '/api/Providers';

  constructor(
    private http: HttpClient,
    private router: Router,
    private utilities: Utilities
  ) {}

  getAll(workspaceId: number, providerType: any) {
    return this.http
      .get(this.backEndUrl + `?WorkspaceId=${workspaceId}&ProviderType=${providerType}`)
      .pipe(catchError(this.utilities.handleErrorGlobal));
  }

  get(id: number) {
    return this.http
      .get(this.backEndUrl + `/${id}`)
      .pipe(catchError(this.utilities.handleErrorGlobal));
  }

  getOdata(queryString: string, workspaceId: number) {
    return this.http
      .get(this.backEndUrl + `/odata?workspaceId=${workspaceId}&${queryString}`)
      .pipe(catchError(this.utilities.handleErrorGlobal));
  }

  update(data: any) {
    return this.http
      .put(this.backEndUrl, data)
      .pipe(catchError(this.utilities.handleErrorGlobal));
  }

  create(data: any) {
    return this.http
      .post(this.backEndUrl, data)
      .pipe(catchError(this.utilities.handleErrorGlobal));
  }

  delete(id: any) {
    return this.http
      .delete(`${this.backEndUrl}/${id}`)
      .pipe(catchError(this.utilities.handleErrorGlobal));
  }

  TestConnection(conn: any) {
    return this.http
      .post<any>(`${this.backEndUrl}/test`, conn)
      .pipe(catchError(this.utilities.handleErrorGlobal));
  }
}
