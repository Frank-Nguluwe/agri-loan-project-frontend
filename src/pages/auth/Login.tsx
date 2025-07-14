import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const Login = () => {
  const navigate = useNavigate();
  const { login, user } = useAuth();

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    email: '',
    phone_number: '',
    password: '',
    loginMethod: 'email', // or 'phone'
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const redirectByRole = (role: string) => {
    const normalizedRole = role.toLowerCase().trim();

    switch (normalizedRole) {
      case 'admin':
        navigate('/dashboard/admin');
        break;
      case 'loan_officer':
        navigate('/dashboard/loan-officer');
        break;
      case 'supervisor':
        navigate('/dashboard/supervisor');
        break;
      case 'farmer':
        navigate('/dashboard/farmer');
        break;
      default:
        navigate('/dashboard');
    }
  };

  // Redirect on user update
  useEffect(() => {
    if (user?.role) {
      redirectByRole(user.role);
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const credentials = {
        password: formData.password,
        ...(formData.loginMethod === 'email'
          ? { email: formData.email }
          : { phone_number: formData.phone_number }),
      };

      await login(credentials);

      toast({
        title: 'Login Successful',
        description: 'Welcome back to the Loan Management System',
      });

      // Do NOT redirect here — wait for user state update in useEffect

    } catch (error: any) {
      setError(error.message || 'Login failed. Please check your credentials.');
      toast({
        title: 'Login Failed',
        description: 'Please check your credentials and try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Button variant="ghost" className="mb-4" onClick={() => navigate('/')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Sign In</h1>
          <p className="text-gray-600 mt-2">Access your loan management portal</p>
        </div>

        <GlassCard className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Login Method Toggle */}
            <div className="flex space-x-2 bg-gray-50 p-1 rounded-md">
              <button
                type="button"
                className={`flex-1 py-2 px-3 rounded text-sm font-medium transition-colors ${
                  formData.loginMethod === 'email'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                onClick={() => setFormData({ ...formData, loginMethod: 'email' })}
              >
                Email
              </button>
              <button
                type="button"
                className={`flex-1 py-2 px-3 rounded text-sm font-medium transition-colors ${
                  formData.loginMethod === 'phone'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                onClick={() => setFormData({ ...formData, loginMethod: 'phone' })}
              >
                Phone
              </button>
            </div>

            {/* Email or Phone Input */}
            <div>
              <Label htmlFor={formData.loginMethod}>
                {formData.loginMethod === 'email' ? 'Email Address' : 'Phone Number'}
              </Label>
              <Input
                id={formData.loginMethod}
                name={formData.loginMethod}
                type={formData.loginMethod === 'email' ? 'email' : 'tel'}
                value={formData.loginMethod === 'email' ? formData.email : formData.phone_number}
                onChange={handleInputChange}
                placeholder={formData.loginMethod === 'email' ? 'Enter your email' : 'Enter your phone number'}
                required
                className="mt-1"
              />
            </div>

            {/* Password Input */}
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
              disabled={loading}
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </Button>

            {/* Additional Links */}
            <div className="flex flex-col space-y-2 text-center text-sm">
              <Link to="/auth/forgot-password" className="text-[#2ACB25] hover:text-[#1E9B1A] font-medium">
                Forgot your password?
              </Link>
              <div className="text-gray-600">
                Don&apos;t have an account?{' '}
                <Link to="/auth/signup" className="text-[#2ACB25] hover:text-[#1E9B1A] font-medium">
                  Sign up here
                </Link>
              </div>
            </div>
          </form>
        </GlassCard>
      </div>
    </div>
  );
};

export default Login;