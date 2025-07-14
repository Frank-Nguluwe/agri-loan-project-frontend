
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Settings } from 'lucide-react';
import { apiService } from '@/lib/api';
import { toast } from '@/hooks/use-toast';

export const SystemSettingsModal: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    key: '',
    value: '',
    description: ''
  });

  const commonSettings = [
    { key: 'max_loan_amount', label: 'Maximum Loan Amount (MWK)', type: 'number' },
    { key: 'min_loan_amount', label: 'Minimum Loan Amount (MWK)', type: 'number' },
    { key: 'default_interest_rate', label: 'Default Interest Rate (%)', type: 'number' },
    { key: 'system_maintenance_mode', label: 'Maintenance Mode', type: 'boolean' },
    { key: 'notification_email', label: 'System Notification Email', type: 'email' }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleQuickSetting = (key: string, label: string) => {
    setFormData({
      key,
      value: '',
      description: `System setting for ${label}`
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await apiService.updateSystemSettings(formData.key, formData.value, formData.description);
      toast({
        title: "Setting Updated",
        description: `${formData.key} has been updated successfully`,
      });
      
      setFormData({ key: '', value: '', description: '' });
      setOpen(false);
    } catch (error: any) {
      setError(error.message || 'Failed to update system setting');
      toast({
        title: "Update Failed",
        description: error.message || 'Failed to update system setting',
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Settings className="h-4 w-4 mr-2" />
          System Settings
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] bg-white">
        <DialogHeader>
          <DialogTitle>System Settings</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div>
            <h4 className="text-sm font-medium mb-3">Quick Settings</h4>
            <div className="grid grid-cols-2 gap-2">
              {commonSettings.map((setting) => (
                <Button
                  key={setting.key}
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickSetting(setting.key, setting.label)}
                  className="text-left justify-start"
                >
                  {setting.label}
                </Button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="key">Setting Key</Label>
              <Input
                id="key"
                name="key"
                value={formData.key}
                onChange={handleInputChange}
                placeholder="e.g., max_loan_amount"
                required
              />
            </div>

            <div>
              <Label htmlFor="value">Setting Value</Label>
              <Input
                id="value"
                name="value"
                value={formData.value}
                onChange={handleInputChange}
                placeholder="e.g., 500000"
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe what this setting controls..."
                rows={3}
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-[#2ACB25] hover:bg-[#1E9B1A] text-white"
                disabled={loading}
              >
                {loading ? 'Updating...' : 'Update Setting'}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};
