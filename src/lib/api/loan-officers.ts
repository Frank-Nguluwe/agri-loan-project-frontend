
import { BaseApiService } from './base';

class LoanOfficersService extends BaseApiService {
  async getLoanOfficerApplications() {
    return this.makeRequest('/loan-officers/applications');
  }

  async getLoanOfficerDashboardStats() {
    return this.makeRequest('/loan-officers/dashboard/stats');
  }

  async getAccessibleDistricts() {
    return this.makeRequest('/loan-officers/districts');
  }

  async getCropTypes() {
    return this.makeRequest('/loan-officers/crop-types');
  }
}

export const loanOfficersService = new LoanOfficersService();
