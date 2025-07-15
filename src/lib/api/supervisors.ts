// src/lib/api/supervisors.ts

import { BaseApiService } from './base';

class SupervisorsService extends BaseApiService {
  // Get supervisor dashboard data
  async getSupervisorDashboard() {
    return this.makeRequest('/supervisors/dashboard');
  }

  // Get all loan officers
  async getLoanOfficers() {
    return this.makeRequest('/supervisors/loan-officers');
  }

  // Approve or reject an application
  async approveRejectApplication(applicationId: string, data: any) {
    return this.makeRequest(`/supervisors/applications/${applicationId}/approve`, {
      method: 'PUT', 
      body: JSON.stringify(data),
    });
  }

  // Get all pending applications
  async getPendingApplications() {
    return this.makeRequest('/supervisors/applications/pending');
  }

  // Assign application to a loan officer
  async assignApplication(applicationId: string, officerId: string) {
    return this.makeRequest(`/supervisors/applications/${applicationId}/assign`, {
      method: 'POST',
      body: JSON.stringify({ officer_id: officerId }),
    });
  }
}

// Export singleton instance
export const supervisorsService = new SupervisorsService();
