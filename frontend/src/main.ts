/// <reference types="@angular/localize" />

import { bootstrapApplication } from '@angular/platform-browser';

import { AppComponent } from '@infra-ui/app.component';
import { appConfig } from '@infra-ui/app.config';

bootstrapApplication(AppComponent, appConfig).catch((err) =>
  console.error(err)
);
