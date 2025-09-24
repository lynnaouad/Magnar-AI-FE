import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Utilities } from '../utils/utilities.service';
import { HttpClient } from '@angular/common/http';
import { catchError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ApiKeysService {
  backEndUrl: string = environment.apiUrl + '/api/ApiKeys';
  constructor(private http: HttpClient, private utilities: Utilities) {}

  getOdata(queryString: string) {
    return this.http
      .get(`${this.backEndUrl}/odata?${queryString}`)
      .pipe(catchError(this.utilities.handleErrorGlobal));
  }

  create(data: any) {
    console.log(data)
    return this.http
      .post(this.backEndUrl, data)
      .pipe(catchError(this.utilities.handleErrorGlobal));
  }

  update(data: any) {
    return this.http
      .put(this.backEndUrl, data)
      .pipe(catchError(this.utilities.handleErrorGlobal));
  }

  revoke(id: any) {
    return this.http
      .delete(`${this.backEndUrl}/${id}`)
      .pipe(catchError(this.utilities.handleErrorGlobal));
  }
}
