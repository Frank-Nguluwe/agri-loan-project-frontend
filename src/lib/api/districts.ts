import { BaseApiService } from './base';

export interface District {
  id: string;
  name: string;
  region?: string;
}

export class DistrictsService extends BaseApiService {
  constructor() {
    super('/api');
  }

  async getAllDistricts(): Promise<District[]> {
    return this.makeRequest<District[]>('/districts', {
      method: 'GET'
    });
  }

  async getDistrictById(id: string): Promise<District> {
    return this.makeRequest<District>(`/districts/${id}`, {
      method: 'GET'
    });
  }
}

export const districtsService = new DistrictsService();