import React from 'react';
import { MapPin, Ruler, Maximize, MessageSquare, Bookmark, Phone, Mail, IndianRupee, ShieldCheck, ClipboardList } from 'lucide-react';
import { Requirement } from '@/types/types';
import { requirementService, bookmarkService } from '@/services/api';
import { useNavigate } from 'react-router-dom';
import { useChat } from '@/contexts/ChatContext';
import { useAuth } from '@/contexts/AuthContext';
import ContactModal from './ContactModal';

interface RequirementCardProps {
  requirement: Requirement;
}

const RequirementCard: React.FC<RequirementCardProps> = ({ requirement }) => {
  const navigate = useNavigate();
  const [isBookmarked, setIsBookmarked] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const { createThread } = useChat();
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
    navigate(`/requirements/${requirement.id}`);
  };

  const [showContactModal, setShowContactModal] = React.useState(false);

  const handleContactSeeker = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      openLogin();
      return;
    }
    if (!requirement.user_id) return;
    setShowContactModal(true);
  };

  const handleSendMessage = async (message: string) => {
    if (!requirement.user_id) return;
    try {
      const thread = await createThread(Number(requirement.user_id), undefined, message);
      navigate(`/messages/${thread.id}`);
    } catch (err) {
      console.error("Failed to initiate contact", err);
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className="bg-white rounded-[24px] overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 group flex flex-col h-full cursor-pointer uppercase-none"
    >
      {/* Header Badges */}
      <div className="p-6 pb-4 flex items-center justify-between">
        <div className="flex gap-2">
          {requirement.is_verified && (
            <span className="bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider border border-emerald-100 flex items-center gap-1 shadow-sm">
              <ShieldCheck className="h-3 w-3" /> Verified
            </span>
          )}
          <span className="bg-[#40a28f] text-white px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider shadow-sm">
            {requirement.purpose}
          </span>
          <span className="bg-gray-100 text-gray-600 px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider">
            {requirement.type}
          </span>
        </div>
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">
          #REQ-{requirement.id}
        </span>
      </div>

      <div className="px-6 flex-grow space-y-6">
        {/* Stats Row at the top (Matches Reference Image feel) */}
        <div className="flex items-center gap-6 py-3 border-b border-gray-50/50">
          <div className="flex items-center gap-2">
            <Ruler className="h-5 w-5 text-gray-400" />
            <span className="text-sm font-medium text-gray-600">{requirement.minArea} - {requirement.maxArea} sq.ft</span>
          </div>
          <div className="flex items-center gap-2">
            <Maximize className="h-5 w-5 text-gray-400" />
            <span className="text-sm font-medium text-gray-600">Adaptive Scale</span>
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-[#40a28f]" />
            <p className="text-sm font-medium text-gray-500">{requirement.location}</p>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-500 leading-relaxed line-clamp-3 italic">
          "{requirement.description || 'Seeking a property matching these strategic parameters in Rajnandgaon...'}"
        </p>

        {/* View Details Hint */}
        <div className="pt-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="text-[#40a28f] text-xs font-bold uppercase tracking-widest flex items-center gap-1">
            View Details <ClipboardList className="h-3 w-3" />
          </span>
        </div>

      </div>

      {/* Footer */}
      <div className="p-6 pt-5 border-t border-gray-100 flex items-center justify-between mt-auto">
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-0.5">Budget Range</span>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-bold text-[#40a28f]">
              ₹{requirement.minBudget?.toLocaleString()} - {requirement.maxBudget?.toLocaleString()}
            </span>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleContactSeeker}
            className="p-2.5 bg-[#e2f2f0] text-[#40a28f] rounded-xl hover:bg-[#d4e9e6] transition-all"
            title="Chat with Seeker"
          >
            <MessageSquare className="h-5 w-5" />
          </button>
          <button
            onClick={toggleBookmark}
            disabled={loading}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${isBookmarked
              ? 'bg-[#e2f2f0] text-[#40a28f]'
              : 'bg-white border border-gray-200 text-gray-400 hover:border-[#40a28f] hover:text-[#40a28f] hover:bg-gray-50'
              }`}
          >
            <Bookmark className={`h-4 w-4 ${isBookmarked ? 'fill-[#40a28f]' : ''}`} />
            {isBookmarked ? 'Saved' : 'Save'}
          </button>
        </div>
      </div>
      <ContactModal
        isOpen={showContactModal}
        onClose={() => setShowContactModal(false)}
        recipientName={requirement.contact_name || requirement.user?.name || "Interested Buyer"}
        propertyName={`Requirement for ${requirement.type} in ${requirement.location}`}
        onSend={handleSendMessage}
      />
    </div>
  );
};

export default RequirementCard;
