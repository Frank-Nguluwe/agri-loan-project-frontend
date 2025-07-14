
import React, { useState, useEffect } from 'react';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DistrictSelect } from '@/components/ui/district-select';
import { User, MapPin, Phone, Mail, Edit, Save, X } from 'lucide-react';
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
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<FarmerProfileData>>({});

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const data = await apiService.getFarmerProfile();
      setProfile(data as FarmerProfileData);
      setFormData(data as FarmerProfileData);
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

  const handleSave = async () => {
    try {
      setLoading(true);
      await apiService.updateProfile(formData);
      setProfile(formData as FarmerProfileData);
      setEditing(false);
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData(profile || {});
    setEditing(false);
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
        {!editing && (
          <Button
            variant="outline"
            onClick={() => setEditing(true)}
            className="flex items-center"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit Profile
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="first_name">First Name</Label>
            {editing ? (
              <Input
                id="first_name"
                value={formData.first_name || ''}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
              />
            ) : (
              <p className="text-gray-900 font-medium">{profile?.first_name}</p>
            )}
          </div>

          <div>
            <Label htmlFor="last_name">Last Name</Label>
            {editing ? (
              <Input
                id="last_name"
                value={formData.last_name || ''}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
              />
            ) : (
              <p className="text-gray-900 font-medium">{profile?.last_name}</p>
            )}
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <div className="flex items-center">
              <Mail className="h-4 w-4 mr-2 text-gray-500" />
              <p className="text-gray-900">{profile?.email}</p>
            </div>
          </div>

          <div>
            <Label htmlFor="phone">Phone Number</Label>
            {editing ? (
              <Input
                id="phone"
                value={formData.phone || ''}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            ) : (
              <div className="flex items-center">
                <Phone className="h-4 w-4 mr-2 text-gray-500" />
                <p className="text-gray-900">{profile?.phone}</p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="district">District</Label>
            {editing ? (
              <DistrictSelect
                value={formData.district_id || ''}
                onValueChange={(value) => setFormData({ ...formData, district_id: value })}
              />
            ) : (
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                <p className="text-gray-900">{profile?.district_name}</p>
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="farm_size">Farm Size (hectares)</Label>
            {editing ? (
              <Input
                id="farm_size"
                type="number"
                step="0.1"
                value={formData.farm_size_hectares || ''}
                onChange={(e) => setFormData({ ...formData, farm_size_hectares: parseFloat(e.target.value) || 0 })}
              />
            ) : (
              <p className="text-gray-900 font-medium">{profile?.farm_size_hectares} hectares</p>
            )}
          </div>

          <div>
            <Label htmlFor="primary_crop">Primary Crop</Label>
            {editing ? (
              <Input
                id="primary_crop"
                value={formData.primary_crop || ''}
                onChange={(e) => setFormData({ ...formData, primary_crop: e.target.value })}
              />
            ) : (
              <p className="text-gray-900 font-medium">{profile?.primary_crop}</p>
            )}
          </div>

          <div>
            <Label htmlFor="address">Address</Label>
            {editing ? (
              <Input
                id="address"
                value={formData.address || ''}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            ) : (
              <p className="text-gray-900">{profile?.address}</p>
            )}
          </div>
        </div>
      </div>

      {editing && (
        <div className="flex justify-end space-x-2 mt-6 pt-4 border-t">
          <Button variant="outline" onClick={handleCancel}>
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading} className="bg-[#2ACB25] hover:bg-[#1E9B1A] text-white">
            <Save className="h-4 w-4 mr-2" />
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      )}
    </GlassCard>
  );
};
