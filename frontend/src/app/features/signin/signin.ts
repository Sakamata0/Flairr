import { Component, OnInit } from '@angular/core';
import { userSignIn } from '../../shared/model/user/usersignin.type';
import { FormsModule, NgForm } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { UserService } from '../../core/services/user.service';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-signin',
  standalone: true,
  imports: [
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    NgIf,
    RouterLink
],
  templateUrl: './signin.html',
  styleUrl: './signin.css'
})
export class Signin{
  model: userSignIn = {
    email: '',
    password: '',
    rememberMe: false
  };

  showPassword = false;
  errorMessage = '';

  constructor(
    private auth: AuthService,
    private userService: UserService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  async onSubmit(f: NgForm): Promise<void> {
    this.errorMessage = '';
    if (f.invalid) return;

    try {
      // call AuthService.login(email, password)
      const res = await this.auth.login(this.model.email, this.model.password);


      // handle Supabase error
      if ((res as any).error) {
        // supabase-js v2 returns { error } or { error, data } depending
        const err = (res as any).error;
        if(err?.message == "Email not confirmed") {
          this.errorMessage = "Please verify your email inbox to verify it";
        }
        else {
          this.errorMessage = err?.message ?? 'Login failed';
        }
        
        return;
      }

      // if sign-in returns a user object, use it; otherwise try to read from AuthService
      const uid = (res as any)?.data?.user?.id ?? this.auth.getUserId();

      if (!uid) {
        // could be email-confirmation flow (no session yet)
        this.errorMessage = 'Check your email to confirm your account (if confirmation is required).';
        return;
      }

      // load profile from users table into the app state
      const { data, error } = await this.userService.loadUserById(uid);
      if (error) {
        console.warn('Could not load profile after login:', error);
        // still continue: user may not have a profile if you rely on a trigger or expect manual creation
      }

  // After sign-in, redirect back to the page the user originally requested (if provided)
  const redirectTo = this.route.snapshot.queryParamMap.get('redirectTo') || '/';
  this.router.navigateByUrl(redirectTo);
    } catch (err: any) {
      console.error('Unexpected login error', err);
      this.errorMessage = err?.message ?? 'Unexpected error during login';
    }
  }
}
