import React, { useState, useEffect } from 'react';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Users, MapPin, TrendingUp, CheckCircle, XCircle, Clock, X } from 'lucide-react';
import { apiService } from '@/lib/api';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

// Utility function for currency formatting
const formatCurrency = (amount: number, currency: string = 'MWK'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

interface DashboardStats {
  totalApplications: number;
  pendingReviews: number;
  approvedApplications: number;
  totalAmountProcessed: number;
}

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

interface District {
  id: string;
  name: string;
}

interface User {
  // Add other user properties as needed
  district?: District;
}

const ApplicationDetailsModal = ({
  application,
  onClose,
  onApprove,
  onReject,
}: {
  application: ApplicationDetails;
  onClose: () => void;
  onApprove: (amount: number, notes: string) => void;
  onReject: (notes: string) => void;
}) => {
  const [notes, setNotes] = useState('');
  const [approvedAmount, setApprovedAmount] = useState(application.predicted_amount_mwk);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <GlassCard className="p-6 max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-6">
          <h2 className="text-2xl font-bold">
            Application: {application.farmer_profile.first_name}{' '}
            {application.farmer_profile.last_name}
          </h2>
          <Button variant="ghost" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <h3 className="font-semibold mb-2">Farmer Details</h3>
            <p>Phone: {application.farmer_profile.phone_number}</p>
            <p>Email: {application.farmer_profile.email}</p>
            <p>National ID: {application.farmer_profile.national_id}</p>
            <p>Farm Location: {application.farmer_profile.farm_location_gps}</p>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Application Details</h3>
            <p>Crop: {application.crop_type}</p>
            <p>Farm Size: {application.farm_size_hectares} hectares</p>
            <p>District: {application.district_name}</p>
            <p>
              Predicted Amount: {formatCurrency(application.predicted_amount_mwk)}
            </p>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="font-semibold mb-2">Yield History</h3>
          {application.yield_history.length > 0 ? (
            <div className="space-y-2">
              {application.yield_history.map((yieldItem, index) => (
                <div key={index} className="border p-2 rounded">
                  <p>Year: {yieldItem.year}</p>
                  <p>Yield: {yieldItem.yield_amount_kg} kg</p>
                  <p>Revenue: {formatCurrency(yieldItem.revenue_mwk)}</p>
                </div>
              ))}
            </div>
          ) : (
            <p>No yield history available</p>
          )}
        </div>

        <div className="mb-6">
          <h3 className="font-semibold mb-2">Review Notes</h3>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Enter your review notes..."
          />
        </div>

        {application.status === 'pending' && (
          <div className="flex justify-between">
            <div>
              <Label>Approved Amount (MWK)</Label>
              <Input
                type="number"
                value={approvedAmount}
                onChange={(e) => setApprovedAmount(Number(e.target.value))}
                min={0}
              />
            </div>
            <div className="flex space-x-2">
              <Button
                variant="destructive"
                onClick={() => onReject(notes)}
              >
                Reject Application
              </Button>
              <Button
                onClick={() => onApprove(approvedAmount, notes)}
              >
                Approve Application
              </Button>
            </div>
          </div>
        )}
      </GlassCard>
    </div>
  );
};

const LoanOfficerDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState<Application[]>([]);
  const [selectedApplication, setSelectedApplication] = useState<ApplicationDetails | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    totalApplications: 0,
    pendingReviews: 0,
    approvedApplications: 0,
    totalAmountProcessed: 0,
  });

  useEffect(() => {
    fetchDashboardData();
    fetchApplications();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const data = await apiService.getLoanOfficerDashboardStats();
      setStats({
        totalApplications: data.total_applications || 0,
        pendingReviews: data.pending_reviews || 0,
        approvedApplications: data.approved_applications || 0,
        totalAmountProcessed: data.total_amount_processed || 0,
      });
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive",
      });
    }
  };

  const fetchApplications = async () => {
    try {
      const data = await apiService.getLoanOfficerApplications();
      setApplications((data as Application[]) || []);
    } catch (error) {
      console.error('Failed to fetch applications:', error);
      toast({
        title: "Error",
        description: "Failed to load applications",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchApplicationDetails = async (applicationId: string) => {
    try {
      const details = await apiService.getApplicationDetails(applicationId);
      setSelectedApplication(details);
    } catch (error) {
      console.error('Failed to fetch application details:', error);
      toast({
        title: "Error",
        description: "Failed to load application details",
        variant: "destructive",
      });
    }
  };

  const handleUpdateApplicationStatus = async (
    applicationId: string,
    status: 'approved' | 'rejected',
    notes: string = '',
    approvedAmount?: number
  ) => {
    try {
      await apiService.approveRejectApplication(applicationId, {
        status,
        loan_officer_notes: notes,
        ...(status === 'approved' && { approved_amount: approvedAmount }),
      });
      
      toast({
        title: "Success",
        description: `Application ${status} successfully`,
      });
      
      fetchApplications();
      fetchDashboardData();
      setSelectedApplication(null);
    } catch (error) {
      console.error(`Failed to ${status} application:`, error);
      toast({
        title: "Error",
        description: `Failed to ${status} application`,
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'under_review':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <GlassCard key={i} className="p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </GlassCard>
          ))}
        </div>
      </div>
    );
  }

  const pendingApplications = applications.filter(app => 
    app.status === 'pending' || app.status === 'under_review'
  );

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <GlassCard className="p-6">
          <div className="flex items-center">
            <div className="bg-blue-100 rounded-full p-3 mr-4">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Applications</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalApplications}</p>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center">
            <div className="bg-yellow-100 rounded-full p-3 mr-4">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Pending Reviews</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pendingReviews}</p>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center">
            <div className="bg-green-100 rounded-full p-3 mr-4">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Approved Applications</p>
              <p className="text-2xl font-bold text-gray-900">{stats.approvedApplications}</p>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center">
            <div className="bg-purple-100 rounded-full p-3 mr-4">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Amount Processed</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(stats.totalAmountProcessed)}
              </p>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* District Info */}
      {user?.district && (
        <GlassCard className="p-4">
          <div className="flex items-center">
            <MapPin className="h-5 w-5 text-[#2ACB25] mr-2" />
            <span className="font-medium text-gray-900">
              Assigned District: {user.district.name}
            </span>
          </div>
        </GlassCard>
      )}

      {/* Applications Requiring Review */}
      <GlassCard className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Applications for Review</h2>
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
            {pendingApplications.length} Pending
          </Badge>
        </div>

        {pendingApplications.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No applications pending review</p>
            <p className="text-sm text-gray-400 mt-2">
              New applications will appear here for your review
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingApplications.map((application) => (
              <div key={application.application_id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-medium text-gray-900">{application.farmer_name}</h3>
                    <p className="text-sm text-gray-600 flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      {application.district_name} • {application.crop_type} • {application.farm_size_hectares} hectares
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">{formatCurrency(application.predicted_amount_mwk)}</p>
                    <Badge className={getStatusColor(application.status)}>
                      {application.status.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-500">Applied on {formatDate(application.application_date)}</p>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => fetchApplicationDetails(application.application_id)}
                      className="text-blue-600 hover:bg-blue-50"
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </GlassCard>

      {/* All Applications */}
      <GlassCard className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">All Applications</h2>
        {applications.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No applications found</p>
          </div>
        ) : (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {applications.map((application) => (
              <div key={application.application_id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <h3 className="font-medium text-gray-900">{application.farmer_name}</h3>
                    <Badge className={getStatusColor(application.status)}>
                      {application.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {application.crop_type} • {application.district_name} • {formatDate(application.application_date)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">{formatCurrency(application.predicted_amount_mwk)}</p>
                  <p className="text-sm text-gray-600">{application.farm_size_hectares} hectares</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </GlassCard>

      {/* Application Details Modal */}
      {selectedApplication && (
        <ApplicationDetailsModal
          application={selectedApplication}
          onClose={() => setSelectedApplication(null)}
          onApprove={(amount, notes) => 
            handleUpdateApplicationStatus(
              selectedApplication.application_id,
              'approved',
              notes,
              amount
            )
          }
          onReject={(notes) => 
            handleUpdateApplicationStatus(
              selectedApplication.application_id,
              'rejected',
              notes
            )
          }
        />
      )}
    </div>
  );
};

export default LoanOfficerDashboard;