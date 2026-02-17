import React from 'react';
import { Info, ChevronDown, Loader2, FileText } from 'lucide-react';
import { paymentService } from '@/services/api';

const PaymentsView: React.FC = () => {
  const [payments, setPayments] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchPayments = async () => {
      try {
        const data = await paymentService.getMyPayments();
        setPayments(data);
      } catch (error) {
        console.error('Failed to fetch payments:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPayments();
  }, []);
  return (
    <main className="min-h-screen bg-[#fcfdfd]">
      {/* Header */}
      <div className="bg-[#40a28f] py-24 px-4 text-white text-center">
        <div className="max-w-7xl mx-auto space-y-4">
          <h1 className="text-5xl md:text-6xl font-black uppercase tracking-tighter leading-none">Payment History</h1>
          <p className="text-xl text-white/80 font-medium">Track your listing payments and manage subscriptions</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 pb-24">
        {/* Pricing Info Box */}
        <div className="bg-[#e2f2f0] border border-[#d1e8e5] rounded-[40px] p-10 mb-12 flex gap-8 items-start relative overflow-hidden group">
          <div className="bg-white p-4 rounded-2xl shadow-sm text-[#40a28f] group-hover:scale-110 transition-transform duration-500">
            <Info className="h-8 w-8" />
          </div>
          <div className="space-y-4 relative z-10">
            <h2 className="text-2xl font-black text-gray-800 uppercase tracking-tight">Simple Pricing Model</h2>
            <p className="text-gray-600 leading-relaxed font-medium max-w-4xl">
              Each active property listing costs <span className="text-[#40a28f] font-black">₹100 per month</span>. Your listing remains visible for 30 days from the payment date. Renew before expiry to keep your property visible to potential buyers and tenants.
            </p>
            <button className="text-[10px] font-black uppercase tracking-[0.2em] text-[#40a28f] hover:text-[#358a7a] transition-colors border-b-2 border-[#40a28f]/20 pb-1">
              Manage My Listings
            </button>
          </div>
          {/* Decorative pattern */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/20 rounded-full blur-3xl -mr-32 -mt-32"></div>
        </div>

        {/* Filters */}
        <div className="bg-white border border-gray-100 rounded-[32px] p-10 mb-16 shadow-xl shadow-gray-200/50">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-8 items-end">
            <div className="space-y-2 lg:col-span-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Payment Status</label>
              <div className="relative">
                <select className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 appearance-none focus:outline-none focus:ring-4 focus:ring-[#40a28f]/5 text-gray-400 text-sm font-bold">
                  <option>All Statuses</option>
                  <option>Success</option>
                  <option>Pending</option>
                  <option>Failed</option>
                </select>
                <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300 pointer-events-none" />
              </div>
            </div>

            <div className="space-y-2 lg:col-span-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">From Date</label>
              <input type="text" defaultValue="2/05/2026" className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 text-gray-600 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-[#40a28f]/5" />
            </div>

            <div className="space-y-2 lg:col-span-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">To Date</label>
              <input type="text" defaultValue="2/05/2026" className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 text-gray-600 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-[#40a28f]/5" />
            </div>

            <div className="flex gap-4 lg:col-span-2">
              <button className="flex-1 bg-[#40a28f] text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-[#40a28f]/20 hover:scale-[1.02] active:scale-[0.98] transition-all">
                Apply Filters
              </button>
              <button className="px-10 bg-gray-50 text-gray-400 border border-gray-100 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-gray-100 transition-all">
                Reset
              </button>
            </div>
          </div>
        </div>

        {/* History Table */}
        <div className="space-y-10">
          <h3 className="text-center text-[10px] font-bold text-gray-300 uppercase tracking-[0.4em]">Transaction History</h3>
          <div className="bg-[#f3f1ee] p-2 rounded-[32px] border border-gray-100">
            {loading ? (
              <div className="bg-white rounded-[30px] py-40 flex flex-col items-center justify-center gap-6">
                <Loader2 className="h-12 w-12 animate-spin text-[#40a28f]" />
                <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.3em]">Synching with ledger</p>
              </div>
            ) : payments.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left border-separate border-spacing-0">
                  <thead>
                    <tr className="text-gray-400 font-black uppercase tracking-widest text-[10px]">
                      <th className="px-10 py-6">Date</th>
                      <th className="px-10 py-6">Listing</th>
                      <th className="px-10 py-6 text-right">Amount</th>
                      <th className="px-10 py-6 text-center">Status</th>
                      <th className="px-10 py-6 text-center">Period</th>
                      <th className="px-10 py-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white">
                    {payments.map((tx, idx) => (
                      <tr key={tx.id} className={`${idx === 0 ? 'rounded-t-[28px]' : ''} ${idx === payments.length - 1 ? 'rounded-b-[28px]' : ''} hover:bg-gray-50 transition-colors group`}>
                        <td className="px-10 py-6 text-gray-800 font-black tracking-tight">{new Date(tx.created_at).toLocaleDateString()}</td>
                        <td className="px-10 py-6 text-gray-500 font-bold uppercase tracking-widest text-[10px]">{tx.property?.title || 'Property Upgrade'}</td>
                        <td className="px-10 py-6 text-right font-black text-gray-900 text-lg">₹{tx.amount}</td>
                        <td className="px-10 py-6 text-center">
                          <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${tx.status === 'Success' ? 'bg-[#e2f2f0] text-[#40a28f]' : 'bg-red-50 text-red-500'
                            }`}>
                            {tx.status}
                          </span>
                        </td>
                        <td className="px-10 py-6 text-center text-gray-400 text-xs font-bold italic">30 Days</td>
                        <td className="px-10 py-6 text-right">
                          <button className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-50 text-gray-400 rounded-xl text-[10px] font-black uppercase tracking-widest group-hover:bg-[#40a28f] group-hover:text-white transition-all">
                            <FileText className="h-3 w-3" />
                            Receipt
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="bg-white rounded-[30px] py-40 text-center space-y-6">
                <div className="h-20 w-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto">
                  <FileText className="h-8 w-8 text-gray-200" />
                </div>
                <div>
                  <h4 className="text-xl font-black text-gray-400 uppercase tracking-tight leading-none">Zero Transaction History</h4>
                  <p className="text-xs font-bold text-gray-300 uppercase tracking-widest pt-2">Your subscription payments will manifest here</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};

export default PaymentsView;
