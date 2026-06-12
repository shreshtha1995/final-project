import { Routes } from '@angular/router';
import { authGuard } from './core/auth.guard';
import { adminGuard } from './core/admin.guard';
import { ShellComponent } from './layout/shell.component';

export const routes: Routes = [
  // Public
  { path: '', pathMatch: 'full', loadComponent: () => import('./features/auth/landing.component').then((m) => m.LandingComponent) },
  { path: 'login', loadComponent: () => import('./features/auth/login.component').then((m) => m.LoginComponent) },
  { path: 'signup', loadComponent: () => import('./features/auth/signup.component').then((m) => m.SignupComponent) },

  // Authenticated app (inside the navbar shell)
  {
    path: '',
    component: ShellComponent,
    canActivate: [authGuard],
    children: [
      { path: 'dashboard', loadComponent: () => import('./features/home/home.component').then((m) => m.HomeComponent) },
      { path: 'browse', loadComponent: () => import('./features/browse/browse.component').then((m) => m.BrowseComponent) },
      { path: 'listing/:id', loadComponent: () => import('./features/browse/listing-detail.component').then((m) => m.ListingDetailComponent) },
      { path: 'create-listing', loadComponent: () => import('./features/list-room/create-listing.component').then((m) => m.CreateListingComponent) },
      { path: 'edit-listing/:id', loadComponent: () => import('./features/list-room/create-listing.component').then((m) => m.CreateListingComponent) },
      { path: 'my-listings', loadComponent: () => import('./features/my-collection/my-listings.component').then((m) => m.MyListingsComponent) },
      { path: 'wishlist', loadComponent: () => import('./features/my-collection/wishlist.component').then((m) => m.WishlistComponent) },
      { path: 'forum', loadComponent: () => import('./features/forum/forum.component').then((m) => m.ForumComponent) },
      { path: 'profile', loadComponent: () => import('./features/home/profile.component').then((m) => m.ProfileComponent) },
      { path: 'admin', canActivate: [adminGuard], loadComponent: () => import('./features/admin/admin.component').then((m) => m.AdminComponent) }
    ]
  },
  { path: '**', redirectTo: '' }
];
