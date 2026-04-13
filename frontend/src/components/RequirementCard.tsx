import React from 'react';
import { MapPin, Square, Maximize, MessageSquare, Bookmark, Phone, Mail, IndianRupee, ShieldCheck, ClipboardList, Crown } from 'lucide-react';
import { Requirement } from '@/types/types';
import { requirementService, bookmarkService } from '@/services/api';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';


interface RequirementCardProps {
  requirement: Requirement;
}

const RequirementCard: React.FC<RequirementCardProps> = ({ requirement }) => {
  const navigate = useNavigate();
  const [isBookmarked, setIsBookmarked] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const { isAuthenticated, openLogin } = useAuth();

  React.useEffect(() => {
    const checkStatus = async () => {
      if (requirement.id && isAuthenticated) {
        try {
          const status = await bookmarkService.isBookmarked(requirement.id, 'requirement');
          setIsBookmarked(status);
        } catch (err) {
          console.error('Failed to check bookmark status:', err);
        }
      }
    };
    checkStatus();
  }, [requirement.id, isAuthenticated]);

  const toggleBookmark = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!requirement.id || loading) return;

    if (!isAuthenticated) {
      openLogin();
      return;
    }

    setLoading(true);
    try {
      await bookmarkService.toggle(requirement.id, 'requirement');
      setIsBookmarked(!isBookmarked);
    } catch (err) {
      console.error('Failed to toggle bookmark:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCardClick = () => {
    if (requirement.purpose === 'Mortgage') {
      navigate(`/mortgage/${requirement.id}`);
    } else {
      navigate(`/requirements/${requirement.id}`);
    }
  };



  const handleContactSeeker = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const phone = requirement.contact_phone || (requirement.user && requirement.user.phone);
    if (!phone) {
      alert('Phone number not available for this seeker.');
      return;
    }
    window.open(`https://wa.me/${phone.replace(/[^0-9]/g, '')}`, '_blank');
  };

  return (
    <div
      onClick={handleCardClick}
      className="bg-white rounded-[32px] overflow-hidden shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-gray-100/80 hover:shadow-[0_32px_64px_-16px_rgba(0,0,0,0.12)] hover:border-indigo-500/20 transition-all duration-500 group flex flex-col h-full cursor-pointer font-['Outfit']"
    >
      {/* Header Badges */}
      <div className="p-6 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          {requirement.is_premium && (
            <span className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-500/20 flex items-center gap-1.5 border border-white/20">
              <Crown className="h-3 w-3 fill-current" /> Premium Demand
            </span>
          )}
          {requirement.is_verified && (
            <span className="bg-white/90 backdrop-blur-md text-emerald-600 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl flex items-center gap-1.5 border border-white/40">
              <ShieldCheck className="h-3 w-3" /> Verified Market
            </span>
          )}
          <span className="bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border border-indigo-100 shadow-sm shrink-0">
            {requirement.purpose}
          </span>
          <span className="bg-gray-50 text-gray-400 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border border-gray-100 shrink-0">
            {requirement.type}
          </span>
        </div>
        <div className="hidden sm:block">
          <span className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] leading-none">
            #{requirement.id || 'REQ'}
          </span>
        </div>
      </div>

      <div className="px-8 flex-grow space-y-6">
        <div className="pt-2">
          <h3 className="text-xl sm:text-2xl font-black text-gray-900 leading-[1.3] mb-3 group-hover:text-indigo-600 transition-colors line-clamp-2">
            Looking for {requirement.type} in {requirement.location}
          </h3>
          <div className="flex items-center gap-2 group/loc">
            <MapPin className="h-4 w-4 text-indigo-400/80 group-hover/loc:text-indigo-600 transition-colors" />
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{requirement.location}</p>
          </div>
        </div>

        {/* Property Specifics Grid */}
        <div className="grid grid-cols-2 gap-4 p-5 bg-indigo-50/30 rounded-3xl border border-indigo-100/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center shadow-sm border border-indigo-100/50">
              <Square className="w-4 h-4 text-indigo-500" />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Target Area</p>
              <p className="text-xs font-black text-gray-800 uppercase tracking-tighter">
                {requirement.minArea}–{requirement.maxArea} <span className="text-[9px] opacity-60">Sq Ft</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center shadow-sm border border-indigo-100/50">
              <IndianRupee className="w-4 h-4 text-indigo-500" />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Scale Limit</p>
              <p className="text-xs font-black text-gray-800 uppercase tracking-tighter">Flexible</p>
            </div>
          </div>
        </div>

        <div className="p-4 bg-gray-50/50 rounded-2xl border border-gray-100/80">
          <p className="text-sm text-gray-500 leading-relaxed line-clamp-3 italic font-medium">
            "{requirement.description || 'Seeking a property matching these strategic parameters in Rajnandgaon...'}"
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="p-8 pt-6 border-t border-gray-50 flex flex-col sm:flex-row sm:items-center justify-between gap-6 mt-auto">
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Proposed Budget</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-gray-900 tracking-tighter hover:text-indigo-600 transition-colors">
              ₹{(requirement.minBudget || 0).toLocaleString('en-IN')} <span className="text-gray-200 mx-1">—</span> {(requirement.maxBudget || 0).toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleContactSeeker}
            className="p-3 bg-[#25D366]/5 text-[#25D366] rounded-2xl hover:bg-[#25D366]/10 border border-[#25D366]/20 transition-all hover:scale-105 active:scale-95"
            title="Chat via WhatsApp"
          >
            <MessageSquare className="w-5 h-5 fill-current" />
          </button>
          
          <button
            onClick={toggleBookmark}
            disabled={loading}
            className={`p-3 rounded-2xl transition-all duration-300 border ${isBookmarked
              ? 'bg-red-50 text-red-500 border-red-100 shadow-lg shadow-red-500/10 scale-105'
              : 'bg-white border-gray-100 text-gray-400 hover:text-red-500 hover:border-red-100 shadow-sm'
              }`}
            title="Bookmark Demand"
          >
            <Bookmark className={`h-5 w-5 ${isBookmarked ? 'fill-current' : ''}`} />
          </button>

          <button
            onClick={handleCardClick}
            className="px-6 py-3 bg-indigo-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/30 hover:bg-indigo-700 transition-all hover:translate-y-[-2px] active:scale-95 ml-2"
          >
            Details
          </button>
        </div>
      </div>
    </div>

  );
};

export default RequirementCard;
