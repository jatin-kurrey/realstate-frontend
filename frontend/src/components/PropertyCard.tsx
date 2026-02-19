import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Ruler, Maximize, Edit2, Heart, Eye, MessageSquare, ShieldCheck } from 'lucide-react';
import { useChat } from '@/contexts/ChatContext';
import { useAuth } from '@/contexts/AuthContext';
import { Property } from '@/types/types';
import { bookmarkService } from '@/services/api';
import ContactModal from './ContactModal';

interface PropertyCardProps {
  property: Property;
  onViewDetails: (property: Property) => void;
  onActivate?: (property: Property) => void;
  onEdit?: (property: Property) => void;
  compact?: boolean;
  stats?: {
    views: number;
    leads: number;
  };
}

const PropertyCard: React.FC<PropertyCardProps> = ({ property, onViewDetails, onActivate, onEdit, compact, stats }) => {
  const [isShortlisted, setIsShortlisted] = useState(false);
  const navigate = useNavigate();
  const [showContactModal, setShowContactModal] = useState(false);
  const { createThread } = useChat();
  const { isAuthenticated, openLogin } = useAuth();
  const token = localStorage.getItem('token');

  const handleContactDealer = async () => {
    if (!isAuthenticated) {
      openLogin();
      return;
    }
    if (!property.owner_id) return;
    setShowContactModal(true);
  };

  const handleSendMessage = async (message: string) => {
    if (!property.owner_id) return;
    try {
      const thread = await createThread(Number(property.owner_id), Number(property.id), message);
      navigate(`/messages/${thread.id}`);
    } catch (err) {
      console.error("Failed to initiate contact", err);
    }
  };

  useEffect(() => {
    const checkStatus = async () => {
      if (isAuthenticated) {
        try {
          const status = await bookmarkService.isBookmarked(property.id, 'property');
          setIsShortlisted(status);
        } catch (err) {
          console.error('Failed to check bookmark status', err);
        }
      } else {
        const saved = localStorage.getItem('shortlisted_properties');
        if (saved) {
          const list = JSON.parse(saved) as Property[];
          setIsShortlisted(list.some(p => p.id === property.id));
        }
      }
    };
    checkStatus();
  }, [property.id, isAuthenticated]);

  const toggleShortlist = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (token) {
      try {
        const res = await bookmarkService.toggle(property.id, 'property');
        setIsShortlisted(res.isBookmarked);
      } catch (err) {
        console.error('Failed to toggle bookmark', err);
      }
    } else {
      const saved = localStorage.getItem('shortlisted_properties');
      let list = saved ? JSON.parse(saved) as Property[] : [];

      if (isShortlisted) {
        list = list.filter(p => p.id !== property.id);
        setIsShortlisted(false);
      } else {
        list.push(property);
        setIsShortlisted(true);
      }

      localStorage.setItem('shortlisted_properties', JSON.stringify(list));
    }

    window.dispatchEvent(new Event('shortlistUpdated'));
  };

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 group flex flex-col h-full">
      {/* Image Container */}
      <div className={`relative ${compact ? 'h-40 sm:h-48' : 'h-48 sm:h-64'} overflow-hidden`}>
        <img
          src={property.imageUrl}
          alt={property.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />

        {/* Badges - Top Right */}
        <div className="absolute top-2 sm:top-4 right-2 sm:right-4 flex gap-1.5 sm:gap-2 flex-wrap">
          {property.is_verified && (
            <span className="bg-emerald-500 text-white px-2 sm:px-3 py-1 sm:py-1.5 rounded-md sm:rounded-lg text-[10px] sm:text-[11px] font-bold uppercase tracking-wider shadow-sm flex items-center gap-0.5 sm:gap-1">
              <ShieldCheck className="h-2.5 w-2.5 sm:h-3 sm:w-3" /> <span className="hidden xs:inline">Verified</span><span className="xs:hidden">✓</span>
            </span>
          )}
          <span className="bg-[#40a28f] text-white px-2 sm:px-3 py-1 sm:py-1.5 rounded-md sm:rounded-lg text-[10px] sm:text-[11px] font-bold uppercase tracking-wider shadow-sm">
            {property.status}
          </span>
          <span className="bg-gray-100/90 backdrop-blur-md text-gray-700 px-2 sm:px-3 py-1 sm:py-1.5 rounded-md sm:rounded-lg text-[10px] sm:text-[11px] font-bold uppercase tracking-wider shadow-sm">
            {property.type}
          </span>
        </div>

        {/* Stats Overlay (Owner View) */}
        {stats && (
          <div className="absolute bottom-2 sm:bottom-4 left-2 sm:left-4 right-2 sm:right-4 flex gap-1.5 sm:gap-2">
            <div className="flex-1 bg-white/90 backdrop-blur-md p-1.5 sm:p-2 rounded-lg sm:rounded-xl flex items-center justify-center gap-1 sm:gap-2 shadow-sm">
              <Eye className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
              <span className="text-[10px] sm:text-xs font-bold text-gray-700">{stats.views} <span className="hidden xs:inline text-[9px] uppercase text-gray-400 font-extrabold tracking-wider">Views</span></span>
            </div>
            <div className="flex-1 bg-white/90 backdrop-blur-md p-1.5 sm:p-2 rounded-lg sm:rounded-xl flex items-center justify-center gap-1 sm:gap-2 shadow-sm">
              <MessageSquare className="h-3 w-3 sm:h-4 sm:w-4 text-[#40a28f]" />
              <span className="text-[10px] sm:text-xs font-bold text-gray-700">{stats.leads} <span className="hidden xs:inline text-[9px] uppercase text-gray-400 font-extrabold tracking-wider">Leads</span></span>
            </div>
          </div>
        )}

        {/* User Badge / Company Name */}
        {property.owner?.badge && property.owner.badge !== 'User' && (
          <div className="absolute top-2 sm:top-4 left-2 sm:left-4 flex flex-col gap-1 sm:gap-2">
            <span className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-md sm:rounded-lg text-[10px] sm:text-[11px] font-bold uppercase tracking-wider shadow-sm flex items-center gap-0.5 sm:gap-1 text-white
              ${property.owner.badge === 'Verified Broker' ? 'bg-blue-600' :
                property.owner.badge === 'Verified User' ? 'bg-emerald-600' :
                  property.owner.badge === 'Verified Builder' ? 'bg-purple-600' :
                    property.owner.badge === 'Developer' ? 'bg-indigo-600' : 'bg-gray-500'}`}>
              <ShieldCheck className="h-2.5 w-2.5 sm:h-3 sm:w-3" /> <span className="hidden xs:inline">{property.owner.badge === 'Developer' ? 'PRO DEVELOPER' : property.owner.badge}</span><span className="xs:hidden">✓</span>
            </span>
            {property.owner.company_name && (property.owner.badge === 'Verified Builder' || property.owner.badge === 'Developer') && (
              <span className="bg-white/90 backdrop-blur-sm text-gray-800 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-[9px] sm:text-[10px] font-black uppercase tracking-tight shadow-sm border border-gray-100 italic">
                {property.owner.company_name}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 sm:p-6 md:p-8 flex flex-col flex-grow space-y-3 sm:space-y-5">
        <div className="space-y-2 sm:space-y-3">
          <h3 className="text-lg sm:text-xl font-bold text-gray-800 leading-tight line-clamp-2 min-h-[2.5rem] sm:min-h-[3rem] group-hover:text-[#40a28f] transition-colors">
            {property.title}
          </h3>
          <div className="flex items-start gap-2">
            <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-[#40a28f] flex-shrink-0 mt-0.5" />
            <p className="text-xs sm:text-sm font-medium text-gray-400 leading-tight">
              {(() => {
                const mainLoc = property.street_name || property.landmark;
                const locParts = [mainLoc, property.village].filter(Boolean);
                return locParts.length > 0 ? locParts.join(', ') : property.location;
              })()}
              {property.distance_from_main_location && (
                <span className="block text-[11px] sm:text-xs text-gray-400 mt-1">
                  ({property.distance_from_main_location})
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Stats Row */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-4 py-1">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Ruler className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
            <span className="text-xs sm:text-sm font-medium text-gray-400">{property.area} {property.area_unit}</span>
          </div>
          {property.frontage && (
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Maximize className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
              <span className="text-xs sm:text-sm font-medium text-gray-400">Front: {property.frontage}</span>
            </div>
          )}
          {property.land_use && (
            <div className="flex items-center gap-1.5 sm:gap-2">
              <ShieldCheck className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
              <span className="text-xs sm:text-sm font-medium text-gray-400">{property.land_use}</span>
            </div>
          )}
        </div>

        {/* Description Snippet */}
        {!compact && (
          <p className="text-sm text-gray-400 leading-relaxed line-clamp-3 bg-yellow-50/50 p-2 rounded-lg border border-yellow-100/50">
            {property.description}
          </p>
        )}

        {/* Footer */}
        <div className="pt-4 sm:pt-6 mt-auto flex items-center justify-between gap-2">
          <div className="flex flex-col min-w-0">
            <div className="flex items-baseline gap-1">
              <span className="text-lg sm:text-2xl font-bold text-[#40a28f]">
                ₹{property.price.toLocaleString()}
              </span>
              {property.status === 'Rent' && (
                <span className="text-xs sm:text-sm font-medium text-gray-400">/month</span>
              )}
            </div>
            <span className="text-[10px] sm:text-xs font-medium text-gray-400 block mt-0.5 sm:mt-1">
              ₹{property.price_per_unit ? property.price_per_unit : Math.round(property.price / (property.area || 1))}/{property.area_unit || 'sqft'}
            </span>
          </div>

          <div className="flex gap-1 sm:gap-2 flex-shrink-0">
            {/* Edit Button for Owners */}
            {onEdit && (
              <button
                onClick={(e) => { e.stopPropagation(); onEdit(property); }}
                className="p-2 sm:p-2.5 bg-gray-50 text-gray-400 rounded-md sm:rounded-lg hover:bg-gray-100 hover:text-gray-600 transition-all"
              >
                <Edit2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </button>
            )}

            {/* Action Button */}
            {onActivate && !property.is_active ? (
              <button
                onClick={(e) => { e.stopPropagation(); onActivate(property); }}
                className="px-4 sm:px-6 py-2 sm:py-2.5 bg-amber-400 text-white rounded-md sm:rounded-lg text-xs sm:text-sm font-bold hover:bg-amber-500 transition-all shadow-sm shadow-amber-400/20 whitespace-nowrap"
              >
                Activate
              </button>
            ) : (
              <div className="flex gap-1 sm:gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleContactDealer();
                  }}
                  className="p-2 sm:p-2.5 bg-[#e2f2f0] text-[#40a28f] rounded-md sm:rounded-lg hover:bg-[#d4e9e6] transition-all"
                  title="Contact Dealer"
                >
                  <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>
                <button
                  onClick={() => onViewDetails(property)}
                  className="px-4 sm:px-6 py-2 sm:py-2.5 bg-[#40a28f] text-white rounded-md sm:rounded-lg text-xs sm:text-sm font-bold hover:bg-[#358a7a] transition-all duration-300 shadow-sm shadow-[#40a28f]/10 active:scale-95 whitespace-nowrap"
                >
                  View Details
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      <ContactModal
        isOpen={showContactModal}
        onClose={() => setShowContactModal(false)}
        recipientName={property.owner?.role === 'developer' && property.owner.company_name
          ? property.owner.company_name
          : property.owner?.name || "Property Owner"}
        propertyName={property.title}
        onSend={handleSendMessage}
      />
    </div>
  );
};

export default PropertyCard;
