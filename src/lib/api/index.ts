import { BaseApiService } from './base';
import { toast } from '@/hooks/use-toast';

// Import all services
import { authService } from './auth';
import { predictionsService } from './predictions';
import { districtsService } from './districts';
import { monitoringService } from './monitoring';
import { usersService } from './users';
import { farmersService } from './farmers';
import { loanOfficersService } from './loan-officers';
import { supervisorsService } from './supervisors';
import { adminService } from './admin';

// Combined API service for backward compatibility
class ApiService {
  private static instance: ApiService;

  // Services instances
  public auth = authService;
  public predictions = predictionsService;
  public districts = districtsService;
  public monitoring = monitoringService;
  public users = usersService;
  public farmers = farmersService;
  public loanOfficers = loanOfficersService;
  public supervisors = supervisorsService;
  public admin = adminService;

  // Auth methods (kept for backward compatibility)
  login = authService.login.bind(authService);
  signup = authService.signup.bind(authService);
  passwordReset = authService.passwordReset.bind(authService);
  verifyOtp = authService.verifyOtp.bind(authService);
  logout = authService.logout.bind(authService);

  // Predictions methods
  predictLoanAmount = predictionsService.predictLoanAmount.bind(predictionsService);
  predictAndUpdateApplication = predictionsService.predictAndUpdateApplication.bind(predictionsService);
  batchPredict = predictionsService.batchPredict.bind(predictionsService);
  getPendingPredictionApplications = predictionsService.getPendingPredictionApplications.bind(predictionsService);
  processPendingBatch = predictionsService.processPendingBatch.bind(predictionsService);
  getModelInfo = predictionsService.getModelInfo.bind(predictionsService);
  reloadModel = predictionsService.reloadModel.bind(predictionsService);
  getFarmerPredictionHistory = predictionsService.getFarmerPredictionHistory.bind(predictionsService);

  // Districts methods
  getAllDistricts = districtsService.getDistricts.bind(districtsService);
  getDistrictById = districtsService.getDistrictById.bind(districtsService);

  // Monitoring methods
  getMonitoringHealth = monitoringService.getMonitoringHealth.bind(monitoringService);
  getMetrics = monitoringService.getMetrics.bind(monitoringService);
  deployModel = monitoringService.deployModel.bind(monitoringService);
  rollbackModel = monitoringService.rollbackModel.bind(monitoringService);
  getDeploymentStatus = monitoringService.getDeploymentStatus.bind(monitoringService);

  // Users methods
  updateProfile = usersService.updateProfile.bind(usersService);
  getDashboardInfo = usersService.getDashboardInfo.bind(usersService);

  // Farmers methods
  submitApplication = farmersService.submitApplication.bind(farmersService);
  getFarmerApplications = farmersService.getFarmerApplications.bind(farmersService);
  getApplicationDetails = farmersService.getApplicationDetails.bind(farmersService);
  getFarmerProfile = farmersService.getFarmerProfile.bind(farmersService);
  getYieldHistory = farmersService.getYieldHistory.bind(farmersService);

  // Loan Officers methods
  getLoanOfficerApplications = loanOfficersService.getLoanOfficerApplications.bind(loanOfficersService);
  getLoanOfficerDashboardStats = loanOfficersService.getLoanOfficerDashboardStats.bind(loanOfficersService);
  getAccessibleDistricts = loanOfficersService.getAccessibleDistricts.bind(loanOfficersService);
  getCropTypes = loanOfficersService.getCropTypes.bind(loanOfficersService);

  // Supervisors methods
  getSupervisorDashboard = supervisorsService.getSupervisorDashboard.bind(supervisorsService);
  getLoanOfficers = supervisorsService.getLoanOfficers.bind(supervisorsService);
  approveRejectApplication = supervisorsService.approveRejectApplication.bind(supervisorsService);
  getPendingApplications = supervisorsService.getPendingApplications.bind(supervisorsService);
  assignApplication = supervisorsService.assignApplication.bind(supervisorsService);

  // Admin methods
  getModelPerformance = adminService.getModelPerformance.bind(adminService);
  updateSystemSettings = adminService.updateSystemSettings.bind(adminService);
  createUser = adminService.createUser.bind(adminService);
  getUsers = adminService.getUsers.bind(adminService);
  getUserDetails = adminService.getUserDetails.bind(adminService);
  updateUser = adminService.updateUser.bind(adminService);
  deactivateUser = adminService.deactivateUser.bind(adminService);

  private constructor() {
    // Initialize services if needed
  }

  static getInstance(): ApiService {
    if (!ApiService.instance) {
      ApiService.instance = new ApiService();
    }
    return ApiService.instance;
  }

  // Clear all caches across services
  clearAllCaches(): void {
    if ('clearCache' in this.districts) {
      (this.districts as any).clearCache();
    }
    // Add other service cache clears as needed
  }
}

export const apiService = ApiService.getInstance();
export default apiService;

// Export types
export type { PredictionRequest, PredictionResponse } from './predictions';
export type { District as DistrictType } from './districts';
export type { LoginCredentials, SignupData, PasswordResetRequest, VerifyOtpData } from './auth';