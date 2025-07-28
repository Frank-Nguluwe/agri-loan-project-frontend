import { BaseApiService } from './base';

export interface District {
  id: string;
  name: string;
  region?: string;
}

export interface UpdateProfileData {
  first_name?: string;
  last_name?: string;
  phone_number?: string;
  national_id?: string;
  address?: string;
  district_id?: string;
}

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  role: string;
  district_id: string;
  district?: District;
  national_id?: string;
  address?: string;
  farmer_profile?: any;
}

export class UsersService extends BaseApiService {
  async updateProfile(profileData: UpdateProfileData): Promise<User> {
    return this.makeRequest<User>('/api/users/update-profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  async getDashboardInfo(): Promise<User> {
    return this.makeRequest<User>('/api/dashboard/me');
  }
}

export const usersService = new UsersService();