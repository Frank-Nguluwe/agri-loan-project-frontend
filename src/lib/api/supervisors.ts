import { BaseApiService } from './base';

export interface SupervisorDashboardResponse {
  total_applications: number;
  approved_applications: number;
  pending_applications: number;
  rejected_applications: number;
  total_amount_approved: number;
  average_approval_amount: number;
  approval_rate: number;
  loan_officer_stats: {
    officer_id: string;
    name: string;
    active_applications: number;
    total_applications: number;
    approved_applications: number;
    pending_applications: number;
    avg_processing_time_days: number;
    district_name: string;
  }[];
  monthly_trends: Record<string, any>;
  district_summary: Record<string, any>;
}

export interface PendingApplication {
  application_id: string;
  farmer_name: string;
  crop_type: string;
  district_id: string;
  district_name: string;
  requested_amount: number;
  status: string;
  application_date: string;
  farm_size_hectares: number;
}

class SupervisorsService extends BaseApiService {
    constructor() {
    super('/api');
  }
  
  async getSupervisorDashboard(): Promise<SupervisorDashboardResponse> {
    return this.makeRequest('/supervisors/dashboard');
  }

  async getLoanOfficers() {
    return this.makeRequest('/supervisors/loan-officers');
  }

  async approveRejectApplication(applicationId: string, data: any) {
    return this.makeRequest(`/supervisors/applications/${applicationId}/approve`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async getPendingApplications(): Promise<PendingApplication[]> {
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
