
import { BaseApiService } from './base';

class AdminService extends BaseApiService {
  async getModelPerformance() {
    return this.makeRequest('/admin/model-performance');
  }

  async updateSystemSettings(key: string, value: string, description: string) {
    return this.makeRequest('/admin/system-settings', {
      method: 'POST',
      body: JSON.stringify({ key, value, description }),
    });
  }

  async createUser(userData: any) {
    return this.makeRequest('/admin/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async getUsers() {
    return this.makeRequest('/admin/users');
  }

  async getUserDetails(userId: string) {
    return this.makeRequest(`/admin/users/${userId}`);
  }

  async updateUser(userId: string, userData: any) {
    return this.makeRequest(`/admin/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async deactivateUser(userId: string) {
    return this.makeRequest(`/admin/users/${userId}`, {
      method: 'DELETE',
    });
  }
}

export const adminService = new AdminService();
