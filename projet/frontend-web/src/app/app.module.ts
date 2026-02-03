// src/app/app.module.ts
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

// Components
import { MapComponent } from './components/map/map.component';
import { LoginComponent } from './components/auth/login/login.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { UserManagementComponent } from './components/admin/user-management/user-management.component';

// Services
import { AuthService } from './services/auth.service';
import { MockDataService } from './services/mock-data.service';
import { UserManagementService } from './services/user-management.service';

// Guards
import { AuthGuard } from './guards/auth.guard';

// Interceptors
import { JwtInterceptor } from './interceptors/jwt.interceptor';

@NgModule({
  declarations: [
    AppComponent,
    MapComponent,
    LoginComponent,
    SidebarComponent,
    UserManagementComponent
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
    UserManagementService,
    AuthGuard,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: JwtInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }