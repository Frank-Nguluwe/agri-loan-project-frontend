import { BaseApiService } from './base';

interface LoginCredentials {
  email?: string;
  phone_number?: string;
  password: string;
}

interface SignupData {
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

interface DistrictResponse {
  id: string;
  name: string;
}

interface FarmerProfileResponse {
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  district: {
    id: string;
    name: string;
  };
  created_at: string;
  is_active: boolean;
  role: string;
}

interface UpdateFarmerProfileData {
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
}

class AuthService extends BaseApiService {
  async login(credentials: LoginCredentials) {
    const response = await this.makeRequest<{ access_token: string; token_type: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    this.setToken(response.access_token);
    return response;
  }

  async signup(data: SignupData) {
    return this.makeRequest('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({
        ...data,
        national_id: data.national_id || undefined,
        address: data.address || undefined
      }),
    });
  }

  async getFarmerProfile(): Promise<FarmerProfileResponse> {
    return this.makeRequest<FarmerProfileResponse>('/farmers/profile', {
      method: 'GET',
    });
  }

  async updateFarmerProfile(data: UpdateFarmerProfileData) {
    return this.makeRequest('/farmers/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async getDistrictById(id: string): Promise<DistrictResponse> {
    return this.makeRequest<DistrictResponse>(`/districts/${id}`, {
      method: 'GET',
    });
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

  logout() {
    this.clearToken();
  }

  async getDashboardInfo() {
    return this.makeRequest('/auth/me', {
      method: 'GET',
    });
  }
}

export const authService = new AuthService();
export type { 
  LoginCredentials, 
  SignupData, 
  FarmerProfileResponse as FarmerProfile,
  DistrictResponse,
  UpdateFarmerProfileData
};