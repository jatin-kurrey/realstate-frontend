import React, { useState, useEffect, useMemo, useCallback } from 'react';
import RequirementCard from '@/components/RequirementCard';
import Pagination from '@/components/Pagination';
import { requirementService } from '@/services/api';
import { Requirement } from '@/types/types';
import { ChevronDown, Loader2 } from 'lucide-react';
import AddRequirementModal from '@/components/AddRequirementModal';
import { useSiteConfig } from '@/contexts/SiteConfigContext';
import FilterBar from '@/components/FilterBar';
import AdvertisementBanner from '@/components/AdvertisementBanner';
import { useAuth } from '@/contexts/AuthContext';

const RequirementsView: React.FC = () => {
  const { config } = useSiteConfig();
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const mockRequirements: Requirement[] = [
    {
      id: 1001,
      purpose: 'Buy',
      type: 'Residential',
      minBudget: 600000,
      maxBudget: 900000,
      location: 'Riverside, Lakeview',
      minArea: 1200,
      maxArea: 2200,
      description: 'Seeking family home near good schools with backyard space.',
      contactMethod: 'In-app'
    },
    {
      id: 1002,
      purpose: 'Buy',
      type: 'Commercial',
      minBudget: 900000,
      maxBudget: 1500000,
      location: 'Business District, City Center',
      minArea: 2000,
      maxArea: 4000,
      description: 'Prefer modern commercial space with dedicated parking.',
      contactMethod: 'Email'
    },
    {
      id: 1003,
      purpose: 'Rent',
      type: 'Residential',
      minBudget: 1500,
      maxBudget: 2600,
      location: 'Central Park, Brooklyn Arts District',
      minArea: 600,
      maxArea: 1100,
      description: 'Looking for pet friendly apartment with balcony and natural light.',
      contactMethod: 'Email'
    },
    {
      id: 1004,
      purpose: 'Rent',
      type: 'Commercial',
      minBudget: 3000,
      maxBudget: 7000,
      location: 'Downtown, Civic Center',
      minArea: 800,
      maxArea: 2500,
      description: 'Need ground floor retail with high foot traffic and corner visibility.',
      contactMethod: 'Phone'
    },
    {
      id: 1005,
      purpose: 'Buy',
      type: 'Plots',
      minBudget: 2500000,
      maxBudget: 4500000,
      location: 'Mohaba Bazar, Raipur',
      minArea: 1500,
      maxArea: 3000,
      description: 'Searching for residential plot in gated colony. West facing preferred.',
      contactMethod: 'In-app'
    },
    {
      id: 1006,
      purpose: 'Rent',
      type: 'Commercial',
      minBudget: 15000,
      maxBudget: 35000,
      location: 'Teddy Industrial Area',
      minArea: 5000,
      maxArea: 8000,
      description: 'Looking for warehouse space with 24ft height and heavy vehicle access.',
      contactMethod: 'Email'
    },
    {
      id: 1007,
      purpose: 'Buy',
      type: 'Residential',
      minBudget: 3500000,
      maxBudget: 5500000,
      location: 'Kaurin Bhata, Rajnandgaon',
      minArea: 1000,
      maxArea: 1500,
      description: 'Ready to move 3BHK bungalow. Budget up to 55L for verified property.',
      contactMethod: 'Phone'
    }
  ];

  const [appliedFilters, setAppliedFilters] = useState<any>({
    purpose: 'All',
    type: 'All',
    minBudget: '',
    maxBudget: '',
    searchQuery: '',
    showPremium: false
  });
  const [sortBy, setSortBy] = useState('Newest First');
  const threshold = Number(config.premium_price_threshold) || 30000000;

  const isPremiumItem = useCallback((req: Requirement) => {
    return req.is_premium || req.maxBudget >= threshold;
  }, [threshold]);

  const fetchRequirements = useCallback(async (premiumOnly: boolean) => {
    setLoading(true);
    try {
      const data = await requirementService.getAll({ premium_only: premiumOnly ? 'true' : 'false' });
      setRequirements(data && data.length > 0 ? data : mockRequirements);
    } catch (error) {
      console.error('Failed to fetch requirements:', error);
      setRequirements(mockRequirements);
    } finally {
      setLoading(false);
    }
  }, [mockRequirements]);

  // handleSearch stabilized with useCallback
  const handleSearch = useCallback((filters: any) => {
    // If premium toggle changed, or if it's the first load, we refetch to ensure fresh data
    const isInitialLoad = requirements.length === 0 && loading;
    if (filters.showPremium !== appliedFilters.showPremium || isInitialLoad) {
      fetchRequirements(filters.showPremium);
    }
    setAppliedFilters(filters);
  }, [appliedFilters.showPremium, fetchRequirements, requirements.length, loading]);

  // No initial fetch here; FilterBar triggers handleSearch on mount

  const { isPremium, userRole } = useAuth();
  const hasPremiumAccess = isPremium || userRole === 'admin';

  const filteredRequirements = useMemo(() => {
    return requirements.filter(req => {
      // ── PREMIUM TOGGLE LOGIC (Threshold-Synced) ──
      if (appliedFilters.showPremium) {
          // Toggle ON: Show ONLY premium requirements
          if (!isPremiumItem(req)) return false;
      } else {
          // Toggle OFF: Show ONLY standard requirements
          if (isPremiumItem(req)) return false;
      }

      const matchPurpose = appliedFilters.purpose === 'All' || req.purpose === appliedFilters.purpose;
      const matchType = appliedFilters.type === 'All' || req.type === appliedFilters.type;
      const matchMinBudget = !appliedFilters.minBudget || Number(req.minBudget) >= Number(appliedFilters.minBudget);
      const matchMaxBudget = !appliedFilters.maxBudget || Number(req.maxBudget) <= Number(appliedFilters.maxBudget);
      const matchSearch = !appliedFilters.searchQuery || 
                         req.location?.toLowerCase().includes(appliedFilters.searchQuery.toLowerCase()) ||
                         req.description?.toLowerCase().includes(appliedFilters.searchQuery.toLowerCase());

      return matchPurpose && matchType && matchMinBudget && matchMaxBudget && matchSearch;
    }).sort((a, b) => {
      if (sortBy === 'Budget: Low to High') return Number(a.minBudget) - Number(b.minBudget);
      if (sortBy === 'Budget: High to Low') return Number(b.minBudget) - Number(a.minBudget);
      if (sortBy === 'Newest First') return Number(b.id) - Number(a.id);
      return 0;
    });
  }, [requirements, appliedFilters, sortBy, hasPremiumAccess, isPremiumItem]);

  return (
    <main className="bg-white">
      {/* Landing Hero */}
      <div className="bg-[#40a28f] py-28 px-4 text-center text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto space-y-8 relative z-10">
          <div className="space-y-6">
            <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-tight max-w-5xl mx-auto uppercase">
              {config.requirements_hero_title || 'Property Requirements'}
            </h1>
            <p className="text-xl md:text-2xl text-white/90 font-medium max-w-3xl mx-auto leading-relaxed">
              {config.requirements_hero_subtitle || 'Discover what buyers and tenants are looking for. Connect directly with serious leads.'}
            </p>
          </div>

          <div className="flex flex-col items-center justify-center pt-4 w-full">
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-[#e2f2f0]/90 backdrop-blur-sm text-[#40a28f] px-10 py-4 rounded-[20px] font-black uppercase tracking-widest text-xs shadow-2xl shadow-black/10 hover:bg-white hover:scale-105 transition-all active:scale-[0.98] mb-8"
            >
              Post Your Requirement
            </button>
            <AdvertisementBanner mode="requirement" />
          </div>
        </div>

        {/* Decorative Circles */}
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute -top-24 -left-24 w-72 h-72 bg-white/5 rounded-full blur-3xl" />
      </div>

      <FilterBar mode="requirement" onSearch={handleSearch} />

      <section className="max-w-7xl mx-auto px-4 pt-20 pb-24">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="space-y-1">
            <h2 className="text-3xl font-black text-gray-800 tracking-tight">Community Requirements</h2>
            <p className="text-[10px] font-black text-[#40a28f] uppercase tracking-[0.2em]">Verified & Active Postings</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-gray-50 border border-gray-100 rounded-2xl py-3 px-6 pr-12 appearance-none focus:outline-none focus:ring-4 focus:ring-[#40a28f]/5 text-gray-500 text-xs font-black uppercase tracking-widest"
              >
                <option value="Newest First">Newest First</option>
                <option value="Budget: Low to High">Budget: Low to High</option>
                <option value="Budget: High to Low">Budget: High to Low</option>
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300 pointer-events-none" />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-[#40a28f]" />
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Loading Requirements</p>
          </div>
        ) : filteredRequirements.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredRequirements.map((req) => (
              <RequirementCard key={req.id} requirement={req} />
            ))}
          </div>
        ) : (
          <div className="text-center py-32 bg-gray-50 rounded-[48px] border-2 border-dashed border-gray-100">
            <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">No requirements found matching your criteria.</p>
          </div>
        )}

        {filteredRequirements.length > 0 && (
          <div className="pt-16">
            <Pagination />
          </div>
        )}
      </section>

      <AddRequirementModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => fetchRequirements(appliedFilters.showPremium)}
      />
    </main>
  );
};

export default RequirementsView;
