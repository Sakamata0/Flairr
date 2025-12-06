// src/app/core/auth/login.ts
import { Component } from '@angular/core';
import { User } from '../../shared/model/user/user.type';
import { FormsModule, NgForm } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { UserService } from '../../core/services/user.service';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    NgIf
  ],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  model: User = {
    id: '',
    fullName: '',
    email: '',
    password: ''
  };

  submitted = false;
  loading = false;
  errorMessage = '';

  constructor(
    private auth: AuthService,
    private userService: UserService,
    private router: Router
  ) {}

  async onSubmit(f: NgForm): Promise<void> {
    this.errorMessage = '';
    if (f.invalid) return;

    this.loading = true;
    try {
      // call AuthService.login(email, password)
      const res = await this.auth.login(this.model.email, this.model.password);

      // handle Supabase error
      if ((res as any).error) {
        // supabase-js v2 returns { error } or { error, data } depending
        const err = (res as any).error;
        this.errorMessage = err?.message ?? 'Login failed';
        this.loading = false;
        return;
      }

      // if sign-in returns a user object, use it; otherwise try to read from AuthService
      const uid = (res as any)?.data?.user?.id ?? this.auth.getUserId();

      if (!uid) {
        // could be email-confirmation flow (no session yet)
        this.errorMessage = 'Check your email to confirm your account (if confirmation is required).';
        this.loading = false;
        return;
      }

      // load profile from users table into the app state
      const { data, error } = await this.userService.loadUserById(uid);
      if (error) {
        console.warn('Could not load profile after login:', error);
        // still continue: user may not have a profile if you rely on a trigger or expect manual creation
      }

      this.submitted = true;
      this.router.navigate(['/']); // navigate to root (adjust if you want another route)
    } catch (err: any) {
      console.error('Unexpected login error', err);
      this.errorMessage = err?.message ?? 'Unexpected error during login';
    } finally {
      this.loading = false;
    }
  }
}
