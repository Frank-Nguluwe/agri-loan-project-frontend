
import { BaseApiService } from './base';

interface District {
  id: string;
  name: string;
  code: string;
  region: string;
}

class DistrictsService extends BaseApiService {
  async getAllDistricts(): Promise<District[]> {
    return this.makeRequest('/districts/');
  }

  async getDistrictById(districtId: string): Promise<District> {
    return this.makeRequest(`/districts/${districtId}`);
  }
}

export const districtsService = new DistrictsService();
export type { District };
