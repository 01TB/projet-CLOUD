// src/app/app-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { MapComponent } from './components/map/map.component';
import { LoginComponent } from './components/auth/login/login.component';
import { UserManagementComponent } from './components/admin/user-management/user-management.component';
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
  { path: '**', redirectTo: '/map' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }