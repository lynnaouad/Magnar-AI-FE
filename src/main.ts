import themes from 'devextreme/ui/themes';
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideRouter } from '@angular/router';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app/app-routing.module'
import { authInterceptor } from './app/interceptors/authentication-interceptor.service';
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { importProvidersFrom } from '@angular/core';
import { provideState, provideStore } from '@ngrx/store';
import { appReducers } from './app/app-store/reducers/app.reducer';

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

themes.initialized(() => {
  bootstrapApplication(AppComponent, {
    providers: [
      provideStore(appReducers),
      provideRouter(routes),
      provideHttpClient(withInterceptors([authInterceptor])),
      importProvidersFrom(TranslateModule.forRoot({
        loader: {
          provide: TranslateLoader,
          useFactory: HttpLoaderFactory,
          deps: [HttpClient]
        }
      }))
    ]
  }).catch(err => console.error(err));
});
