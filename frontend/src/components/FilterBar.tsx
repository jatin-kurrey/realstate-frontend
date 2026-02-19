
import React from 'react';
import { Search, RotateCcw, ChevronDown } from 'lucide-react';

interface FilterState {
  searchQuery: string;
  district: string;
  tehesil: string;
  riCircle: string;
  village: string;
  purpose: string;
  type: string;
  minArea: string;
  maxArea: string;
  areaUnit: string;
}

interface FilterBarProps {
  onSearch: (filters: FilterState) => void;
}

const FilterBar: React.FC<FilterBarProps> = ({ onSearch }) => {
  const [showAdvanced, setShowAdvanced] = React.useState(false);
  const [filters, setFilters] = React.useState<FilterState>({
    searchQuery: '',
    district: '',
    tehesil: '',
    riCircle: '',
    village: '',
    purpose: 'All',
    type: 'All',
    minArea: '',
    maxArea: '',
    areaUnit: 'sqft'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSearch = () => {
    onSearch(filters);
  };

  const handleReset = () => {
    const defaultFilters = {
      searchQuery: '',
      district: '',
      tehesil: '',
      riCircle: '',
      village: '',
      purpose: 'All',
      type: 'All',
      minArea: '',
      maxArea: '',
      areaUnit: 'sqft'
    };
    setFilters(defaultFilters);
    onSearch(defaultFilters);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 -mt-12 relative z-10">
      <div className="bg-white rounded-[32px] shadow-2xl shadow-gray-200/50 border border-gray-100 p-8 md:p-10 space-y-6">
        {/* Main Search Row */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              name="searchQuery"
              value={filters.searchQuery}
              onChange={handleChange}
              placeholder="Search by area, landmark, or title..."
              className="w-full pl-14 pr-4 py-5 bg-gray-50/50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#40a28f]/5 transition-all text-gray-700 font-medium placeholder:text-gray-400"
            />
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className={`px-8 py-5 rounded-2xl font-black uppercase tracking-widest text-xs transition-all border-2 ${showAdvanced ? 'bg-gray-100 border-gray-200 text-gray-700' : 'bg-white border-gray-100 text-gray-500 hover:border-[#40a28f]/30 hover:text-[#40a28f]'}`}
            >
              Advanced Search
            </button>
            <button
              onClick={handleSearch}
              className="bg-[#40a28f] text-white px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-[#358a7a] flex items-center justify-center gap-3 shadow-xl shadow-[#40a28f]/20 transition-all active:scale-[0.98]"
            >
              <Search className="h-4 w-4" />
              Search
            </button>
          </div>
        </div>

        {/* Administrative Filters (Advanced) */}
        {showAdvanced && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 p-6 bg-gray-50/50 rounded-2xl border border-gray-100 animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="space-y-2.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">District</label>
              <div className="relative">
                <select
                  name="district"
                  value={filters.district}
                  onChange={handleChange}
                  className="w-full bg-white border border-gray-200 rounded-xl py-3.5 px-4 appearance-none focus:outline-none focus:ring-4 focus:ring-[#40a28f]/5 text-gray-700 font-bold text-sm"
                >
                  <option value="">Select District</option>
                  <option value="Rajnandgaon">Rajnandgaon</option>
                  {/* Dynamic Options should be loaded here */}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div className="space-y-2.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Tehesil</label>
              <div className="relative">
                <select
                  name="tehesil"
                  value={filters.tehesil}
                  onChange={handleChange}
                  className="w-full bg-white border border-gray-200 rounded-xl py-3.5 px-4 appearance-none focus:outline-none focus:ring-4 focus:ring-[#40a28f]/5 text-gray-700 font-bold text-sm"
                >
                  <option value="">Select Tehesil</option>
                  <option value="Rajnandgaon">Rajnandgaon</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div className="space-y-2.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">RI Circle</label>
              <div className="relative">
                <select
                  name="riCircle"
                  value={filters.riCircle}
                  onChange={handleChange}
                  className="w-full bg-white border border-gray-200 rounded-xl py-3.5 px-4 appearance-none focus:outline-none focus:ring-4 focus:ring-[#40a28f]/5 text-gray-700 font-bold text-sm"
                >
                  <option value="">Select RI</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div className="space-y-2.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Village</label>
              <div className="relative">
                <select
                  name="village"
                  value={filters.village}
                  onChange={handleChange}
                  className="w-full bg-white border border-gray-200 rounded-xl py-3.5 px-4 appearance-none focus:outline-none focus:ring-4 focus:ring-[#40a28f]/5 text-gray-700 font-bold text-sm"
                >
                  <option value="">Select Village</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>
        )}

        {/* Specific Filters Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-6 items-end">
          <div className="space-y-2.5 lg:col-span-3">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Purpose</label>
            <div className="relative">
              <select
                name="purpose"
                value={filters.purpose}
                onChange={handleChange}
                className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3.5 px-4 appearance-none focus:outline-none focus:ring-4 focus:ring-[#40a28f]/5 text-gray-700 font-bold text-sm"
              >
                <option value="All">All</option>
                <option value="Sale">Sale</option>
                <option value="Rent">Rent</option>
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          <div className="space-y-2.5 lg:col-span-3">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Type</label>
            <div className="relative">
              <select
                name="type"
                value={filters.type}
                onChange={handleChange}
                className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3.5 px-4 appearance-none focus:outline-none focus:ring-4 focus:ring-[#40a28f]/5 text-gray-700 font-bold text-sm"
              >
                <option value="All">All</option>
                <option value="Residential Building">Residential Building</option>
                <option value="Commercial Building">Commercial Building</option>
                <option value="Plot">Plot</option>
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          <div className="space-y-2.5 lg:col-span-5">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Area Range</label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                name="minArea"
                value={filters.minArea}
                onChange={handleChange}
                placeholder="Min"
                className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3.5 px-5 focus:outline-none focus:ring-4 focus:ring-[#40a28f]/5 text-sm font-bold placeholder:text-gray-300"
              />
              <span className="text-gray-300 font-bold">–</span>
              <input
                type="number"
                name="maxArea"
                value={filters.maxArea}
                onChange={handleChange}
                placeholder="Max"
                className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3.5 px-5 focus:outline-none focus:ring-4 focus:ring-[#40a28f]/5 text-sm font-bold placeholder:text-gray-300"
              />
              <div className="relative min-w-[100px]">
                <select
                  name="areaUnit"
                  value={filters.areaUnit}
                  onChange={handleChange}
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3.5 px-4 appearance-none focus:outline-none focus:ring-4 focus:ring-[#40a28f]/5 text-gray-700 font-bold text-sm"
                >
                  <option value="sqft">Sq.ft</option>
                  <option value="acre">Acres</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>

          <div className="space-y-2.5 lg:col-span-1">
            <button
              onClick={handleReset}
              className="w-full flex items-center justify-center gap-2 text-gray-400 hover:text-[#40a28f] font-black uppercase tracking-widest text-[10px] transition-colors py-4"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterBar;
