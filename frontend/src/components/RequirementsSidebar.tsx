
import React from 'react';
import { ChevronDown, RotateCcw, Send, ListChecks, Crown } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface RequirementsSidebarProps {
  filters: {
    purpose: string;
    type: string;
    minBudget: string;
    maxBudget: string;
    locality: string;
    showPremium?: boolean;
  };
  onFilterChange: (name: string, value: string) => void;
  onApplyFilters: () => void;
  onReset: () => void;
  activeCount: number;
}

const RequirementsSidebar: React.FC<RequirementsSidebarProps> = ({
  filters,
  onFilterChange,
  onApplyFilters,
  onReset,
  activeCount
}) => {
  const { isPremium, userRole } = useAuth();
  const hasPremiumAccess = isPremium || userRole === 'admin';
  return (
    <div className="space-y-6">
      {/* Filter Card */}
      <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 p-8 space-y-8">
        <div className="flex items-center gap-3 border-b border-gray-50 pb-4">
          <div className="w-10 h-10 bg-[#40a28f]/10 rounded-xl flex items-center justify-center">
            <ListChecks className="h-5 w-5 text-[#40a28f]" />
          </div>
          <h2 className="text-xl font-black text-gray-800 tracking-tight uppercase">Filter {filters.purpose === 'Mortgage' ? 'Mortgages' : 'Requirements'}</h2>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Purpose</label>
            <div className="relative">
              <select
                value={filters.purpose}
                onChange={(e) => onFilterChange('purpose', e.target.value)}
                className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3.5 px-4 appearance-none focus:outline-none focus:ring-4 focus:ring-[#40a28f]/5 focus:border-[#40a28f] text-gray-700 text-sm font-bold transition-all"
              >
                <option value="All">All Purposes</option>
                <option value="Buy">Buy</option>
                <option value="Rent">Rent</option>
                <option value="Mortgage">Mortgage</option>
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300 pointer-events-none" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Property Type</label>
            <div className="relative">
              <select
                value={filters.type}
                onChange={(e) => onFilterChange('type', e.target.value)}
                className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3.5 px-4 appearance-none focus:outline-none focus:ring-4 focus:ring-[#40a28f]/5 focus:border-[#40a28f] text-gray-700 text-sm font-bold transition-all"
              >
                <option value="All">All Categories</option>
                <option value="Residential">Residential</option>
                <option value="Commercial">Commercial</option>
                <option value="Land">Land / Plot</option>
                <option value="Agricultural">Agricultural</option>
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300 pointer-events-none" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Budget Range (₹)</label>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="number"
                placeholder="Min"
                value={filters.minBudget}
                onChange={(e) => onFilterChange('minBudget', e.target.value)}
                className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3.5 px-4 focus:outline-none focus:ring-4 focus:ring-[#40a28f]/5 focus:border-[#40a28f] text-sm font-bold text-gray-700 transition-all placeholder:text-gray-300"
              />
              <input
                type="number"
                placeholder="Max"
                value={filters.maxBudget}
                onChange={(e) => onFilterChange('maxBudget', e.target.value)}
                className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3.5 px-4 focus:outline-none focus:ring-4 focus:ring-[#40a28f]/5 focus:border-[#40a28f] text-sm font-bold text-gray-700 transition-all placeholder:text-gray-300"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Locality / Area</label>
            <input
              type="text"
              placeholder="Search locality..."
              value={filters.locality}
              onChange={(e) => onFilterChange('locality', e.target.value)}
              className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3.5 px-4 focus:outline-none focus:ring-4 focus:ring-[#40a28f]/5 focus:border-[#40a28f] text-sm font-bold text-gray-700 transition-all placeholder:text-gray-300"
            />
          </div>

          {hasPremiumAccess && (
            <div className="pt-2">
              <label className="relative inline-flex items-center cursor-pointer group">
                <input 
                  type="checkbox" 
                  checked={filters.showPremium || false}
                  onChange={(e) => onFilterChange('showPremium', e.target.checked as any)}
                  className="sr-only peer" 
                />
                <div className="w-11 h-6 bg-gray-100 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-200 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#40a28f]"></div>
                <span className="ms-3 text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover:text-[#40a28f] transition-colors flex items-center gap-2">
                  <Crown className={`w-3.5 h-3.5 ${filters.showPremium ? 'text-[#40a28f] fill-current' : 'text-gray-300'}`} />
                  Premium Deals Only
                </span>
              </label>
            </div>
          )}
        </div>

        <div className="pt-2 space-y-4">
          <button
            onClick={onApplyFilters}
            className="w-full bg-[#40a28f] text-white py-4 rounded-xl font-black uppercase tracking-widest text-[11px] shadow-xl shadow-[#40a28f]/20 hover:bg-[#358a7a] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3"
          >
            <Send className="h-4 w-4 rotate-45 mb-1" />
            Update Results
          </button>

          <button
            onClick={onReset}
            className="w-full flex items-center justify-center gap-2 text-gray-400 hover:text-red-500 text-[10px] font-black uppercase tracking-widest transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset Parameters
          </button>
        </div>
      </div>

      {/* Summary Card */}
      <div className="bg-[#40a28f]/5 rounded-[32px] border border-[#40a28f]/10 p-8 space-y-6">
        <h3 className="text-sm font-black text-[#40a28f] uppercase tracking-widest">Active Inventory</h3>
        <div className="space-y-1">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Results Found</p>
          <p className="text-3xl font-black text-gray-800 tracking-tighter">{activeCount}</p>
        </div>
        <p className="text-[10px] font-bold text-gray-400 leading-relaxed uppercase tracking-tight">
          These are verified {filters.purpose === 'Mortgage' ? 'mortgage demands' : 'property requirements'} currently active on the RJG network.
        </p>
      </div>
    </div>
  );
};

export default RequirementsSidebar;
