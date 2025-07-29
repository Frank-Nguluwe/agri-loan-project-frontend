import { BaseApiService } from './base';

interface Application {
  application_id: string;
  farmer_name: string;
  application_date: string;
  predicted_amount_mwk: number;
  status: string;
  crop_type: string;
  farm_size_hectares: number;
  district_name: string;
  expected_yield_kg: number;
  expected_revenue_mwk: number;
}

interface ApplicationDetails extends Application {
  prediction_details: {
    predicted_amount_mwk: number;
    prediction_confidence: number;
    prediction_date: string;
    model_version: string;
  };
  farmer_profile: {
    user_id: string;
    email: string;
    phone_number: string;
    first_name: string;
    last_name: string;
    date_of_birth: string;
    national_id: string;
    address: string;
    farm_location_gps: string;
    farm_size_hectares: number;
    registration_date: string;
    district_name: string;
  };
  yield_history: Array<{
    year: number;
    crop_type: string;
    yield_amount_kg: number;
    revenue_mwk: number;
  }>;
  review_history: Array<{
    reviewer_name: string;
    review_date: string;
    comments: string;
    action: string;
  }>;
  approved_amount_mwk: number;
  approval_date: string;
  approver_name: string;
  override_reason: string;
}

interface DashboardStats {
  total_applications?: number;
  pending_reviews?: number;
  approved_applications?: number;
  total_amount_processed?: number;
}

class LoanOfficersService extends BaseApiService {
  async getLoanOfficerApplications(): Promise<Application[]> {
    return this.makeRequest('/api/loan-officers/applications');
  }

  async getApplicationDetails(applicationId: string): Promise<ApplicationDetails> {
    return this.makeRequest(`/api/loan-officers/applications/${applicationId}`);
  }

  async getLoanOfficerDashboardStats(): Promise<DashboardStats> {
    return this.makeRequest('/api/loan-officers/dashboard/stats');
  }

  async getAccessibleDistricts(): Promise<string[]> {
    return this.makeRequest('/api/loan-officers/districts');
  }

  async getCropTypes(): Promise<string[]> {
    return this.makeRequest('/api/loan-officers/crop-types');
  }

  async approveRejectApplication(
    applicationId: string,
    data: {
      status: 'approved' | 'rejected';
      loan_officer_notes: string;
      approved_amount?: number;
      override_reason?: string;
    }
  ): Promise<void> {
    return this.makeRequest(`/api/loan-officers/applications/${applicationId}/review`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}

export const loanOfficersService = new LoanOfficersService();