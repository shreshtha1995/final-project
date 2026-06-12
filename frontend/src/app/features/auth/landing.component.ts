import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { ThemeService } from '../../core/theme.service';
import { IconComponent } from '../../shared/icon.component';
import { StarsComponent } from '../../shared/stars.component';

/** Public marketing/intro page shown when the site first opens (before login). */
@Component({
  selector: 'app-landing',
  imports: [IconComponent, StarsComponent],
  template: `
    <header class="landing-nav">
      <span class="brand-lg">CampusSync</span>
      <div class="nav-actions">
        <button class="icon-btn theme-toggle" (click)="theme.toggle()" [title]="theme.theme() === 'dark' ? 'Light mode' : 'Dark mode'">
          <app-icon [name]="theme.theme() === 'dark' ? 'sun' : 'moon'" [size]="19" />
        </button>
        <button class="ghost" (click)="go('/login')">Sign in</button>
        <button class="solid" (click)="start()">Get Started</button>
      </div>
    </header>

    <section class="landing-hero">
      <div class="blob b1"></div><div class="blob b2"></div><div class="blob b3"></div>

      <div class="hero-text">
        <div class="badge-pill"><app-icon name="shield" [size]="15" /> Verified colleagues only</div>
        <h1>Find a safe place to stay,<br/><span class="grad-word">with people you trust.</span></h1>
        <p>
          Relocating for work? CampusSync is a private, verified co-living platform exclusively for
          Cognizant employees and new joinees — every flatmate is a genuine colleague, every review is real.
        </p>
        <div class="hero-cta">
          <button class="solid big" (click)="start()">Get Started <app-icon name="arrow-right" [size]="18" /></button>
          <button class="ghost big" (click)="go('/login')">I have an account</button>
        </div>
        <div class="trust">
          <span><app-icon name="check-circle" [size]="16" /> ID-verified</span>
          <span><app-icon name="check-circle" [size]="16" /> Real reviews</span>
          <span><app-icon name="check-circle" [size]="16" /> Free to use</span>
        </div>
      </div>

      <div class="hero-visual">
        <div class="mock-card">
          <div class="mock-img"><span class="mock-vac">2/3 beds free</span></div>
          <div class="mock-body">
            <div class="mock-title">Lake View PG</div>
            <div class="mock-loc"><app-icon name="pin" [size]="13" /> Chennai · Siruseri</div>
            <div class="mock-row">
              <span class="mock-rent">₹8,500<small>/mo</small></span>
              <app-stars [rating]="4" [size]="15" />
            </div>
          </div>
        </div>
        <div class="mock-chip chip-1"><app-icon name="shield" [size]="16" /> Verified provider</div>
        <div class="mock-chip chip-2"><app-icon name="chat" [size]="16" /> 12 replies</div>
      </div>
    </section>

    <section class="how container">
      <h2 class="center sec-title">How CampusSync helps you</h2>
      <div class="grid home">
        <div class="card feat"><div class="feature-icon"><app-icon name="shield" [size]="30" /></div><h3>Verified at the door</h3>
          <p class="muted">Sign-up works only with a valid Cognizant ID. No strangers — ever.</p></div>
        <div class="card feat"><div class="feature-icon"><app-icon name="home" [size]="30" /></div><h3>Real rooms, real reviews</h3>
          <p class="muted">Listings carry food &amp; service ratings from colleagues who lived there.</p></div>
        <div class="card feat"><div class="feature-icon"><app-icon name="match" [size]="30" /></div><h3>Smart, safe matching</h3>
          <p class="muted">You only ever see rooms shared by same-gender colleagues near your office.</p></div>
        <div class="card feat"><div class="feature-icon"><app-icon name="chat" [size]="30" /></div><h3>Peer community</h3>
          <p class="muted">Ask about cities, transport &amp; PGs and get answers before Day 1.</p></div>
      </div>
    </section>

    <section class="steps-band container">
      <h2 class="center sec-title">Up and running in 3 steps</h2>
      <div class="grid" style="grid-template-columns:repeat(3,1fr)">
        <div class="card feat center"><div class="step-num">1</div><strong>Verify your ID</strong>
          <p class="muted">Confirm you're a Cognizant employee or new joinee.</p></div>
        <div class="card feat center"><div class="step-num">2</div><strong>Browse or list</strong>
          <p class="muted">Find a vacant bed near your office, or offer yours.</p></div>
        <div class="card feat center"><div class="step-num">3</div><strong>Connect offline</strong>
          <p class="muted">Get the provider's number and finalise with confidence.</p></div>
      </div>
      <div class="center" style="margin-top:28px">
        <button class="gradient big" (click)="start()">Get Started <app-icon name="arrow-right" [size]="18" /></button>
      </div>
    </section>

    <footer class="landing-foot">CampusSync · Verified Co-living &amp; Accommodation for Employees</footer>
  `,
  styles: [`
    :host { display: block; }
    .landing-nav { display: flex; justify-content: space-between; align-items: center; padding: 18px 40px; }
    .brand-lg { font-size: 24px; font-weight: 800; background: var(--grad-text); -webkit-background-clip: text; background-clip: text; color: transparent; }
    .nav-actions { display: flex; gap: 10px; align-items: center; }
    .nav-actions .ghost { color: var(--brand); border: 1.5px solid var(--brand); background: transparent; }
    .nav-actions .ghost:hover { background: var(--brand-soft); box-shadow: none; }
    .nav-actions .solid { background: var(--grad-vivid); color: #fff; }

    .landing-hero {
      position: relative; overflow: hidden; display: grid; grid-template-columns: 1.05fr .95fr; gap: 32px; align-items: center;
      margin: 12px 24px 0; padding: 56px 44px; border-radius: 28px; background: var(--grad-vivid);
      background-size: 200% 200%; animation: gradientShift 11s ease-in-out infinite alternate; color: #fff;
      box-shadow: 0 30px 90px rgba(124, 58, 237, .38), 0 12px 44px rgba(14, 165, 233, .26);
    }
    .blob { position: absolute; border-radius: 50%; filter: blur(60px); opacity: .55; pointer-events: none; }
    .b1 { width: 320px; height: 320px; background: #22d3ee; top: -120px; right: 18%; }
    .b2 { width: 280px; height: 280px; background: #6366f1; bottom: -130px; left: -40px; }
    .b3 { width: 200px; height: 200px; background: #f472b6; top: 30%; right: -60px; opacity: .4; }

    .hero-text { position: relative; z-index: 2; animation: fadeUp .5s ease both; }
    .badge-pill { display: inline-flex; align-items: center; gap: 7px; background: rgba(255,255,255,.18); padding: 7px 15px; border-radius: 999px; font-weight: 600; font-size: 13.5px; backdrop-filter: blur(4px); }
    .hero-text h1 { color: #fff; font-size: 46px; line-height: 1.12; margin: 18px 0; letter-spacing: -.03em; }
    .grad-word { background: linear-gradient(90deg, #fde68a, #fca5a5); -webkit-background-clip: text; background-clip: text; color: transparent; }
    .hero-text p { max-width: 540px; font-size: 16.5px; opacity: .95; }
    .hero-cta { margin-top: 26px; display: flex; gap: 14px; flex-wrap: wrap; }
    button.big { padding: 14px 26px; font-size: 16px; display: inline-flex; align-items: center; gap: 8px; }
    .solid { background: #fff; color: var(--brand-dark); }
    .ghost { background: transparent; color: #fff; border: 1.5px solid rgba(255,255,255,.7); }
    .ghost:hover { background: rgba(255,255,255,.16); box-shadow: none; }
    .trust { display: flex; gap: 18px; flex-wrap: wrap; margin-top: 22px; font-size: 13.5px; opacity: .92; }
    .trust span { display: inline-flex; align-items: center; gap: 6px; }

    .hero-visual { position: relative; z-index: 2; height: 340px; animation: fadeUp .7s ease both; }
    .mock-card { position: absolute; top: 30px; left: 50%; transform: translateX(-50%); width: 280px;
      background: var(--card); color: var(--text); border-radius: 18px; box-shadow: 0 24px 60px rgba(0,0,0,.3); overflow: hidden; animation: floaty 6s ease-in-out infinite; }
    .mock-img { height: 130px; background: linear-gradient(135deg,#7c3aed,#0ea5e9); position: relative; }
    .mock-vac { position: absolute; top: 10px; right: 10px; background: var(--success); color: #fff; font-size: 11px; font-weight: 700; padding: 4px 9px; border-radius: 999px; }
    .mock-body { padding: 14px 16px; }
    .mock-title { font-weight: 800; font-size: 17px; }
    .mock-loc { display: inline-flex; align-items: center; gap: 4px; color: var(--muted); font-size: 12.5px; margin: 4px 0 10px; }
    .mock-row { display: flex; justify-content: space-between; align-items: center; }
    .mock-rent { color: var(--brand); font-weight: 800; font-size: 18px; }
    .mock-rent small { color: var(--muted); font-weight: 600; }
    .mock-chip { position: absolute; background: var(--card); color: var(--text); border-radius: 12px; padding: 9px 13px; font-weight: 700; font-size: 13px; box-shadow: 0 12px 30px rgba(0,0,0,.25); display: inline-flex; align-items: center; gap: 7px; }
    .mock-chip app-icon { color: var(--brand); }
    .chip-1 { top: 0; left: 4%; animation: floaty 5s ease-in-out infinite; }
    .chip-2 { bottom: 10px; right: 2%; animation: floaty 7s ease-in-out infinite; }

    .sec-title { font-size: 30px; margin-bottom: 26px; }
    .how { padding-top: 56px; } .steps-band { padding-bottom: 40px; }
    .how .grid { grid-template-columns: repeat(4, 1fr); }
    @media (max-width: 980px) { .how .grid { grid-template-columns: repeat(2, 1fr); } }
    @media (max-width: 560px) { .how .grid { grid-template-columns: 1fr; } }
    .feat { padding: 28px 24px; }
    .feat:hover { transform: translateY(-6px); box-shadow: var(--shadow); }
    .step-num { width: 48px; height: 48px; border-radius: 50%; background: var(--grad-vivid); color: #fff; font-weight: 800;
      display: flex; align-items: center; justify-content: center; font-size: 20px; margin: 0 auto 14px; box-shadow: var(--glow); }
    .steps-band strong { display: block; font-size: 17px; }
    .theme-toggle { color: var(--text); border: 1px solid var(--border); }
    .landing-foot { text-align: center; padding: 30px; color: var(--muted); border-top: 1px solid var(--border); margin-top: 30px; }

    @media (max-width: 860px) {
      .landing-hero { grid-template-columns: 1fr; padding: 36px 24px; }
      .hero-visual { height: 300px; order: -1; }
      .hero-text h1 { font-size: 34px; }
      .landing-nav { padding: 16px 18px; }
      .grid[style] { grid-template-columns: 1fr !important; }
    }
  `]
})
export class LandingComponent {
  private auth = inject(AuthService);
  private router = inject(Router);
  theme = inject(ThemeService);

  go(path: string): void { this.router.navigateByUrl(path); }
  start(): void { this.router.navigateByUrl(this.auth.isLoggedIn() ? '/dashboard' : '/signup'); }
}
