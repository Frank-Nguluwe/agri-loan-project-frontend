
import React, { useState, useEffect } from 'react';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, XCircle, TrendingUp, Users, MapPin, FileText } from 'lucide-react';
import { apiService } from '@/lib/api';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface SupervisorStats {
  total_applications: number;
  approved_applications: number;
  pending_applications: number;
  rejected_applications: number;
  total_amount_approved: number;
  average_approval_amount: number;
  approval_rate: number;
  loan_officer_stats: any[];
  monthly_trends: any;
  district_summary: any;
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
}

const SupervisorDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState<Application[]>([]);
  const [stats, setStats] = useState<SupervisorStats>({
    total_applications: 0,
    approved_applications: 0,
    pending_applications: 0,
    rejected_applications: 0,
    total_amount_approved: 0,
    average_approval_amount: 0,
    approval_rate: 0,
    loan_officer_stats: [],
    monthly_trends: {},
    district_summary: {},
  });

  useEffect(() => {
    fetchDashboardData();
    fetchPendingApplications();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const data = await apiService.getSupervisorDashboard();
      setStats((data as SupervisorStats) || {
        total_applications: 0,
        approved_applications: 0,
        pending_applications: 0,
        rejected_applications: 0,
        total_amount_approved: 0,
        average_approval_amount: 0,
        approval_rate: 0,
        loan_officer_stats: [],
        monthly_trends: {},
        district_summary: {},
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

  const fetchPendingApplications = async () => {
    try {
      const data = await apiService.getPendingApplications();
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

  const handleApproveApplication = async (applicationId: string) => {
    try {
      await apiService.approveRejectApplication(applicationId, {
        status: 'approved',
        supervisor_notes: 'Approved by supervisor'
      });
      
      toast({
        title: "Success",
        description: "Application approved successfully",
      });
      
      fetchPendingApplications();
      fetchDashboardData();
    } catch (error) {
      console.error('Failed to approve application:', error);
      toast({
        title: "Error",
        description: "Failed to approve application",
        variant: "destructive",
      });
    }
  };

  const handleRejectApplication = async (applicationId: string) => {
    try {
      await apiService.approveRejectApplication(applicationId, {
        status: 'rejected',
        supervisor_notes: 'Rejected by supervisor'
      });
      
      toast({
        title: "Success",
        description: "Application rejected",
      });
      
      fetchPendingApplications();
      fetchDashboardData();
    } catch (error) {
      console.error('Failed to reject application:', error);
      toast({
        title: "Error",
        description: "Failed to reject application",
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

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <GlassCard className="p-6">
          <div className="flex items-center">
            <div className="bg-blue-100 rounded-full p-3 mr-4">
              <TrendingUp className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Applications</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total_applications}</p>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center">
            <div className="bg-green-100 rounded-full p-3 mr-4">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Approved</p>
              <p className="text-2xl font-bold text-gray-900">{stats.approved_applications}</p>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center">
            <div className="bg-yellow-100 rounded-full p-3 mr-4">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pending_applications}</p>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center">
            <div className="bg-red-100 rounded-full p-3 mr-4">
              <XCircle className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Rejected</p>
              <p className="text-2xl font-bold text-gray-900">{stats.rejected_applications}</p>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <GlassCard className="p-6">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">Total Amount Approved</p>
            <p className="text-3xl font-bold text-[#2ACB25]">
              {formatCurrency(stats.total_amount_approved)}
            </p>
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">Average Approval Amount</p>
            <p className="text-3xl font-bold text-blue-600">
              {formatCurrency(stats.average_approval_amount)}
            </p>
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">Approval Rate</p>
            <p className="text-3xl font-bold text-purple-600">
              {Math.round(stats.approval_rate * 100)}%
            </p>
          </div>
        </GlassCard>
      </div>

      {/* Pending Applications for Review */}
      <GlassCard className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Pending Applications - {user?.district || 'All Districts'}</h2>
        {applications.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No pending applications</p>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map((application) => (
              <div key={application.application_id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-medium text-gray-900">{application.farmer_name}</h3>
                    <p className="text-sm text-gray-600">
                      {application.crop_type} • {application.farm_size_hectares} hectares • {application.district_name}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">{formatCurrency(application.requested_amount)}</p>
                    <Badge className={getStatusColor(application.status)}>
                      {application.status}
                    </Badge>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-500">Applied on {formatDate(application.application_date)}</p>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRejectApplication(application.application_id)}
                      className="text-red-600 hover:bg-red-50"
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Reject
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleApproveApplication(application.application_id)}
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

      {/* Loan Officer Performance */}
      <GlassCard className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Loan Officer Performance</h2>
        {stats.loan_officer_stats.length === 0 ? (
          <div className="text-center py-8">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No loan officer data available</p>
          </div>
        ) : (
          <div className="space-y-4">
            {stats.loan_officer_stats.map((officer, index) => (
              <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <h3 className="font-medium text-gray-900">{officer.name}</h3>
                  <p className="text-sm text-gray-600">{officer.district_name}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">
                    {officer.approved_applications}/{officer.total_applications}
                  </p>
                  <p className="text-sm text-gray-600">Approved/Total</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </GlassCard>
    </div>
  );
};

export default SupervisorDashboard;
