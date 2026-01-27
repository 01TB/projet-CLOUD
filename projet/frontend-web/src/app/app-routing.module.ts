import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
// import { AdminGuard } from './guards/admin.guard';

import { MapComponent } from './components/map/map.component';
import { LoginComponent } from './components/auth/login/login.component';
// import { RegisterComponent } from './components/auth/register/register.component';
// import { ForgotPasswordComponent } from './components/auth/forgot-password/forgot-password.component';
// import { ProfileComponent } from './components/auth/profile/profile.component';
import { UserManagementComponent } from './components/admin/user-management/user-management.component';
// import { DashboardComponent } from './components/admin/dashboard/dashboard.component';
// import { SignalementListComponent } from './components/signalements/signalement-list/signalement-list.component';
// import { SyncComponent } from './components/sync/sync.component';

const routes: Routes = [
  { path: '', redirectTo: '/map', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  // { path: 'register', component: RegisterComponent },
  // { path: 'forgot-password', component: ForgotPasswordComponent },
  
  // Routes protégées
  { 
    path: 'map', 
    component: MapComponent,
    canActivate: [AuthGuard]
  },
  // { 
  //   path: 'profile', 
  //   component: ProfileComponent,
  //   canActivate: [AuthGuard]
  // },
  // { 
  //   path: 'signalements', 
  //   component: SignalementListComponent,
  //   canActivate: [AuthGuard]
  // },
  
  // Routes admin
  { 
    path: 'admin/users', 
    component: UserManagementComponent,
    // canActivate: [AdminGuard]
  },
  // { 
  //   path: 'admin/dashboard', 
  //   component: DashboardComponent,
  //   // canActivate: [AdminGuard]
  // },
  // { 
  //   path: 'sync', 
  //   component: SyncComponent,
  //   canActivate: [AuthGuard]
  // },
  
  { path: '**', redirectTo: '/map' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }