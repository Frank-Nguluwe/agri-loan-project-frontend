// src/services/auth.ts
import { BaseApiService } from './base';

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
  role: 'farmer' | 'loan_officer' | 'supervisor' | 'admin';
  district_id: string;
  national_id?: string;
  address?: string;
}

export class AuthService extends BaseApiService {
  async login(credentials: LoginCredentials) {
    const response = await this.makeRequest<{ access_token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    this.setToken(response.access_token);
    return response;
  }

  async signup(data: SignupData) {
    return this.makeRequest('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getDashboardInfo() {
    return this.makeRequest('/auth/me', { method: 'GET' });
  }

  logout() {
    this.clearToken();
  }

  async resetPassword(identifier: string) {
    return this.makeRequest('/auth/password-reset', {
      method: 'POST',
      body: JSON.stringify({ identifier }),
    });
  }

  async verifyOtp(otp: string, newPassword: string) {
    return this.makeRequest('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ otp, new_password: newPassword }),
    });
  }
}

export const authService = new AuthService();
