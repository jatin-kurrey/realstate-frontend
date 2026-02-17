import React, { useState, useEffect, useMemo } from 'react';
import RequirementsSidebar from '@/components/RequirementsSidebar';
import RequirementCard from '@/components/RequirementCard';
import Pagination from '@/components/Pagination';
import { requirementService } from '@/services/api';
import { Requirement } from '@/types/types';
import { ChevronDown, Loader2 } from 'lucide-react';
import AddRequirementModal from '@/components/AddRequirementModal';
import { useSiteConfig } from '@/contexts/SiteConfigContext';

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
    }
  ];

  const [filters, setFilters] = useState({
    purpose: 'All',
    type: 'All',
    minBudget: '',
    maxBudget: '',
    locality: ''
  });

  const [appliedFilters, setAppliedFilters] = useState(filters);
  const [sortBy, setSortBy] = useState('Choose an option...');

  const fetchRequirements = async () => {
    setLoading(true);
    try {
      const data = await requirementService.getAll();
      setRequirements(data && data.length > 0 ? data : mockRequirements);
    } catch (error) {
      console.error('Failed to fetch requirements:', error);
      setRequirements(mockRequirements);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequirements();
  }, []);

  const handleFilterChange = (name: string, value: string) => {
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const applyFilters = () => {
    setAppliedFilters(filters);
  };

  const resetFilters = () => {
    const defaultFilters = {
      purpose: 'All',
      type: 'All',
      minBudget: '',
      maxBudget: '',
      locality: ''
    };
    setFilters(defaultFilters);
    setAppliedFilters(defaultFilters);
  };

  const filteredRequirements = useMemo(() => {
    return requirements.filter(req => {
      const matchPurpose = appliedFilters.purpose === 'All' || req.purpose === appliedFilters.purpose;
      const matchType = appliedFilters.type === 'All' || req.type === appliedFilters.type;
      const matchMinBudget = !appliedFilters.minBudget || Number(req.minBudget) >= Number(appliedFilters.minBudget);
      const matchMaxBudget = !appliedFilters.maxBudget || Number(req.maxBudget) <= Number(appliedFilters.maxBudget);
      const matchLocality = !appliedFilters.locality || req.location.toLowerCase().includes(appliedFilters.locality.toLowerCase());

      return matchPurpose && matchType && matchMinBudget && matchMaxBudget && matchLocality;
    }).sort((a, b) => {
      if (sortBy === 'Budget: Low to High') return Number(a.minBudget) - Number(b.minBudget);
      if (sortBy === 'Budget: High to Low') return Number(b.minBudget) - Number(a.minBudget);
      if (sortBy === 'Newest First') return Number(b.id) - Number(a.id);
      return 0;
    });
  }, [requirements, appliedFilters, sortBy]);

  return (
    <main className="bg-[#fcfdfd]">
      {/* Inline Hero */}
      <div className="bg-[#e2f2f0] py-20 px-4 text-center border-b border-[#d1e8e5]">
        <div className="max-w-4xl mx-auto space-y-4">
          <h1 className="text-4xl md:text-5xl font-black text-[#2d3748] tracking-tight uppercase">
            {config.hero_title || 'Property Requirements'}
          </h1>
          <p className="text-base text-gray-500 max-w-2xl mx-auto font-medium">
            {config.hero_subtitle || 'Browse what buyers and tenants are looking for in Rajnandgaon, or post your own requirement to connect with property owners.'}
          </p>
          <div className="pt-8">
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-[#40a28f] text-white px-10 py-4 rounded-xl font-black uppercase tracking-widest text-[11px] hover:bg-[#358a7a] transition-all shadow-2xl shadow-[#40a28f]/30 flex items-center gap-3 mx-auto active:scale-95"
            >
              <div className="bg-white/20 p-1.5 rounded-lg">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              Post Your Requirement
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Sidebar */}
          <aside className="w-full lg:w-80 shrink-0">
            <RequirementsSidebar
              filters={filters}
              onFilterChange={handleFilterChange}
              onApplyFilters={applyFilters}
              onReset={resetFilters}
              activeCount={requirements.filter(r => Number(r.id) > 1000 || typeof r.id === 'string' && r.id.startsWith('m')).length}
            />
          </aside>

          {/* Main Content */}
          <div className="flex-grow space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-gray-100 pb-6">
              <div className="space-y-1">
                <span className="text-xl font-black text-gray-800 tracking-tight">
                  {loading ? 'Searching...' : `${filteredRequirements.length} requirements found`}
                </span>
                <p className="text-[10px] font-black text-[#40a28f] uppercase tracking-[0.2em]">Verified Community Requirements</p>
              </div>

              <div className="flex items-center gap-4">
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="bg-[#40a28f] text-white px-4 py-2.5 rounded-lg font-black uppercase tracking-widest text-[10px] hover:bg-[#358a7a] transition-all shadow-md flex items-center gap-2 group"
                >
                  <svg className="h-3.5 w-3.5 group-hover:rotate-90 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
                  </svg>
                  Post Requirement
                </button>
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bg-white border border-gray-100 rounded-xl py-2.5 px-5 pr-12 appearance-none focus:outline-none focus:ring-2 focus:ring-[#40a28f]/20 focus:border-[#40a28f] text-gray-500 text-sm font-bold transition-all min-w-[200px] shadow-sm"
                  >
                    <option>Choose an option...</option>
                    <option>Budget: Low to High</option>
                    <option>Budget: High to Low</option>
                    <option>Newest First</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300 pointer-events-none" />
                </div>
              </div>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-32 space-y-4">
                <Loader2 className="h-10 w-10 animate-spin text-[#40a28f]" />
                <p className="text-xs font-black text-gray-400 uppercase tracking-[0.3em]">Mapping Requirements</p>
              </div>
            ) : filteredRequirements.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {filteredRequirements.map((req) => (
                  <RequirementCard key={req.id} requirement={req} />
                ))}
              </div>
            ) : (
              <div className="text-center py-32 bg-gray-50/50 rounded-[40px] border-2 border-dashed border-gray-100">
                <div className="max-w-xs mx-auto space-y-4">
                  <div className="bg-white w-16 h-16 rounded-3xl flex items-center justify-center mx-auto shadow-sm">
                    <Loader2 className="h-8 w-8 text-gray-200" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-800 uppercase tracking-tight">No match found</h3>
                  <p className="text-sm text-gray-400 font-medium leading-relaxed">Try adjusting your filters to see more requirements from the community.</p>
                  <button onClick={resetFilters} className="text-[#40a28f] font-black text-xs uppercase tracking-[0.2em] hover:underline pt-2">
                    Clear all filters
                  </button>
                </div>
              </div>
            )}

            {filteredRequirements.length > 0 && (
              <div className="pt-12 flex justify-center">
                <Pagination />
              </div>
            )}
          </div>
        </div>
      </div>

      <AddRequirementModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchRequirements}
      />
    </main>
  );
};

export default RequirementsView;
