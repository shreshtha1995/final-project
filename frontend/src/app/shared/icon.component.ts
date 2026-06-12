import { Component, Input } from '@angular/core';

/**
 * Reusable inline-SVG icon. Stroke uses currentColor so icons adapt to text colour
 * and dark/light themes. Usage: <app-icon name="search" [size]="18" />
 */
@Component({
  selector: 'app-icon',
  standalone: true,
  template: `
    <svg [attr.width]="size" [attr.height]="size" viewBox="0 0 24 24"
         [attr.fill]="(name === 'star' || name === 'heart') && filled ? 'currentColor' : 'none'"
         stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="ico">
      @switch (name) {
        @case ('search') { <circle cx="11" cy="11" r="7"/><line x1="16.5" y1="16.5" x2="21" y2="21"/> }
        @case ('home') { <path d="M4 11 12 4l8 7"/><path d="M6 9.5V20h12V9.5"/> }
        @case ('list') { <rect x="5" y="4" width="14" height="17" rx="2"/><line x1="8" y1="9" x2="16" y2="9"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="13" y2="17"/> }
        @case ('chat') { <path d="M5 5h14a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H9l-4 4V6a1 1 0 0 1 1-1z"/> }
        @case ('shield') { <path d="M12 3l7 3v5c0 4.5-3 7.5-7 8.5-4-1-7-4-7-8.5V6l7-3z"/> }
        @case ('match') { <path d="M4 5h16l-6 7v5l-4 2v-7L4 5z"/> }
        @case ('moon') { <path d="M20 13A7.5 7.5 0 1 1 11 4a6 6 0 0 0 9 9z"/> }
        @case ('sun') {
          <circle cx="12" cy="12" r="4"/>
          <line x1="12" y1="2" x2="12" y2="4"/><line x1="12" y1="20" x2="12" y2="22"/>
          <line x1="2" y1="12" x2="4" y2="12"/><line x1="20" y1="12" x2="22" y2="12"/>
          <line x1="4.2" y1="4.2" x2="5.6" y2="5.6"/><line x1="18.4" y1="18.4" x2="19.8" y2="19.8"/>
          <line x1="19.8" y1="4.2" x2="18.4" y2="5.6"/><line x1="5.6" y1="18.4" x2="4.2" y2="19.8"/>
        }
        @case ('user') { <circle cx="12" cy="8" r="4"/><path d="M5 20c0-3.9 3.1-6 7-6s7 2.1 7 6"/> }
        @case ('logout') { <path d="M14 4h4a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-4"/><line x1="4" y1="12" x2="15" y2="12"/><polyline points="11 8 15 12 11 16"/> }
        @case ('edit') { <path d="M4 20h4L19 9l-4-4L4 16z"/><line x1="13" y1="6" x2="17" y2="10"/> }
        @case ('trash') { <line x1="4" y1="7" x2="20" y2="7"/><path d="M9 7V4h6v3"/><path d="M6 7l1 13h10l1-13"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/> }
        @case ('camera') { <rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7l2-3h4l2 3"/><circle cx="12" cy="13" r="3.4"/> }
        @case ('bed') { <path d="M2 10v10"/><path d="M2 14h20v6"/><line x1="2" y1="20" x2="22" y2="20"/><path d="M6 14v-3h6v3"/> }
        @case ('phone') { <path d="M6 4h3l1.5 4-2 1.5a11 11 0 0 0 5 5l1.5-2 4 1.5V21a1 1 0 0 1-1 1A17 17 0 0 1 5 5a1 1 0 0 1 1-1z"/> }
        @case ('check') { <polyline points="5 12 10 17 19 7"/> }
        @case ('check-circle') { <circle cx="12" cy="12" r="9"/><polyline points="8 12 11 15 16 9"/> }
        @case ('plus') { <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/> }
        @case ('pin') { <path d="M12 21s7-6.5 7-11A7 7 0 1 0 5 10c0 4.5 7 11 7 11z"/><circle cx="12" cy="10" r="2.5"/> }
        @case ('arrow-right') { <line x1="4" y1="12" x2="19" y2="12"/><polyline points="13 6 19 12 13 18"/> }
        @case ('refresh') { <path d="M20 11a8 8 0 0 0-14-4.5L4 8"/><polyline points="4 4 4 8 8 8"/><path d="M4 13a8 8 0 0 0 14 4.5L20 16"/><polyline points="20 20 20 16 16 16"/> }
        @case ('clock') { <circle cx="12" cy="12" r="8"/><polyline points="12 8 12 12 15 14"/> }
        @case ('chevron-down') { <polyline points="6 9 12 15 18 9"/> }
        @case ('chevron-up') { <polyline points="6 15 12 9 18 15"/> }
        @case ('close') { <line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/> }
        @case ('briefcase') { <rect x="3" y="8" width="18" height="12" rx="2"/><path d="M8 8V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="3" y1="13" x2="21" y2="13"/> }
        @case ('cap') { <path d="M3 9l9-4 9 4-9 4-9-4z"/><path d="M7 11v4c0 1 2.4 2 5 2s5-1 5-2v-4"/> }
        @case ('help') { <circle cx="12" cy="12" r="9"/><path d="M9.6 9.2a2.4 2.4 0 1 1 3.4 2.2c-.8.4-1 .9-1 1.6"/><line x1="12" y1="16.5" x2="12" y2="16.7"/> }
        @case ('heart') { <path d="M12 20.5l-1.3-1.2C6 14.9 3 12.1 3 8.8 3 6.2 5 4.2 7.5 4.2c1.5 0 3 .8 3.8 2 .8-1.2 2.3-2 3.8-2C18.6 4.2 21 6.2 21 8.8c0 3.3-3 6.1-7.7 10.5L12 20.5z"/> }
        @case ('star') { <polygon points="12 3 14.6 8.6 21 9.3 16.4 13.6 17.7 20 12 16.8 6.3 20 7.6 13.6 3 9.3 9.4 8.6"/> }
        @case ('star-half') { <polygon points="12 3 14.6 8.6 21 9.3 16.4 13.6 17.7 20 12 16.8 6.3 20 7.6 13.6 3 9.3 9.4 8.6"/> }
        @default { <circle cx="12" cy="12" r="9"/> }
      }
    </svg>
  `,
  styles: [`.ico { display: inline-block; vertical-align: middle; flex: 0 0 auto; }`]
})
export class IconComponent {
  @Input() name = '';
  @Input() size = 20;
  @Input() filled = false;
}
