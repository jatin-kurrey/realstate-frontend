
import React from 'react';
import { ChevronDown, RotateCcw, Send, ListChecks } from 'lucide-react';

interface RequirementsSidebarProps {
  filters: {
    purpose: string;
    type: string;
    minBudget: string;
    maxBudget: string;
    locality: string;
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
  return (
    <div className="space-y-6">
      {/* Filter Card */}
      <div className="bg-white rounded-[24px] shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] border border-gray-100 p-8 space-y-8">
        <h2 className="text-xl font-bold text-[#2d3748] tracking-tight">Filter Requirements</h2>

        <div className="space-y-5">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Purpose</label>
            <div className="relative">
              <select
                value={filters.purpose}
                onChange={(e) => onFilterChange('purpose', e.target.value)}
                className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 px-4 appearance-none focus:outline-none focus:ring-2 focus:ring-[#40a28f]/20 focus:border-[#40a28f] text-gray-400 text-sm font-medium transition-all"
              >
                <option value="All">All Purposes</option>
                <option value="Buy">Buy</option>
                <option value="Rent">Rent</option>
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
                className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 px-4 appearance-none focus:outline-none focus:ring-2 focus:ring-[#40a28f]/20 focus:border-[#40a28f] text-gray-400 text-sm font-medium transition-all"
              >
                <option value="All">All Types</option>
                <option value="Residential">Residential</option>
                <option value="Commercial">Commercial</option>
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300 pointer-events-none" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Budget Range (₹)</label>
            <div className="flex flex-col gap-2">
              <input
                type="number"
                placeholder="Min"
                value={filters.minBudget}
                onChange={(e) => onFilterChange('minBudget', e.target.value)}
                className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#40a28f]/20 focus:border-[#40a28f] text-sm font-medium text-gray-600 transition-all"
              />
              <input
                type="number"
                placeholder="Max"
                value={filters.maxBudget}
                onChange={(e) => onFilterChange('maxBudget', e.target.value)}
                className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#40a28f]/20 focus:border-[#40a28f] text-sm font-medium text-gray-600 transition-all"
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
              className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#40a28f]/20 focus:border-[#40a28f] text-sm font-medium text-gray-600 transition-all"
            />
          </div>
        </div>

        <div className="pt-2 space-y-4">
          <button
            onClick={onApplyFilters}
            className="w-full bg-[#40a28f] text-white py-3.5 rounded-xl font-black uppercase tracking-widest text-[11px] shadow-lg shadow-[#40a28f]/20 hover:shadow-xl hover:shadow-[#40a28f]/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            <Send className="h-3.5 w-3.5 rotate-45 mb-1" />
            Apply Filters
          </button>

          <button
            onClick={onReset}
            className="w-full flex items-center justify-center gap-2 text-gray-400 hover:text-red-500 text-[11px] font-black uppercase tracking-widest transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset
          </button>
        </div>
      </div>

      {/* Summary Card */}
      <div className="bg-white rounded-[24px] shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.4)] border border-gray-100 p-8 space-y-6">
        <h3 className="text-xl font-bold text-[#2d3748] tracking-tight">My Requirements</h3>
        <div className="space-y-1">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">You have</p>
          <p className="text-xl font-black text-[#40a28f]">{activeCount} active requirements</p>
        </div>
        <button className="w-full bg-[#e2f2f0] text-[#40a28f] py-4 rounded-xl font-black uppercase tracking-widest text-[11px] hover:bg-[#d4e9e6] flex items-center justify-center gap-3 transition-all">
          <ListChecks className="h-4 w-4" />
          Manage My Requirements
        </button>
      </div>
    </div>
  );
};

export default RequirementsSidebar;
