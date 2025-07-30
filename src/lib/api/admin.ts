import { BaseApiService } from './base';

export interface ListUser {
  user_id: string;
  first_name: string;
  last_name: string;
  role: string;
  district: string;
  is_active: boolean;
}

export interface DetailedUser {
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  role: string;
  district_id: string;
  is_active: boolean;
  created_at: string;
}

export interface ModelPerformance {
  accuracy: number;
  recent_predictions: any[];
  drift_metrics: any;
}

export interface SystemSetting {
  key: string;
  value: string;
  description: string;
}

class AdminService extends BaseApiService {
  constructor() {
    super('/api');
  }

  async getModelPerformance(): Promise<ModelPerformance> {
    return this.makeRequest('/admin/model-performance');
  }

  async updateSystemSettings(data: SystemSetting): Promise<void> {
    return this.makeRequest('/admin/system-settings', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async createUser(userData: {
    first_name: string;
    last_name: string;
    email: string;
    phone_number: string;
    role: string;
    district_id: string;
    password: string;
  }): Promise<DetailedUser> {
    return this.makeRequest('/admin/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async getUsers(): Promise<ListUser[]> {
    return this.makeRequest('/admin/users');
  }

  async getUserDetails(userId: string): Promise<DetailedUser> {
    return this.makeRequest(`/admin/users/${userId}`);
  }

  async updateUser(
    userId: string,
    userData: {
      first_name?: string;
      last_name?: string;
      email?: string;
      phone_number?: string;
      district_id?: string;
      is_active?: boolean;
    }
  ): Promise<DetailedUser> {
    return this.makeRequest(`/admin/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async deactivateUser(userId: string): Promise<void> {
    return this.makeRequest(`/admin/users/${userId}`, {
      method: 'DELETE',
    });
  }
}

export const adminService = new AdminService();