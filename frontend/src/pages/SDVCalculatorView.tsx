import React, { useState, useMemo } from 'react';
import {
  Calculator, Info, ShieldCheck, MapPin, Building2, Ruler,
  Percent, Download, Lock, ChevronDown, AlertTriangle, IndianRupee,
  Home, Landmark, FileText, TrendingUp
} from 'lucide-react';
import { useSiteConfig } from '@/contexts/SiteConfigContext';

// ─── CG 2025-26 GUIDELINE RATES (₹ per Sq Ft) ───────────────────────────────
// Source: Chhattisgarh IGRS, approximate rates for Rajnandgaon district
// Revised post Dec-2025 amendments
const GUIDELINE_RATES: Record<string, Record<string, number>> = {
  nagar_nigam: {     // Municipal Corporation (Rajnandgaon city)
    residential: 900,
    commercial: 1600,
    agricultural: 180,
    industrial: 1200,
  },
  nagar_palika: {    // Municipality (medium towns)
    residential: 550,
    commercial: 950,
    agricultural: 120,
    industrial: 700,
  },
  nagar_panchayat: { // Small towns
    residential: 320,
    commercial: 560,
    agricultural: 80,
    industrial: 420,
  },
  gram_panchayat: {  // Rural / Village
    residential: 150,
    commercial: 280,
    agricultural: 45,
    industrial: 200,
  },
};

// Road type multipliers
const ROAD_MULTIPLIERS: Record<string, number> = {
  nh_sh: 1.30,      // National / State Highway
  main_road: 1.15,  // Main road > 12m
  other_road: 1.00, // Internal road < 12m
};

// Structure rates per Sq Ft (CG construction cost schedule)
const STRUCTURE_RATES: Record<string, number> = {
  rcc_double: 3200,   // RCC double-storey pukka
  rcc_single: 2500,   // RCC single-storey pukka
  semi_pukka: 1400,   // Semi-pukka / mixed
  tin_shed: 900,      // Tin shed / industrial
  kutcha: 500,        // Kutcha / temporary
};

// Unit conversion to Sq Ft
function toSqFt(value: number, unit: string): number {
  switch (unit) {
    case 'sqft': return value;
    case 'sqm': return value * 10.7639;
    case 'hectare': return value * 107639;
    case 'acre': return value * 43560;
    case 'dismil': return value * 435.6;
    default: return value;
  }
}

// ─── STAMP DUTY RATES ────────────────────────────────────────────────────────
// CG 2025 confirmed rates
const STAMP_DUTY: Record<string, number> = {
  male: 0.05,         // 5%
  female: 0.04,       // 4% (1% concession)
  joint: 0.04,        // 4% (at least one woman)
  sc_st: 0.02,        // 2% for SC/ST agricultural
  family: 0.02,       // 2% family transfer
};
const REGISTRATION_FEE_RATE = 0.04; // 4% (confirmed 2025)

const SDVCalculatorView: React.FC = () => {
  const { config } = useSiteConfig();

  // Page-level guard
  if (config['enable_sdv'] === 'false') {
    return (
      <main className="min-h-screen bg-[#f8fbfa] flex items-center justify-center px-4">
        <div className="text-center space-y-6 max-w-md">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
            <Lock className="w-9 h-9 text-gray-400" />
          </div>
          <h1 className="text-3xl font-black text-gray-800 uppercase tracking-tight">SDV Calculator</h1>
          <p className="text-sm font-medium text-gray-400 leading-relaxed">
            This feature is currently disabled by the administrator.<br />Please check back later.
          </p>
          <span className="inline-block bg-amber-50 border border-amber-100 text-amber-600 text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full">
            Temporarily Unavailable
          </span>
        </div>
      </main>
    );
  }

  // ── State ──────────────────────────────────────────────────────────────────
  const [areaValue, setAreaValue] = useState('');
  const [areaUnit, setAreaUnit] = useState('sqft');
  const [zone, setZone] = useState('nagar_nigam');
  const [landUse, setLandUse] = useState('residential');
  const [roadType, setRoadType] = useState('other_road');
  const [isCorner, setIsCorner] = useState(false);
  const [buyerType, setBuyerType] = useState('male');
  const [salePrice, setSalePrice] = useState('');

  // Structure
  const [hasStructure, setHasStructure] = useState(false);
  const [structureType, setStructureType] = useState('rcc_single');
  const [structureAreaValue, setStructureAreaValue] = useState('');
  const [structureAge, setStructureAge] = useState(0);

  // ── Calculation ────────────────────────────────────────────────────────────
  const calc = useMemo(() => {
    const areaSqFt = toSqFt(parseFloat(areaValue) || 0, areaUnit);
    if (areaSqFt <= 0) return null;

    // 1. Land Guideline Value
    const baseRate = GUIDELINE_RATES[zone]?.[landUse] ?? 0;
    const roadMult = ROAD_MULTIPLIERS[roadType] ?? 1;
    const cornerBonus = isCorner ? 1.10 : 1.00;
    const landSDV = areaSqFt * baseRate * roadMult * cornerBonus;

    // 2. Structure Value (if any)
    let structureValue = 0;
    if (hasStructure) {
      const builtSqFt = toSqFt(parseFloat(structureAreaValue) || 0, 'sqft');
      const ratePerSqFt = STRUCTURE_RATES[structureType] ?? 0;
      const rawStructure = builtSqFt * ratePerSqFt;
      const depreciationRate = Math.min(structureAge * 0.01, 0.50); // max 50%
      structureValue = rawStructure * (1 - depreciationRate);
    }

    // 3. Total Guideline Value (SDV)
    const totalSDV = landSDV + structureValue;

    // 4. Taxable value = higher of Sale Price or SDV
    const salePriceNum = parseFloat(salePrice) || 0;
    const taxableValue = Math.max(totalSDV, salePriceNum);

    // 5. Stamp Duty
    const stampDutyRate = STAMP_DUTY[buyerType] ?? 0.05;
    const stampDuty = taxableValue * stampDutyRate;

    // 6. Registration Fee (4% — confirmed CG 2025)
    const registrationFee = taxableValue * REGISTRATION_FEE_RATE;

    // 7. Total transaction cost
    const totalCost = taxableValue + stampDuty + registrationFee;

    // 8. Loan eligibility (75% of SDV standard LAP)
    const loanEligibility = totalSDV * 0.75;

    return {
      areaSqFt,
      baseRate,
      landSDV,
      structureValue,
      totalSDV,
      salePriceNum,
      taxableValue,
      stampDutyRate,
      stampDuty,
      registrationFee,
      totalCost,
      loanEligibility,
      ratePerSqFt: Math.round(landSDV / areaSqFt),
    };
  }, [areaValue, areaUnit, zone, landUse, roadType, isCorner, buyerType, salePrice, hasStructure, structureType, structureAreaValue, structureAge]);

  const fmt = (n: number) => `₹${Math.round(n).toLocaleString('en-IN')}`;
  const fmtCr = (n: number) => {
    if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)} Cr`;
    if (n >= 100000) return `₹${(n / 100000).toFixed(2)} L`;
    return fmt(n);
  };

  const inputCls = "w-full bg-gray-50/80 border border-gray-100 rounded-2xl py-3.5 px-5 focus:outline-none focus:ring-4 focus:ring-[#40a28f]/10 focus:border-[#40a28f] transition-all text-sm font-bold text-gray-700 placeholder:font-medium placeholder:text-gray-300";
  const selectCls = `${inputCls} appearance-none cursor-pointer pr-10`;
  const labelCls = "text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1 mb-1.5";

  return (
    <main className="min-h-screen bg-[#f8fbfa] pb-24">
      {/* Hero */}
      <div className="bg-gradient-to-br from-[#40a28f] to-[#2d7a69] pt-28 pb-40 px-4 text-center text-white relative overflow-hidden">
        <div className="max-w-4xl mx-auto space-y-5 relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/15 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-[0.2em]">
            <ShieldCheck className="w-3 h-3" /> CG IGRS 2025-26 Compliant
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter leading-none uppercase">
            SDV & Stamp Duty<br />
            <span className="text-white/30 italic">Calculator</span>
          </h1>
          <p className="text-base text-white/75 font-medium max-w-xl mx-auto">
            Accurate Stamp Duty Valuation for Chhattisgarh properties based on official Collector Guideline Rates 2025-26.
          </p>
        </div>
        <div className="absolute -bottom-32 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-white/5 rounded-full blur-3xl" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-2xl" />
      </div>

      {/* Main Content */}
      <section className="max-w-6xl mx-auto px-4 -mt-28 relative z-10 space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* ── FORM ── */}
          <div className="lg:col-span-7 space-y-6">

            {/* Section 1: Land Details */}
            <div className="bg-white rounded-[32px] p-8 shadow-xl shadow-gray-200/40 border border-gray-50">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-50">
                <div className="p-2 bg-[#e2f2f0] rounded-xl"><MapPin className="w-4 h-4 text-[#40a28f]" /></div>
                <h2 className="text-xs font-black uppercase tracking-[0.25em] text-gray-900">Land Details</h2>
              </div>

              <div className="space-y-5">
                {/* Area */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Area</label>
                    <input
                      type="number" placeholder="e.g. 1500" value={areaValue}
                      onChange={e => setAreaValue(e.target.value)}
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Unit</label>
                    <div className="relative">
                      <select value={areaUnit} onChange={e => setAreaUnit(e.target.value)} className={selectCls}>
                        <option value="sqft">Sq Ft (वर्ग फीट)</option>
                        <option value="sqm">Sq Meter (वर्ग मीटर)</option>
                        <option value="hectare">Hectare (हेक्टेयर)</option>
                        <option value="acre">Acre (एकड़)</option>
                        <option value="dismil">Dismil (डिसमिल)</option>
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* Zone */}
                <div>
                  <label className={labelCls}>Zone / Location Type</label>
                  <div className="relative">
                    <select value={zone} onChange={e => setZone(e.target.value)} className={selectCls}>
                      <option value="nagar_nigam">Nagar Nigam (नगर निगम) — Municipal Corporation</option>
                      <option value="nagar_palika">Nagar Palika (नगर पालिका) — Municipality</option>
                      <option value="nagar_panchayat">Nagar Panchayat (नगर पंचायत) — Town</option>
                      <option value="gram_panchayat">Gram Panchayat (ग्राम पंचायत) — Village/Rural</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                {/* Land Use + Road Type */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Land Use / भूमि उपयोग</label>
                    <div className="relative">
                      <select value={landUse} onChange={e => setLandUse(e.target.value)} className={selectCls}>
                        <option value="residential">Residential (आवासीय)</option>
                        <option value="commercial">Commercial (व्यावसायिक)</option>
                        <option value="agricultural">Agricultural (कृषि)</option>
                        <option value="industrial">Industrial (औद्योगिक)</option>
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                  <div>
                    <label className={labelCls}>Road Frontage / सड़क</label>
                    <div className="relative">
                      <select value={roadType} onChange={e => setRoadType(e.target.value)} className={selectCls}>
                        <option value="nh_sh">NH / State Highway (+30%)</option>
                        <option value="main_road">Main Road &gt;12m (+15%)</option>
                        <option value="other_road">Internal Road (&lt;12m)</option>
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* Corner Plot */}
                <button
                  onClick={() => setIsCorner(!isCorner)}
                  className={`w-full py-3.5 px-5 rounded-2xl border-2 flex items-center gap-3 font-bold text-sm transition-all ${isCorner ? 'bg-[#40a28f]/10 border-[#40a28f] text-[#40a28f]' : 'border-gray-100 text-gray-400 hover:border-gray-200'}`}
                >
                  <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${isCorner ? 'bg-[#40a28f] border-[#40a28f]' : 'border-gray-200'}`}>
                    {isCorner && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                  </div>
                  <span>Corner Plot (कोना प्लॉट) — +10% Premium</span>
                </button>
              </div>
            </div>

            {/* Section 2: Structure (optional) */}
            <div className="bg-white rounded-[32px] p-8 shadow-xl shadow-gray-200/40 border border-gray-50">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#e2f2f0] rounded-xl"><Building2 className="w-4 h-4 text-[#40a28f]" /></div>
                  <h2 className="text-xs font-black uppercase tracking-[0.25em] text-gray-900">Built-up Structure (Optional)</h2>
                </div>
                <button
                  onClick={() => setHasStructure(!hasStructure)}
                  className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${hasStructure ? 'bg-[#40a28f] text-white' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}
                >
                  {hasStructure ? 'Included' : '+ Add Structure'}
                </button>
              </div>

              {hasStructure && (
                <div className="space-y-5 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>Construction Type</label>
                      <div className="relative">
                        <select value={structureType} onChange={e => setStructureType(e.target.value)} className={selectCls}>
                          <option value="rcc_double">RCC Double-Storey Pukka (₹3,200/sqft)</option>
                          <option value="rcc_single">RCC Single-Storey Pukka (₹2,500/sqft)</option>
                          <option value="semi_pukka">Semi-Pukka Mixed (₹1,400/sqft)</option>
                          <option value="tin_shed">Tin Shed / Industrial (₹900/sqft)</option>
                          <option value="kutcha">Kutcha / Temporary (₹500/sqft)</option>
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                      </div>
                    </div>
                    <div>
                      <label className={labelCls}>Built-up Area (Sq Ft)</label>
                      <input
                        type="number" placeholder="e.g. 1200" value={structureAreaValue}
                        onChange={e => setStructureAreaValue(e.target.value)}
                        className={inputCls}
                      />
                    </div>
                  </div>
                  <div>
                    <label className={labelCls}>Age of Structure: <span className="text-[#40a28f]">{structureAge} Years</span> (Depreciation: {Math.min(structureAge, 50)}%)</label>
                    <input
                      type="range" min={0} max={50} value={structureAge}
                      onChange={e => setStructureAge(Number(e.target.value))}
                      className="w-full accent-[#40a28f] h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-[9px] font-black text-gray-300 uppercase mt-1">
                      <span>New (0%)</span><span>25 Yrs (25%)</span><span>50+ Yrs (50%)</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Section 3: Transaction Details */}
            <div className="bg-white rounded-[32px] p-8 shadow-xl shadow-gray-200/40 border border-gray-50">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-50">
                <div className="p-2 bg-[#e2f2f0] rounded-xl"><FileText className="w-4 h-4 text-[#40a28f]" /></div>
                <h2 className="text-xs font-black uppercase tracking-[0.25em] text-gray-900">Transaction Details</h2>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Buyer Category / क्रेता वर्ग</label>
                  <div className="relative">
                    <select value={buyerType} onChange={e => setBuyerType(e.target.value)} className={selectCls}>
                      <option value="male">Male (पुरुष) — Stamp Duty 5%</option>
                      <option value="female">Female (महिला) — Stamp Duty 4%</option>
                      <option value="joint">Joint (Man+Woman) — 4%</option>
                      <option value="sc_st">SC/ST (Agricultural) — 2%</option>
                      <option value="family">Family Transfer — 2%</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Actual Sale Price (₹) — Optional</label>
                  <input
                    type="number" placeholder="Market sale price" value={salePrice}
                    onChange={e => setSalePrice(e.target.value)}
                    className={inputCls}
                  />
                  <p className="text-[9px] text-gray-300 font-bold uppercase tracking-wider mt-1 ml-1">Stamp duty charged on higher of sale price or SDV</p>
                </div>
              </div>
            </div>
          </div>

          {/* ── RESULTS PANEL ── */}
          <div className="lg:col-span-5 space-y-5 lg:sticky lg:top-28">
            {!calc ? (
              <div className="bg-gray-900 rounded-[32px] p-10 text-center text-white/30 space-y-4">
                <Calculator className="w-12 h-12 mx-auto opacity-20" />
                <p className="text-xs font-black uppercase tracking-widest">Enter area to calculate</p>
              </div>
            ) : (
              <>
                {/* SDV Summary */}
                <div className="bg-gray-900 rounded-[32px] p-8 text-white relative overflow-hidden shadow-2xl">
                  <div className="relative z-10 space-y-6">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mb-1">Total Stamp Duty Value (SDV)</p>
                      <div className="text-4xl md:text-5xl font-black tracking-tighter text-white">
                        {fmtCr(calc.totalSDV)}
                      </div>
                      <p className="text-[10px] text-[#40a28f] font-black uppercase tracking-widest mt-1">
                        ₹{Math.round(calc.ratePerSqFt).toLocaleString('en-IN')}/Sq Ft (Guideline Rate)
                      </p>
                    </div>

                    <div className="space-y-3 border-t border-white/5 pt-5">
                      {[
                        { label: 'Land SDV', value: fmtCr(calc.landSDV), sub: `${Math.round(calc.areaSqFt).toLocaleString()} Sq Ft × ₹${calc.baseRate}` },
                        ...(calc.structureValue > 0 ? [{ label: 'Structure Value', value: fmtCr(calc.structureValue), sub: 'After depreciation' }] : []),
                        { label: 'Taxable Value', value: fmtCr(calc.taxableValue), sub: calc.salePriceNum > calc.totalSDV ? 'Sale price > SDV' : 'SDV used as base' },
                      ].map((row, i) => (
                        <div key={i} className="flex items-center justify-between py-2 border-b border-white/5">
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-wider text-white/50">{row.label}</p>
                            <p className="text-[9px] text-white/25 font-medium">{row.sub}</p>
                          </div>
                          <span className="text-sm font-black">{row.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#40a28f] blur-3xl opacity-15 -mr-16 -mt-16" />
                </div>

                {/* Duty Breakdown */}
                <div className="bg-white rounded-[32px] p-6 shadow-xl shadow-gray-200/30 border border-gray-50 space-y-4">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-gray-400 mb-4">Registration Cost Breakdown</h3>
                  {[
                    {
                      icon: <Percent className="w-4 h-4 text-orange-500" />,
                      label: `Stamp Duty (${(calc.stampDutyRate * 100).toFixed(0)}%)`,
                      value: fmtCr(calc.stampDuty),
                      color: 'bg-orange-50',
                    },
                    {
                      icon: <Landmark className="w-4 h-4 text-blue-500" />,
                      label: 'Registration Fee (4%)',
                      value: fmtCr(calc.registrationFee),
                      color: 'bg-blue-50',
                    },
                    {
                      icon: <IndianRupee className="w-4 h-4 text-[#40a28f]" />,
                      label: 'Total Transaction Cost',
                      value: fmtCr(calc.totalCost),
                      color: 'bg-[#e2f2f0]',
                      highlight: true,
                    },
                  ].map((row, i) => (
                    <div key={i} className={`flex items-center justify-between p-4 rounded-2xl ${row.color} ${row.highlight ? 'ring-1 ring-[#40a28f]/20' : ''}`}>
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-white rounded-xl shadow-sm">{row.icon}</div>
                        <span className={`text-xs font-black uppercase tracking-wide ${row.highlight ? 'text-[#40a28f]' : 'text-gray-600'}`}>{row.label}</span>
                      </div>
                      <span className={`text-sm font-black ${row.highlight ? 'text-[#40a28f]' : 'text-gray-800'}`}>{row.value}</span>
                    </div>
                  ))}
                </div>

                {/* Loan Eligibility */}
                <div className="bg-gradient-to-br from-[#40a28f] to-[#2d7a69] rounded-[32px] p-6 text-white shadow-xl shadow-[#40a28f]/30">
                  <div className="flex items-center gap-3 mb-4">
                    <TrendingUp className="w-5 h-5 text-white/70" />
                    <h3 className="text-[10px] font-black uppercase tracking-[0.25em]">Max Loan Eligibility (LAP – 75% of SDV)</h3>
                  </div>
                  <div className="text-3xl font-black tracking-tighter">{fmtCr(calc.loanEligibility)}</div>
                  <p className="text-[9px] text-white/50 font-bold uppercase tracking-wider mt-1">Loan Against Property — Standard bank LTV ratio</p>
                </div>

                {/* Disclaimer */}
                <div className="bg-amber-50 border border-amber-100 rounded-[24px] p-5 flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[10px] font-black text-amber-800 uppercase tracking-wider mb-1">Disclaimer</p>
                    <p className="text-[10px] text-amber-700/70 font-medium leading-relaxed">
                      Rates are based on CG Collector Guideline 2025-26 approximations for Rajnandgaon district.
                      Actual rates may vary by ward, mohalla, and latest government gazette.
                      Consult the Sub-Registrar office or <strong>igrs.cgstate.gov.in</strong> for exact values.
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Rate Reference Table */}
        <div className="bg-white rounded-[32px] p-8 shadow-xl shadow-gray-200/30 border border-gray-50 mt-8">
          <h3 className="text-xs font-black uppercase tracking-[0.25em] text-gray-800 mb-6">
            📋 Rajnandgaon Guideline Rate Reference (2025-26)
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 px-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Zone</th>
                  <th className="text-right py-3 px-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Residential</th>
                  <th className="text-right py-3 px-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Commercial</th>
                  <th className="text-right py-3 px-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Agricultural</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {[
                  { label: 'Nagar Nigam (City)', key: 'nagar_nigam' },
                  { label: 'Nagar Palika (Town)', key: 'nagar_palika' },
                  { label: 'Nagar Panchayat', key: 'nagar_panchayat' },
                  { label: 'Gram Panchayat (Village)', key: 'gram_panchayat' },
                ].map(row => (
                  <tr key={row.key} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-3 px-4 text-sm font-bold text-gray-700">{row.label}</td>
                    <td className="py-3 px-4 text-right text-sm font-bold text-[#40a28f]">₹{GUIDELINE_RATES[row.key].residential}/sqft</td>
                    <td className="py-3 px-4 text-right text-sm font-bold text-orange-500">₹{GUIDELINE_RATES[row.key].commercial}/sqft</td>
                    <td className="py-3 px-4 text-right text-sm font-bold text-gray-500">₹{GUIDELINE_RATES[row.key].agricultural}/sqft</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { label: 'Stamp Duty (Male)', value: '5%', note: 'of taxable value' },
              { label: 'Stamp Duty (Female / Joint)', value: '4%', note: '1% concession' },
              { label: 'Registration Fee', value: '4%', note: 'all categories' },
            ].map((item, i) => (
              <div key={i} className="bg-gray-50 rounded-2xl p-4 text-center">
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{item.label}</p>
                <p className="text-2xl font-black text-gray-800 my-1">{item.value}</p>
                <p className="text-[9px] text-gray-400 font-medium">{item.note}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
};

export default SDVCalculatorView;
