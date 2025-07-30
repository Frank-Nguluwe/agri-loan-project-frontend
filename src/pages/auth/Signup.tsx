import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService, SignupData } from '@/lib/api/auth';
import { districtsService, District } from '@/lib/api/districts';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const Signup = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [districts, setDistricts] = useState<District[]>([]);
  const [fetchingDistricts, setFetchingDistricts] = useState(true);
  
  // Define available roles based on SignupData type
  const roles = [
    { code: 'farmer', name: 'Farmer' },
    { code: 'loan_officer', name: 'Loan Officer' },
    { code: 'supervisor', name: 'Supervisor' },
    { code: 'admin', name: 'Admin' }
  ];

  const [formData, setFormData] = useState<Omit<SignupData, 'district_id' | 'role'>>({
    email: '',
    phone_number: '',
    first_name: '',
    last_name: '',
    password: '',
  });

  const [selectedDistrict, setSelectedDistrict] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<string>('');

  useEffect(() => {
    const fetchDistricts = async () => {
      try {
        const districtsData = await districtsService.getDistricts();
        setDistricts(districtsData);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch districts",
          variant: "destructive",
        });
        console.error('Error fetching districts:', error);
      } finally {
        setFetchingDistricts(false);
      }
    };

    fetchDistricts();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate required fields
    if (!selectedDistrict || !selectedRole) {
      setError('Please select both district and role');
      setLoading(false);
      return;
    }

    try {
      // Combine all form data with selections
      const signupPayload: SignupData = {
        ...formData,
        district_id: selectedDistrict,
        role: selectedRole as SignupData['role'] // Type assertion since we know it's valid
      };

      await authService.signup(signupPayload);
      
      toast({
        title: "Account Created Successfully",
        description: "Please sign in with your new account",
      });
      
      navigate('/auth/login');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to create account';
      setError(errorMessage);
      toast({
        title: "Signup Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Button
            variant="ghost"
            className="mb-4"
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Sign Up</h1>
          <p className="text-gray-600 mt-2">
            Create your loan management account
          </p>
        </div>

        <GlassCard className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* First Name */}
            <div>
              <Label htmlFor="first_name">First Name</Label>
              <Input
                id="first_name"
                name="first_name"
                type="text"
                value={formData.first_name}
                onChange={handleInputChange}
                placeholder="Enter your first name"
                required
                className="mt-1"
              />
            </div>

            {/* Last Name */}
            <div>
              <Label htmlFor="last_name">Last Name</Label>
              <Input
                id="last_name"
                name="last_name"
                type="text"
                value={formData.last_name}
                onChange={handleInputChange}
                placeholder="Enter your last name"
                required
                className="mt-1"
              />
            </div>

            {/* Email */}
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter your email"
                required
                className="mt-1"
              />
            </div>

            {/* Phone Number */}
            <div>
              <Label htmlFor="phone_number">Phone Number</Label>
              <Input
                id="phone_number"
                name="phone_number"
                type="tel"
                value={formData.phone_number}
                onChange={handleInputChange}
                placeholder="Enter your phone number"
                required
                className="mt-1"
              />
            </div>

            {/* Role Selection */}
            <div>
              <Label htmlFor="role">Role</Label>
              <Select
                value={selectedRole}
                onValueChange={setSelectedRole}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.code} value={role.code}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* District Selection */}
            <div>
              <Label htmlFor="district">District</Label>
              <Select
                value={selectedDistrict}
                onValueChange={setSelectedDistrict}
                disabled={fetchingDistricts}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder={fetchingDistricts ? "Loading districts..." : "Select your district"} />
                </SelectTrigger>
                <SelectContent>
                  {districts.map((district) => (
                    <SelectItem key={district.id} value={district.id}>
                      {district.name} {district.region ? `(${district.region})` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Password */}
            <div>
              <Label htmlFor="password">Password</Label>
              <div className="mt-1 relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center pr-3"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            {/* Optional National ID */}
            <div>
              <Label htmlFor="national_id">National ID (Optional)</Label>
              <Input
                id="national_id"
                name="national_id"
                type="text"
                value={formData.national_id || ''}
                onChange={handleInputChange}
                placeholder="Enter your national ID"
                className="mt-1"
              />
            </div>

            {/* Optional Address */}
            <div>
              <Label htmlFor="address">Address (Optional)</Label>
              <Input
                id="address"
                name="address"
                type="text"
                value={formData.address || ''}
                onChange={handleInputChange}
                placeholder="Enter your address"
                className="mt-1"
              />
            </div>

            {/* Error Alert */}
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full bg-[#2ACB25] hover:bg-[#1E9B1A] text-white"
              disabled={loading || fetchingDistricts}
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </Button>

            {/* Additional Links */}
            <div className="text-center text-sm">
              <div className="text-gray-600">
                Already have an account?{' '}
                <Link
                  to="/auth/login"
                  className="text-[#2ACB25] hover:text-[#1E9B1A] font-medium"
                >
                  Sign in here
                </Link>
              </div>
            </div>
          </form>
        </GlassCard>
      </div>
    </div>
  );
};

export default Signup;