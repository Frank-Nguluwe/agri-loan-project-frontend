
import React, { useState, useEffect } from 'react';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Users, MapPin, TrendingUp, CheckCircle, XCircle, Clock } from 'lucide-react';
import { apiService } from '@/lib/api';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface DashboardStats {
  totalApplications: number;
  pendingReviews: number;
  approvedApplications: number;
  totalAmountProcessed: number;
}

interface Application {
  application_id: string;
  farmer_name: string;
  crop_type: string;
  district_name: string;
  requested_amount: number;
  status: string;
  application_date: string;
  farm_size_hectares: number;
  farmer_phone: string;
}

const LoanOfficerDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState<Application[]>([]);
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
      setStats((data as DashboardStats) || {
        totalApplications: 0,
        pendingReviews: 0,
        approvedApplications: 0,
        totalAmountProcessed: 0,
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

  const handleUpdateApplicationStatus = async (applicationId: string, status: 'approved' | 'rejected', notes: string = '') => {
    try {
      await apiService.approveRejectApplication(applicationId, {
        status,
        loan_officer_notes: notes || `${status} by loan officer`
      });
      
      toast({
        title: "Success",
        description: `Application ${status} successfully`,
      });
      
      fetchApplications();
      fetchDashboardData();
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'MWK',
      minimumFractionDigits: 0,
    }).format(amount);
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

  const pendingApplications = applications.filter(app => app.status === 'pending' || app.status === 'under_review');

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
            <span className="font-medium text-gray-900">Assigned District: {user.district}</span>
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
                    {application.farmer_phone && (
                      <p className="text-sm text-gray-500">Phone: {application.farmer_phone}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">{formatCurrency(application.requested_amount)}</p>
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
                      onClick={() => handleUpdateApplicationStatus(application.application_id, 'rejected')}
                      className="text-red-600 hover:bg-red-50"
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Reject
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleUpdateApplicationStatus(application.application_id, 'approved')}
                      className="bg-[#2ACB25] hover:bg-[#1E9B1A] text-white"
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Approve
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
                  <p className="font-medium text-gray-900">{formatCurrency(application.requested_amount)}</p>
                  <p className="text-sm text-gray-600">{application.farm_size_hectares} hectares</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </GlassCard>
    </div>
  );
};

export default LoanOfficerDashboard;
