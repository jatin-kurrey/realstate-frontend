import React from 'react';
import { Search, RotateCcw, ChevronDown, Crown } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface FilterState {
  searchQuery: string;
  district: string;
  tehsil: string;
  riCircle: string;
  village: string;
  purpose: string;
  type: string;
  minArea: string;
  maxArea: string;
  areaUnit: string;
  showPremium: boolean;
  minBudget?: string;
  maxBudget?: string;
}

interface FilterBarProps {
  onSearch: (filters: FilterState) => void;
  mode?: 'property' | 'requirement' | 'mortgage' | 'auction';
  initialFilters?: Partial<FilterState>;
}

const FilterBar: React.FC<FilterBarProps> = ({ onSearch, mode = 'property', initialFilters }) => {
  const [showAdvanced, setShowAdvanced] = React.useState(false);
  const [filters, setFilters] = React.useState<FilterState>({
    searchQuery: '',
    district: '',
    tehsil: '',
    riCircle: '',
    village: '',
    purpose: mode === 'mortgage' ? 'Mortgage' : 'All',
    type: 'All',
    minArea: '',
    maxArea: '',
    areaUnit: 'sqft',
    showPremium: false,
    minBudget: '',
    maxBudget: '',
    ...initialFilters
  });

  React.useEffect(() => {
    onSearch(filters);
  }, []);

  const { isPremium, userRole } = useAuth();
  const hasPremiumAccess = isPremium || userRole === 'admin';
  const [locations, setLocations] = React.useState<any[]>([]);

  React.useEffect(() => {
    const fetchLocations = async () => {
      try {
        const { locationService } = await import('@/services/api');
        const data = await locationService.getAll();
        setLocations(data);
      } catch (err) {
        console.error('Failed to fetch locations:', err);
      }
    };
    fetchLocations();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as any;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    const newFilters = { ...filters, [name]: val };
    setFilters(newFilters);

    // Immediate update for the premium toggle to improve UX
    if (name === 'showPremium') {
      onSearch(newFilters);
    }
  };

  const handleSearch = () => {
    onSearch(filters);
  };

  const handleReset = () => {
    const defaultFilters = {
      searchQuery: '',
      district: '',
      tehsil: '',
      riCircle: '',
      village: '',
      purpose: mode === 'mortgage' ? 'Mortgage' : 'All',
      type: 'All',
      minArea: '',
      maxArea: '',
      areaUnit: 'sqft',
      showPremium: false,
      minBudget: '',
      maxBudget: '',
    };
    setFilters(defaultFilters);
    onSearch(defaultFilters);
  };

  const getPurposeOptions = () => {
    if (mode === 'requirement') return ['All', 'Buy', 'Rent'];
    if (mode === 'mortgage') return ['Mortgage'];
    if (mode === 'auction') return ['Bank Auction'];
    return ['All', 'Sale', 'Rent'];
  };

  return (
    <div className="max-w-7xl mx-auto px-4 -mt-12 relative z-10 w-full">
      <div className="bg-white rounded-[32px] shadow-2xl shadow-gray-200/50 border border-gray-100 p-6 md:p-10 space-y-6">
        {/* Main Search Row */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative w-full">
            <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              name="searchQuery"
              value={filters.searchQuery}
              onChange={handleChange}
              placeholder={mode === 'requirement' ? "Search seeker name or locality..." : "Search by area, landmark, or title..."}
              className="w-full pl-14 pr-4 py-4 md:py-5 bg-gray-50/50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#40a28f]/5 transition-all text-gray-700 font-medium placeholder:text-gray-400"
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className={`w-full sm:flex-1 md:w-auto px-6 md:px-8 py-4 md:py-5 rounded-2xl font-black uppercase tracking-widest text-[10px] md:text-xs transition-all border-2 ${showAdvanced ? 'bg-gray-100 border-gray-200 text-gray-700' : 'bg-white border-gray-100 text-gray-500 hover:border-[#40a28f]/30 hover:text-[#40a28f]'}`}
            >
              Advanced Search
            </button>
            <button
              onClick={handleSearch}
              className="w-full sm:flex-1 md:w-auto bg-[#40a28f] text-white px-8 md:px-10 py-4 md:py-5 rounded-2xl font-black uppercase tracking-widest text-[10px] md:text-xs hover:bg-[#358a7a] flex items-center justify-center gap-3 shadow-xl shadow-[#40a28f]/20 transition-all active:scale-[0.98]"
            >
              <Search className="h-4 w-4" />
              Search
            </button>
          </div>
        </div>

        {/* Premium Toggle & Quick Filters */}
        <div className="flex flex-wrap items-center gap-4 pt-2">
          <label className="relative inline-flex items-center group cursor-pointer">
            <input 
              type="checkbox" 
              name="showPremium"
              checked={filters.showPremium}
              onChange={handleChange}
              className="sr-only peer" 
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
            <span className={`ms-3 text-[10px] font-black uppercase tracking-widest ${filters.showPremium ? 'text-emerald-600' : 'text-gray-500'} transition-colors flex items-center gap-2`}>
              Premium Only
              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-600 rounded-full text-[8px] font-black tracking-tighter ml-1">NEW</span>
            </span>
          </label>
          
          <div className="h-4 w-[1px] bg-gray-200 hidden md:block"></div>
          
          <div className="flex gap-2">
            {(mode === 'requirement' || mode === 'mortgage' ? ['Residential', 'Commercial', 'Plots'] : ['Residential', 'Commercial', 'Plots']).map((t) => (
              <button
                key={t}
                onClick={() => setFilters(prev => ({ ...prev, type: prev.type === t ? 'All' : t }))}
                className={`px-3 md:px-4 py-2 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all ${
                  filters.type === t 
                    ? 'bg-emerald-50 text-emerald-600 border border-emerald-100 shadow-sm' 
                    : 'bg-gray-50 text-gray-400 border border-transparent hover:bg-gray-100'
                }`}
              >
                {t}
              </button>
            ))}
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
                  {locations.filter(l => l.type === 'district').map(l => (
                    <option key={l.id} value={l.name}>{l.name}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div className="space-y-2.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Tehsil</label>
              <div className="relative">
                <select
                  name="tehsil"
                  value={filters.tehsil}
                  onChange={handleChange}
                  disabled={!filters.district}
                  className="w-full bg-white border border-gray-200 rounded-xl py-3.5 px-4 appearance-none focus:outline-none focus:ring-4 focus:ring-[#40a28f]/5 text-gray-700 font-bold text-sm disabled:opacity-50"
                >
                  <option value="">Select Tehsil</option>
                  {locations.filter(l => l.type === 'tehsil' && 
                    l.parent_id === locations.find(p => p.name === filters.district)?.id
                  ).map(l => (
                    <option key={l.id} value={l.name}>{l.name}</option>
                  ))}
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
                  disabled={!filters.tehsil}
                  className="w-full bg-white border border-gray-200 rounded-xl py-3.5 px-4 appearance-none focus:outline-none focus:ring-4 focus:ring-[#40a28f]/5 text-gray-700 font-bold text-sm disabled:opacity-50"
                >
                  <option value="">Select RI</option>
                  {locations.filter(l => l.type === 'ri_circle' && 
                    l.parent_id === locations.find(p => p.name === filters.tehsil)?.id
                  ).map(l => (
                    <option key={l.id} value={l.name}>{l.name}</option>
                  ))}
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
                  disabled={!filters.riCircle}
                  className="w-full bg-white border border-gray-200 rounded-xl py-3.5 px-4 appearance-none focus:outline-none focus:ring-4 focus:ring-[#40a28f]/5 text-gray-700 font-bold text-sm disabled:opacity-50"
                >
                  <option value="">Select Village</option>
                  {locations.filter(l => l.type === 'village' && 
                    l.parent_id === locations.find(p => p.name === filters.riCircle)?.id
                  ).map(l => (
                    <option key={l.id} value={l.name}>{l.name}</option>
                  ))}
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
                {getPurposeOptions().map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          <div className="space-y-2.5 lg:col-span-4">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
              {mode === 'requirement' || mode === 'mortgage' ? 'Budget Range (₹)' : 'Price Range (₹)'}
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                name={mode === 'requirement' || mode === 'mortgage' ? "minBudget" : "minBudget"} 
                value={filters.minBudget}
                onChange={handleChange}
                placeholder="Min"
                className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3.5 px-5 focus:outline-none focus:ring-4 focus:ring-[#40a28f]/5 text-sm font-bold placeholder:text-gray-300"
              />
              <span className="text-gray-300 font-bold">–</span>
              <input
                type="number"
                name={mode === 'requirement' || mode === 'mortgage' ? "maxBudget" : "maxBudget"}
                value={filters.maxBudget}
                onChange={handleChange}
                placeholder="Max"
                className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3.5 px-5 focus:outline-none focus:ring-4 focus:ring-[#40a28f]/5 text-sm font-bold placeholder:text-gray-300"
              />
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
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3.5 px-4 appearance-none focus:outline-none focus:ring-4 focus:ring-[#40a28f]/5 text-gray-700 font-bold text-sm shadow-sm"
                >
                  <option value="sqft">Sq.ft</option>
                  <option value="acre">Acres</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>
          
          <button onClick={handleReset} className="lg:absolute lg:top-4 lg:right-4 p-2 text-gray-300 hover:text-red-400 transition-colors" title="Reset Filters">
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterBar;
