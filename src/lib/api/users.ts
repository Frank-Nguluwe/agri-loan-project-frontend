// src/services/users.ts
import { BaseApiService } from './base';

export class UsersService extends BaseApiService {
  async updateProfile(profileData: any) {
    return this.makeRequest('/users/update-profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  async getDashboardInfo() {
    return this.makeRequest('/dashboard/me');
  }
}

export const usersService = new UsersService();
