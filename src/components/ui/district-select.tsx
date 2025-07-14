
import React, { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { apiService } from '@/lib/api';
import { toast } from '@/hooks/use-toast';

interface District {
  id: string;
  name: string;
  code: string;
  region: string;
}

interface DistrictSelectProps {
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export const DistrictSelect: React.FC<DistrictSelectProps> = ({
  value,
  onValueChange,
  placeholder = "Select a district",
  disabled = false
}) => {
  const [districts, setDistricts] = useState<District[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDistricts();
  }, []);

  const fetchDistricts = async () => {
    try {
      const data = await apiService.getAllDistricts();
      setDistricts(data || []);
    } catch (error) {
      console.error('Failed to fetch districts:', error);
      toast({
        title: "Error",
        description: "Failed to load districts",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Select disabled>
        <SelectTrigger>
          <SelectValue placeholder="Loading districts..." />
        </SelectTrigger>
      </Select>
    );
  }

  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {districts.map((district) => (
          <SelectItem key={district.id} value={district.id}>
            {district.name} ({district.region})
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
