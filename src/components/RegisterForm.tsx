import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { validateRegistrationData } from '@/utils/validation';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

interface RegisterFormProps {
  onSwitchToLogin: () => void;
}

export function RegisterForm({ onSwitchToLogin }: RegisterFormProps) {
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    email: '',
    fullName: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate form data
    const validation = validateRegistrationData(formData);
    if (!validation.isValid) {
      setError(validation.errors[0].message);
      return;
    }

    setIsLoading(true);
    try {
      const result = await register(formData);
      if (result.success) {
        setSuccess(true);
        setTimeout(() => {
          onSwitchToLogin();
        }, 2000);
      } else {
        setError(result.message || 'Registration failed');
      }
    } catch (error) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError(null);
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50"></div>
        <div className="relative z-10 max-w-md w-full">
          <div className="card-elevated">
            <div className="px-8 py-10 text-center">
              <div className="mx-auto h-16 w-16 bg-gradient-to-r from-emerald-500 to-green-600 rounded-full flex items-center justify-center mb-6 shadow-lg">
                <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Registration Successful!</h3>
              <p className="text-gray-600 mb-4">Your account has been created successfully.</p>
              <div className="status-success">
                <div className="flex items-center justify-center space-x-2">
                  <div className="loading-spinner h-4 w-4 border-emerald-600"></div>
                  <span className="font-medium">Redirecting to login...</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50"></div>
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-20 right-20 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
        <div className="absolute bottom-20 left-20 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 w-72 h-72 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse animation-delay-4000"></div>
      </div>
      
      <div className="relative z-10 max-w-md w-full">
        <div className="card-elevated">
          <div className="px-8 py-10">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="mx-auto h-16 w-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold gradient-text mb-2">
                Create Account
              </h2>
              <p className="text-gray-600 font-medium">
                Register for BQC Generator
              </p>
            </div>
        
        <form className="space-y-5" onSubmit={handleSubmit}>
              {error && (
                <div className="status-error animate-in slide-in-from-top-2 duration-300">
                  <div className="flex items-center space-x-2">
                    <svg className="h-5 w-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="font-medium">{error}</span>
                  </div>
                </div>
              )}
              
              <div className="space-y-4">
                <div className="form-group">
                  <label htmlFor="fullName" className="form-label">
                    Full Name
                  </label>
                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    required
                    className="form-input h-11"
                    placeholder="Enter your full name"
                    value={formData.fullName}
                    onChange={handleChange}
                    disabled={isLoading}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="username" className="form-label">
                    Username
                  </label>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    required
                    className="form-input h-11"
                    placeholder="Choose a username"
                    value={formData.username}
                    onChange={handleChange}
                    disabled={isLoading}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email" className="form-label">
                    Email Address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    className="form-input h-11"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={isLoading}
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="password" className="form-label">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      className="form-input h-11 pr-12"
                      placeholder="Choose a password"
                      value={formData.password}
                      onChange={handleChange}
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeSlashIcon className="h-5 w-5" />
                      ) : (
                        <EyeIcon className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="confirmPassword" className="form-label">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      className="form-input h-11 pr-12"
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeSlashIcon className="h-5 w-5" />
                      ) : (
                        <EyeIcon className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn-primary w-full h-12 text-base font-semibold disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="loading-spinner h-5 w-5"></div>
                      <span>Creating account...</span>
                    </div>
                  ) : (
                    'Create account'
                  )}
                </button>
              </div>

              <div className="text-center pt-4">
                <button
                  type="button"
                  onClick={onSwitchToLogin}
                  className="text-purple-600 hover:text-purple-700 text-sm font-semibold transition-colors duration-200"
                >
                  Already have an account? <span className="underline">Sign in here</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
