import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DistrictSelect } from '@/components/ui/district-select';
import { Calculator, TrendingUp, AlertCircle } from 'lucide-react';
import { apiService, PredictionResponse } from '@/lib/api';
import { toast } from '@/hooks/use-toast';

interface CropType {
  id: string;
  name: string;
}

export const LoanPredictionModal: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [cropTypes, setCropTypes] = useState<CropType[]>([]);
  const [prediction, setPrediction] = useState<PredictionResponse | null>(null);
  
  const [formData, setFormData] = useState({
    crop_type_id: '',
    farm_size_hectares: 0,
    expected_yield_kg: 0,
    expected_revenue_mwk: 0,
    district_id: '',
  });

  useEffect(() => {
    if (open) {
      fetchCropTypes();
    }
  }, [open]);

  const fetchCropTypes = async () => {
    try {
      const data = await apiService.getCropTypes();
      setCropTypes((data as CropType[]) || []);
    } catch (error) {
      console.error('Failed to fetch crop types:', error);
      toast({
        title: "Error",
        description: "Failed to load crop types",
        variant: "destructive",
      });
    }
  };

  const handlePredict = async () => {
    if (!formData.crop_type_id || !formData.district_id || formData.farm_size_hectares <= 0) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      const result = await apiService.predictLoanAmount({
        farmer_id: 'current_farmer', // This should come from auth context
        ...formData,
      });
      setPrediction(result);
      toast({
        title: "Prediction Complete",
        description: "Loan amount prediction has been calculated",
      });
    } catch (error) {
      console.error('Prediction failed:', error);
      toast({
        title: "Error",
        description: "Failed to predict loan amount",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      crop_type_id: '',
      farm_size_hectares: 0,
      expected_yield_kg: 0,
      expected_revenue_mwk: 0,
      district_id: '',
    });
    setPrediction(null);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'MWK',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-[#2ACB25] hover:bg-[#1E9B1A] text-white">
          <Calculator className="h-4 w-4 mr-2" />
          Predict Loan Amount
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] bg-white">
        <DialogHeader>
          <DialogTitle>Loan Amount Prediction</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="crop_type">Crop Type *</Label>
              <Select
                value={formData.crop_type_id}
                onValueChange={(value) => setFormData({ ...formData, crop_type_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select crop type" />
                </SelectTrigger>
                <SelectContent>
                  {cropTypes.map((crop) => (
                    <SelectItem key={crop.id} value={crop.id}>
                      {crop.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="district">District *</Label>
              <DistrictSelect
                value={formData.district_id}
                onValueChange={(value) => setFormData({ ...formData, district_id: value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="farm_size">Farm Size (hectares) *</Label>
              <Input
                id="farm_size"
                type="number"
                step="0.1"
                value={formData.farm_size_hectares}
                onChange={(e) => setFormData({ ...formData, farm_size_hectares: parseFloat(e.target.value) || 0 })}
                placeholder="Enter farm size"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="expected_yield">Expected Yield (kg)</Label>
              <Input
                id="expected_yield"
                type="number"
                value={formData.expected_yield_kg}
                onChange={(e) => setFormData({ ...formData, expected_yield_kg: parseInt(e.target.value) || 0 })}
                placeholder="Enter expected yield"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="expected_revenue">Expected Revenue (MWK)</Label>
              <Input
                id="expected_revenue"
                type="number"
                value={formData.expected_revenue_mwk}
                onChange={(e) => setFormData({ ...formData, expected_revenue_mwk: parseInt(e.target.value) || 0 })}
                placeholder="Enter expected revenue"
              />
            </div>
          </div>

          {prediction && (
            <div className="bg-green-50 p-6 rounded-lg text-center">
              <TrendingUp className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-green-900 mb-2">
                Predicted Loan Amount
              </h3>
              <p className="text-3xl font-bold text-green-600">
                {formatCurrency(prediction.predicted_amount_mwk)}
              </p>
            </div>
          )}

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={handleReset}>
              Reset
            </Button>
            <Button 
              onClick={handlePredict}
              disabled={loading}
              className="bg-[#2ACB25] hover:bg-[#1E9B1A] text-white"
            >
              {loading ? 'Calculating...' : 'Predict Loan Amount'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
