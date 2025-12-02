import { Component } from '@angular/core';
import { User } from '../../shared/model/user/user.type';
import { FormsModule, NgForm } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatButtonModule
  ],
  templateUrl: './login.html',
  styleUrl: './login.css'
})

export class Login {
  constructor(private auth: AuthService, private router: Router) {}

  model: User = {
    id: '',
    fullName: '',
    email: '',
    password: ''
  };

  submitted = false;

  onSubmit(f: NgForm): void {
    if (f.invalid) return;

    this.auth.login(this.model.email);

    this.submitted = true;
    console.log("Logged in as:", this.model.email);

    this.router.navigate(['/']);
  }
}


