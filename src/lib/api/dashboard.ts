import { BaseApiService } from './base';

export interface CropType {
  id: string;
  name: string;
  code: string;
  description: string;
}

class DashboardService extends BaseApiService {
  constructor() {
    super('/api'); // Base path for all requests
  }

  async getCropTypes(): Promise<CropType[]> {
    try {
      // Explicitly type the response as an array of CropType
      const response = await this.makeRequest<CropType[]>('/dashboard/crop-types');
      
      // Validate the response structure
      if (!Array.isArray(response)) {
        throw new Error('Invalid response format: expected an array');
      }

      // Return the validated response
      return response;
      
    } catch (error) {
      console.error('Error fetching crop types:', error);
      // Return empty array if API fails (since you want all data from URL)
      return [];
    }
  }
}

// Export the service instance and type
export const dashboardService = new DashboardService();