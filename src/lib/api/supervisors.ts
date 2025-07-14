
import { BaseApiService } from './base';

class SupervisorsService extends BaseApiService {
  async getSupervisorDashboard() {
    return this.makeRequest('/supervisors/dashboard');
  }

  async getLoanOfficers() {
    return this.makeRequest('/supervisors/loan-officers');
  }

  async approveRejectApplication(applicationId: string, data: any) {
    return this.makeRequest(`/supervisors/applications/${applicationId}/approve`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getPendingApplications() {
    return this.makeRequest('/supervisors/applications/pending');
  }

  async assignApplication(applicationId: string, officerId: string) {
    return this.makeRequest(`/supervisors/applications/${applicationId}/assign`, {
      method: 'POST',
      body: JSON.stringify({ officer_id: officerId }),
    });
  }
}

export const supervisorsService = new SupervisorsService();
