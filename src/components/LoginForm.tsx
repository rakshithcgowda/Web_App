import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { validateLoginCredentials } from '@/utils/validation';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

interface LoginFormProps {
  onSwitchToRegister: () => void;
}

export function LoginForm({ onSwitchToRegister }: LoginFormProps) {
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate form data
    const validation = validateLoginCredentials(formData.username, formData.password);
    if (!validation.isValid) {
      setError(validation.errors[0].message);
      return;
    }

    setIsLoading(true);
    try {
      const result = await login(formData);
      if (!result.success) {
        setError(result.message || 'Login failed');
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

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50"></div>
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-20 left-20 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
        <div className="absolute top-40 right-20 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse animation-delay-4000"></div>
      </div>
      
      <div className="relative z-10 max-w-md w-full">
        <div className="card-elevated">
          <div className="px-8 py-10">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="mx-auto h-16 w-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold gradient-text mb-2">
                BQC Generator
              </h2>
              <p className="text-gray-600 font-medium">
                Sign in to your account
              </p>
            </div>
            
            <form className="space-y-6" onSubmit={handleSubmit}>
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
              
              <div className="space-y-5">
                <div className="form-group">
                  <label htmlFor="username" className="form-label">
                    Username
                  </label>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    required
                    className="form-input h-12"
                    placeholder="Enter your username"
                    value={formData.username}
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
                      className="form-input h-12 pr-12"
                      placeholder="Enter your password"
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
                      <span>Signing in...</span>
                    </div>
                  ) : (
                    'Sign in'
                  )}
                </button>
              </div>

              <div className="text-center pt-4">
                <button
                  type="button"
                  onClick={onSwitchToRegister}
                  className="text-blue-600 hover:text-blue-700 text-sm font-semibold transition-colors duration-200"
                >
                  Don't have an account? <span className="underline">Register here</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
