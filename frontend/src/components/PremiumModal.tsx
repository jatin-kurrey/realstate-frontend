import React, { useState } from 'react';
import { X, Crown, CheckCircle, Shield, Star, Clock } from 'lucide-react';
import { premiumService } from '@/services/api';

interface PremiumModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PremiumModal: React.FC<PremiumModalProps> = ({ isOpen, onClose }) => {
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      await premiumService.requestPremium(message);
      setIsSuccess(true);
      setTimeout(() => {
        onClose();
        setIsSuccess(false);
        setMessage('');
      }, 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to submit request. You might already have a pending request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const features = [
    { icon: <Shield className="w-5 h-5 text-emerald-600" />, title: 'Exclusive Listings', desc: 'Access highly premium properties and requirements.' },
    { icon: <Star className="w-5 h-5 text-emerald-600" />, title: 'Priority Support', desc: 'Get direct access to our premium assistance team.' },
    { icon: <Clock className="w-5 h-5 text-emerald-600" />, title: 'Early Access', desc: 'See new high-value properties before anyone else.' },
    { icon: <Crown className="w-5 h-5 text-emerald-600" />, title: 'Premium Badge', desc: 'Stand out in the community with a verified premium status.' }
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose} />
      
      {/* Modal Container */}
      <div className="relative w-full max-w-lg bg-white rounded-[24px] sm:rounded-[40px] shadow-2xl border border-white/20 animate-in zoom-in-95 duration-300 max-h-[95vh] flex flex-col overflow-hidden">
        {/* Header Decor - pointer-events-none ensures buttons work */}
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-br from-[#40a28f] to-[#1e293b] opacity-10 pointer-events-none" />
        
        {/* Close Button - Outside scroll area for visibility */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2 rounded-full bg-white/80 backdrop-blur-md text-gray-400 hover:text-gray-900 shadow-sm transition-colors z-20"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Content - Scrollable area */}
        <div className="relative flex-1 overflow-y-auto custom-scrollbar p-6 sm:p-10 pt-12 sm:pt-10">
          {isSuccess ? (
            <div className="py-8 sm:py-12 text-center space-y-6 animate-in fade-in slide-in-from-bottom-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8 sm:w-10 sm:h-10 text-emerald-500" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl sm:text-2xl font-black text-gray-900 uppercase tracking-tight">Request Sent!</h3>
                <p className="text-sm text-gray-500 font-medium">Our team will review your request and get back to you soon.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-6 sm:space-y-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-emerald-50 rounded-2xl flex items-center justify-center shadow-sm flex-shrink-0">
                  <Crown className="w-6 h-6 sm:w-7 sm:h-7 text-emerald-600" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-gray-900 uppercase tracking-tight leading-tight">Become Premium</h2>
                  <p className="text-[10px] sm:text-xs font-bold text-emerald-600 uppercase tracking-widest">Unlock exclusive real estate power</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {features.map((f, i) => (
                  <div key={i} className="flex gap-3 p-3 rounded-2xl bg-gray-50/50 border border-gray-100">
                    <div className="mt-1 flex-shrink-0">{f.icon}</div>
                    <div>
                      <h4 className="text-[10px] sm:text-xs font-black text-gray-800 uppercase tracking-tight">{f.title}</h4>
                      <p className="text-[9px] sm:text-[10px] text-gray-500 font-medium leading-relaxed">{f.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Why do you want to join?</label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Tell us about your requirements or brokerage goals..."
                    className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl p-4 text-sm font-medium text-gray-800 focus:bg-white focus:border-emerald-500 focus:ring-0 outline-none transition-all resize-none min-h-[100px] h-32"
                    required
                  />
                </div>

                {error && (
                  <div className="p-3 bg-red-50 rounded-xl border border-red-100 text-red-600 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                    <Shield className="w-4 h-4 flex-shrink-0" /> {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 sm:py-5 bg-[#1e293b] text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] sm:text-xs shadow-xl shadow-gray-200 hover:bg-emerald-600 transition-all transform active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3 mt-2"
                >
                  {isSubmitting ? (
                    'Processing...'
                  ) : (
                    <>Submit Premium Request <CheckCircle className="w-4 h-4" /></>
                  )}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PremiumModal;
