import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../service/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {

  router = inject(Router)
  auth = inject(AuthService)
  email: string = '';
  password: string = '';
  rememberMe: boolean = false;
  showPassword: boolean = false;
  isLoading: boolean = false;

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  onLogin() {
    // this.errorMsg = '';
    if (!this.email || !this.password) {
      // this.errorMsg = 'Please fill in all fields.'; return;
    }
    this.isLoading = true;
    setTimeout(() => {
      const result = this.auth.login(this.email, this.password);
      this.isLoading = false;
      if (result.success) {
        this.router.navigate(['/dashboard']);
      } else {
        // this.errorMsg = result.message;
      }
    }, 600);
  }

  loginWithGoogle(): void {
    console.log('Google login');
    // Implement Google OAuth
  }

  loginWithMicrosoft(): void {
    console.log('Microsoft login');
    // Implement Microsoft OAuth
  }
}