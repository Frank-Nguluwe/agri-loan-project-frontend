import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '@/lib/api/auth';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const PasswordReset = () => {
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await authService.passwordReset({ identifier });
      setSuccess(true);
      toast({
        title: "Password Reset Requested",
        description: "Check your email for reset instructions",
      });
    } catch (error: any) {
      setError(error.message || 'Failed to request password reset. Please try again.');
      toast({
        title: "Password Reset Failed",
        description: "Please check your email/phone and try again.",
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
          <h1 className="text-3xl font-bold text-gray-900">Reset Password</h1>
          <p className="text-gray-600 mt-2">
            Enter your email or phone number to reset your password
          </p>
        </div>

        <GlassCard className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="identifier">Email or Phone Number</Label>
              <Input
                id="identifier"
                name="identifier"
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="Enter your email or phone number"
                required
                className="mt-1"
              />
            </div>

            {success && (
              <Alert>
                <AlertDescription>
                  If an account with that identifier exists, we've sent password reset instructions.
                </AlertDescription>
              </Alert>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              className="w-full bg-[#2ACB25] hover:bg-[#1E9B1A] text-white"
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Reset Password'}
            </Button>

            <div className="text-center text-sm space-y-2">
              <div className="text-gray-600">
                Remember your password?{' '}
                <Link
                  to="/auth/login"
                  className="text-[#2ACB25] hover:text-[#1E9B1A] font-medium"
                >
                  Sign in here
                </Link>
              </div>
              <div className="text-gray-600">
                Don't have an account?{' '}
                <Link
                  to="/auth/signup"
                  className="text-[#2ACB25] hover:text-[#1E9B1A] font-medium"
                >
                  Create one here
                </Link>
              </div>
            </div>
          </form>
        </GlassCard>
      </div>
    </div>
  );
};

export default PasswordReset;