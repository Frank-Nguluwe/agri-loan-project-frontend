import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, Activity, RefreshCw, Upload, RotateCcw, Play, Square } from 'lucide-react';
import { apiService } from '@/lib/api';
import { toast } from '@/hooks/use-toast';

interface ModelInfo {
  name: string;
  version: string;
  status: string;
  last_trained: string;
  accuracy: number;
}

interface DeploymentStatus {
  status: string;
  version: string;
  deployed_at: string;
  health: string;
}

export const ModelManagementModal: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [modelInfo, setModelInfo] = useState<ModelInfo | null>(null);
  const [deploymentStatus, setDeploymentStatus] = useState<DeploymentStatus | null>(null);
  const [health, setHealth] = useState<any>(null);

  useEffect(() => {
    if (open) {
      fetchModelData();
    }
  }, [open]);

  const fetchModelData = async () => {
    try {
      setLoading(true);
      const [modelData, statusData, healthData] = await Promise.all([
        apiService.getModelInfo(),
        apiService.getDeploymentStatus(),
        apiService.getMonitoringHealth(),
      ]);
      
      setModelInfo(modelData as ModelInfo);
      setDeploymentStatus(statusData as DeploymentStatus);
      setHealth(healthData);
    } catch (error) {
      console.error('Failed to fetch model data:', error);
      toast({
        title: "Error",
        description: "Failed to load model information",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeploy = async () => {
    try {
      setLoading(true);
      await apiService.deployModel();
      toast({
        title: "Success",
        description: "Model deployment initiated",
      });
      fetchModelData();
    } catch (error) {
      console.error('Deploy failed:', error);
      toast({
        title: "Error",
        description: "Failed to deploy model",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRollback = async () => {
    try {
      setLoading(true);
      await apiService.rollbackModel();
      toast({
        title: "Success",
        description: "Model rollback initiated",
      });
      fetchModelData();
    } catch (error) {
      console.error('Rollback failed:', error);
      toast({
        title: "Error",
        description: "Failed to rollback model",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReload = async () => {
    try {
      setLoading(true);
      await apiService.reloadModel();
      toast({
        title: "Success",
        description: "Model reloaded successfully",
      });
      fetchModelData();
    } catch (error) {
      console.error('Reload failed:', error);
      toast({
        title: "Error",
        description: "Failed to reload model",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
      case 'healthy':
        return 'bg-green-100 text-green-800';
      case 'deploying':
      case 'loading':
        return 'bg-yellow-100 text-yellow-800';
      case 'error':
      case 'unhealthy':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Settings className="h-4 w-4 mr-2" />
          Model Management
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px] bg-white">
        <DialogHeader>
          <DialogTitle>ML Model Management</DialogTitle>
        </DialogHeader>
        
        {loading ? (
          <div className="flex justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2ACB25]"></div>
          </div>
        ) : (
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="deployment">Deployment</TabsTrigger>
              <TabsTrigger value="health">Health</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              {modelInfo && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-2">Model Information</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Name:</span>
                        <span className="text-sm font-medium">{modelInfo.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Version:</span>
                        <span className="text-sm font-medium">{modelInfo.version}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Status:</span>
                        <Badge className={getStatusColor(modelInfo.status)}>
                          {modelInfo.status}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Accuracy:</span>
                        <span className="text-sm font-medium">
                          {Math.round(modelInfo.accuracy * 100)}%
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-2">Quick Actions</h4>
                    <div className="space-y-2">
                      <Button 
                        className="w-full" 
                        variant="outline" 
                        onClick={handleReload}
                        disabled={loading}
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Reload Model
                      </Button>
                      <Button 
                        className="w-full" 
                        variant="outline" 
                        onClick={fetchModelData}
                        disabled={loading}
                      >
                        <Activity className="h-4 w-4 mr-2" />
                        Refresh Data
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="deployment" className="space-y-4">
              {deploymentStatus && (
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-3">Deployment Status</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Current Status:</span>
                        <Badge className={getStatusColor(deploymentStatus.status)}>
                          {deploymentStatus.status}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Version:</span>
                        <span className="text-sm font-medium">{deploymentStatus.version}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Deployed At:</span>
                        <span className="text-sm font-medium">
                          {new Date(deploymentStatus.deployed_at).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button 
                      onClick={handleDeploy}
                      disabled={loading}
                      className="bg-[#2ACB25] hover:bg-[#1E9B1A] text-white"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Deploy Model
                    </Button>
                    <Button 
                      onClick={handleRollback}
                      disabled={loading}
                      variant="outline"
                    >
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Rollback
                    </Button>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="health" className="space-y-4">
              {health && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-3">System Health</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <span className="text-sm text-gray-600">Overall Status:</span>
                      <Badge className={getStatusColor(health.status)}>
                        {health.status || 'Unknown'}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <span className="text-sm text-gray-600">Last Check:</span>
                      <span className="text-sm font-medium">
                        {new Date().toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}

        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
