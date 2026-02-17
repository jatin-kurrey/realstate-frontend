
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import FilterBar from '@/components/FilterBar';
import PropertyCard from '@/components/PropertyCard';
import Pagination from '@/components/Pagination';
import { propertyService } from '@/services/api';
import { Property } from '@/types/types';
import { ArrowRight, Loader2 } from 'lucide-react';
import { useSiteConfig } from '@/contexts/SiteConfigContext';

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
  const [loading, setLoading] = useState(true);
  const [isLoggedIn] = useState(!!localStorage.getItem('token'));

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const data = await propertyService.getAll();
        setProperties(data);
      } catch (error) {
        console.error('Failed to fetch properties:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProperties();
  }, []);

  const handleOpenDetail = (property: Property) => {
    navigate(`/properties/${property.id}`);
  };

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

          <div className="flex justify-center pt-4">
            <button
              onClick={onNavigateToRequirements}
              className="bg-[#e2f2f0]/90 backdrop-blur-sm text-[#40a28f] px-10 py-4 rounded-[20px] font-black uppercase tracking-widest text-xs shadow-2xl shadow-black/10 hover:bg-white hover:scale-105 transition-all active:scale-[0.98]"
            >
              Post Your Requirement
            </button>
          </div>
        </div>

        {/* Subtle Decorative Elements */}
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute -top-24 -left-24 w-72 h-72 bg-white/5 rounded-full blur-3xl" />
      </div>

      {/* Landing Filter Overlay */}
      <FilterBar />

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
        ) : properties.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {properties.map((property) => (
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

        {properties.length > 0 && <Pagination />}
      </section>
    </main>
  );
};

export default BrowsePropertiesView;
