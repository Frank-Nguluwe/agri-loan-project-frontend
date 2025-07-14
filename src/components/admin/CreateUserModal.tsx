
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { UserPlus } from 'lucide-react';
import { apiService } from '@/lib/api';
import { toast } from '@/hooks/use-toast';

interface CreateUserModalProps {
  onUserCreated: () => void;
}

export const CreateUserModal: React.FC<CreateUserModalProps> = ({ onUserCreated }) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    role: 'farmer' as 'farmer' | 'loan_officer' | 'supervisor' | 'admin',
    password: '',
    district_id: '880bc4ee-477a-4e12-a0f0-c89f020ba05d'
  });

  const roles = [
    { value: 'farmer', label: 'Farmer' },
    { value: 'loan_officer', label: 'Loan Officer' },
    { value: 'supervisor', label: 'Supervisor' },
    { value: 'admin', label: 'Administrator' }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleRoleChange = (value: string) => {
    setFormData({
      ...formData,
      role: value as 'farmer' | 'loan_officer' | 'supervisor' | 'admin'
    });
  };

  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData({ ...formData, password });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await apiService.createUser(formData);
      toast({
        title: "User Created Successfully",
        description: `${formData.first_name} ${formData.last_name} has been created with role: ${formData.role}`,
      });
      
      // Reset form and close modal
      setFormData({
        first_name: '',
        last_name: '',
        email: '',
        phone_number: '',
        role: 'farmer',
        password: '',
        district_id: '880bc4ee-477a-4e12-a0f0-c89f020ba05d'
      });
      setOpen(false);
      onUserCreated();
    } catch (error: any) {
      setError(error.message || 'Failed to create user');
      toast({
        title: "Failed to Create User",
        description: error.message || 'An error occurred while creating the user',
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-[#2ACB25] hover:bg-[#1E9B1A] text-white">
          <UserPlus className="h-4 w-4 mr-2" />
          Create User
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] bg-white">
        <DialogHeader>
          <DialogTitle>Create New User</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="first_name">First Name</Label>
              <Input
                id="first_name"
                name="first_name"
                value={formData.first_name}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="last_name">Last Name</Label>
              <Input
                id="last_name"
                name="last_name"
                value={formData.last_name}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
          </div>

          <div>
            <Label htmlFor="phone_number">Phone Number</Label>
            <Input
              id="phone_number"
              name="phone_number"
              value={formData.phone_number}
              onChange={handleInputChange}
              required
            />
          </div>

          <div>
            <Label htmlFor="role">Role</Label>
            <Select onValueChange={handleRoleChange} defaultValue={formData.role}>
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                {roles.map((role) => (
                  <SelectItem key={role.value} value={role.value}>
                    {role.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="password">Password</Label>
            <div className="flex space-x-2">
              <Input
                id="password"
                name="password"
                type="text"
                value={formData.password}
                onChange={handleInputChange}
                required
                placeholder="Enter password or generate one"
              />
              <Button type="button" variant="outline" onClick={generatePassword}>
                Generate
              </Button>
            </div>
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
              {loading ? 'Creating...' : 'Create User'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
