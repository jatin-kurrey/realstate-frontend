import React, { useState, useEffect, useMemo } from 'react';
import RequirementCard from '@/components/RequirementCard';
import Pagination from '@/components/Pagination';
import { requirementService } from '@/services/api';
import { Requirement } from '@/types/types';
import { ChevronDown, Loader2, Lock, Calculator, TrendingUp, Landmark, Percent, Settings2 } from 'lucide-react';
import AddRequirementModal from '@/components/AddRequirementModal';
import { useSiteConfig } from '@/contexts/SiteConfigContext';
import FilterBar from '@/components/FilterBar';
import AdvertisementBanner from '@/components/AdvertisementBanner';

const MortgageView: React.FC = () => {
  const { config } = useSiteConfig();

  // Page-level guard
  if (config['enable_mortgage'] === 'false') {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="text-center space-y-6 max-w-md">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
            <Lock className="w-9 h-9 text-gray-400" />
          </div>
          <h1 className="text-3xl font-black text-gray-800 uppercase tracking-tight">Mortgage</h1>
          <p className="text-sm font-medium text-gray-400 leading-relaxed">
            This section is currently disabled by the administrator.
            <br />Please check back later.
          </p>
          <span className="inline-block bg-amber-50 border border-amber-100 text-amber-600 text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full">
            Temporarily Unavailable
          </span>
        </div>
      </main>
    );
  }

  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [appliedFilters, setAppliedFilters] = useState<any>({
    purpose: 'Mortgage',
    type: 'All',
    minBudget: '',
    maxBudget: '',
    searchQuery: '',
    showPremium: false
  });
  const [sortBy, setSortBy] = useState('Newest First');

  const fetchMortgages = async () => {
    setLoading(true);
    try {
      // Mortgages are stored as requirements with purpose='Mortgage'
      const data = await requirementService.getAll();
      const mortgageData = data.filter(req => req.purpose === 'Mortgage');
      setRequirements(mortgageData);
    } catch (error) {
      console.error('Failed to fetch mortgages:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMortgages();
  }, []);

  const handleSearch = (filters: any) => {
    setAppliedFilters(filters);
  };

  const filteredMortgages = useMemo(() => {
    return requirements.filter(req => {
      // Even though we fetch only mortgages, user might change purpose in filter
      const matchPurpose = appliedFilters.purpose === 'All' || req.purpose === appliedFilters.purpose;
      const matchType = appliedFilters.type === 'All' || req.type === appliedFilters.type;
      const matchMinBudget = !appliedFilters.minBudget || Number(req.minBudget) >= Number(appliedFilters.minBudget);
      const matchMaxBudget = !appliedFilters.maxBudget || Number(req.maxBudget) <= Number(appliedFilters.maxBudget);
      const matchSearch = !appliedFilters.searchQuery || 
                         req.location?.toLowerCase().includes(appliedFilters.searchQuery.toLowerCase()) ||
                         req.description?.toLowerCase().includes(appliedFilters.searchQuery.toLowerCase());
      const matchPremium = !appliedFilters.showPremium || req.is_premium;

      return matchPurpose && matchType && matchMinBudget && matchMaxBudget && matchSearch && matchPremium;
    }).sort((a, b) => {
      if (sortBy === 'Amount: Low to High') return Number(a.minBudget) - Number(b.minBudget);
      if (sortBy === 'Amount: High to Low') return Number(b.minBudget) - Number(a.minBudget);
      if (sortBy === 'Newest First') return Number(b.id) - Number(a.id);
      return 0;
    });
  }, [requirements, appliedFilters, sortBy]);

  // ─── EMI Calculator Logic (2025 Rates) ────────────────────────────────────
  const [propertyVal, setPropertyVal] = useState(5000000); // ₹50 Lakh default
  const [interestRate, setInterestRate] = useState(9.5);   // 9.5% default (SBI/HDFC LAP)
  const [tenureYears, setTenureYears] = useState(15);      // 15 years standard LAP

  const lapCalc = useMemo(() => {
    const maxLoan = propertyVal * 0.75; // Standard 75% LTV for LAP in India
    const p = maxLoan;
    const r = interestRate / 12 / 100;
    const n = tenureYears * 12;
    const emi = p > 0 && r > 0 && n > 0 ? (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1) : 0;
    const totalPayment = emi * n;
    const totalInterest = totalPayment - p;
    
    return { maxLoan, emi, totalPayment, totalInterest };
  }, [propertyVal, interestRate, tenureYears]);

  const fmtL = (v: number) => v >= 10000000 ? `₹${(v/10000000).toFixed(2)} Cr` : v >= 100000 ? `₹${(v/100000).toFixed(2)} L` : `₹${Math.round(v).toLocaleString('en-IN')}`;

  return (
    <main className="bg-white">
      {/* Premium Mortgage Hero */}
      <div className="bg-[#40a28f] pt-32 pb-48 px-4 text-center text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto space-y-8 relative z-10">
          <div className="space-y-6">
            <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-tight max-w-5xl mx-auto uppercase italic">
              {config.mortgage_hero_title || 'Mortgage Solutions'}
            </h1>
            <p className="text-xl md:text-2xl text-white/90 font-medium max-w-3xl mx-auto leading-relaxed">
              {config.mortgage_hero_subtitle || 'Leverage your property for financial growth. Connect with verified lenders and investors.'}
            </p>
          </div>

          <div className="flex flex-col items-center justify-center pt-8 w-full group">
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-white text-[#40a28f] px-12 py-5 rounded-[24px] font-black uppercase tracking-[0.2em] text-xs shadow-[0_20px_50px_rgba(0,0,0,0.2)] hover:scale-105 transition-all active:scale-95 flex items-center gap-4 mb-10"
            >
              Post Mortgage Demand
              <div className="bg-[#e2f2f0] p-1.5 rounded-full group-hover:rotate-45 transition-transform">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
                </svg>
              </div>
            </button>
            <AdvertisementBanner mode="mortgage" />
          </div>

          {/* ─── REALTIME MORTGAGE & EMI CALCULATOR ─── */}
          <div className="bg-white rounded-[32px] p-8 shadow-[0_30px_60px_rgba(0,0,0,0.2)] text-left mt-16 max-w-5xl mx-auto relative z-20 border border-gray-100">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2.5 bg-[#e2f2f0] rounded-xl"><Calculator className="w-5 h-5 text-[#40a28f]" /></div>
              <div>
                <h3 className="text-xl font-black text-gray-900 uppercase tracking-tighter">Loan Against Property Calculator</h3>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Based on India 2025 Standard Rates (SBI/HDFC)</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              {/* Sliders */}
              <div className="space-y-8">
                <div className="space-y-3">
                  <div className="flex justify-between items-end">
                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Property SDV/Market Value</label>
                    <span className="text-xl font-black text-[#40a28f]">{fmtL(propertyVal)}</span>
                  </div>
                  <input type="range" min="1000000" max="100000000" step="100000" value={propertyVal} onChange={(e) => setPropertyVal(Number(e.target.value))} className="w-full accent-[#40a28f] h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer" />
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-end">
                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Interest Rate (p.a.)</label>
                    <span className="text-xl font-black text-orange-500">{interestRate}%</span>
                  </div>
                  <input type="range" min="8.50" max="15.00" step="0.10" value={interestRate} onChange={(e) => setInterestRate(Number(e.target.value))} className="w-full accent-orange-500 h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer" />
                  <p className="text-[9px] font-bold text-gray-300 uppercase">Current LAP Avg: 9.20% - 10.50%</p>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-end">
                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Loan Tenure</label>
                    <span className="text-xl font-black text-blue-500">{tenureYears} Years</span>
                  </div>
                  <input type="range" min="1" max="25" step="1" value={tenureYears} onChange={(e) => setTenureYears(Number(e.target.value))} className="w-full accent-blue-500 h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer" />
                </div>
              </div>

              {/* Output Panel */}
              <div className="bg-gray-50 rounded-3xl p-8 border border-gray-100 space-y-6">
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Max Loan Eligibility (75% LTV)</p>
                  <div className="text-4xl lg:text-5xl font-black text-gray-900 tracking-tighter">{fmtL(lapCalc.maxLoan)}</div>
                </div>

                <div className="grid grid-cols-2 gap-4 border-t border-gray-200 pt-6">
                  <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-50">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 shadow-sm">Monthly EMI</p>
                    <p className="text-2xl font-black text-[#40a28f] tracking-tight text-shadow-sm">₹{Math.round(lapCalc.emi).toLocaleString('en-IN')}</p>
                  </div>
                  <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-50">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 shadow-sm">Total Interest</p>
                    <p className="text-xl font-black text-orange-500 tracking-tight text-shadow-sm">{fmtL(lapCalc.totalInterest)}</p>
                  </div>
                </div>

                <p className="text-[9px] text-gray-400 font-medium leading-relaxed pt-2">
                  * This is an estimate based on standard Indian Loan Against Property (LAP) conditions. Final LTV and rates depend on bank policy, credit score, and property location.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Background Elements */}
        <div className="absolute -bottom-48 -left-24 w-[600px] h-[600px] bg-white/10 rounded-full blur-[120px]" />
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#e2f2f0]/10 rounded-full blur-[100px]" />
      </div>

      <FilterBar 
        mode="mortgage" 
        onSearch={handleSearch} 
        initialFilters={{ purpose: 'Mortgage' }}
      />

      <section className="max-w-7xl mx-auto px-4 pt-24 pb-32">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 px-2">
          <div className="space-y-2">
            <h2 className="text-4xl font-black text-gray-900 tracking-tighter uppercase italic">Active Demands</h2>
            <div className="flex items-center gap-3">
              <span className="h-1.5 w-1.5 rounded-full bg-[#40a28f] animate-pulse" />
              <p className="text-[10px] font-black text-[#40a28f] uppercase tracking-[0.3em]">Live Financial Marketplace</p>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-gray-50/50 border border-gray-100 rounded-[20px] py-4 px-8 pr-14 appearance-none focus:outline-none focus:ring-4 focus:ring-[#40a28f]/5 text-gray-400 text-[10px] font-black uppercase tracking-widest cursor-pointer hover:bg-white transition-all shadow-sm"
              >
                <option value="Newest First">Latest Postings</option>
                <option value="Amount: Low to High">Amount: Ascending</option>
                <option value="Amount: High to Low">Amount: Descending</option>
              </select>
              <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300 pointer-events-none" />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-40 gap-6">
            <div className="relative">
              <Loader2 className="h-14 w-14 animate-spin text-[#40a28f] opacity-20" />
              <Loader2 className="h-14 w-14 animate-spin text-[#40a28f] absolute inset-0 [animation-delay:-0.5s]" />
            </div>
            <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.4em] animate-pulse">Syncing Demands</p>
          </div>
        ) : filteredMortgages.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {filteredMortgages.map((req) => (
              <RequirementCard key={req.id} requirement={req} />
            ))}
          </div>
        ) : (
          <div className="text-center py-40 bg-gray-50/50 rounded-[60px] border-4 border-dashed border-gray-100/50 mx-2">
            <div className="space-y-6 max-w-md mx-auto">
              <p className="text-gray-300 font-black uppercase tracking-[0.2em] text-sm">No demands found matching your financial criteria.</p>
              <button 
                onClick={() => setAppliedFilters({ purpose: 'Mortgage', type: 'All', minBudget: '', maxBudget: '', searchQuery: '', showPremium: false })}
                className="text-[#40a28f] text-[10px] font-black uppercase tracking-widest hover:underline underline-offset-8"
              >
                Reset Search Filters
              </button>
            </div>
          </div>
        )}

        {filteredMortgages.length > 0 && (
          <div className="pt-24">
            <Pagination />
          </div>
        )}
      </section>

      <AddRequirementModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchMortgages}
        defaultPurpose="Mortgage"
      />
    </main>
  );
};

export default MortgageView;
