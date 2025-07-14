import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileCheck, Send } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { farmersService } from '@/lib/api/farmers';
import { dashboardService, CropType } from '@/lib/api/dashboard';

interface ApplicationFormData {
  loan_farm_size: number;
  loan_crop: string;
  past_yield_kgs: number;
  past_yield_mk: number;
  expected_yield_kgs: number;
  expected_yield_mk: number;
}

export const LoanApplicationForm: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [cropTypes, setCropTypes] = useState<CropType[]>([]);
  const [formData, setFormData] = useState<ApplicationFormData>({
    loan_farm_size: 0,
    loan_crop: '',
    past_yield_kgs: 0,
    past_yield_mk: 0,
    expected_yield_kgs: 0,
    expected_yield_mk: 0,
  });

  useEffect(() => {
    fetchCropTypes();
  }, []);

  const fetchCropTypes = async () => {
    try {
      const data = await dashboardService.getCropTypes();
      setCropTypes(data);
    } catch (error) {
      console.error('Failed to fetch crop types:', error);
      toast({
        title: 'Error',
        description: 'Failed to load crop types',
        variant: 'destructive',
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.loan_crop || formData.loan_farm_size <= 0) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoading(true);
      await farmersService.submitApplication({
        ...formData,
        farmer_id: user?.id,
      });

      toast({
        title: 'Application Submitted',
        description: 'Your loan application has been submitted successfully',
      });

      navigate('/dashboard');
    } catch (error) {
      console.error('Failed to submit application:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit application',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof ApplicationFormData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: typeof value === 'number' && isNaN(value) ? 0 : value,
    }));
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <GlassCard className="p-6">
        <div className="flex items-center mb-6">
          <FileCheck className="h-6 w-6 text-[#2ACB25] mr-3" />
          <h2 className="text-2xl font-bold text-gray-900">Loan Application</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Crop & Farm Info */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="loan_crop">Crop Type *</Label>
                <Select
                  value={formData.loan_crop}
                  onValueChange={value => handleInputChange('loan_crop', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select crop type" />
                  </SelectTrigger>
                  <SelectContent>
                    {cropTypes.map(crop => (
                      <SelectItem key={crop.id} value={crop.name}>
                        {crop.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="loan_farm_size">Farm Size (hectares) *</Label>
                <Input
                  id="loan_farm_size"
                  type="number"
                  step="0.1"
                  value={formData.loan_farm_size || ''}
                  onChange={e => handleInputChange('loan_farm_size', parseFloat(e.target.value))}
                  placeholder="Enter farm size"
                  required
                />
              </div>

              <div>
                <Label htmlFor="past_yield_kgs">Past Yield (kg)</Label>
                <Input
                  id="past_yield_kgs"
                  type="number"
                  value={formData.past_yield_kgs || ''}
                  onChange={e => handleInputChange('past_yield_kgs', parseInt(e.target.value))}
                  placeholder="Enter past yield in kg"
                />
              </div>

              <div>
                <Label htmlFor="past_yield_mk">Past Yield Value (MWK)</Label>
                <Input
                  id="past_yield_mk"
                  type="number"
                  value={formData.past_yield_mk || ''}
                  onChange={e => handleInputChange('past_yield_mk', parseInt(e.target.value))}
                  placeholder="Enter past yield value"
                />
              </div>

              <div>
                <Label htmlFor="expected_yield_kgs">Expected Yield (kg)</Label>
                <Input
                  id="expected_yield_kgs"
                  type="number"
                  value={formData.expected_yield_kgs || ''}
                  onChange={e => handleInputChange('expected_yield_kgs', parseInt(e.target.value))}
                  placeholder="Enter expected yield in kg"
                />
              </div>

              <div>
                <Label htmlFor="expected_yield_mk">Expected Yield Value (MWK)</Label>
                <Input
                  id="expected_yield_mk"
                  type="number"
                  value={formData.expected_yield_mk || ''}
                  onChange={e => handleInputChange('expected_yield_mk', parseInt(e.target.value))}
                  placeholder="Enter expected yield value"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/dashboard')}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-[#2ACB25] hover:bg-[#1E9B1A] text-white"
            >
              {loading ? 'Submitting...' : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Submit Application
                </>
              )}
            </Button>
          </div>
        </form>
      </GlassCard>
    </div>
  );
};
