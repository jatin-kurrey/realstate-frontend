import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import FilterBar from '@/components/FilterBar';
import PropertyCard from '@/components/PropertyCard';
import Pagination from '@/components/Pagination';
import AdvertisementBanner from '@/components/AdvertisementBanner';
import AddPropertyModal from '@/components/AddPropertyModal';
import { propertyService } from '@/services/api';
import { Property } from '@/types/types';
import { ArrowRight, Loader2 } from 'lucide-react';
import { useSiteConfig } from '@/contexts/SiteConfigContext';
import { useAuth } from '@/contexts/AuthContext';

interface BrowsePropertiesViewProps {
  onNavigateToRequirements: () => void;
  onOpenLogin: () => void;
}

const BrowsePropertiesView: React.FC<BrowsePropertiesViewProps> = ({
  onNavigateToRequirements,
  onOpenLogin
}) => {
  const navigate = useNavigate();
  const { config } = useSiteConfig();
  const [properties, setProperties] = useState<Property[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn] = useState(!!localStorage.getItem('token'));
  const [isAddPropertyModalOpen, setIsAddPropertyModalOpen] = useState(false);

  // No initial fetch here; FilterBar will trigger handleSearch on mount

  const handleOpenDetail = (property: Property) => {
    navigate(`/properties/${property.id}`);
  };

  const handlePostProperty = () => {
    if (isLoggedIn) {
      setIsAddPropertyModalOpen(true);
    } else {
      onOpenLogin();
    }
  };

  const handlePropertySuccess = () => {
    setLoading(true);
    propertyService.getAll({ premium_only: currentFilters.showPremium ? 'true' : 'false' }).then(data => {
      setProperties(data);
      applyLocalFilters(data, currentFilters);
      setLoading(false);
    });
  };

  const { isPremium, userRole } = useAuth();
  const hasPremiumAccess = isPremium || userRole === 'admin';

  const [currentFilters, setCurrentFilters] = useState<any>({});
  const threshold = Number(config.premium_price_threshold) || 30000000;

  const isPremiumItem = useCallback((p: Property) => {
    return p.is_premium || p.price >= threshold;
  }, [threshold]);

  const applyLocalFilters = useCallback((source: Property[], filters: any) => {
    let filtered = [...source];

    // ── PREMIUM TOGGLE LOGIC (Threshold-Synced) ──
    if (filters.showPremium) {
      // Toggle ON: Show ONLY premium properties
      filtered = filtered.filter(p => isPremiumItem(p));
    } else {
      // Toggle OFF: Show ONLY standard properties
      filtered = filtered.filter(p => !isPremiumItem(p));
    }

    // Search Query
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(p =>
        p.title?.toLowerCase().includes(query) ||
        p.location?.toLowerCase().includes(query)
      );
    }

    // Purpose
    if (filters.purpose && filters.purpose !== 'All') {
      filtered = filtered.filter(p => p.status === filters.purpose);
    }

    // Type
    if (filters.type && filters.type !== 'All') {
      filtered = filtered.filter(p => p.type === filters.type);
    }

    // District
    if (filters.district) {
      filtered = filtered.filter(p => p.district === filters.district);
    }

    // Tehsil
    if (filters.tehsil) {
      filtered = filtered.filter(p => p.tehsil === filters.tehsil);
    }

    // RI Circle
    if (filters.riCircle) {
      filtered = filtered.filter(p => p.revenue_inspector_circle === filters.riCircle);
    }

    // Village
    if (filters.village) {
      filtered = filtered.filter(p => p.village === filters.village);
    }

    setFilteredProperties(filtered);
  }, [isPremiumItem]);

  const handleSearch = useCallback(async (filters: any) => {
    // If premium filter changed, we MUST refetch from backend
    // Or if currentFilters is empty (initial load)
    const isInitialLoad = Object.keys(currentFilters).length === 0;
    const premiumFilterChanged = filters.showPremium !== currentFilters.showPremium;

    if (isInitialLoad || premiumFilterChanged) {
      setLoading(true);
      try {
        const data = await propertyService.getAll({ premium_only: filters.showPremium ? 'true' : 'false' });
        setProperties(data);
        applyLocalFilters(data, filters);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    } else {
      applyLocalFilters(properties, filters);
    }
    setCurrentFilters(filters);
  }, [currentFilters, properties, applyLocalFilters]);

  return (
    <main className="bg-white">
      {/* Landing Hero */}
      <div className="bg-[#40a28f] py-28 px-4 text-center text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto space-y-8 relative z-10">
          <div className="space-y-6">
            <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-tight max-w-5xl mx-auto">
              {config.hero_title || 'Find Your Perfect Property in Rajnandgaon'}
            </h1>
            <p className="text-xl md:text-2xl text-white/90 font-medium max-w-3xl mx-auto leading-relaxed">
              {config.hero_subtitle || 'Discover homes, shops, and land for rent or sale. Connect directly with property owners.'}
            </p>
          </div>

          <div className="flex flex-col items-center justify-center pt-4 w-full">
            {config['enable_listings'] === 'true' && (
              <button
                onClick={handlePostProperty}
                className="bg-[#e2f2f0]/90 backdrop-blur-sm text-[#40a28f] px-10 py-4 rounded-[20px] font-black uppercase tracking-widest text-xs shadow-2xl shadow-black/10 hover:bg-white hover:scale-105 transition-all active:scale-[0.98] mb-8"
              >
                Post Your Property
              </button>
            )}
            <AdvertisementBanner mode="property" />
          </div>
        </div>

        {/* Subtle Decorative Elements */}
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute -top-24 -left-24 w-72 h-72 bg-white/5 rounded-full blur-3xl" />
      </div>

      {/* Landing Filter Overlay */}
      <FilterBar onSearch={handleSearch} />

      {/* Property List Section */}
      <section className="max-w-7xl mx-auto px-4 pt-16 pb-24">
        <div className="flex items-end justify-between mb-10">
          <div className="space-y-1">
            <h2 className="text-3xl font-black text-gray-800 tracking-tight">
              Available Properties
            </h2>
          </div>
          <button
            onClick={onNavigateToRequirements}
            className="flex items-center gap-2 text-[#40a28f] font-black uppercase tracking-widest text-[10px] hover:underline transition-all group pb-1"
          >
            Browse Requirements
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-[#40a28f]" />
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Loading Properties</p>
          </div>
        ) : filteredProperties.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {filteredProperties.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                onViewDetails={handleOpenDetail}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-32 bg-gray-50 rounded-[48px] border-2 border-dashed border-gray-100">
            <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">No properties found. Be the first to list one!</p>
          </div>
        )}

        {filteredProperties.length > 0 && <Pagination />}
      </section>

      <AddPropertyModal
        isOpen={isAddPropertyModalOpen}
        onClose={() => setIsAddPropertyModalOpen(false)}
        onSuccess={handlePropertySuccess}
      />
    </main>
  );
};

export default BrowsePropertiesView;
