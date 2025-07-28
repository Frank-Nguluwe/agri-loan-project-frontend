import { BaseApiService } from './base';
import { User } from './users';

export type UserRole = 'farmer' | 'loan_officer' | 'supervisor' | 'admin';

export interface LoginCredentials {
  email?: string;
  phone_number?: string;
  password: string;
}

export interface SignupData {
  email: string;
  phone_number: string;
  first_name: string;
  last_name: string;
  password: string;
  role: UserRole;
  district_id: string;
  national_id?: string;
  address?: string;
}

export interface PasswordResetRequest {
  identifier: string; // email or phone number
}

export interface PasswordResetConfirm {
  token: string;
  new_password: string;
}

export interface VerifyOtpData {
  otp: string;
  new_password: string;
}

export class AuthService extends BaseApiService {
  async login(credentials: LoginCredentials): Promise<{ access_token: string }> {
    const response = await this.makeRequest<{ access_token: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.access_token) {
      throw new Error('No access token received');
    }
    
    localStorage.setItem('access_token', response.access_token);
    return response;
  }

  async signup(data: SignupData): Promise<User> {
    return this.makeRequest<User>('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  async passwordReset(data: PasswordResetRequest): Promise<void> {
    return this.makeRequest('/api/auth/password-reset', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  async verifyOtp(data: VerifyOtpData): Promise<void> {
    return this.makeRequest('/api/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  async getDashboardInfo(): Promise<User> {
    return this.makeRequest<User>('/api/auth/me', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
      },
    });
  }

  logout(): void {
    localStorage.removeItem('access_token');
  }
}

export const authService = new AuthService();