import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { requirementService } from '@/services/api';
import { Requirement } from '@/types/types';
import {
    MapPin,
    Maximize,
    DollarSign,
    ClipboardList,
    ArrowLeft,
    Share2,
    ShieldCheck,
    MessageCircle,
    Clock,
    User,
    Info,
    Calendar,
    Percent,
    Lock
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useSiteConfig } from '@/contexts/SiteConfigContext';

const MortgageDetailsView: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [mortgage, setMortgage] = useState<Requirement | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const { isAuthenticated, openLogin } = useAuth();
    const { config } = useSiteConfig();

    useEffect(() => {
        const fetchMortgage = async () => {
            if (!id) return;
            try {
                setLoading(true);
                const data = await requirementService.getById(id);
                if (data.purpose !== 'Mortgage') {
                    navigate(`/requirement/${id}`);
                    return;
                }
                setMortgage(data);
            } catch (err) {
                console.error('Failed to fetch mortgage details:', err);
                setError('Failed to load mortgage details. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchMortgage();
    }, [id, navigate]);

    const handleContactAdmin = () => {
        const adminPhone = config['admin_whatsapp'] || '918007767378'; // Default fallback from site config
        const message = `Hello RJG Admin, I am interested in this Mortgage Request:\n\nRef: M-${mortgage?.id}\nAsset: ${mortgage?.type}\nLocation: ${mortgage?.location}\nDemand: ₹${mortgage?.maxBudget}\n\nPlease share more details.`;
        window.open(`https://wa.me/${adminPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`, '_blank');
    };

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: `Mortgage Request M-${mortgage?.id} | RJG`,
                    text: `Funding opportunity for ${mortgage?.type} in ${mortgage?.location}. Check details on RJG.`,
                    url: window.location.href,
                });
            } catch (error) {
                console.log('Error sharing:', error);
            }
        } else {
            navigator.clipboard.writeText(window.location.href);
            alert('Link copied to clipboard!');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#fcfdfd] flex flex-col items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#40a28f]"></div>
                <p className="mt-4 text-gray-400 font-bold uppercase tracking-widest text-sm">Loading Mortgage Details...</p>
            </div>
        );
    }

    if (error || !mortgage) {
        return (
            <div className="min-h-screen bg-[#fcfdfd] flex flex-col items-center justify-center p-4 text-center">
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
                    <Info className="w-10 h-10 text-red-500" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Mortgage Request Not Found</h2>
                <p className="text-gray-500 mb-8 font-medium max-w-md">{error || "This mortgage request has been removed or is no longer active."}</p>
                <button
                    onClick={() => navigate('/mortgage')}
                    className="px-8 py-3 bg-[#40a28f] text-white rounded-xl font-bold uppercase tracking-wide hover:bg-[#358a7a] transition-all"
                >
                    Back to Board
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#fcfdfd] pb-20">
            {/* Navigation Header */}
            <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100 px-4 py-3">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <button
                        onClick={() => navigate('/mortgage')}
                        className="flex items-center gap-2 text-gray-500 hover:text-[#40a28f] transition-colors"
                    >
                        <ArrowLeft className="h-5 w-5" />
                        <span className="font-bold text-sm hidden sm:inline">Back to Board</span>
                    </button>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleShare}
                            className="p-2.5 rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
                            title="Share Request"
                        >
                            <Share2 className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">

                    {/* Left Column: Details */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* Summary Header Card */}
                        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 border-l-4 border-l-[#40a28f]">
                            <div className="flex flex-col md:flex-row justify-between items-start mb-6 gap-4">
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest">
                                            Mortgage Request M-{mortgage.id}
                                        </span>
                                        <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest">
                                            {mortgage.type} Collateral
                                        </span>
                                        {mortgage.is_verified && (
                                            <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                                                <ShieldCheck className="w-2.5 h-2.5" /> Verified
                                            </span>
                                        )}
                                    </div>
                                    <h1 className="text-3xl font-black text-gray-800 leading-tight">
                                        Funding Demand for {mortgage.location}
                                    </h1>
                                    <div className="flex items-center gap-2 text-gray-500 mt-2">
                                        <MapPin className="h-4 w-4 text-[#40a28f]" />
                                        <span className="font-bold">{mortgage.location}</span>
                                    </div>
                                </div>
                                <div className="text-left md:text-right">
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Liquidity Demand</p>
                                    <p className="text-3xl font-black text-[#40a28f]">
                                        ₹{mortgage.maxBudget.toLocaleString()}
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-6 border-t border-gray-50">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Area</p>
                                    <div className="flex items-center gap-2 text-gray-800 font-bold">
                                        <Maximize className="h-4 w-4 text-[#40a28f]" />
                                        <span>{mortgage.maxArea} {mortgage.area_unit || 'SqFt'}</span>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Interest Offer</p>
                                    <div className="flex items-center gap-2 text-gray-800 font-bold">
                                        <Percent className="h-4 w-4 text-[#40a28f]" />
                                        <span>{mortgage.expected_rate || 'Market Rate'}</span>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Post Date</p>
                                    <div className="flex items-center gap-2 text-gray-800 font-bold">
                                        <Calendar className="h-4 w-4 text-[#40a28f]" />
                                        <span>{new Date(mortgage.created_at).toLocaleDateString()}</span>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Tenure</p>
                                    <div className="flex items-center gap-2 text-gray-800 font-bold">
                                        <Clock className="h-4 w-4 text-[#40a28f]" />
                                        <span>{mortgage.loan_duration || '12 Months'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Detailed Description */}
                        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                            <h3 className="text-lg font-black text-gray-800 uppercase tracking-wide mb-6 flex items-center gap-2">
                                <ClipboardList className="h-5 w-5 text-[#40a28f]" />
                                Asset & Funding Details
                            </h3>
                            <p className="text-gray-600 leading-relaxed whitespace-pre-line text-lg">
                                {mortgage.description || "The owner is seeking funding against this property. All documents are available for verification with the admin."}
                            </p>
                        </div>

                        {/* Collateral Geo-Coordinates (Optional) */}
                        {(mortgage.district || mortgage.tehsil) && (
                            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                                <h3 className="text-lg font-black text-gray-800 uppercase tracking-wide mb-6 flex items-center gap-2">
                                    <MapPin className="h-5 w-5 text-[#40a28f]" />
                                    Collateral Details
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {[
                                        { label: 'District', value: mortgage.district },
                                        { label: 'Tehsil', value: mortgage.tehsil },
                                        { label: 'Revenue Circle', value: mortgage.revenue_inspector_circle },
                                        { label: 'Village/Street', value: mortgage.village || mortgage.street_name }
                                    ].filter(item => item.value).map((geo, idx) => (
                                        <div key={idx} className="bg-gray-50/50 p-4 rounded-xl border border-gray-100 flex justify-between items-center">
                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{geo.label}</span>
                                            <span className="text-xs font-bold text-gray-800 uppercase">{geo.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Security Section */}
                        <div className="bg-[#40a28f]/5 rounded-3xl p-8 border border-[#40a28f]/10">
                            <h3 className="text-lg font-black text-[#40a28f] uppercase tracking-wide mb-4 flex items-center gap-2">
                                <ShieldCheck className="h-5 w-5" />
                                Institutional Security
                            </h3>
                            <p className="text-sm text-gray-600 font-medium leading-relaxed">
                                All mortgage requests on RJG are subject to document verification by our admin team. Lenders are advised to perform their own due diligence before committing funds.
                            </p>
                        </div>

                    </div>

                    {/* Right Column: Contact info */}
                    <div className="space-y-6">
                        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/40 sticky top-24">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="h-16 w-16 bg-[#e2f2f0] rounded-full flex items-center justify-center">
                                    <User className="h-8 w-8 text-[#40a28f]" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Asset Owner</p>
                                    <h3 className="text-xl font-bold text-gray-800">
                                        Confidential Seeker
                                    </h3>
                                    <p className="text-sm text-[#40a28f] font-medium flex items-center gap-1">
                                        <Lock className="h-3 w-3" /> Contact Admin Only
                                    </p>
                                </div>
                            </div>

                            <button
                                onClick={handleContactAdmin}
                                className="w-full py-4 bg-[#40a28f] hover:bg-[#358a7a] text-white rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 transition-all shadow-xl shadow-[#40a28f]/20 active:scale-[0.98]"
                            >
                                <MessageCircle className="h-4 w-4" />
                                Inquire with Admin
                            </button>
                        </div>

                        <div className="mt-6 p-4 bg-amber-50 rounded-2xl border border-amber-100 flex gap-3">
                            <Info className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                            <p className="text-[10px] text-amber-700 font-bold leading-relaxed uppercase tracking-tight">
                                Note: This connection will be mediated by RJG Admin to ensure safety for both borrowers and lenders.
                            </p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default MortgageDetailsView;
