import { BaseApiService } from './base';

interface CropType {
  id: string;
  name: string;
  code: string;
  description: string;
}

class DashboardService extends BaseApiService {
  async getCropTypes(): Promise<CropType[]> {
    return this.makeRequest('/dashboard/crop-types');
  }
}

export const dashboardService = new DashboardService();
export type { CropType };
