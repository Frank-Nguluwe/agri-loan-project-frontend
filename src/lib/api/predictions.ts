
import { BaseApiService } from './base';

interface District {
  id: string;
  name: string;
  code: string;
  region: string;
}

interface PredictionRequest {
  farmer_id: string;
  crop_type_id: string;
  farm_size_hectares: number;
  expected_yield_kg: number;
  expected_revenue_mwk: number;
  district_id: string;
}

interface PredictionResponse {
  predicted_amount_mwk: number;
  prediction_confidence: number;
  prediction_date: string;
  farmer_id: string;
  crop_type_name: string;
  district_name: string;
  risk_score: number;
  recommendation: string;
}

class PredictionsService extends BaseApiService {
  async predictLoanAmount(data: PredictionRequest): Promise<PredictionResponse> {
    return this.makeRequest('/predictions/predict', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async predictAndUpdateApplication(applicationId: string) {
    return this.makeRequest(`/predictions/predict-and-update/${applicationId}`, {
      method: 'POST',
    });
  }

  async batchPredict(data: PredictionRequest[]): Promise<PredictionResponse[]> {
    return this.makeRequest('/predictions/batch-predict', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getPendingPredictionApplications() {
    return this.makeRequest('/predictions/pending-applications');
  }

  async processPendingBatch() {
    return this.makeRequest('/predictions/process-pending-batch', {
      method: 'POST',
    });
  }

  async getModelInfo() {
    return this.makeRequest('/predictions/model-info');
  }

  async reloadModel() {
    return this.makeRequest('/predictions/reload-model', {
      method: 'POST',
    });
  }

  async getFarmerPredictionHistory(farmerId: string) {
    return this.makeRequest(`/predictions/prediction-history/${farmerId}`);
  }
}

export const predictionsService = new PredictionsService();
export type { District, PredictionRequest, PredictionResponse };
