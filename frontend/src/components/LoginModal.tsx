
import React, { useState } from 'react';
import { X, ShieldCheck, Loader2 } from 'lucide-react';
import { authService } from '@/services/api';
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';
import { jwtDecode } from "jwt-decode";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToSignUp: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onSwitchToSignUp }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = await authService.login({ email, password });
      // Check if role is admin OR if it's the master admin email (failsafe for accidental demotion)
      if (data.user.role === 'admin' || email === 'admin@rjg.com') {
        // Handle admin within user modal
        sessionStorage.setItem('isAdminAuthenticated', 'true');
        localStorage.setItem('userRole', 'admin'); // Force override in case of DB mismatch
        onClose();
        window.location.reload();
      } else {
        onClose();
        window.location.reload(); // Refresh to update UI state
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    try {
      if (credentialResponse.credential) {
        const decoded: any = jwtDecode(credentialResponse.credential);
        const { email, name } = decoded;

        setLoading(true);
        await authService.googleLogin({ email, name, token: credentialResponse.credential });
        onClose();
        window.location.reload();
      }
    } catch (err) {
      console.error(err);
      setError('Google Login Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative bg-white w-full max-w-lg rounded-[24px] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="p-6 sm:p-12">
          {/* Header */}
          <div className="flex items-center justify-between mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-[#2d3748]">Welcome Back</h2>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="h-5 w-5 sm:h-6 sm:w-6 text-gray-400" />
            </button>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl font-medium">
              {error}
            </div>
          )}

          {/* Form */}
          <form className="space-y-4 sm:space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 sm:py-4 sm:px-5 focus:outline-none focus:ring-2 focus:ring-[#40a28f]/20 focus:border-[#40a28f] transition-all text-sm sm:text-base text-gray-600 placeholder:text-gray-400"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 sm:py-4 sm:px-5 focus:outline-none focus:ring-2 focus:ring-[#40a28f]/20 focus:border-[#40a28f] transition-all text-sm sm:text-base text-gray-600 placeholder:text-gray-400"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#40a28f] text-white py-2 sm:py-2.5 px-4 rounded-md font-bold text-sm sm:text-base hover:bg-[#358a7a] transition-all shadow-md shadow-[#40a28f]/20 active:scale-[0.98] flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Log In'}
            </button>


          </form>

          <div className="mt-6">
            <div className="relative my-6 sm:my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-3 bg-white text-gray-500 font-medium">Or continue with</span>
              </div>
            </div>

            <div className="mt-6 flex justify-center">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setError('Google Login Failed')}
                useOneTap
                theme="outline"
                shape="pill"
                size="large"
                width="100%"
                containerProps={{
                  className: "!py-2 sm:!py-2.5 !px-4 !rounded-md !text-sm sm:!text-base"
                }}
              />
            </div>
            <p className="text-[10px] text-center text-gray-400 mt-2">
              Note: You need to configure a valid Client ID for this to work.
            </p>
          </div>

          {/* Footer Link */}
          <div className="mt-6 sm:mt-8 text-center space-y-4 sm:space-y-6">
            <button
              onClick={onSwitchToSignUp}
              className="text-[#40a28f] font-medium hover:underline text-sm sm:text-base transition-colors"
            >
              Don't have an account? Sign up
            </button>

            {/* Admin Hints for Dev */}
            <div className="bg-[#f0f9f7] rounded-xl p-3 sm:p-4 border border-[#40a28f]/10">
              <div className="flex items-center gap-2 mb-1 sm:mb-2 text-[#40a28f]">
                <ShieldCheck className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest">Admin Access Details</span>
              </div>
              <div className="flex flex-col sm:flex-row justify-between text-[10px] sm:text-[11px] font-bold text-gray-500 bg-white/50 p-2 rounded-lg mb-1 sm:mb-2">
                <span>Email: <span className="text-gray-800">admin@rjg.com</span></span>
                <span>Pass: <span className="text-gray-800">admin123</span></span>
              </div>
              <div className="flex flex-col sm:flex-row justify-between text-[10px] sm:text-[11px] font-bold text-gray-500 bg-white/50 p-2 rounded-lg">
                <span>God Mode Key: <span className="text-gray-800">RJG_GOD_ACCESS_2024</span></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;

