import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  MapPin, 
  Calendar, 
  Users, 
  Clock, 
  Gavel, 
  TrendingUp, 
  ShieldCheck, 
  AlertCircle,
  ArrowLeft,
  Share2,
  Heart,
  Eye,
  MessageSquare,
  ExternalLink
} from 'lucide-react';
import { auctionService } from '@/services/auctionService';
import { getImageUrl } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import PropertyCard from '@/components/PropertyCard';

const AuctionDetailView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, openLogin } = useAuth();
  
  const [property, setProperty] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [relatedProperties, setRelatedProperties] = useState<any[]>([]);

  useEffect(() => {
    if (id) {
      fetchAuctionDetails();
    }
  }, [id]);

  const fetchAuctionDetails = async () => {
    try {
      // Since we don't have a single auction endpoint, we'll get all and filter
      const allAuctions = await auctionService.getAuctionProperties();
      const auction = allAuctions.find(p => p.id.toString() === id);
      setProperty(auction || null);
      
      // Fetch related auctions (same location or type)
      const related = allAuctions
        .filter(p => p.id.toString() !== id && (p.location === auction?.location || p.type === auction?.type))
        .slice(0, 3);
      setRelatedProperties(related);
    } catch (error) {
      console.error('Failed to fetch auction details:', error);
    } finally {
      setLoading(false);
    }
  };



  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: property?.title || 'Auction Property',
        text: `Check out this auction property: ${property?.title} - ${property?.location}`,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  const getTimeRemaining = () => {
    if (!property) return null;
    
    // Use expiry_date if available (comes from backend ExpiryDate)
    const targetDate = property.expiry_date 
      ? new Date(property.expiry_date).getTime() 
      : new Date(property.created_at).getTime() + (30 * 24 * 60 * 60 * 1000);
    
    const diff = targetDate - Date.now();
    
    if (diff <= 0) return { days: 0, hours: 0, minutes: 0, total: 0 };
    
    return {
      total: diff,
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((diff / (1000 * 60)) % 60)
    };
  };

  const timeRemaining = getTimeRemaining();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fbfa] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-[#40a28f]/20 border-t-[#40a28f] rounded-full animate-spin"></div>
          <p className="text-sm font-bold text-gray-400 uppercase tracking-widest animate-pulse">Loading Auction Details...</p>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-[#f8fbfa] flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Auction Not Found</h2>
          <p className="text-gray-600 mb-6">The auction property you're looking for doesn't exist or has been removed.</p>
          <button
            onClick={() => navigate('/auctions')}
            className="px-6 py-3 bg-[#40a28f] text-white rounded-xl font-medium hover:bg-[#358a7a] transition-colors"
          >
            Back to Auctions
          </button>
        </div>
      </div>
    );
  }



  return (
    <div className="min-h-screen bg-[#f8fbfa]">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#40a28f] to-[#358a7a] pt-20 pb-32 px-4 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Gavel className="w-64 h-64 transform rotate-12" />
        </div>
        
        <button
          onClick={() => navigate('/auctions')}
          className="absolute top-4 left-4 p-2 bg-white/20 backdrop-blur-md hover:bg-white/30 text-white rounded-full transition-all"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>

        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-lg text-xs font-black uppercase tracking-widest">
              Bank Auction
            </span>
            {property.is_verified && (
              <span className="px-3 py-1 bg-emerald-500 text-white rounded-lg text-xs font-black uppercase tracking-widest">
                <ShieldCheck className="w-3 h-3 inline mr-1" />
                Verified
              </span>
            )}
          </div>
          
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter leading-none uppercase max-w-4xl">
            {property.title}
          </h1>
          
          <div className="flex items-center gap-4 mt-4">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              <span className="text-lg font-medium">{property.location}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              <span className="text-lg font-medium">
                Listed: {new Date(property.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 -mt-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Property Images */}
            <div className="bg-white rounded-3xl overflow-hidden shadow-xl border border-gray-100">
              <div className="aspect-video bg-gray-100">
                <img 
                  src={getImageUrl(property.imageUrl)} 
                  alt={property.title}
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Image Actions */}
              <div className="p-4 flex items-center justify-between border-t border-gray-100">
                <div className="flex items-center gap-2">
                  <button className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors">
                    <Eye className="h-4 w-4" />
                  </button>
                  <button className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors">
                    <Heart className="h-4 w-4" />
                  </button>
                </div>
                <button 
                  onClick={handleShare}
                  className="p-2 bg-[#40a28f] text-white rounded-lg hover:bg-[#358a7a] transition-colors"
                >
                  <Share2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Property Details */}
            <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Property Details</h2>
              
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-2">Property Type</h3>
                  <p className="text-lg font-semibold text-gray-900">{property.type}</p>
                </div>
                <div>
                  <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-2">Area</h3>
                  <p className="text-lg font-semibold text-gray-900">{property.area} {property.area_unit}</p>
                </div>
                {property.frontage && (
                  <div>
                    <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-2">Frontage</h3>
                    <p className="text-lg font-semibold text-gray-900">{property.frontage}</p>
                  </div>
                )}
                {property.land_use && (
                  <div>
                    <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-2">Land Use</h3>
                    <p className="text-lg font-semibold text-gray-900">{property.land_use}</p>
                  </div>
                )}
              </div>

              {property.description && (
                <div>
                  <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-2">Description</h3>
                  <p className="text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-100">
                    {property.description}
                  </p>
                </div>
              )}
            </div>

            {/* Auction Information */}
            <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-3xl p-8 border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 uppercase tracking-tighter">Auction Information</h2>
                <span className="px-3 py-1 bg-amber-500 text-white rounded-lg text-xs font-black uppercase tracking-widest">
                  Scheduled
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl border border-white/50">
                  <div className="flex items-center gap-3 mb-3">
                    <TrendingUp className="h-6 w-6 text-amber-600" />
                    <h3 className="text-lg font-bold text-gray-900">Base Price</h3>
                  </div>
                  <p className="text-3xl font-black text-amber-600">
                    ₹{property.price.toLocaleString('en-IN')}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    Reserve price set by institution
                  </p>
                </div>

                <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl border border-white/50">
                  <div className="flex items-center gap-3 mb-3">
                    <Clock className="h-6 w-6 text-blue-600" />
                    <h3 className="text-lg font-bold text-gray-900">Auction Date</h3>
                  </div>
                  <p className="text-2xl font-black text-blue-600">
                    {property.expiry_date ? new Date(property.expiry_date).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' }) : 'To Be Announced'}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    Official hearing/bidding date
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-8 space-y-4">
                {property.auction_link && (
                  <a
                    href={property.auction_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-5 bg-[#1e293b] text-white rounded-2xl font-black text-sm uppercase tracking-[0.2em] hover:bg-black transition-all shadow-xl shadow-gray-200 flex items-center justify-center gap-3 transform hover:scale-[1.01] active:scale-95"
                  >
                    View Official Documents <ExternalLink className="w-4 h-4" />
                  </a>
                )}
                
                <button
                  onClick={() => {
                    const phone = property.owner?.phone || '91XXXXXXXXXX'; // Fallback or use real admin phone
                    window.open(`https://wa.me/${phone.replace(/[^0-9]/g, '')}?text=Interested in Bank Auction: ${property.title}`, '_blank');
                  }}
                  className="w-full py-5 bg-[#40a28f] text-white rounded-2xl font-black text-sm uppercase tracking-[0.2em] hover:bg-[#358a7a] transition-all shadow-xl shadow-emerald-600/10 flex items-center justify-center gap-3"
                >
                  Connect with Auctioneer <MessageSquare className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Quick Actions */}
            <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full py-3 bg-[#40a28f] text-white rounded-xl font-medium hover:bg-[#358a7a] transition-colors flex items-center justify-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Contact Auctioneer
                </button>
                <button className="w-full py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors flex items-center justify-center gap-2">
                  <Share2 className="h-4 w-4" />
                  Share Auction
                </button>
              </div>
            </div>

            {/* Related Properties */}
            {relatedProperties.length > 0 && (
              <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Related Auctions</h3>
                <div className="space-y-4">
                  {relatedProperties.map((relatedProperty) => (
                    <div 
                      key={relatedProperty.id}
                      onClick={() => navigate(`/auctions/${relatedProperty.id}`)}
                      className="cursor-pointer group"
                    >
                      <div className="flex gap-3 p-3 rounded-xl border border-gray-100 group-hover:border-[#40a28f] transition-all">
                        <img 
                          src={getImageUrl(relatedProperty.imageUrl)} 
                          alt={relatedProperty.title}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 text-sm truncate">{relatedProperty.title}</p>
                          <p className="text-xs text-gray-500">{relatedProperty.location}</p>
                          <p className="text-sm font-bold text-[#40a28f]">₹{relatedProperty.price.toLocaleString('en-IN')}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Information Support */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl p-6 border border-blue-100">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Marketplace Guidelines</h3>
              <ul className="space-y-3 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-[#40a28f] mt-1">•</span>
                  <span>View official bank documents via the link provided</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#40a28f] mt-1">•</span>
                  <span>Direct connection with assigned institutional auctioneers</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#40a28f] mt-1">•</span>
                  <span>Verification labels ensure asset authenticity</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#40a28f] mt-1">•</span>
                  <span>Contact support for property visit assistance</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>


    </div>
  );
};

export default AuctionDetailView;
