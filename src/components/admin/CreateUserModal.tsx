import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { adminService } from '@/lib/api/admin';
import { districtsService, District } from '@/lib/api/districts';
import { toast } from '@/hooks/use-toast';

interface CreateUserModalProps {
  onUserCreated: () => void;
}

const CreateUserModal: React.FC<CreateUserModalProps> = ({ onUserCreated }) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [districtLoading, setDistrictLoading] = useState(false);
  const [districts, setDistricts] = useState<District[]>([]);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    role: 'farmer',
    district_id: '',
    password: '',
  });

  useEffect(() => {
    if (open) {
      fetchDistricts();
    }
  }, [open]);

  const fetchDistricts = async () => {
    setDistrictLoading(true);
    try {
      const data = await districtsService.getDistricts();
      setDistricts(data);
    } catch (error) {
      console.error('Failed to fetch districts:', error);
      toast({
        title: 'Error',
        description: 'Failed to load districts',
        variant: 'destructive',
      });
    } finally {
      setDistrictLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.district_id) {
      toast({
        title: 'Validation Error',
        description: 'Please select a district',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      await adminService.createUser(formData);
      toast({
        title: 'Success',
        description: 'User created successfully',
      });
      setOpen(false);
      onUserCreated();
      setFormData({
        first_name: '',
        last_name: '',
        email: '',
        phone_number: '',
        role: 'farmer',
        district_id: '',
        password: '',
      });
    } catch (error: any) {
      console.error('Failed to create user:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create user',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button 
        onClick={() => setOpen(true)}
        className="bg-[#2ACB25] hover:bg-[#1E9B1A] text-white"
      >
        Create New User
      </Button>

      {open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Create New User</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="first_name">First Name *</Label>
                  <Input
                    id="first_name"
                    value={formData.first_name}
                    onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="last_name">Last Name *</Label>
                  <Input
                    id="last_name"
                    value={formData.last_name}
                    onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                />
              </div>

              <div>
                <Label htmlFor="phone_number">Phone Number *</Label>
                <Input
                  id="phone_number"
                  value={formData.phone_number}
                  onChange={(e) => setFormData({...formData, phone_number: e.target.value})}
                  required
                />
              </div>

              <div>
                <Label htmlFor="role">Role *</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) => setFormData({...formData, role: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="farmer">Farmer</SelectItem>
                    <SelectItem value="loan_officer">Loan Officer</SelectItem>
                    <SelectItem value="supervisor">Supervisor</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="district">District *</Label>
                <Select
                  value={formData.district_id}
                  onValueChange={(value) => setFormData({...formData, district_id: value})}
                  disabled={districtLoading}
                >
                  <SelectTrigger>
                    <SelectValue 
                      placeholder={districtLoading ? "Loading districts..." : "Select district"} 
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {districts.map((district) => (
                      <SelectItem key={district.id} value={district.id}>
                        {district.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="password">Password *</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  required
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4">
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
                  disabled={loading || districtLoading}
                  className="bg-[#2ACB25] hover:bg-[#1E9B1A] text-white"
                >
                  {loading ? 'Creating...' : 'Create User'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default CreateUserModal;