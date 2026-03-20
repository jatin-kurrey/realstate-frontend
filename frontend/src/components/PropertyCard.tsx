import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Maximize, Ruler, Square, Edit2, Heart, Eye, MessageSquare, ShieldCheck, Gavel, EyeOff, Trash2, Crown, Calculator } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Property } from '@/types/types';
import { bookmarkService, getImageUrl } from '@/services/api';
import { AuctionProperty } from '@/services/auctionService';

// ─── SDV Guideline Rates (CG 2025-26) ────────────────────────────────────────
const SDV_RATES: Record<string, number> = {
    residential: 900,
    commercial:  1600,
    agricultural: 180,
    industrial:   1200,
    default:      900,
};
function getSDVEstimate(area: number, areaUnit: string, type: string) {
    if (!area) return null;
    const sqFt = (areaUnit === 'acres') ? area * 43560 : (areaUnit === 'hectare') ? area * 107639 : area;
    const rateKey = (type || '').toLowerCase().includes('commercial') ? 'commercial'
        : (type || '').toLowerCase().includes('agri') ? 'agricultural'
        : 'residential';
    const rate = SDV_RATES[rateKey] ?? SDV_RATES.default;
    return sqFt * rate;
}


interface PropertyCardProps {
  property: Property | AuctionProperty;
  onViewDetails: (property: Property | AuctionProperty) => void;
  onActivate?: (property: Property | AuctionProperty) => void;
  onEdit?: (property: Property | AuctionProperty) => void;
  onToggleActive?: (property: Property | AuctionProperty) => void;
  onDelete?: (property: Property | AuctionProperty) => void;
  compact?: boolean;
  stats?: {
    views: number;
    leads: number;
  };
}

const PropertyCard: React.FC<PropertyCardProps> = ({ 
  property, 
  onViewDetails, 
  onActivate, 
  onEdit, 
  onToggleActive,
  onDelete,
  compact, 
  stats,
}) => {
  const [isShortlisted, setIsShortlisted] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated, openLogin } = useAuth();
  const token = localStorage.getItem('token');

  const handleContactDealer = async () => {
    if (!property.owner) return;
    const phone = property.owner.phone;
    if (!phone) {
      alert('Phone number not available for this owner.');
      return;
    }
    window.open(`https://wa.me/${phone.replace(/[^0-9]/g, '')}`, '_blank');
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
          src={getImageUrl(property.imageUrl) || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=400'}
          alt={property.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />

        {/* Badges - Top Right */}
        <div className="absolute top-2 sm:top-4 right-2 sm:right-4 flex gap-1.5 sm:gap-2 flex-wrap">
          {property.is_auction && (
            <span className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-2 sm:px-3 py-1 sm:py-1.5 rounded-md sm:rounded-lg text-[10px] sm:text-[11px] font-bold uppercase tracking-wider shadow-sm flex items-center gap-0.5 sm:gap-1 animate-pulse">
              <Gavel className="h-2.5 w-2.5 sm:h-3 sm:w-3" /> <span className="hidden xs:inline">Auction</span>
            </span>
          )}
          {property.is_verified && (
            <span className="bg-emerald-500 text-white px-2 sm:px-3 py-1 sm:py-1.5 rounded-md sm:rounded-lg text-[10px] sm:text-[11px] font-bold uppercase tracking-wider shadow-sm flex items-center gap-0.5 sm:gap-1">
              <ShieldCheck className="h-2.5 w-2.5 sm:h-3 sm:w-3" /> <span className="hidden xs:inline">Verified</span>
            </span>
          )}
          {property.is_premium && (
            <span className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-2 sm:px-3 py-1 sm:py-1.5 rounded-md sm:rounded-lg text-[10px] sm:text-[11px] font-bold uppercase tracking-wider shadow-sm flex items-center gap-0.5 sm:gap-1">
              <Crown className="h-2.5 w-2.5 sm:h-3 sm:w-3" /> <span className="hidden xs:inline">Premium</span>
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
              <ShieldCheck className="h-2.5 w-2.5 sm:h-3 sm:w-3" /> <span className="hidden xs:inline">{property.owner.badge === 'Developer' ? 'PRO DEVELOPER' : property.owner.badge}</span>
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
            <Square className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
            <span className="text-xs sm:text-sm font-medium text-gray-400">
              {property.area}
              <sup className="text-[9px] font-bold">2</sup>
              {' '}
              <span className="text-[10px] font-bold uppercase tracking-wide">
                {property.area_unit === 'sqft' ? 'Sq Ft' : 'Acres'}
              </span>
            </span>
          </div>
          {property.frontage && (
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Ruler className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
              <span className="text-xs sm:text-sm font-medium text-gray-400">Front: {property.frontage}</span>
            </div>
          )}
          {property.land_use && (
            <div className="flex items-center gap-1.5 sm:gap-2">
              <ShieldCheck className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
              <span className="text-xs sm:text-sm font-medium text-gray-400">{property.land_use}</span>
            </div>
          )}

          {property.area > 0 && (() => {
            const sdv = getSDVEstimate(property.area, property.area_unit, property.type);
            if (!sdv) return null;
            const fmtL = (n: number) => n >= 10000000 ? `₹${(n/10000000).toFixed(2)}Cr` : n >= 100000 ? `₹${(n/100000).toFixed(2)}L` : `₹${Math.round(n).toLocaleString('en-IN')}`;
            return (
              <div className="flex items-center gap-1.5 sm:gap-2 px-2 py-0.5 bg-[#40a28f]/10 rounded border border-[#40a28f]/20" title="State SDV Guideline Value (Est.)">
                <Calculator className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#40a28f]" />
                <span className="text-[10px] sm:text-xs font-black tracking-wide text-[#40a28f]">SDV: {fmtL(sdv)}</span>
              </div>
            );
          })()}
        </div>

        {/* Description Snippet */}
        {!compact && (
          <p className="text-sm text-gray-400 leading-relaxed line-clamp-3 bg-yellow-50/50 p-2 rounded-lg border border-yellow-100/50">
            {property.description}
          </p>
        )}

        {/* Footer */}
        <div className="pt-4 sm:pt-6 mt-auto flex flex-wrap items-center justify-between gap-y-4 gap-x-2">
          <div className="flex flex-col min-w-0">
            <>
              <div className="flex items-baseline gap-1 flex-wrap">
                <span className="text-lg sm:text-xl md:text-2xl font-black text-[#40a28f] tracking-tighter">
                  ₹{property.price ? Number(property.price).toLocaleString() : 'P.O.A'}
                </span>
                {property.status === 'Rent' && (
                  <span className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-widest">/ month</span>
                )}
              </div>
              <span className="text-[9px] sm:text-[10px] font-black text-gray-400 block mt-0.5 sm:mt-1 uppercase tracking-widest truncate">
                ₹{property.price_per_unit || (property.price && property.area ? Math.round(property.price / property.area) : 0)} / {property.area_unit === 'sqft' ? 'Sq foot' : 'Acers'}
              </span>
            </>
          </div>

          <div className="flex gap-1 sm:gap-2 flex-shrink-0">
            {/* Owner Management Controls */}
            {onEdit && (
              <div className="flex gap-1.5">
                <button
                  onClick={(e) => { e.stopPropagation(); onEdit(property); }}
                  className="p-2 sm:p-2.5 bg-gray-50 text-gray-400 rounded-md sm:rounded-lg hover:bg-gray-100 hover:text-gray-600 transition-all border border-gray-100"
                  title="Edit Property"
                >
                  <Edit2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </button>
                {onToggleActive && (
                  <button
                    onClick={(e) => { e.stopPropagation(); onToggleActive(property); }}
                    className={`p-2 sm:p-2.5 rounded-md sm:rounded-lg transition-all border ${property.is_active ? 'bg-gray-50 text-emerald-500 border-emerald-100 hover:bg-emerald-50' : 'bg-gray-50 text-amber-500 border-amber-100 hover:bg-amber-50'}`}
                    title={property.is_active ? "Hide Listing" : "Show Listing"}
                  >
                    {property.is_active ? <Eye className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> : <EyeOff className="h-3.5 w-3.5 sm:h-4 sm:w-4" />}
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={(e) => { e.stopPropagation(); onDelete(property); }}
                    className="p-2 sm:p-2.5 bg-gray-50 text-red-400 rounded-md sm:rounded-lg hover:bg-red-50 hover:text-red-500 transition-all border border-red-100"
                    title="Delete Property"
                  >
                    <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  </button>
                )}
              </div>
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
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleContactDealer();
                    }}
                    className="p-2 sm:p-2.5 bg-[#25D366]/10 text-[#25D366] rounded-md sm:rounded-lg hover:bg-[#25D366]/20 transition-all"
                    title="Contact via WhatsApp"
                  >
                    <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5" />
                  </button>
                  <button
                    onClick={() => onViewDetails(property)}
                    className="px-4 sm:px-6 py-2 sm:py-2.5 bg-[#40a28f] text-white rounded-md sm:rounded-lg text-xs sm:text-sm font-bold hover:bg-[#358a7a] transition-all duration-300 shadow-sm shadow-[#40a28f]/10 active:scale-95 whitespace-nowrap"
                  >
                    View Details
                  </button>
                </>
              </div>
            )}
          </div>
        </div>
      </div>
      
    </div>
  );
};

export default PropertyCard;
