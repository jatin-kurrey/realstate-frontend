
import React from 'react';
import { Search, RotateCcw, ChevronDown } from 'lucide-react';

const FilterBar: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 -mt-12 relative z-10">
      <div className="bg-white rounded-[32px] shadow-2xl shadow-gray-200/50 border border-gray-100 p-8 md:p-10 space-y-8">
        {/* Main Search Row */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by area, landmark, or title..."
              className="w-full pl-14 pr-4 py-5 bg-gray-50/50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#40a28f]/5 transition-all text-gray-700 font-medium placeholder:text-gray-400"
            />
          </div>
          <button className="bg-[#40a28f] text-white px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-[#358a7a] flex items-center justify-center gap-3 shadow-xl shadow-[#40a28f]/20 transition-all active:scale-[0.98]">
            <Search className="h-4 w-4" />
            Search
          </button>
        </div>

        {/* Specific Filters Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-6 items-end">
          <div className="space-y-2.5">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Purpose</label>
            <div className="relative">
              <select className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3.5 px-4 appearance-none focus:outline-none focus:ring-4 focus:ring-[#40a28f]/5 text-gray-700 font-bold text-sm">
                <option>All</option>
                <option>Sale</option>
                <option>Rent</option>
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          <div className="space-y-2.5">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Type</label>
            <div className="relative">
              <select className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3.5 px-4 appearance-none focus:outline-none focus:ring-4 focus:ring-[#40a28f]/5 text-gray-700 font-bold text-sm">
                <option>All</option>
                <option>Residential</option>
                <option>Commercial</option>
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          <div className="space-y-2.5 lg:col-span-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Price Range</label>
            <div className="flex items-center gap-3">
              <input type="text" placeholder="Min ₹" className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3.5 px-5 focus:outline-none focus:ring-4 focus:ring-[#40a28f]/5 text-sm font-bold placeholder:text-gray-300" />
              <span className="text-gray-300 font-bold">–</span>
              <input type="text" placeholder="Max ₹" className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3.5 px-5 focus:outline-none focus:ring-4 focus:ring-[#40a28f]/5 text-sm font-bold placeholder:text-gray-300" />
            </div>
          </div>

          <div className="space-y-2.5">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Area/Locality</label>
            <input type="text" placeholder="e.g. Civil Lines" className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3.5 px-5 focus:outline-none focus:ring-4 focus:ring-[#40a28f]/5 text-sm font-bold placeholder:text-gray-300" />
          </div>

          <div className="space-y-2.5">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Sort By</label>
            <div className="relative">
              <select className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3.5 px-4 appearance-none focus:outline-none focus:ring-4 focus:ring-[#40a28f]/5 text-gray-700 font-bold text-sm">
                <option>Choose an option...</option>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
                <option>Newest First</option>
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Reset */}
        <div className="pt-2">
          <button className="flex items-center gap-2 text-gray-400 hover:text-[#40a28f] font-black uppercase tracking-widest text-[10px] transition-colors">
            <RotateCcw className="h-3.5 w-3.5" />
            Reset
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterBar;
