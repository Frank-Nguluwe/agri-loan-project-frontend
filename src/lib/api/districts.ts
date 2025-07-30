import { BaseApiService } from './base';

export interface District {
  id: string;
  name: string;
  code: string;
  region: string;
}

class DistrictsService extends BaseApiService {
  constructor() {
    super('/api');
  }

  async getDistricts(): Promise<District[]> {
    return this.makeRequest('/districts');
  }

  async getDistrictById(id: string): Promise<District> {
    return this.makeRequest(`/districts/${id}`);
  }
}

export const districtsService = new DistrictsService();