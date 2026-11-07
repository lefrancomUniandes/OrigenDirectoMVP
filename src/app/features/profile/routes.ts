import { Routes } from '@angular/router';
import { ProfilePage } from './pages/profile-page';

export const routes: Routes = [{ path: ':id', component: ProfilePage }];
