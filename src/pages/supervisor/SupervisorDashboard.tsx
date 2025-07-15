import React, { useState, useEffect } from 'react';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, XCircle, TrendingUp, FileText } from 'lucide-react';
import { supervisorsService, SupervisorDashboardResponse, PendingApplication } from '@/lib/api/supervisors';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

const SupervisorDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState<PendingApplication[]>([]);
  const [stats, setStats] = useState<SupervisorDashboardResponse>({
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
    const loadAllData = async () => {
      setLoading(true);
      await Promise.all([fetchDashboardData(), fetchPendingApplications()]);
      setLoading(false);
    };
    loadAllData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const data = await supervisorsService.getSupervisorDashboard();
      setStats(data);
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to load dashboard data',
        variant: 'destructive',
      });
    }
  };

  const fetchPendingApplications = async () => {
    try {
      const data = await supervisorsService.getPendingApplications();
      const filtered = user?.district_id
        ? data.filter(app => app.district_id === user.district_id)
        : data;
      setApplications(filtered);
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to load applications',
        variant: 'destructive',
      });
    }
  };

  const handleApproveApplication = async (applicationId: string) => {
    try {
      const application = applications.find(app => app.application_id === applicationId);
      if (!application) throw new Error('Application not found');
      await supervisorsService.approveRejectApplication(applicationId, {
        action: 'approve',
        approved_amount_mwk: application.requested_amount,
        override_prediction: false,
        override_reason: '',
        comments: 'Approved by supervisor',
      });
      toast({
        title: 'Success',
        description: 'Application approved successfully',
      });
      await Promise.all([fetchDashboardData(), fetchPendingApplications()]);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to approve application',
        variant: 'destructive',
      });
    }
  };

  const handleRejectApplication = async (applicationId: string) => {
    try {
      await supervisorsService.approveRejectApplication(applicationId, {
        action: 'reject',
        approved_amount_mwk: 0,
        override_prediction: false,
        override_reason: '',
        comments: 'Rejected by supervisor',
      });
      toast({
        title: 'Success',
        description: 'Application rejected successfully',
      });
      await Promise.all([fetchDashboardData(), fetchPendingApplications()]);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to reject application',
        variant: 'destructive',
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

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'MWK', minimumFractionDigits: 0 }).format(amount);

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Applications', icon: <TrendingUp className="h-6 w-6 text-blue-600" />, value: stats.total_applications },
          { label: 'Approved', icon: <CheckCircle className="h-6 w-6 text-green-600" />, value: stats.approved_applications },
          { label: 'Pending', icon: <Clock className="h-6 w-6 text-yellow-600" />, value: stats.pending_applications },
          { label: 'Rejected', icon: <XCircle className="h-6 w-6 text-red-600" />, value: stats.rejected_applications },
        ].map((stat, idx) => (
          <GlassCard key={idx} className="p-6">
            <div className="flex items-center">
              <div className="bg-gray-100 rounded-full p-3 mr-4">{stat.icon}</div>
              <div>
                <p className="text-sm text-gray-600">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>
      <GlassCard className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          Pending Applications - {user?.district?.name || 'All Districts'}
        </h2>
        {applications.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No pending applications</p>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map(application => (
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
                    <Badge className={getStatusColor(application.status)}>{application.status}</Badge>
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
    </div>
  );
};

export default SupervisorDashboard;
