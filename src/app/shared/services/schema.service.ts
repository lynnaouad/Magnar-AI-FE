import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class SchemaService {

  apiUrl: string =  environment.apiUrl + '/api/DatabaseSchema';
	constructor(
		private http: HttpClient,
		private router: Router) {

    }

  getTables(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/tables`);
  }

  getTableInfo(schemaName: string, tableName: string,): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/tables/${schemaName}/${tableName}`);
  }

  annotate(request: any){
    return this.http.post(`${this.apiUrl}/annotate`, request);
  }

  readSelected(){
    return this.http.get(`${this.apiUrl}/selected`);
  }
}
