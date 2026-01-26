import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { AppComponent } from './app.component';
// import { MapComponent } from './map/map.component';
import { LoginComponent } from './components/auth/login/login.component';
// import { RegisterComponent } from './components/auth/register/register.component';
// import { ForgotPasswordComponent } from './components/auth/forgot-password/forgot-password.component';
// import { ProfileComponent } from './components/auth/profile/profile.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { UserManagementComponent } from './components/admin/user-management/user-management.component';
// import { DashboardComponent } from './components/admin/dashboard/dashboard.component';
// import { SignalementFormComponent } from './components/signalements/signalement-form/signalement-form.component';
// import { SignalementListComponent } from './components/signalements/signalement-list/signalement-list.component';
// import { SyncComponent } from './components/sync/sync.component';

import { AppRoutingModule } from './app-routing.module';

@NgModule({
  declarations: [
    AppComponent,
    // MapComponent,
    LoginComponent,
    // RegisterComponent,
    // ForgotPasswordComponent,
    // ProfileComponent,
    SidebarComponent,
    UserManagementComponent,
    // DashboardComponent,
    // SignalementFormComponent,
    // SignalementListComponent,
    // SyncComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }