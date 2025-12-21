import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { userSignUp } from '../../shared/model/user/usersignun.type';
import { EmailConfirmationDialog } from '../../shared/components/email-confirmation-dialog/email-confirmation-dialog';
import { FeatureComingSoonDialog } from '../../shared/components/feature-coming-soon-dialog/feature-coming-soon-dialog';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, EmailConfirmationDialog, FeatureComingSoonDialog],
  templateUrl: './signup.html',
  styleUrls: ['./signup.css']
})
export class Signup {
  model: userSignUp = {
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    country: '',
    birthdate: ''
  };
  checkPolicyTerms = false;
  errorMessage = '';

  countries: string[] = ["Afghanistan","Albania","Algeria","Andorra","Angola","Antigua and Barbuda","Argentina","Armenia","Australia","Austria","Azerbaijan","Bahamas","Bahrain","Bangladesh","Barbados","Belarus","Belgium","Belize","Benin","Bhutan","Bolivia","Bosnia and Herzegovina","Botswana","Brazil","Brunei","Bulgaria","Burkina Faso","Burundi","Cabo Verde","Cambodia","Cameroon","Canada","Central African Republic","Chad","Chile","China","Colombia","Comoros","Congo","Costa Rica","Croatia","Cuba","Cyprus","Czech Republic","Denmark","Djibouti","Dominica","Dominican Republic","Ecuador","Egypt","El Salvador","Equatorial Guinea","Eritrea","Estonia","Eswatini","Ethiopia","Fiji","Finland","France","Gabon","Gambia","Georgia","Germany","Ghana","Greece","Grenada","Guatemala","Guinea","Guinea-Bissau","Guyana","Haiti","Honduras","Hungary","Iceland","India","Indonesia","Iran","Iraq","Ireland","Israel","Italy","Jamaica","Japan","Jordan","Kazakhstan","Kenya","Kiribati","Kuwait","Kyrgyzstan","Laos","Latvia","Lebanon","Lesotho","Liberia","Libya","Liechtenstein","Lithuania","Luxembourg","Madagascar","Malawi","Malaysia","Maldives","Mali","Malta","Marshall Islands","Mauritania","Mauritius","Mexico","Micronesia","Moldova","Monaco","Mongolia","Montenegro","Morocco","Mozambique","Myanmar","Namibia","Nauru","Nepal","Netherlands","New Zealand","Nicaragua","Niger","Nigeria","North Korea","North Macedonia","Norway","Oman","Pakistan","Palau","Panama","Papua New Guinea","Paraguay","Peru","Philippines","Poland","Portugal","Qatar","Romania","Russia","Rwanda","Saint Kitts and Nevis","Saint Lucia","Saint Vincent and the Grenadines","Samoa","San Marino","Sao Tome and Principe","Saudi Arabia","Senegal","Serbia","Seychelles","Sierra Leone","Singapore","Slovakia","Slovenia","Solomon Islands","Somalia","South Africa","South Korea","South Sudan","Spain","Sri Lanka","Sudan","Suriname","Sweden","Switzerland","Syria","Taiwan","Tajikistan","Tanzania","Thailand","Timor-Leste","Togo","Tonga","Trinidad and Tobago","Tunisia","Turkey","Turkmenistan","Tuvalu","Uganda","Ukraine","United Arab Emirates","United Kingdom","United States","Uruguay","Uzbekistan","Vanuatu","Vatican City","Venezuela","Vietnam","Yemen","Zambia","Zimbabwe"];

  // UI state
  showPassword = false;
  showConfirmPassword = false;
  isLoading = false;
  successMessage: string | null = null;

  // Email confirmation dialog state
  showEmailConfirmDialog = false;
  registeredEmail = '';

  // Feature coming soon dialog state
  showFeatureDialog = false;

  constructor(
    private auth: AuthService, 
    private router: Router
  ) {}

  checkPasswordMismatch(): boolean {
    return this.model.password !== '' && 
           this.model.confirmPassword !== '' && 
           this.model.password !== this.model.confirmPassword;
  }

  validateForm(): string | null {
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.model.email)) {
      return 'Please enter a valid email address';
    }

    // Password strength validation
    if (this.model.password.length < 6) {
      return 'Password must be at least 6 characters';
    }

    // Password match validation
    if (this.model.password !== this.model.confirmPassword) {
      return 'Passwords do not match';
    }

    // Name validation
    if (this.model.fullName.trim().length < 2) {
      return 'First name must be at least 2 characters';
    }

    // Terms acceptance
    if (!this.checkPolicyTerms) {
      return 'You must accept the Terms of Service and Privacy Policy';
    }

    return '';
  }

  async onSubmit(f: any) {
    // Reset messages
    this.errorMessage = '';
    this.successMessage = null;

    // Basic form validation
    if (f.invalid) {
      this.errorMessage = 'Please fill all required fields correctly';
      return;
    }

    // Custom validation
    const validationError = this.validateForm();
    if (validationError) {
      this.errorMessage = validationError;
      return;
    }

    try {
      this.isLoading = true;
      this.errorMessage = '';

      console.log('📝 Submitting signup with data:', {
        email: this.model.email,
        full_name: this.model.fullName
      });

      const { data, error } = await this.auth.signupWithProfile({
        email: this.model.email.trim(),
        password: this.model.password,
        full_name: this.model.fullName.trim(),
        country: this.model.country,
        birthdate: this.model.birthdate
      });

      if (error) {
        throw new Error(error.message);
      }

      console.log('✅ Signup successful!', data);
      
      // Store email and show confirmation dialog
      this.registeredEmail = this.model.email.trim();
      this.showEmailConfirmDialog = true;
      this.isLoading = false;
      
    } catch (err: any) {
      console.error('❌ Signup error:', err);
      
      // Handle specific error types
      if (err.message?.includes('already registered') || err.message?.includes('User already registered')) {
        this.errorMessage = 'This email is already registered. Please login instead.';
      } else if (err.message?.includes('Invalid email')) {
        this.errorMessage = 'Please enter a valid email address';
      } else if (err.message?.includes('Password')) {
        this.errorMessage = 'Password must be at least 6 characters';
      } else if (err.message?.includes('network') || err.message?.includes('fetch')) {
        this.errorMessage = 'Network error. Please check your connection and try again.';
      } else {
        this.errorMessage = 'Signup failed. Please try again.';
      }
      
      this.isLoading = false;
    }
  }

  onEmailConfirmClose() {
    this.showEmailConfirmDialog = false;
    // Redirect to login page
    this.router.navigate(['/signin']);
  }

  // Show feature coming soon dialog
  onSocialLogin() {
    this.showFeatureDialog = true;
  }

  onFeatureDialogClose() {
    this.showFeatureDialog = false;
  }

  getPasswordStrength(): 'weak' | 'medium' | 'strong' {
    if (this.model.password.length === 0) return 'weak';
    if (this.model.password.length < 6) return 'weak';
    if (this.model.password.length < 10) return 'medium';
    
    // Check for complexity
    const hasUpperCase = /[A-Z]/.test(this.model.password);
    const hasLowerCase = /[a-z]/.test(this.model.password);
    const hasNumbers = /\d/.test(this.model.password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(this.model.password);
    
    const complexityScore = [hasUpperCase, hasLowerCase, hasNumbers, hasSpecialChar]
      .filter(Boolean).length;
    
    if (complexityScore >= 3) return 'strong';
    if (complexityScore >= 2) return 'medium';
    return 'weak';
  }

  checkPasswordMissmatch() {
    return this.model.password.trim() != this.model.confirmPassword.trim();
  }
}