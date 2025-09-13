import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { catchError } from 'rxjs';
import { Utilities } from '../utils/utilities.service';

@Injectable({ providedIn: 'root' })
export class TypesService {
  backEndUrl: string = environment.apiUrl + '/api/Types/';
  constructor(private http: HttpClient, private utilities: Utilities) {}

  get(type: string){
    return this.http
    .get(this.backEndUrl + `${type}`)
    .pipe(catchError(this.utilities.handleErrorGlobal));
  }
}
