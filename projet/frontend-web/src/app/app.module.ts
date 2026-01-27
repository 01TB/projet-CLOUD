// src/app/app.module.ts
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

// Components
import { MapComponent } from './components/map/map.component';
import { LoginComponent } from './components/auth/login/login.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';

// Services
import { AuthService } from './services/auth.service';
import { MockDataService } from './services/mock-data.service';

// Guards
import { AuthGuard } from './guards/auth.guard';

@NgModule({
  declarations: [
    AppComponent,
    MapComponent,
    LoginComponent,
    SidebarComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    AppRoutingModule
  ],
  providers: [
    AuthService,
    MockDataService,
    AuthGuard
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }