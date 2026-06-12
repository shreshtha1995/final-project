import { Routes } from '@angular/router';
import { authGuard } from './core/auth.guard';
import { adminGuard } from './core/admin.guard';
import { ShellComponent } from './pages/shell/shell.component';

export const routes: Routes = [
  // Public
  { path: '', pathMatch: 'full', loadComponent: () => import('./pages/landing/landing.component').then((m) => m.LandingComponent) },
  { path: 'login', loadComponent: () => import('./pages/login/login.component').then((m) => m.LoginComponent) },
  { path: 'signup', loadComponent: () => import('./pages/signup/signup.component').then((m) => m.SignupComponent) },

  // Authenticated app (inside the navbar shell)
  {
    path: '',
    component: ShellComponent,
    canActivate: [authGuard],
    children: [
      { path: 'dashboard', loadComponent: () => import('./pages/home/home.component').then((m) => m.HomeComponent) },
      { path: 'browse', loadComponent: () => import('./pages/browse/browse.component').then((m) => m.BrowseComponent) },
      { path: 'listing/:id', loadComponent: () => import('./pages/listing-detail/listing-detail.component').then((m) => m.ListingDetailComponent) },
      { path: 'create-listing', loadComponent: () => import('./pages/create-listing/create-listing.component').then((m) => m.CreateListingComponent) },
      { path: 'edit-listing/:id', loadComponent: () => import('./pages/create-listing/create-listing.component').then((m) => m.CreateListingComponent) },
      { path: 'my-listings', loadComponent: () => import('./pages/my-listings/my-listings.component').then((m) => m.MyListingsComponent) },
      { path: 'wishlist', loadComponent: () => import('./pages/wishlist/wishlist.component').then((m) => m.WishlistComponent) },
      { path: 'forum', loadComponent: () => import('./pages/forum/forum.component').then((m) => m.ForumComponent) },
      { path: 'profile', loadComponent: () => import('./pages/profile/profile.component').then((m) => m.ProfileComponent) },
      { path: 'admin', canActivate: [adminGuard], loadComponent: () => import('./pages/admin/admin.component').then((m) => m.AdminComponent) }
    ]
  },
  { path: '**', redirectTo: '' }
];
