import React, { useState, useEffect } from 'react';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { User, MapPin, Phone, Mail } from 'lucide-react';
import { apiService } from '@/lib/api';
import { toast } from '@/hooks/use-toast';

interface FarmerProfileData {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  district_id: string;
  district_name: string;
  farm_size_hectares: number;
  primary_crop: string;
  address: string;
}

export const FarmerProfile: React.FC = () => {
  const [profile, setProfile] = useState<FarmerProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const data = await apiService.getFarmerProfile();
      setProfile(data as FarmerProfileData);
    } catch (error) {
      console.error('Failed to fetch farmer profile:', error);
      toast({
        title: "Error",
        description: "Failed to load profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading && !profile) {
    return (
      <GlassCard className="p-6 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-8 bg-gray-200 rounded w-1/2"></div>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold text-gray-900 flex items-center">
          <User className="h-5 w-5 mr-2" />
          Farmer Profile
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium text-gray-500">First Name</h4>
            <p className="text-gray-900 font-medium">{profile?.first_name}</p>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-500">Last Name</h4>
            <p className="text-gray-900 font-medium">{profile?.last_name}</p>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-500">Email</h4>
            <div className="flex items-center">
              <Mail className="h-4 w-4 mr-2 text-gray-500" />
              <p className="text-gray-900">{profile?.email}</p>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-500">Phone Number</h4>
            <div className="flex items-center">
              <Phone className="h-4 w-4 mr-2 text-gray-500" />
              <p className="text-gray-900">{profile?.phone}</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium text-gray-500">District</h4>
            <div className="flex items-center">
              <MapPin className="h-4 w-4 mr-2 text-gray-500" />
              <p className="text-gray-900">{profile?.district_name}</p>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-500">Farm Size</h4>
            <p className="text-gray-900 font-medium">{profile?.farm_size_hectares} hectares</p>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-500">Primary Crop</h4>
            <p className="text-gray-900 font-medium">{profile?.primary_crop}</p>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-500">Address</h4>
            <p className="text-gray-900">{profile?.address}</p>
          </div>
        </div>
      </div>
    </GlassCard>
  );
};