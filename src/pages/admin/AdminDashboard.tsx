import React, { useState, useEffect } from 'react';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { CreateUserModal } from '@/components/admin/CreateUserModal';
import { UserManagementTable } from '@/components/admin/UserManagementTable';
import { SystemSettingsModal } from '@/components/admin/SystemSettingsModal';
import { ModelPerformanceModal } from '@/components/admin/ModelPerformanceModal';
import { ModelManagementModal } from '@/components/admin/ModelManagementModal';
import { DistrictSelect } from '@/components/ui/district-select';
import { Users, TrendingUp, Activity, Database, MapPin } from 'lucide-react';
import apiService from '@/lib/api';
import { toast } from '@/hooks/use-toast';

const getCurrentUserRole = () => {
  return localStorage.getItem('userRole') || 'admin';
};

interface ModelPerformance {
  accuracy: number;
  recent_predictions: any[];
  drift_metrics: any;
}

const AdminDashboard = () => {
  console.log('AdminDashboard - Component rendering');

  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<any[]>([]);
  const [modelPerformance, setModelPerformance] = useState<ModelPerformance>({
    accuracy: 0,
    recent_predictions: [],
    drift_metrics: {},
  });
  const [selectedDistrict, setSelectedDistrict] = useState<string>('');
  const [pendingApplications, setPendingApplications] = useState<any[]>([]);

  const userRole = getCurrentUserRole();

  useEffect(() => {
    console.log('AdminDashboard - useEffect triggered, fetching data');
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    console.log('AdminDashboard - fetchDashboardData started');
    try {
      const usersPromise = apiService.getUsers().catch(err => {
        console.error('Failed to fetch users:', err);
        return [];
      });

      const performancePromise = apiService.getModelPerformance().catch(err => {
        console.error('Failed to fetch model performance:', err);
        return { accuracy: 0, recent_predictions: [], drift_metrics: {} };
      });

      const pendingPromise =
        userRole === 'supervisor'
          ? apiService.getPendingPredictionApplications().catch(err => {
              console.error('Failed to fetch pending applications:', err);
              return [];
            })
          : Promise.resolve([]); 

      const [usersData, performanceData, pendingData] = await Promise.all([
        usersPromise,
        performancePromise,
        pendingPromise,
      ]);

      console.log('AdminDashboard - Data fetched:', {
        usersData,
        performanceData,
        pendingData,
      });

      setUsers(Array.isArray(usersData) ? usersData : []);
      setModelPerformance(
        (performanceData as ModelPerformance) || {
          accuracy: 0,
          recent_predictions: [],
          drift_metrics: {},
        }
      );
      setPendingApplications(Array.isArray(pendingData) ? pendingData : []);
    } catch (error) {
      console.error('AdminDashboard - Failed to fetch dashboard data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load dashboard data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
      console.log('AdminDashboard - Data fetching completed');
    }
  };

  const handleProcessPendingBatch = async () => {
    try {
      setLoading(true);
      await apiService.processPendingBatch();
      toast({
        title: 'Success',
        description: 'Pending applications processed successfully',
      });
      fetchDashboardData();
    } catch (error) {
      console.error('Failed to process pending batch:', error);
      toast({
        title: 'Error',
        description: 'Failed to process pending applications',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  console.log('AdminDashboard - Render state:', {
    loading,
    usersCount: users.length,
  });

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
      {/* District Filter */}
      <GlassCard className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <MapPin className="h-5 w-5 text-gray-600" />
            <span className="font-medium text-gray-900">Filter by District:</span>
            <div className="w-64">
              <DistrictSelect
                value={selectedDistrict}
                onValueChange={setSelectedDistrict}
                placeholder="All Districts"
              />
            </div>
          </div>
          <div className="text-sm text-gray-600">
            {selectedDistrict ? 'Filtered view' : 'Showing all districts'}
          </div>
        </div>
      </GlassCard>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <GlassCard className="p-6">
          <div className="flex items-center">
            <div className="bg-blue-100 rounded-full p-3 mr-4">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{users.length}</p>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center">
            <div className="bg-green-100 rounded-full p-3 mr-4">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Model Accuracy</p>
              <p className="text-2xl font-bold text-gray-900">
                {Math.round(modelPerformance.accuracy * 100)}%
              </p>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center">
            <div className="bg-yellow-100 rounded-full p-3 mr-4">
              <Activity className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Recent Predictions</p>
              <p className="text-2xl font-bold text-gray-900">
                {modelPerformance.recent_predictions.length}
              </p>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center">
            <div className="bg-purple-100 rounded-full p-3 mr-4">
              <Database className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Pending Applications</p>
              <p className="text-2xl font-bold text-gray-900">
                {pendingApplications.length}
              </p>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4">
        <CreateUserModal onUserCreated={fetchDashboardData} />
        <SystemSettingsModal />
        <ModelPerformanceModal />
        <ModelManagementModal />

        {/* Only show Process Pending if supervisor and there are pending */}
        {userRole === 'supervisor' && pendingApplications.length > 0 && (
          <Button
            onClick={handleProcessPendingBatch}
            disabled={loading}
            className="bg-[#2ACB25] hover:bg-[#1E9B1A] text-white"
          >
            <Database className="h-4 w-4 mr-2" />
            Process Pending ({pendingApplications.length})
          </Button>
        )}
      </div>

      {/* User Management Table */}
      <UserManagementTable
        users={users}
        onUsersChange={fetchDashboardData}
        selectedDistrict={selectedDistrict}
      />
    </div>
  );
};

export default AdminDashboard;
