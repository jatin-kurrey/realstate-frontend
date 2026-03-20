import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import PropertyCard from '@/components/PropertyCard';
import { auctionService, AuctionProperty } from '@/services/auctionService';
import { Loader2, Gavel, Plus, ChevronDown } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import AddPropertyModal from '@/components/AddPropertyModal';
import { Property } from '@/types/types';
import FilterBar from '@/components/FilterBar';
import AdvertisementBanner from '@/components/AdvertisementBanner';

const AuctionPropertiesView: React.FC = () => {
  const navigate = useNavigate();
  const [properties, setProperties] = useState<AuctionProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const { userRole } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [appliedFilters, setAppliedFilters] = useState<any>({
    location: '',
    type: 'All',
    minPrice: '',
    maxPrice: '',
    searchQuery: '',
    showPremium: false
  });
  const [sortBy, setSortBy] = useState('Newest First');

  const fetchAuctionProperties = async () => {
    try {
      setLoading(true);
      const data = await auctionService.getAuctionProperties();
      setProperties(data || []);
    } catch (error) {
      console.error('Failed to fetch auction properties:', error);
      setProperties([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuctionProperties();
  }, []);

  const handleOpenDetail = (property: AuctionProperty) => {
    navigate(`/auctions/${property.id}`);
  };


  const handleSearch = (filters: any) => {
    setAppliedFilters(filters);
  };

  const filteredProperties = useMemo(() => {
    return properties.filter(p => {
      const matchLocation = !appliedFilters.searchQuery || p.location?.toLowerCase().includes(appliedFilters.searchQuery.toLowerCase()) || p.title?.toLowerCase().includes(appliedFilters.searchQuery.toLowerCase());
      const matchType = appliedFilters.type === 'All' || p.type === appliedFilters.type;
      const matchMinPrice = !appliedFilters.minPrice || p.price >= Number(appliedFilters.minPrice);
      const matchMaxPrice = !appliedFilters.maxPrice || p.price <= Number(appliedFilters.maxPrice);
      const matchPremium = !appliedFilters.showPremium || p.is_premium;

      return matchLocation && matchType && matchMinPrice && matchMaxPrice && matchPremium;
    }).sort((a, b) => {
      if (sortBy === 'Price: Low to High') return a.price - b.price;
      if (sortBy === 'Price: High to Low') return b.price - a.price;
      if (sortBy === 'Newest First') return Number(b.id) - Number(a.id);
      return 0;
    });
  }, [properties, appliedFilters, sortBy]);

  return (
    <main className="bg-white min-h-screen">
      {/* Premium Auction Hero */}
      <div className="bg-[#40a28f] py-32 px-4 text-center text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto space-y-8 relative z-10">
          <div className="inline-flex items-center gap-3 px-6 py-2.5 bg-black/20 backdrop-blur-xl border border-white/10 rounded-full text-[10px] font-black uppercase tracking-[0.3em]">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Asset Marketplace
          </div>
          
          <div className="space-y-6">
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-none uppercase">
              Bank <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-white/40 italic">Auctions</span>
            </h1>
            <p className="text-xl md:text-2xl text-white/80 font-medium max-w-2xl mx-auto leading-relaxed">
              Premium gateway to institutional assets and community property auctions with legal transparency.
            </p>
          </div>

          <div className="flex flex-col items-center justify-center pt-10">
            {userRole === 'admin' && (
              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-white text-[#40a28f] px-10 py-4 rounded-[20px] font-black uppercase tracking-widest text-xs shadow-2xl hover:scale-105 transition-all flex items-center gap-3 active:scale-[0.98] mb-10"
              >
                <Plus className="w-4 h-4" /> Post Auction Listing
              </button>
            )}
            <AdvertisementBanner mode="auction" />
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-full h-full opacity-5 pointer-events-none">
          <Gavel className="absolute -bottom-20 -left-20 w-[500px] h-[500px] -rotate-12" />
        </div>
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white/10 rounded-full blur-[140px] -mr-48 -mt-48" />
      </div>

      <FilterBar mode="auction" onSearch={handleSearch} />

      <section className="max-w-7xl mx-auto px-4 pt-24 pb-32">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-10 mb-16 px-4">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <Gavel className="h-6 w-6 text-[#40a28f]" />
              <h2 className="text-4xl font-black text-gray-900 tracking-tighter uppercase italic">Distressed Assets</h2>
            </div>
            <p className="text-[10px] font-black text-[#40a28f] uppercase tracking-[0.4em] ml-1">Verified Institutional Postings</p>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-gray-50 border border-gray-100 rounded-[22px] py-4 px-10 pr-16 appearance-none focus:outline-none focus:ring-4 focus:ring-[#40a28f]/5 text-gray-400 text-[10px] font-black uppercase tracking-widest cursor-pointer hover:bg-white transition-all shadow-sm"
              >
                <option value="Newest First">Newest First</option>
                <option value="Price: Low to High">Price: Low to High</option>
                <option value="Price: High to Low">Price: High to Low</option>
              </select>
              <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300 pointer-events-none" />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-48 gap-8">
            <div className="relative">
              <div className="w-20 h-20 border-8 border-gray-50 rounded-full" />
              <div className="w-20 h-20 border-t-8 border-[#40a28f] rounded-full animate-spin absolute inset-0" />
            </div>
            <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.5em] animate-pulse">Syncing Database</p>
          </div>
        ) : filteredProperties.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 px-4">
            {filteredProperties.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                onViewDetails={handleOpenDetail}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-40 bg-gray-50/50 rounded-[80px] border-4 border-dashed border-gray-100 space-y-8 mx-4">
            <div className="w-24 h-24 bg-white rounded-[32px] flex items-center justify-center mx-auto shadow-2xl shadow-gray-200">
              <Gavel className="h-10 w-10 text-gray-200" />
            </div>
            <div>
              <p className="text-gray-400 font-black uppercase tracking-[0.3em] text-sm leading-relaxed max-w-sm mx-auto">No assets found matching your search criteria.</p>
            </div>
          </div>
        )}
      </section>

      {isModalOpen && (
        <AddPropertyModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          property={{ is_auction: true } as Property}
          onSuccess={() => {
            setIsModalOpen(false);
            fetchAuctionProperties();
          }}
        />
      )}
    </main>
  );
};

export default AuctionPropertiesView;
