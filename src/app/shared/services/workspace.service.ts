import { Injectable } from '@angular/core';

import { HttpClient } from '@angular/common/http';
import { Utilities } from '../utils/utilities.service';
import { catchError } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class WorkspaceService {
  backEndUrl: string = environment.apiUrl + '/api/Workspaces';
  constructor(private http: HttpClient, private utilities: Utilities) {}

  getAll() {
    return this.http
      .get(this.backEndUrl)
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

  haveAccess(id: any) {
    return this.http
      .get(`${this.backEndUrl}/${id}/access`)
      .pipe(catchError(this.utilities.handleErrorGlobal));
  }
}
