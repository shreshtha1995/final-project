import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ThemeService } from './core/theme.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('CampusSync');
  private theme = inject(ThemeService);

  constructor() {
    this.theme.init();
    // Defeat the browser's back/forward cache (bfcache). When a page is restored
    // from bfcache, Angular does NOT re-run route guards, so a logged-out user
    // could otherwise still SEE a previously rendered authenticated page.
    // Forcing a fresh load makes the auth guard run again and redirect to /login.
    window.addEventListener('pageshow', (event: PageTransitionEvent) => {
      if (event.persisted) {
        window.location.reload();
      }
    });
  }
}
