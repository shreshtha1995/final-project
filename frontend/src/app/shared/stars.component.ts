import { Component, Input } from '@angular/core';
import { IconComponent } from './icon.component';

/** Renders a 1-5 star rating using SVG icons (filled vs outline). */
@Component({
  selector: 'app-stars',
  standalone: true,
  imports: [IconComponent],
  template: `
    @for (n of slots; track n) {
      <app-icon name="star" [filled]="n <= rating" [size]="size" />
    }
  `,
  styles: [`:host { display: inline-flex; gap: 2px; color: var(--accent); vertical-align: middle; }`]
})
export class StarsComponent {
  @Input() rating = 0;
  @Input() size = 16;
  slots = [1, 2, 3, 4, 5];
}
