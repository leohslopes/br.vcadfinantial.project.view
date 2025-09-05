import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient, withFetch, withInterceptors, withInterceptorsFromDi } from '@angular/common/http';
import { authInterceptor } from './shared/authInteceptor';
import {  LOCALE_ID } from '@angular/core';



export const appConfig: ApplicationConfig = {
  providers: [
   // provideBrowserGlobalErrorListeners(),
   // provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withFetch(),
      withInterceptorsFromDi(),
      withInterceptors([authInterceptor])
    ),
    { provide: LOCALE_ID, useValue: 'pt-BR' }
  ]
};
