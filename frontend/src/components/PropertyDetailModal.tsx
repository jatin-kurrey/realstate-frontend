
import React from 'react';
import { X, MapPin } from 'lucide-react';
import { Property } from '@/types/types';

interface PropertyDetailModalProps {
  property: Property;
  isOpen: boolean;
  onClose: () => void;
}

const PropertyDetailModal: React.FC<PropertyDetailModalProps> = ({
  property,
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white w-full max-w-3xl rounded-[24px] shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Header Section */}
        <div className="p-8 pb-0">
          <div className="flex justify-between items-start mb-6">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-[#40a28f]">₹{property.price.toLocaleString()}</span>
                  {property.status === 'Rent' && <span className="text-gray-400 font-bold text-xs uppercase tracking-widest">/month</span>}
                </div>
                {property.is_negotiable && (
                  <span className="px-2.5 py-1 bg-[#e2f2f0] text-[#40a28f] text-[10px] font-black uppercase tracking-widest rounded-lg border border-[#40a28f]/20">
                    Negotiable
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 pt-4">
                <h2 className="text-lg font-bold text-gray-800">Location</h2>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin className="h-5 w-5 text-[#40a28f]" />
                <span className="text-sm font-medium">{property.location}</span>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <X className="h-6 w-6 text-gray-400" />
            </button>
          </div>

          {/* Large Image */}
          <div className="w-full h-72 rounded-xl overflow-hidden mb-8 shadow-sm">
            <img
              src={property.imageUrl}
              alt={property.title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Property Details Grid */}
          <h3 className="text-lg font-bold text-gray-800 mb-4">Property Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="bg-gray-50 border border-gray-100 rounded-xl p-5">
              <p className="text-xs font-bold text-gray-400 uppercase mb-1">Square Footage</p>
              <p className="text-lg font-bold text-gray-800">{property.area} sq.ft</p>
            </div>
            <div className="bg-gray-50 border border-gray-100 rounded-xl p-5">
              <p className="text-xs font-bold text-gray-400 uppercase mb-1">Frontage</p>
              <p className="text-lg font-bold text-gray-800">{property.frontage || 'N/A'}</p>
            </div>
            <div className="bg-gray-50 border border-gray-100 rounded-xl p-5">
              <p className="text-xs font-bold text-gray-400 uppercase mb-1">Purpose</p>
              <p className="text-lg font-bold text-gray-800">{property.status}</p>
            </div>
            <div className="bg-gray-50 border border-gray-100 rounded-xl p-5">
              <p className="text-xs font-bold text-gray-400 uppercase mb-1">Property Type</p>
              <p className="text-lg font-bold text-gray-800">{property.type}</p>
            </div>
          </div>

          {/* Description */}
          <div className="mb-8">
            <h3 className="text-lg font-bold text-gray-800 mb-3">Description</h3>
            <p className="text-gray-600 leading-relaxed">
              {property.description}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetailModal;
