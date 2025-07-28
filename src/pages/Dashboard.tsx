import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Layout } from '@/components/layout/Layout';
import FarmerDashboard from './farmer/FarmerDashboard';
import LoanOfficerDashboard from './loan-officer/LoanOfficerDashboard';
import SupervisorDashboard from './supervisor/SupervisorDashboard';
import AdminDashboard from './admin/AdminDashboard';

const Dashboard = () => {
  const { user, loading, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/auth/login', { state: { from: '/dashboard' } });
    }
  }, [loading, isAuthenticated, navigate]);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2ACB25]"></div>
      </div>
    );
  }

  const getDashboardComponent = () => {
    switch (user.role) {
      case 'farmer':
        return <FarmerDashboard />;
      case 'loan_officer':
        return <LoanOfficerDashboard />;
      case 'supervisor':
        return <SupervisorDashboard />;
      case 'admin':
        return <AdminDashboard />;
      default:
        return (
          <div className="p-6 text-center">
            <h2 className="text-xl font-semibold text-red-600">Invalid Role</h2>
            <p className="text-gray-600 mt-2">
              Your account role ({user.role}) is not recognized. Please contact an administrator.
            </p>
          </div>
        );
    }
  };

  const getTitle = () => {
    switch (user.role) {
      case 'farmer': return 'Farmer Portal';
      case 'loan_officer': return 'Loan Officer Workspace';
      case 'supervisor': return 'Supervisor Console';
      case 'admin': return 'Admin Portal';
      default: return 'Dashboard';
    }
  };

  return (
    <Layout title={getTitle()}>
      {getDashboardComponent()}
    </Layout>
  );
};

export default Dashboard;