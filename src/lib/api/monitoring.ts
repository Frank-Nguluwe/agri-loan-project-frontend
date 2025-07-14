
import { BaseApiService } from './base';

class MonitoringService extends BaseApiService {
  async getMonitoringHealth() {
    return this.makeRequest('/monitoring/health');
  }

  async getMetrics() {
    return this.makeRequest('/monitoring/metrics');
  }

  async deployModel() {
    return this.makeRequest('/monitoring/deploy', {
      method: 'POST',
    });
  }

  async rollbackModel() {
    return this.makeRequest('/monitoring/rollback', {
      method: 'POST',
    });
  }

  async getDeploymentStatus() {
    return this.makeRequest('/monitoring/status');
  }
}

export const monitoringService = new MonitoringService();
