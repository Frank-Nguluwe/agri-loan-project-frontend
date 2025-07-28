import { BaseApiService } from './base';
import { Application, FarmerProfile, YieldHistory } from './types';

export class FarmersService extends BaseApiService {
  constructor() {
    super('/api'); 
  }

  async submitApplication(data: any): Promise<Application> {
    return this.makeRequest('/farmers/applications', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getFarmerApplications(): Promise<Application[]> {
    return this.makeRequest('/farmers/applications');
  }

  async getApplicationDetails(applicationId: string): Promise<Application> {
    return this.makeRequest(`/farmers/applications/${applicationId}`);
  }

  async getFarmerProfile(): Promise<FarmerProfile> {
    return this.makeRequest('/farmers/profile');
  }

  async getYieldHistory(): Promise<YieldHistory[]> {
    return this.makeRequest('/farmers/yield-history');
  }
}

export const farmersService = new FarmersService();