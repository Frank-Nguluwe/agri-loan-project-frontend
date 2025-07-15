
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { TrendingUp, MapPin, Shield } from 'lucide-react';

const Landing = () => {
  const navigate = useNavigate();

  const systemFeatures = [
    {
      icon: <TrendingUp className="h-6 w-6" />,
      title: 'AI-Powered Predictions',
      description: 'Machine learning models predict optimal loan amounts based on crop data and yield history'
    },
    {
      icon: <MapPin className="h-6 w-6" />,
      title: 'District-Based Management',
      description: 'Organized by districts for efficient loan processing and local agricultural expertise'
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: 'Multi-Level Approval',
      description: 'Secure approval workflow with loan officers and supervisors ensuring proper validation'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-white to-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Agricultural Loan
              <span className="text-[#2ACB25]"> Management</span> System
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Streamline agricultural lending with AI-powered loan predictions, 
              comprehensive farmer profiles, and efficient approval workflows.
            </p>
            <div className="flex justify-center">
              <Button 
                size="lg" 
                className="bg-[#2ACB25] hover:bg-[#1E9B1A] text-white"
                onClick={() => navigate('/auth/login')}
              >
                Sign In
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* System Features */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              System Features
            </h2>
            <p className="text-gray-600">
              Advanced technology for modern agricultural lending
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {systemFeatures.map((feature, index) => (
              <GlassCard key={index} className="p-6 text-center">
                <div className="bg-[#2ACB25] bg-opacity-10 rounded-full p-4 w-16 h-16 mx-auto mb-4">
                  <div className="text-[#2ACB25]">
                    {feature.icon}
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </GlassCard>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-gray-400">
              © 2025 Agricultural Loan Management System. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
