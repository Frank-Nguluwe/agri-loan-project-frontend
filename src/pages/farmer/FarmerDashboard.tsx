import React, { useState, useEffect } from 'react';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FarmerProfile } from '@/components/farmer/FarmerProfile';
import { Plus, FileText, User, TrendingUp, Calendar } from 'lucide-react';
import { farmersService } from '@/lib/api/farmers';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface Application {
  application_id: string;
  application_date: string;
  status: 'pending' | 'approved' | 'rejected';
  crop_type: string;
  predicted_amount_mwk: number;
  approved_amount_mwk: number | null;
  farm_size_hectares: number;
}

interface DashboardStats {
  totalApplications: number;
  approvedAmount: number;
  pendingApplications: number;
  lastApplicationDate: string | null;
}

const FarmerDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'profile'>('overview');
  const [stats, setStats] = useState<DashboardStats>({
    totalApplications: 0,
    approvedAmount: 0,
    pendingApplications: 0,
    lastApplicationDate: null,
  });

  useEffect(() => {
    if (user) {
      fetchApplications();
    }
  }, [user]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await farmersService.getFarmerApplications();
      console.log('API Response:', data);

      // Transform the data to match our interface
      const typedData: Application[] = data.map((app: any) => ({
        application_id: app.application_id,
        application_date: app.application_date,
        status: app.status,
        crop_type: app.crop_type,
        predicted_amount_mwk: Number(app.predicted_amount_mwk || app.predicted_amount || 0),
        approved_amount_mwk: app.approved_amount_mwk || app.approved_amount ? 
          Number(app.approved_amount_mwk || app.approved_amount) : null,
        farm_size_hectares: Number(app.farm_size_hectares) || 0
      }));
      
      setApplications(typedData);
      
      // Calculate statistics
      const totalApplications = typedData.length;
      const approvedAmount = typedData.reduce((sum, app) => sum + (app.approved_amount_mwk || 0), 0);
      const pendingApplications = typedData.filter(app => app.status === 'pending').length;
      const lastApplicationDate = typedData[0]?.application_date || null;
      
      setStats({
        totalApplications,
        approvedAmount,
        pendingApplications,
        lastApplicationDate,
      });
    } catch (err) {
      console.error('Failed to fetch applications:', err);
      setError('Failed to load applications. Please try again later.');
      toast({
        title: "Error",
        description: "Could not fetch your applications",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number | null | undefined) => {
    // Handle null/undefined cases
    if (amount === null || amount === undefined || isNaN(amount)) {
      return 'MWK 0';
    }
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'MWK',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
      currencyDisplay: 'narrowSymbol'
    }).format(amount).replace('MWK', 'MWK ');
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

  if (error) {
    return (
      <div className="p-6 text-center">
        <div className="text-red-500 mb-4">{error}</div>
        <Button onClick={fetchApplications}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex space-x-4 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === 'overview'
              ? 'border-[#2ACB25] text-[#2ACB25]'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Dashboard Overview
        </button>
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === 'profile'
              ? 'border-[#2ACB25] text-[#2ACB25]'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          My Profile
        </button>
      </div>

      {activeTab === 'overview' ? (
        <>
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
                <div className="bg-green-100 rounded-full p-3 mr-4">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Approved Amount</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(stats.approvedAmount)}
                  </p>
                </div>
              </div>
            </GlassCard>

            <GlassCard className="p-6">
              <div className="flex items-center">
                <div className="bg-yellow-100 rounded-full p-3 mr-4">
                  <Calendar className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Pending Applications</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.pendingApplications}</p>
                </div>
              </div>
            </GlassCard>

            <GlassCard className="p-6">
              <div className="flex items-center">
                <div className="bg-purple-100 rounded-full p-3 mr-4">
                  <User className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Last Application</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.lastApplicationDate ? formatDate(stats.lastApplicationDate) : 'None'}
                  </p>
                </div>
              </div>
            </GlassCard>
          </div>

          {/* Quick Actions */}
          <div className="flex space-x-4">
            <Button
              className="bg-[#2ACB25] hover:bg-[#1E9B1A] text-white"
              onClick={() => navigate('/farmer/apply')}
            >
              <Plus className="h-4 w-4 mr-2" />
              New Loan Application
            </Button>
            <Button
              variant="outline"
              onClick={() => setActiveTab('profile')}
            >
              <User className="h-4 w-4 mr-2" />
              View Profile
            </Button>
          </div>

          {/* Recent Applications */}
          <GlassCard className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">My Applications</h2>
              <Button
                variant="outline"
                onClick={() => navigate('/farmer/applications')}
              >
                View All
              </Button>
            </div>

            {applications.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No applications yet</p>
                <Button
                  className="mt-4 bg-[#2ACB25] hover:bg-[#1E9B1A] text-white"
                  onClick={() => navigate('/farmer/apply')}
                >
                  Submit Your First Application
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {applications.slice(0, 5).map((application) => (
                  <div
                    key={`application-${application.application_id}`}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => navigate(`/farmer/applications/${application.application_id}`)}
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h3 className="font-medium text-gray-900">{application.crop_type}</h3>
                        <Badge className={getStatusColor(application.status)}>
                          {application.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {application.farm_size_hectares} hectares • Applied on {formatDate(application.application_date)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">
                        {formatCurrency(application.predicted_amount_mwk)}
                      </p>
                      <p className="text-sm text-gray-600">Predicted Amount</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </GlassCard>
        </>
      ) : (
        <FarmerProfile />
      )}
    </div>
  );
};

export default FarmerDashboard;