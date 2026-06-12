import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { Gender, IdType, SignupRequest } from '../../models/models';
import { IconComponent } from '../../shared/icon.component';

/**
 * Three-step onboarding:
 *  1 - choose role (Employee / New Joinee)
 *  2 - verify the Cognizant ID (must match the chosen role)
 *  3 - profile details, with inline validation
 */
@Component({
  selector: 'app-signup',
  imports: [FormsModule, RouterLink, IconComponent],
  template: `
    <div class="auth-wrap">
      <div class="card auth-card">
        <div class="auth-logo">Create your account</div>

        <div class="steps">
          <span class="step-dot" [class.active]="step() >= 1"></span>
          <span class="step-dot" [class.active]="step() >= 2"></span>
          <span class="step-dot" [class.active]="step() >= 3"></span>
        </div>

        @if (step() === 1) {
          <p class="muted">Step 1 — Are you a current employee or a new joinee?</p>
          <div class="choices">
            <div class="choice" [class.selected]="role() === 'EMPLOYEE'" (click)="role.set('EMPLOYEE')">
              <div class="ic"><app-icon name="briefcase" [size]="30" /></div><div class="t">Current Employee</div>
              <div class="muted">I already work at Cognizant</div>
            </div>
            <div class="choice" [class.selected]="role() === 'CANDIDATE'" (click)="role.set('CANDIDATE')">
              <div class="ic"><app-icon name="cap" [size]="30" /></div><div class="t">New Joinee</div>
              <div class="muted">I have an offer / candidate ID</div>
            </div>
          </div>
          <button class="full-width gradient" style="margin-top:18px" [disabled]="!role()" (click)="step.set(2)">Continue</button>

        } @else if (step() === 2) {
          <p class="muted">Step 2 — Verify your {{ role() === 'EMPLOYEE' ? 'Employee' : 'Candidate' }} ID.</p>
          <label class="req">{{ role() === 'EMPLOYEE' ? 'Employee' : 'Candidate' }} ID</label>
          <input [(ngModel)]="cognizantId" [placeholder]="role() === 'EMPLOYEE' ? 'Enter your CTS ID' : 'Enter your candidate ID'" (keyup.enter)="verify()" />
          <button class="full-width gradient" style="margin-top:16px" [disabled]="loading()" (click)="verify()">
            {{ loading() ? 'Verifying...' : 'Verify ID' }}
          </button>
          <button class="link" style="margin-top:12px" (click)="step.set(1)">← Back</button>

        } @else {
          <p class="success">✓ ID {{ cognizantId }} verified. Step 3 — your details.</p>

          <label class="req">Full name</label>
          <input [(ngModel)]="name" #nameRef="ngModel" name="name" required [class.invalid]="nameRef.invalid && nameRef.touched" />
          @if (nameRef.invalid && nameRef.touched) { <div class="field-error">Name is required.</div> }

          <label class="req">Email</label>
          <input type="email" [(ngModel)]="email" #emailRef="ngModel" name="email" required email
                 placeholder="you@cognizant.com" [class.invalid]="emailRef.invalid && emailRef.touched" />
          @if (emailRef.invalid && emailRef.touched) { <div class="field-error">Enter a valid email.</div> }

          <label class="req">Phone number</label>
          <input [(ngModel)]="phoneNumber" #phoneRef="ngModel" name="phone" required pattern="\\d{10}"
                 maxlength="10" placeholder="10 digits" [class.invalid]="phoneRef.invalid && phoneRef.touched" />
          @if (phoneRef.invalid && phoneRef.touched) { <div class="field-error">Phone must be exactly 10 digits.</div> }

          <label class="req">Gender</label>
          <select [(ngModel)]="gender" name="gender">
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
          </select>

          <label class="req">Password</label>
          <input type="password" [(ngModel)]="password" #pwdRef="ngModel" name="pwd" required minlength="6"
                 pattern="\\S+" [class.invalid]="pwdRef.invalid && pwdRef.touched" />
          @if (pwdRef.touched && pwdRef.errors?.['required']) { <div class="field-error">Password is required.</div> }
          @else if (pwdRef.touched && pwdRef.errors?.['minlength']) { <div class="field-error">At least 6 characters.</div> }
          @else if (pwdRef.touched && pwdRef.errors?.['pattern']) { <div class="field-error">Password cannot contain spaces.</div> }

          <label class="req">Confirm password</label>
          <input type="password" [(ngModel)]="confirmPassword" #cpwdRef="ngModel" name="cpwd" required
                 [class.invalid]="cpwdRef.touched && confirmPassword !== password" />
          @if (cpwdRef.touched && confirmPassword !== password) { <div class="field-error">Passwords do not match.</div> }

          <button class="full-width gradient" style="margin-top:18px" [disabled]="loading()" (click)="register()">
            {{ loading() ? 'Creating account...' : 'Create account' }}
          </button>
        }

        @if (error()) { <p class="error">{{ error() }}</p> }
        <p class="muted" style="margin-top:18px">Already have an account? <a routerLink="/login">Sign in</a></p>
        <p class="center" style="margin-top:6px"><a routerLink="/">← Back to home</a></p>
      </div>
    </div>
  `
})
export class SignupComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  step = signal(1);
  role = signal<IdType | null>(null);
  loading = signal(false);
  error = signal('');

  cognizantId = '';
  name = '';
  email = '';
  phoneNumber = '';
  gender: Gender = 'MALE';
  password = '';
  confirmPassword = '';

  verify(): void {
    this.error.set('');
    if (!this.cognizantId.trim()) { this.error.set('Please enter your ID.'); return; }
    this.loading.set(true);
    this.auth.verifyId(this.cognizantId.trim()).subscribe({
      next: (res) => {
        this.loading.set(false);
        if (res.idType !== this.role()) {
          this.error.set(`This ID is registered as a ${res.idType === 'EMPLOYEE' ? 'current employee' : 'new joinee'} ID. Go back and pick the correct option.`);
          return;
        }
        this.step.set(3);
      },
      error: (err) => { this.error.set(err?.error?.message ?? 'ID verification failed.'); this.loading.set(false); }
    });
  }

  register(): void {
    this.error.set('');
    if (!this.formValid()) {
      this.error.set('Please fix the highlighted fields before submitting.');
      return;
    }
    const request: SignupRequest = {
      cognizantId: this.cognizantId.trim(),
      name: this.name.trim(),
      email: this.email.trim(),
      phoneNumber: this.phoneNumber.trim(),
      gender: this.gender,
      password: this.password
    };
    this.loading.set(true);
    this.auth.signup(request).subscribe({
      next: () => this.router.navigateByUrl('/dashboard'),
      error: (err) => { this.error.set(this.readError(err)); this.loading.set(false); }
    });
  }

  private formValid(): boolean {
    const phoneOk = /^\d{10}$/.test(this.phoneNumber.trim());
    const emailOk = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(this.email.trim());
    const pwdOk = this.password.length >= 6 && !/\s/.test(this.password);
    return !!this.name.trim() && emailOk && phoneOk && pwdOk && this.password === this.confirmPassword;
  }

  private readError(err: any): string {
    if (err?.error?.fieldErrors) return Object.values(err.error.fieldErrors).join(' ');
    return err?.error?.message ?? 'Sign-up failed.';
  }
}
