
import { BaseApiService } from './base';

class UsersService extends BaseApiService {
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