import { Injectable, signal } from '@angular/core';

const KEY = 'campusSyncTheme';
type Theme = 'light' | 'dark';

/** Toggles light/dark mode by setting a class on <body>; remembers the choice. */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  readonly theme = signal<Theme>('light');

  init(): void {
    const saved = (localStorage.getItem(KEY) as Theme) || 'light';
    this.apply(saved);
  }

  toggle(): void {
    this.apply(this.theme() === 'dark' ? 'light' : 'dark');
  }

  private apply(theme: Theme): void {
    this.theme.set(theme);
    localStorage.setItem(KEY, theme);
    document.body.classList.toggle('dark', theme === 'dark');
  }
}
