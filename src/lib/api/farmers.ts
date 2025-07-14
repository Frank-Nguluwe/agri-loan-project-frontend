
import { BaseApiService } from './base';

class FarmersService extends BaseApiService {
  async submitApplication(data: any) {
    return this.makeRequest('/farmers/applications', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getFarmerApplications() {
    return this.makeRequest('/farmers/applications');
  }

  async getApplicationDetails(applicationId: string) {
    return this.makeRequest(`/farmers/applications/${applicationId}`);
  }

  async getFarmerProfile() {
    return this.makeRequest('/farmers/profile');
  }

  async getYieldHistory() {
    return this.makeRequest('/farmers/yield-history');
  }
}

export const farmersService = new FarmersService();
