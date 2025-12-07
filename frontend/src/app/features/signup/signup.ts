import { Component } from '@angular/core';
import { userSignUp } from '../../shared/model/user/usersignun.type';
import { FormsModule, NgForm } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { AuthService } from '../../core/auth/auth.service';
import { Router, RouterLink } from '@angular/router';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-signup',
  imports: [
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    NgIf,
    RouterLink
  ],
  templateUrl: './signup.html',
  styleUrl: './signup.css'
})

export class Signup {
  constructor(private auth: AuthService, private router: Router) {}

  model: userSignUp = {
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    country: '',
    birthdate: ''
  };
  showPassword = false;
  showConfirmPassword = false;
  checkPolicyTerms = false;
  errorMessage = '';

  onSubmit(f: NgForm): void {
    if (f.invalid || this.checkPasswordMissmatch() || !this.checkPolicyTerms) return;
    
    this.auth.signup(this.model.email, "hamma1212");
    this.router.navigate(['/']);
  }

  checkPasswordMissmatch() {
    return this.model.password.trim() != this.model.confirmPassword.trim();
  }
}