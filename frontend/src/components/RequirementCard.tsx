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
      className="bg-white rounded-[24px] overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 group flex flex-col h-full cursor-pointer"
    >
      {/* Header Badges */}
      <div className="p-6 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          {requirement.is_verified && (
            <span className="bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border border-emerald-100 flex items-center gap-1 shadow-sm shrink-0">
              <ShieldCheck className="h-3 w-3" /> Verified
            </span>
          )}
          {requirement.is_premium && (
            <span className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider shadow-sm flex items-center gap-1 shrink-0">
              Premium
            </span>
          )}
          <span className="bg-[#40a28f] text-white px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider shadow-sm shrink-0">
            {requirement.purpose}
          </span>
          <span className="bg-gray-100 text-gray-600 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider shrink-0">
            {requirement.type}
          </span>
        </div>
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none shrink-0">
          #REQ-{requirement.id}
        </span>
      </div>

      <div className="px-6 flex-grow space-y-6">
        {/* Stats Row at the top */}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3 py-3 border-b border-gray-50/50">
          <div className="flex items-center gap-2">
            <Square className="h-4 w-4 text-gray-400" />
            <span className="text-xs font-bold text-gray-600 uppercase tracking-tight">
              {requirement.minArea} – {requirement.maxArea}
              <sup className="text-[9px] font-bold">2</sup>
              {' Sq Ft'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Maximize className="h-4 w-4 text-gray-400" />
            <span className="text-xs font-bold text-gray-600 uppercase tracking-tight">Adaptive Scale</span>
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-[#40a28f]" />
            <p className="text-sm font-bold text-gray-700 uppercase tracking-tight">{requirement.location}</p>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-500 leading-relaxed line-clamp-3 italic font-medium">
          "{requirement.description || 'Seeking a property matching these strategic parameters in Rajnandgaon...'}"
        </p>

        {/* View Details Hint */}
        <div className="pt-2 sm:opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="text-[#40a28f] text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
            View Details <ClipboardList className="h-3 w-3" />
          </span>
        </div>

      </div>

      {/* Footer */}
      <div className="p-6 pt-5 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-6 mt-auto">
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Budget Range</span>
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-black text-[#40a28f] tracking-tighter">
              ₹{(requirement.minBudget || 0).toLocaleString()} - {(requirement.maxBudget || 0).toLocaleString()}
            </span>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleContactSeeker}
            className="p-2.5 bg-[#25D366]/10 text-[#25D366] rounded-xl hover:bg-[#25D366]/20 transition-all border border-[#25D366]/10"
            title="Chat via WhatsApp"
          >
            <MessageSquare className="h-5 w-5" />
          </button>
          <button
            onClick={toggleBookmark}
            disabled={loading}
            className={`flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 flex-grow sm:flex-grow-0 ${isBookmarked
              ? 'bg-[#e2f2f0] text-[#40a28f]'
              : 'bg-white border border-gray-200 text-gray-400 hover:border-[#40a28f] hover:text-[#40a28f] hover:bg-gray-50'
              }`}
          >
            <Bookmark className={`h-3.5 w-3.5 ${isBookmarked ? 'fill-[#40a28f]' : ''}`} />
            {isBookmarked ? 'Saved' : 'Save'}
          </button>
        </div>
      </div>
    </div>

  );
};

export default RequirementCard;
