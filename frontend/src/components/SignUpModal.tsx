
import React, { useState } from 'react';
import { X, ChevronDown, Loader2 } from 'lucide-react';
import { authService } from '@/services/api';
import { useSiteConfig } from '@/contexts/SiteConfigContext';

interface SignUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToLogin: () => void;
}

const SignUpModal: React.FC<SignUpModalProps> = ({ isOpen, onClose, onSwitchToLogin }) => {
  const { config } = useSiteConfig();
  const showRoleSelection = config['registration_role_selection'] === 'true';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('seeker');
  const [companyName, setCompanyName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await authService.register({ email, password, name, phone, role, company_name: companyName });
      onSwitchToLogin();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
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
      <div className="relative bg-white w-[95%] sm:w-full max-w-lg rounded-[24px] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="p-5 sm:p-12">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="space-y-1">
              <h2 className="text-2xl font-black text-[#2d3748] tracking-tight uppercase">Join the Community</h2>
              <p className="text-xs font-bold text-[#40a28f] uppercase tracking-widest">Connect with property owners in Rajnandgaon</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-2xl transition-all"
            >
              <X className="h-6 w-6 text-gray-400" />
            </button>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-xs rounded-2xl font-bold uppercase tracking-wide">
              {error}
            </div>
          )}

          {/* Form */}
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full bg-gray-50/50 border border-gray-100 rounded-2xl py-3.5 px-5 focus:outline-none focus:ring-4 focus:ring-[#40a28f]/5 focus:border-[#40a28f] transition-all text-sm font-bold text-gray-600 placeholder:text-gray-300"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Phone Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="98765 43210"
                  className="w-full bg-gray-50/50 border border-gray-100 rounded-2xl py-3.5 px-5 focus:outline-none focus:ring-4 focus:ring-[#40a28f]/5 focus:border-[#40a28f] transition-all text-sm font-bold text-gray-600 placeholder:text-gray-300"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-gray-50/50 border border-gray-100 rounded-2xl py-3.5 px-5 focus:outline-none focus:ring-4 focus:ring-[#40a28f]/5 focus:border-[#40a28f] transition-all text-sm font-bold text-gray-600 placeholder:text-gray-300"
                required
              />
            </div>

            {showRoleSelection && (
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">I am a</label>
                <div className="relative">
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full bg-gray-50/50 border border-gray-100 rounded-2xl py-3.5 px-5 appearance-none focus:outline-none focus:ring-4 focus:ring-[#40a28f]/5 focus:border-[#40a28f] transition-all text-sm font-bold text-gray-600 cursor-pointer"
                  >
                    <option value="seeker">Property Owner/ Seeker</option>
                    <option value="broker">Real Estate Broker</option>
                    <option value="developer">Real Estate Developer</option>
                  </select>
                  <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                </div>
              </div>
            )}

            {role === 'developer' && (
              <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2 duration-300">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Company Name</label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. RJG Constructions"
                  className="w-full bg-gray-50/50 border border-gray-100 rounded-2xl py-3.5 px-5 focus:outline-none focus:ring-4 focus:ring-[#40a28f]/5 focus:border-[#40a28f] transition-all text-sm font-bold text-gray-600 placeholder:text-gray-300"
                  required
                />
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a password"
                className="w-full bg-gray-50/50 border border-gray-100 rounded-2xl py-3.5 px-5 focus:outline-none focus:ring-4 focus:ring-[#40a28f]/5 focus:border-[#40a28f] transition-all text-sm font-bold text-gray-600 placeholder:text-gray-300"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#40a28f] text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-[#358a7a] transition-all shadow-xl shadow-[#40a28f]/20 mt-4 active:scale-[0.98] flex items-center justify-center gap-2 group"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : (
                <>
                  Create Account
                  <ChevronDown className="h-4 w-4 -rotate-90 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Footer Link */}
          <div className="mt-8 text-center">
            <button
              onClick={onSwitchToLogin}
              className="text-[#40a28f] font-black text-[10px] uppercase tracking-widest hover:underline transition-all"
            >
              Already have an account? Log in
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUpModal;

