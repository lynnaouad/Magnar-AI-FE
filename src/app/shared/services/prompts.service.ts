import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Utilities } from '../utils/utilities.service';
import { HttpClient } from '@angular/common/http';
import { catchError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PromptsService {
  backEndUrl: string = environment.apiUrl + '/api/Prompts';
  constructor(private http: HttpClient, private utilities: Utilities) {}

  executePrompt(data: any, workspaceId: number) {
    return this.http
      .post(`${this.backEndUrl}?workspaceId=${workspaceId}`, data)
      .pipe(catchError(this.utilities.handleErrorGlobal));
  }

  loadHistory(workspaceId: number) {
    return this.http
      .get(`${this.backEndUrl}?workspaceId=${workspaceId}`)
      .pipe(catchError(this.utilities.handleErrorGlobal));
  }
}
