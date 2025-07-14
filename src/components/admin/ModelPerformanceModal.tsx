
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { TrendingUp, Activity, Database, AlertCircle } from 'lucide-react';
import { apiService } from '@/lib/api';
import { toast } from '@/hooks/use-toast';

interface ModelPerformance {
  accuracy: number;
  recent_predictions: any[];
  drift_metrics: any;
}

export const ModelPerformanceModal: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [performance, setPerformance] = useState<ModelPerformance>({
    accuracy: 0,
    recent_predictions: [],
    drift_metrics: {},
  });

  useEffect(() => {
    if (open) {
      fetchModelPerformance();
    }
  }, [open]);

  const fetchModelPerformance = async () => {
    try {
      setLoading(true);
      const data = await apiService.getModelPerformance();
      setPerformance(data as ModelPerformance);
    } catch (error) {
      console.error('Failed to fetch model performance:', error);
      toast({
        title: "Error",
        description: "Failed to load model performance data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getPerformanceStatus = (accuracy: number) => {
    if (accuracy >= 0.9) return { label: 'Excellent', color: 'text-green-600' };
    if (accuracy >= 0.8) return { label: 'Good', color: 'text-blue-600' };
    if (accuracy >= 0.7) return { label: 'Fair', color: 'text-yellow-600' };
    return { label: 'Needs Attention', color: 'text-red-600' };
  };

  const status = getPerformanceStatus(performance.accuracy);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <TrendingUp className="h-4 w-4 mr-2" />
          Model Performance
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] bg-white">
        <DialogHeader>
          <DialogTitle>ML Model Performance Dashboard</DialogTitle>
        </DialogHeader>
        
        {loading ? (
          <div className="flex justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2ACB25]"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Overall Performance */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <div className="flex items-center justify-center mb-2">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {Math.round(performance.accuracy * 100)}%
                </p>
                <p className="text-sm text-gray-600">Model Accuracy</p>
                <p className={`text-xs font-medium ${status.color}`}>
                  {status.label}
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <div className="flex items-center justify-center mb-2">
                  <Database className="h-6 w-6 text-blue-600" />
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {performance.recent_predictions.length}
                </p>
                <p className="text-sm text-gray-600">Recent Predictions</p>
                <p className="text-xs text-gray-500">Last 30 days</p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <div className="flex items-center justify-center mb-2">
                  <Activity className="h-6 w-6 text-purple-600" />
                </div>
                <p className="text-2xl font-bold text-gray-900">Active</p>
                <p className="text-sm text-gray-600">Model Status</p>
                <p className="text-xs text-green-600">Operational</p>
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold">Performance Metrics</h4>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Accuracy</span>
                  <span className="text-sm text-gray-600">
                    {Math.round(performance.accuracy * 100)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full"
                    style={{ width: `${performance.accuracy * 100}%` }}
                  ></div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Prediction Volume</span>
                  <span className="text-sm text-gray-600">
                    {performance.recent_predictions.length} predictions
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${Math.min(performance.recent_predictions.length * 2, 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div>
              <h4 className="text-lg font-semibold mb-3">Recent Activity</h4>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {performance.recent_predictions.length > 0 ? (
                  performance.recent_predictions.slice(0, 5).map((prediction, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm">Prediction #{index + 1}</span>
                      <span className="text-xs text-gray-500">Recently processed</span>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                    <p>No recent predictions available</p>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={fetchModelPerformance}>
                Refresh Data
              </Button>
              <Button 
                className="bg-[#2ACB25] hover:bg-[#1E9B1A] text-white"
                onClick={() => setOpen(false)}
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
