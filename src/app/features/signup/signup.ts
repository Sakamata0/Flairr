import { Component } from '@angular/core';
import { User } from '../../shared/model/user/user.type';
import { FormsModule, NgForm } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { AuthService } from '../../core/auth/auth.service';
import { Router } from '@angular/router';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-signup',
  imports: [
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatButtonModule,
    NgIf
  ],
  templateUrl: './signup.html',
  styleUrl: './signup.css'
})

export class Signup {
  constructor(private auth: AuthService, private router: Router) {}

  model: User = {
    id: '',
    fullName: '',
    email: '',
    password: ''
  };

  c_password = '';
  passwordMismatch = false;
  submitted = false;

  checkPasswordMatch(): void {
    this.passwordMismatch = this.model.password !== this.c_password;
  }

  onSubmit(f: NgForm): void {
    if (f.invalid || this.passwordMismatch) return;

    this.auth.signup(this.model.email);

    this.submitted = true;
    console.log("Signed up:", this.model);

    this.router.navigate(['/']);
  }
}