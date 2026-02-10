// src/app/app-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { MapComponent } from './components/map/map.component';
import { LoginComponent } from './components/auth/login/login.component';
import { UserManagementComponent } from './components/admin/user-management/user-management.component';
import { UserDetailsComponent } from './components/admin/user-details/user-details.component';
import { SignalementManagementComponent } from './components/admin/signalement-management/signalement-management.component';
import { SignalementDetailComponent } from './components/signalement-detail/signalement-detail.component';
import { SignalementTableComponent } from './components/signalement-table/signalement-table.component';
import { AuthGuard } from './guards/auth.guard';

const routes: Routes = [
  { path: '', redirectTo: '/map', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { 
    path: 'map', 
    component: MapComponent,
    canActivate: [AuthGuard]
  },
  { 
    path: 'admin/users', 
    component: UserManagementComponent,
    canActivate: [AuthGuard]
  },
  { 
    path: 'admin/users/:id', 
    component: UserDetailsComponent,
    canActivate: [AuthGuard]
  },
  { 
    path: 'admin/signalements', 
    component: SignalementManagementComponent,
    canActivate: [AuthGuard]
  },
  { 
    path: 'signalement/:id', 
    component: SignalementDetailComponent,
    canActivate: [AuthGuard]
  },
  { 
    path: 'signalements', 
    component: SignalementTableComponent,
    canActivate: [AuthGuard]
  },
  { path: '**', redirectTo: '/map' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }