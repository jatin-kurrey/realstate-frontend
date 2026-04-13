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
    <div className="bg-white rounded-[32px] overflow-hidden shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-gray-100/80 hover:shadow-[0_32px_64px_-16px_rgba(0,0,0,0.12)] hover:border-[#40a28f]/20 transition-all duration-500 group flex flex-col h-full font-['Outfit']">
      {/* Image Container */}
      <div className={`relative ${compact ? 'h-44' : 'h-64 sm:h-72'} overflow-hidden m-2`}>
        <div className="absolute inset-0 z-0 bg-gray-100 animate-pulse" />
        <img
          src={getImageUrl(property.imageUrl) || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=400'}
          alt={property.title}
          className="relative z-10 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
        />
        <div className="absolute inset-0 z-20 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {/* Floating Glass Badges */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 z-30 items-end">
          <div className="flex gap-2">
            {property.is_auction && (
              <span className="bg-red-500/90 backdrop-blur-md text-white px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl flex items-center gap-1.5 border border-white/20">
                <Gavel className="h-3 w-3" /> Auction
              </span>
            )}
            {property.is_verified && (
              <span className="bg-white/90 backdrop-blur-md text-emerald-600 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl flex items-center gap-1.5 border border-white/40">
                <ShieldCheck className="h-3 w-3" /> Verified
              </span>
            )}
          </div>
          <div className="flex gap-2">
            {property.is_premium && (
              <span className="bg-gradient-to-r from-amber-400 to-amber-600 text-white px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl flex items-center gap-1.5 border border-white/20">
                <Crown className="h-3 w-3 fill-current" /> Premium
              </span>
            )}
            <span className="bg-[#40a28f] text-white px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl border border-white/20">
              {property.status}
            </span>
          </div>
        </div>

        {/* Bookmark Button */}
        <button 
          onClick={toggleShortlist}
          className={`absolute bottom-3 right-3 z-30 p-2.5 rounded-2xl backdrop-blur-md transition-all duration-300 transform group-hover:translate-y-0 translate-y-2 opacity-0 group-hover:opacity-100 ${isShortlisted ? 'bg-red-500 text-white shadow-red-500/30' : 'bg-white/90 text-gray-600 hover:text-red-500 shadow-xl'}`}
        >
          <Heart className={`w-5 h-5 ${isShortlisted ? 'fill-current' : ''}`} />
        </button>

        {/* View Count Badge */}
        {stats && (
          <div className="absolute bottom-3 left-3 z-30 flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10">
            <Eye className="w-3.5 h-3.5 text-white/80" />
            <span className="text-[10px] font-black text-white uppercase tracking-widest">{stats.views} Views</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6 sm:p-8 flex flex-col flex-grow">
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-1 bg-[#40a28f]/10 text-[#40a28f] rounded-lg text-[9px] font-black uppercase tracking-widest border border-[#40a28f]/20 leading-none">
              {property.type}
            </span>
            {property.land_use && (
              <span className="px-2.5 py-1 bg-gray-50 text-gray-500 rounded-lg text-[9px] font-black uppercase tracking-widest border border-gray-100 leading-none">
                {property.land_use}
              </span>
            )}
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-gray-900 leading-[1.2] mb-1.5 group-hover:text-[#40a28f] transition-colors line-clamp-2 min-h-[3rem]">
            {property.title}
          </h3>
          <div className="flex items-center gap-1.5 group/loc">
            <MapPin className="h-4 w-4 text-[#40a28f]/60 group-hover/loc:text-[#40a28f] transition-colors" />
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              {(() => {
                const mainLoc = property.street_name || property.landmark;
                const locParts = [mainLoc, property.village].filter(Boolean);
                return locParts.length > 0 ? locParts.join(', ') : property.location;
              })()}
            </p>
          </div>
        </div>

        {/* Key Specs Grid */}
        <div className="grid grid-cols-2 gap-3 mb-6 p-4 bg-gray-50/50 rounded-2xl border border-gray-100/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center shadow-sm border border-gray-100">
              <Maximize className="w-4 h-4 text-[#40a28f]" />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Area Size</p>
              <p className="text-xs font-black text-gray-800 uppercase tracking-tighter">
                {property.area} <span className="text-[9px] opacity-60">{property.area_unit === 'sqft' ? 'Sq Ft' : 'Acres'}</span>
              </p>
            </div>
          </div>
          {property.frontage && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center shadow-sm border border-gray-100">
                <Ruler className="w-4 h-4 text-[#40a28f]" />
              </div>
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Frontage</p>
                <p className="text-xs font-black text-gray-800 uppercase tracking-tighter">{property.frontage}</p>
              </div>
            </div>
          )}
        </div>

        {/* Pricing & Actions */}
        <div className="mt-auto pt-6 border-t border-gray-50 flex items-center justify-between">
          <div className="flex flex-col">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 leading-none">Starting from</p>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-gray-900 tracking-tighter">
                ₹{property.price ? Number(property.price).toLocaleString('en-IN') : 'P.O.A'}
              </span>
              {property.status === 'Rent' && <span className="text-[10px] font-bold text-[#40a28f] uppercase tracking-widest">/mo</span>}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => { e.stopPropagation(); handleContactDealer(); }}
              className="p-3 bg-[#25D366]/5 text-[#25D366] rounded-2xl hover:bg-[#25D366]/10 border border-[#25D366]/20 transition-all hover:scale-105 active:scale-95"
              title="WhatsApp Dealer"
            >
              <MessageSquare className="w-5 h-5 fill-current" />
            </button>
            <button
              onClick={() => onViewDetails(property)}
              className="px-6 py-3 bg-[#40a28f] text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg shadow-[#40a28f]/20 hover:shadow-[#40a28f]/30 hover:bg-[#358a7a] transition-all hover:translate-y-[-2px] active:scale-95"
            >
              Learn More
            </button>
          </div>
        </div>

        {/* Admin/Owner Controls Overlay */}
        {onEdit && (
          <div className="mt-4 flex gap-2 w-full">
            <button onClick={(e) => { e.stopPropagation(); onEdit(property); }} className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gray-50 text-gray-600 rounded-xl text-[10px] font-black uppercase tracking-widest border border-gray-100 hover:bg-gray-100 transition-all"><Edit2 className="w-3.5 h-3.5" /> Edit</button>
            <button onClick={(e) => { e.stopPropagation(); onDelete(property); }} className="p-2.5 bg-red-50 text-red-500 rounded-xl border border-red-100 hover:bg-red-500 hover:text-white transition-all"><Trash2 className="w-4 h-4" /></button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PropertyCard;
