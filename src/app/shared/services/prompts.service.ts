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

  executePrompt(data: any) {
    return this.http
      .post(this.backEndUrl, data)
      .pipe(catchError(this.utilities.handleErrorGlobal));
  }
}
