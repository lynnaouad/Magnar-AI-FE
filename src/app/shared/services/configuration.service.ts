import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, of, take } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment'

@Injectable({ providedIn: 'root' })
export class ConfigurationService {
    backEndUrl: string =  environment.apiUrl + '/api/Configurations/';
	constructor(
		private httpClient: HttpClient,
		private router: Router) {

    }

	reCaptchaConfiguration: any = {};

	get apiUri() {
		var config: any = {};
		var sessionConfig = sessionStorage.getItem("configuration");
		if (sessionConfig == null) {
			return environment.apiUrl;
		}
		try {
			config = JSON.parse(sessionStorage.getItem("configuration") ?? '{}');
			return config.apiUri;
		}
		finally {
			return environment.apiUrl;
		}
	}

	getClientConfiguration() {
		this.httpClient
		.get(this.backEndUrl + 'client-configuration')
		.pipe(
			take(1),
			catchError(() => {
				this.router.navigate(["/login"]);
				return of();
			})
		)
		.subscribe((res: any) => {
			sessionStorage.setItem("configuration", JSON.stringify(res));
			this.reCaptchaConfiguration = res.reCaptchaConfig;
		});
	}

	getGoogleRecaptchaConfiguration() {
		var config = JSON.parse(sessionStorage.getItem("configuration") ?? '{}')
		return config.reCaptchaConfig;
	}
}
