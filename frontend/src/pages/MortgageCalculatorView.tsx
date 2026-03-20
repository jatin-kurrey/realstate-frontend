import React, { useState, useMemo } from 'react';
import { 
  Calculator, 
  Home, 
  ShieldCheck, 
  IndianRupee, 
  ChevronDown, 
  Lock,
  Calendar,
  Percent,
  TrendingDown,
  FileText,
  Landmark,
  ArrowRight,
  ChevronRight,
  Info
} from 'lucide-react';
import { useSiteConfig } from '@/contexts/SiteConfigContext';

// 2025 India Banking Rates Reference
const BANK_DATA = [
  { name: 'SBI', rate: 8.50, fee: '0.35%', color: 'bg-blue-600' },
  { name: 'HDFC', rate: 8.75, fee: '0.50%', color: 'bg-red-600' },
  { name: 'ICICI', rate: 8.75, fee: '0.50%', color: 'bg-orange-600' },
  { name: 'Axis', rate: 8.90, fee: '0.50%', color: 'bg-purple-800' },
  { name: 'LIC Housing', rate: 8.50, fee: '₹10k - 15k', color: 'bg-blue-800' },
];

const MortgageCalculatorView: React.FC = () => {
  const { config } = useSiteConfig();

  // Page-level guard
  if (config['enable_mortgage'] === 'false') {
    return (
      <main className="min-h-screen bg-[#f8fbfa] flex items-center justify-center px-4">
        <div className="text-center space-y-6 max-w-md">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
            <Lock className="w-9 h-9 text-gray-400" />
          </div>
          <h1 className="text-3xl font-black text-gray-800 uppercase tracking-tight">Mortgage Calculator</h1>
          <p className="text-sm font-medium text-gray-400 leading-relaxed">
            This tool is currently disabled by the administrator.
            <br />Please check back later.
          </p>
          <span className="inline-block bg-amber-50 border border-amber-100 text-amber-600 text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full">
            Temporarily Unavailable
          </span>
        </div>
      </main>
    );
  }

  // ── State ──────────────────────────────────────────────────────────────────
  const [propertyValue, setPropertyValue] = useState('5000000');
  const [downpaymentPercent, setDownpaymentPercent] = useState('20');
  const [interestRate, setInterestRate] = useState('8.5');
  const [tenureYears, setTenureYears] = useState('20');
  const [processingFeePercent, setProcessingFeePercent] = useState('0.5');

  // ── Calculation ────────────────────────────────────────────────────────────
  const calc = useMemo(() => {
    const pVal = parseFloat(propertyValue) || 0;
    const dpPct = parseFloat(downpaymentPercent) || 0;
    const iRate = parseFloat(interestRate) || 0;
    const tYrs = parseInt(tenureYears, 10) || 0;
    const pFeePct = parseFloat(processingFeePercent) || 0;

    if (pVal <= 0 || tYrs <= 0) return null;

    const downpaymentAmount = pVal * (dpPct / 100);
    const loanAmount = pVal - downpaymentAmount;
    
    // Monthly interest rate
    const r = iRate / 12 / 100;
    // Total number of months
    const n = tYrs * 12;

    let emi = 0;
    if (r > 0) {
      emi = (loanAmount * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    } else {
      emi = loanAmount / n;
    }

    const totalPayable = emi * n;
    const totalInterest = totalPayable - loanAmount;
    const processingFee = loanAmount * (pFeePct / 100);

    // Amortization (Yearly Summary)
    const amortization = [];
    let balance = loanAmount;
    for (let yr = 1; yr <= tYrs; yr++) {
      let yrInterest = 0;
      let yrPrincipal = 0;
      for (let m = 1; m <= 12; m++) {
        const mInterest = balance * r;
        const mPrincipal = emi - mInterest;
        yrInterest += mInterest;
        yrPrincipal += mPrincipal;
        balance -= mPrincipal;
      }
      amortization.push({
        year: yr,
        interest: yrInterest,
        principal: yrPrincipal,
        balance: Math.max(0, balance)
      });
    }

    return {
      loanAmount,
      downpaymentAmount,
      emi,
      totalInterest,
      totalPayable,
      processingFee,
      amortization,
      interestRate: iRate,
      tenureYears: tYrs
    };
  }, [propertyValue, downpaymentPercent, interestRate, tenureYears, processingFeePercent]);

  const fmt = (n: number) => `₹${Math.round(n).toLocaleString('en-IN')}`;
  const fmtCr = (n: number) => {
    if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)} Cr`;
    if (n >= 100000) return `₹${(n / 100000).toFixed(2)} L`;
    return fmt(n);
  };

  const inputCls = "w-full bg-gray-50/80 border border-gray-100 rounded-2xl py-3.5 px-5 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-sm font-bold text-gray-700 placeholder:font-medium placeholder:text-gray-300";
  const selectCls = `${inputCls} appearance-none cursor-pointer pr-10`;
  const labelCls = "text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1 mb-1.5";

  return (
    <main className="min-h-screen bg-[#f8fbfa] pb-24">
      {/* Hero */}
      <div className="bg-gradient-to-br from-[#1a365d] to-[#2563eb] pt-28 pb-40 px-4 text-center text-white relative overflow-hidden">
        <div className="max-w-4xl mx-auto space-y-5 relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/15 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-[0.2em]">
            <TrendingDown className="w-3 h-3" /> Home Loan Expert 2025
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter leading-none uppercase">
            Mortgage EMI<br />
            <span className="text-white/30 italic">Simulator</span>
          </h1>
          <p className="text-base text-white/75 font-medium max-w-xl mx-auto">
            Professional mortgage calculator with amortization schedule and bank comparison for the Indian real estate market.
          </p>
        </div>
        <div className="absolute -bottom-32 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-blue-400/10 rounded-full blur-3xl" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-2xl" />
      </div>

      {/* Main Content */}
      <section className="max-w-6xl mx-auto px-4 -mt-28 relative z-10 space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* ── FORM ── */}
          <div className="lg:col-span-7 space-y-6">

            {/* Section 1: Loan Basics */}
            <div className="bg-white rounded-[32px] p-8 shadow-xl shadow-gray-200/40 border border-gray-50">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-50">
                <div className="p-2 bg-blue-50 rounded-xl"><Home className="w-4 h-4 text-blue-600" /></div>
                <h2 className="text-xs font-black uppercase tracking-[0.25em] text-gray-900">Loan Basics</h2>
              </div>

              <div className="space-y-5">
                {/* Property Value */}
                <div>
                  <label className={labelCls}>Property Value / Sale Price (₹)</label>
                  <input
                    type="number" placeholder="5,000,000" value={propertyValue}
                    onChange={e => setPropertyValue(e.target.value)}
                    className={inputCls}
                  />
                </div>

                {/* Downpayment & Percent */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Down Payment (%)</label>
                    <input
                      type="number" value={downpaymentPercent}
                      onChange={e => setDownpaymentPercent(e.target.value)}
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Tenure (Years)</label>
                    <div className="relative">
                      <select value={tenureYears} onChange={e => setTenureYears(e.target.value)} className={selectCls}>
                        {[5, 10, 15, 20, 25, 30].map(yr => (
                          <option key={yr} value={yr}>{yr} Years</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: Interest & Processing */}
            <div className="bg-white rounded-[32px] p-8 shadow-xl shadow-gray-200/40 border border-gray-50">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-50">
                <div className="p-2 bg-orange-50 rounded-xl"><Percent className="w-4 h-4 text-orange-500" /></div>
                <h2 className="text-xs font-black uppercase tracking-[0.25em] text-gray-900">Interest & Fees</h2>
              </div>

              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Interest Rate (%)</label>
                    <input
                      type="number" step="0.05" value={interestRate}
                      onChange={e => setInterestRate(e.target.value)}
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Processing Fee (%)</label>
                    <input
                      type="number" step="0.1" value={processingFeePercent}
                      onChange={e => setProcessingFeePercent(e.target.value)}
                      className={inputCls}
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <label className={labelCls}>Current Market Rates (2025)</label>
                  <div className="flex flex-wrap gap-2">
                    {BANK_DATA.map(bank => (
                      <button
                        key={bank.name}
                        onClick={() => setInterestRate(bank.rate.toString())}
                        className={`px-3 py-2 rounded-xl border text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-2 ${
                          interestRate === bank.rate.toString() 
                            ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200' 
                            : 'bg-white border-gray-100 text-gray-500 hover:border-blue-200'
                        }`}
                      >
                        <div className={`w-2 h-2 rounded-full ${bank.color}`} />
                        {bank.name}: {bank.rate}%
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Section 3: Amortization Schedule (Yearly) */}
            {calc && (
              <div className="bg-white rounded-[32px] p-8 shadow-xl shadow-gray-200/40 border border-gray-50">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-50">
                  <div className="p-2 bg-purple-50 rounded-xl"><Calendar className="w-4 h-4 text-purple-600" /></div>
                  <h2 className="text-xs font-black uppercase tracking-[0.25em] text-gray-900">Yearly Schedule</h2>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-[10px] font-bold text-gray-600">
                    <thead>
                      <tr className="border-b border-gray-50 text-gray-400 uppercase tracking-widest">
                        <th className="text-left pb-4 px-2">Year</th>
                        <th className="text-right pb-4 px-2">Principal Paid</th>
                        <th className="text-right pb-4 px-2">Interest Paid</th>
                        <th className="text-right pb-4 px-2">Balance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {calc.amortization.map(row => (
                        <tr key={row.year} className="hover:bg-gray-50/50 transition-colors">
                          <td className="py-3 px-2 text-gray-900">Year {row.year}</td>
                          <td className="text-right py-3 px-2 text-emerald-600">{fmt(row.principal)}</td>
                          <td className="text-right py-3 px-2 text-orange-500">{fmt(row.interest)}</td>
                          <td className="text-right py-3 px-2 font-black text-gray-900">{fmt(row.balance)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* ── RESULTS PANEL ── */}
          <div className="lg:col-span-5 space-y-5 lg:sticky lg:top-28">
            {!calc ? (
              <div className="bg-gray-900 rounded-[32px] p-10 text-center text-white/30 space-y-4">
                <Calculator className="w-12 h-12 mx-auto opacity-20" />
                <p className="text-xs font-black uppercase tracking-widest">Enter loan values to calculate</p>
              </div>
            ) : (
              <>
                {/* EMI Primary Card */}
                <div className="bg-gray-900 rounded-[32px] p-8 text-white relative overflow-hidden shadow-2xl">
                  <div className="relative z-10 space-y-6">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mb-1">Monthly EMI Amount</p>
                      <div className="text-5xl md:text-6xl font-black tracking-tighter text-blue-400">
                        {fmt(calc.emi)}
                      </div>
                      <p className="text-[10px] text-blue-400/50 font-black uppercase tracking-widest mt-1">
                        Fixed for {calc.tenureYears} Years @ {calc.interestRate}%
                      </p>
                    </div>

                    <div className="space-y-3 border-t border-white/5 pt-5">
                      {[
                        { label: 'Loan Amount', value: fmtCr(calc.loanAmount), sub: `Property Value less ${downpaymentPercent}% DP` },
                        { label: 'Down Payment', value: fmtCr(calc.downpaymentAmount), sub: 'Initial self-funding' },
                        { label: 'Processing Fee', value: fmt(calc.processingFee), sub: `Typical ${processingFeePercent}% setup fee` },
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

                    <div className="pt-4 flex items-center justify-between">
                       <span className="text-[11px] font-black text-white/20 uppercase tracking-widest">Total Interest Payable</span>
                       <span className="text-xl font-black text-orange-400">{fmtCr(calc.totalInterest)}</span>
                    </div>
                  </div>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500 blur-3xl opacity-15 -mr-16 -mt-16" />
                </div>

                {/* Second Summary Card: Total Repayment */}
                <div className="bg-white rounded-[32px] p-7 shadow-xl shadow-gray-200/30 border border-gray-50">
                   <div className="flex items-center justify-between mb-8">
                      <div>
                        <h3 className="text-xs font-black uppercase tracking-widest text-gray-900">Total Repayment</h3>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">Principal + Interest</p>
                      </div>
                      <IndianRupee className="w-5 h-5 text-emerald-500" />
                   </div>
                   
                   <div className="relative h-6 w-full bg-gray-50 rounded-full overflow-hidden flex mb-6">
                      <div style={{ width: `${(calc.loanAmount / calc.totalPayable) * 100}%` }} className="bg-blue-600 h-full" />
                      <div style={{ width: `${(calc.totalInterest / calc.totalPayable) * 100}%` }} className="bg-orange-400 h-full" />
                   </div>

                   <div className="space-y-4">
                      <div className="flex items-center justify-between text-sm">
                         <div className="flex items-center gap-3">
                            <div className="w-3 h-3 rounded-full bg-blue-600" />
                            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Loan Principal</span>
                         </div>
                         <span className="font-black text-gray-900">{fmtCr(calc.loanAmount)}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                         <div className="flex items-center gap-3">
                            <div className="w-3 h-3 rounded-full bg-orange-400" />
                            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Pure Interest</span>
                         </div>
                         <span className="font-black text-gray-900">{fmtCr(calc.totalInterest)}</span>
                      </div>
                      <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                         <span className="text-sm font-black text-gray-900 uppercase tracking-tight italic">Total Cost of Loan</span>
                         <span className="text-2xl font-black text-gray-900 tracking-tighter">{fmtCr(calc.totalPayable)}</span>
                      </div>
                   </div>
                </div>

                {/* Helpful CTA / Note */}
                <div className="bg-[#eff6ff] rounded-[32px] p-6 border border-blue-100 flex gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center shrink-0 shadow-sm shadow-blue-100">
                    <Landmark className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="text-[11px] font-black text-blue-900 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                       Check Eligibility <ArrowRight className="w-3 h-3" />
                    </h4>
                    <p className="text-[10px] text-blue-700/60 font-medium leading-relaxed">
                      Banks in India usually ensure that your total EMIs (including this one) do not exceed <span className="text-blue-900 font-bold">50-60% of your take-home salary</span>. 
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </section>
    </main>
  );
};

export default MortgageCalculatorView;
