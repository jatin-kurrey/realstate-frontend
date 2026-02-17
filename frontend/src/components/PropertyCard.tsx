import React, { useState, useEffect } from 'react';
import { MapPin, Ruler, Maximize, Edit2, Heart, Eye, MessageSquare, ShieldCheck } from 'lucide-react';
import { Property } from '@/types/types';
import { bookmarkService } from '@/services/api';

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
  const token = localStorage.getItem('token');

  useEffect(() => {
    const checkStatus = async () => {
      if (token) {
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
  }, [property.id, token]);

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
      <div className={`relative ${compact ? 'h-48' : 'h-64'} overflow-hidden`}>
        <img
          src={property.imageUrl}
          alt={property.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />

        {/* Badges - Top Right */}
        <div className="absolute top-4 right-4 flex gap-2">
          {property.is_verified && (
            <span className="bg-emerald-500 text-white px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider shadow-sm flex items-center gap-1">
              <ShieldCheck className="h-3 w-3" /> Verified
            </span>
          )}
          <span className="bg-[#40a28f] text-white px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider shadow-sm">
            {property.status}
          </span>
          <span className="bg-gray-100/90 backdrop-blur-md text-gray-700 px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider shadow-sm">
            {property.type}
          </span>
        </div>

        {/* Stats Overlay (Owner View) */}
        {stats && (
          <div className="absolute bottom-4 left-4 right-4 flex gap-2">
            <div className="flex-1 bg-white/90 backdrop-blur-md p-2 rounded-xl flex items-center justify-center gap-2 shadow-sm">
              <Eye className="h-4 w-4 text-gray-400" />
              <span className="text-xs font-bold text-gray-700">{stats.views} <span className="text-[9px] uppercase text-gray-400 font-extrabold tracking-wider">Views</span></span>
            </div>
            <div className="flex-1 bg-white/90 backdrop-blur-md p-2 rounded-xl flex items-center justify-center gap-2 shadow-sm">
              <MessageSquare className="h-4 w-4 text-[#40a28f]" />
              <span className="text-xs font-bold text-gray-700">{stats.leads} <span className="text-[9px] uppercase text-gray-400 font-extrabold tracking-wider">Leads</span></span>
            </div>
          </div>
        )}

        {/* Featured Tag (if applicable) */}
        {property.is_featured && (
          <div className="absolute top-4 left-4 flex flex-col gap-2">
            <span className="bg-amber-400 text-white px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider shadow-sm">
              Featured
            </span>
          </div>
        )}

        {/* Developer / Pro Badge */}
        {property.owner?.role === 'developer' && property.owner.company_name && (
          <div className={`absolute ${property.is_featured ? 'top-14' : 'top-4'} left-4`}>
            <span className="bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider shadow-sm flex items-center gap-1">
              Pro: {property.owner.company_name}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-8 flex flex-col flex-grow space-y-5">
        <div className="space-y-3">
          <h3 className="text-xl font-bold text-gray-800 leading-tight line-clamp-2 min-h-[3rem] group-hover:text-[#40a28f] transition-colors">
            {property.title}
          </h3>
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-[#40a28f]" />
            <p className="text-sm font-medium text-gray-400 leading-tight">
              {property.location}
            </p>
          </div>
        </div>

        {/* Stats Row */}
        <div className="flex items-center gap-8 py-1">
          <div className="flex items-center gap-2">
            <Ruler className="h-5 w-5 text-gray-400" />
            <span className="text-sm font-medium text-gray-400">{property.area} sq.ft</span>
          </div>
          <div className="flex items-center gap-2">
            <Maximize className="h-5 w-5 text-gray-400" />
            <span className="text-sm font-medium text-gray-400">{property.dimensions}</span>
          </div>
        </div>

        {/* Description Snippet */}
        {!compact && (
          <p className="text-sm text-gray-400 leading-relaxed line-clamp-3">
            {property.description || "Beautiful property located in Rajnandgaon, featuring modern amenities and prime location access."}
          </p>
        )}

        {/* Footer */}
        <div className="pt-6 mt-auto flex items-center justify-between">
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-[#40a28f]">
              ₹{property.price.toLocaleString()}
            </span>
            {property.status === 'Rent' && (
              <span className="text-sm font-medium text-gray-400">/month</span>
            )}
          </div>

          <div className="flex gap-2">
            {/* Edit Button for Owners */}
            {onEdit && (
              <button
                onClick={(e) => { e.stopPropagation(); onEdit(property); }}
                className="p-2.5 bg-gray-50 text-gray-400 rounded-lg hover:bg-gray-100 hover:text-gray-600 transition-all"
              >
                <Edit2 className="h-4 w-4" />
              </button>
            )}

            {/* Action Button */}
            {onActivate && !property.is_active ? (
              <button
                onClick={(e) => { e.stopPropagation(); onActivate(property); }}
                className="px-6 py-2.5 bg-amber-400 text-white rounded-lg text-sm font-bold hover:bg-amber-500 transition-all shadow-sm shadow-amber-400/20"
              >
                Activate
              </button>
            ) : (
              <button
                onClick={() => onViewDetails(property)}
                className="px-6 py-2.5 bg-[#40a28f] text-white rounded-lg text-sm font-bold hover:bg-[#358a7a] transition-all duration-300 shadow-sm shadow-[#40a28f]/10 active:scale-95"
              >
                View Details
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;
