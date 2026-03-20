
import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { propertyService, bookmarkService, getImageUrl } from '@/services/api';
import { Property } from '@/types/types';
import {
    MapPin,
    Home,
    Tag,
    CheckCircle,
    ArrowLeft,
    Share2,
    Heart,
    Calendar,
    ShieldCheck,
    MessageCircle,
    Clock,
    User,
    Crown,
    Calculator,
    TrendingUp,
    Landmark,
    AlertTriangle
} from 'lucide-react';
import LoginModal from '@/components/LoginModal';
import SignUpModal from '@/components/SignUpModal';
import { useAuth } from '@/contexts/AuthContext';
import PremiumModal from '@/components/PremiumModal';

// ─── SDV Guideline Rates (CG 2025-26) ────────────────────────────────────────
const SDV_RATES: Record<string, number> = {
    residential: 900,   // Nagar Nigam base (conservative)
    commercial:  1600,
    agricultural: 180,
    industrial:   1200,
    default:      900,
};
function getSDVEstimate(area: number, areaUnit: string, type: string) {
    const toSqFt = (v: number, u: string) => {
        if (u === 'acres') return v * 43560;
        if (u === 'hectare') return v * 107639;
        return v; // sqft
    };
    const sqFt = toSqFt(area, areaUnit || 'sqft');
    const rateKey = (type || '').toLowerCase().includes('commercial') ? 'commercial'
        : (type || '').toLowerCase().includes('agri') ? 'agricultural'
        : 'residential';
    const rate = SDV_RATES[rateKey] ?? SDV_RATES.default;
    const landSDV   = sqFt * rate;
    const stampMale = landSDV * 0.05;
    const stampFemale = landSDV * 0.04;
    const regFee    = landSDV * 0.04;
    const totalMale = stampMale + regFee;
    const totalFemale = stampFemale + regFee;
    const loanLAP   = landSDV * 0.75;
    return { landSDV, stampMale, stampFemale, regFee, totalMale, totalFemale, loanLAP, sqFt, rate };
}

const PropertyDetailsView: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [property, setProperty] = useState<Property | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isBookmarked, setIsBookmarked] = useState(false);
    const [isPremiumModalOpen, setIsPremiumModalOpen] = useState(false);

    const { isAuthenticated, openLogin } = useAuth();

    const handleContactDealer = async () => {
        if (!property || !property.owner) return;
        const phone = property.owner.phone;
        if (!phone) {
            alert('Phone number not available for this owner.');
            return;
        }
        window.open(`https://wa.me/${phone.replace(/[^0-9]/g, '')}`, '_blank');
    };

    useEffect(() => {
        const fetchProperty = async () => {
            if (!id) return;
            try {
                setLoading(true);
                const data = await propertyService.getById(id);
                setProperty(data);

                // Check bookmark status if user is logged in
                if (isAuthenticated) {
                    try {
                        const bookmarked = await bookmarkService.isBookmarked(id, 'property');
                        setIsBookmarked(bookmarked);
                    } catch (err) {
                        console.error("Failed to check bookmark status", err);
                    }
                } else {
                    // Fallback to local storage for guest
                    const saved = localStorage.getItem('shortlisted_properties');
                    if (saved) {
                        const list = JSON.parse(saved) as Property[];
                        setIsBookmarked(list.some(p => p.id === Number(id))); // Assuming ID might be number map to string
                    }
                }
            } catch (err: any) {
                console.error('Failed to fetch property details:', err);
                if (err.response?.status === 403 || err.response?.data?.isPremium) {
                    setIsPremiumModalOpen(true);
                    setError('PREMIUM_CONTENT');
                } else {
                    setError('Failed to load property details. Please try again later.');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchProperty();
    }, [id, isAuthenticated]);

    const handleToggleBookmark = async () => {
        if (!property) return;

        if (!isAuthenticated) {
            // Local storage fallback logic for guests
            const saved = localStorage.getItem('shortlisted_properties');
            let list = saved ? JSON.parse(saved) as Property[] : [];

            if (isBookmarked) {
                list = list.filter(p => p.id !== property.id);
                setIsBookmarked(false);
            } else {
                list.push(property);
                setIsBookmarked(true);
            }
            localStorage.setItem('shortlisted_properties', JSON.stringify(list));
            window.dispatchEvent(new Event('shortlistUpdated'));
            return;
        }

        try {
            // API call for authenticated users - Assuming bookmarkService exists or implementing local logic if strict API not ready
            // Given previous file view, bookmarkService was in api.ts
            await bookmarkService.toggle(property.id, 'property');
            setIsBookmarked(!isBookmarked);
        } catch (err) {
            console.error('Failed to toggle bookmark:', err);
        }
    };

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: property?.title,
                    text: `Check out this property in ${property?.location}`,
                    url: window.location.href,
                });
            } catch (error) {
                console.log('Error sharing:', error);
            }
        } else {
            // Fallback: Copy to clipboard
            navigator.clipboard.writeText(window.location.href);
            alert('Link copied to clipboard!');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#fcfdfd] flex flex-col items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#40a28f]"></div>
                <p className="mt-4 text-gray-400 font-bold uppercase tracking-widest text-sm">Loading Details...</p>
            </div>
        );
    }

    if (error === 'PREMIUM_CONTENT') {
        return (
            <div className="min-h-screen bg-[#fcfdfd] flex flex-col items-center justify-center p-4 text-center">
                <div className="w-20 h-20 bg-emerald-50 rounded-3xl flex items-center justify-center mb-6 shadow-xl shadow-emerald-500/10">
                    <Crown className="h-10 w-10 text-emerald-600" />
                </div>
                <h2 className="text-3xl font-black text-gray-800 mb-2 uppercase tracking-tight">Premium Listing</h2>
                <p className="text-gray-500 mb-8 max-w-sm font-medium">This is a high-value premium property. You need an active premium membership to view its details, documents, and owner contact.</p>
                <div className="flex flex-col sm:flex-row gap-4">
                    <button
                        onClick={() => setIsPremiumModalOpen(true)}
                        className="px-8 py-4 bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-600/20 active:scale-95 flex items-center gap-2"
                    >
                        <Crown className="h-4 w-4" /> Upgrade to Premium
                    </button>
                    <button
                        onClick={() => navigate('/')}
                        className="px-8 py-4 bg-gray-100 text-gray-700 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-gray-200 transition-all active:scale-95"
                    >
                        Keep Browsing
                    </button>
                </div>
                <PremiumModal isOpen={isPremiumModalOpen} onClose={() => setIsPremiumModalOpen(false)} />
            </div>
        );
    }

    if (error || !property) {
        return (
            <div className="min-h-screen bg-[#fcfdfd] flex flex-col items-center justify-center p-4 text-center">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Property Not Found</h2>
                <p className="text-gray-500 mb-6">{error || "The property you're looking for doesn't exist or has been removed."}</p>
                <button
                    onClick={() => navigate('/')}
                    className="px-6 py-3 bg-[#40a28f] text-white rounded-xl font-bold uppercase tracking-wide hover:bg-[#358a7a] transition-all"
                >
                    Back to Browse
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
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-gray-500 hover:text-[#40a28f] transition-colors"
                    >
                        <ArrowLeft className="h-5 w-5" />
                        <span className="font-bold text-sm hidden sm:inline">Back</span>
                    </button>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleShare}
                            className="p-2.5 rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
                            title="Share Property"
                        >
                            <Share2 className="h-5 w-5" />
                        </button>
                        <button
                            onClick={handleToggleBookmark}
                            className={`p-2.5 rounded-full hover:bg-gray-100 transition-colors ${isBookmarked ? 'text-red-500' : 'text-gray-500'}`}
                            title={isBookmarked ? "Remove from Favorites" : "Add to Favorites"}
                        >
                            <Heart className={`h-5 w-5 ${isBookmarked ? 'fill-current' : ''}`} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">

                    {/* Left Column: Images & Details */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* Hero Image */}
                        <div className="relative aspect-video rounded-3xl overflow-hidden shadow-2xl shadow-gray-200/50 group">
                            <img
                                src={getImageUrl(property.imageUrl)}
                                alt={property.title}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            />

                            <div className="absolute top-6 right-6 flex flex-col gap-2 items-end">
                                <span className="bg-[#40a28f] text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-[#40a28f]/20">
                                    {property.status}
                                </span>
                                <span className="bg-gray-100/90 backdrop-blur-md text-gray-700 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-gray-200/20">
                                    {property.type}
                                </span>
                                {property.is_featured && (
                                    <span className="bg-amber-400 text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-amber-400/20">
                                        Featured
                                    </span>
                                )}
                                {property.is_verified && (
                                    <span className="bg-blue-500 text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 flex items-center gap-1">
                                        <ShieldCheck className="h-3 w-3" /> Verified
                                    </span>
                                )}
                                {property.is_premium && (
                                    <span className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-emerald-600/20 flex items-center gap-1">
                                        Premium
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Title & Location Header */}
                        <div className="space-y-4">
                            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                                <div className="space-y-2 flex-grow min-w-0">
                                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-gray-800 leading-tight break-words flex items-center gap-3">
                                        {property.title}
                                        {property.is_premium && (
                                            <Crown className="w-8 h-8 text-emerald-600 fill-current shrink-0" />
                                        )}
                                    </h1>
                                    <div className="flex items-center gap-2 text-gray-500 font-medium text-lg">
                                        <MapPin className="h-5 w-5 text-[#40a28f] flex-shrink-0" />
                                        <span className="break-words">
                                            {(() => {
                                                const mainLoc = property.street_name || property.landmark;
                                                const locParts = [mainLoc, property.village].filter(Boolean);
                                                return locParts.length > 0 ? locParts.join(', ') : property.location;
                                            })()}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex flex-col items-start md:items-end flex-shrink-0">
                                    <div className="text-3xl md:text-4xl lg:text-5xl font-black text-[#40a28f] tracking-tighter">
                                        ₹{property.price.toLocaleString()}
                                    </div>
                                    {property.status === 'Rent' && (
                                        <span className="text-gray-400 font-bold uppercase tracking-widest text-[10px] md:text-xs">Per Month</span>
                                    )}
                                    {property.is_negotiable && (
                                        <span className="inline-block mt-2 px-3 py-1 bg-green-50 text-green-600 rounded-lg text-[10px] font-black uppercase tracking-widest border border-green-100">
                                            Price Negotiable
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Key Features Grid */}
                        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 space-y-8">
                            <div>
                                <h3 className="text-lg font-black text-gray-800 uppercase tracking-wide mb-6">Property Overview</h3>
                                <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                                    <div className="flex justify-between border-b border-gray-50 pb-2">
                                        <dt className="font-bold text-gray-400 text-sm uppercase tracking-wider">Purpose</dt>
                                        <dd className="font-bold text-gray-800">{property.status}</dd>
                                    </div>
                                    <div className="flex justify-between border-b border-gray-50 pb-2">
                                        <dt className="font-bold text-gray-400 text-sm uppercase tracking-wider">Property Type</dt>
                                        <dd className="font-bold text-gray-800">{property.type}</dd>
                                    </div>
                                    <div className="md:col-span-2 border-b border-gray-50 pb-2">
                                        <dt className="font-bold text-gray-400 text-sm uppercase tracking-wider mb-1">Location</dt>
                                        <dd className="font-bold text-gray-800">
                                            {[
                                                property.district && `Dist: ${property.district}`,
                                                property.tehsil && `Tehsil: ${property.tehsil}`,
                                                property.revenue_inspector_circle && `RI: ${property.revenue_inspector_circle}`,
                                                property.village,
                                                property.street_name,
                                                property.landmark
                                            ].filter(Boolean).join(' › ')}
                                        </dd>
                                    </div>
                                    <div className="flex justify-between border-b border-gray-50 pb-2">
                                        <dt className="font-bold text-gray-400 text-sm uppercase tracking-wider">Area</dt>
                                        <dd className="font-bold text-gray-800">{property.area}<sup className="text-[10px]">2</sup> {property.area_unit === 'sqft' ? 'Sq Ft' : 'Acres'}</dd>
                                    </div>
                                    <div className="flex justify-between border-b border-gray-50 pb-2">
                                        <dt className="font-bold text-gray-400 text-sm uppercase tracking-wider">Dimensions</dt>
                                        <dd className="font-bold text-gray-800">{property.dimensions || 'N/A'}</dd>
                                    </div>
                                    <div className="flex justify-between border-b border-gray-50 pb-2">
                                        <dt className="font-bold text-gray-400 text-sm uppercase tracking-wider">Frontage</dt>
                                        <dd className="font-bold text-gray-800">{property.frontage || 'N/A'}</dd>
                                    </div>
                                    <div className="flex justify-between border-b border-gray-50 pb-2">
                                        <dt className="font-bold text-gray-400 text-sm uppercase tracking-wider">Land Use</dt>
                                        <dd className="font-bold text-gray-800">{property.land_use || 'N/A'}</dd>
                                    </div>
                                    <div className="flex justify-between border-b border-gray-50 pb-2">
                                        <dt className="font-bold text-gray-400 text-sm uppercase tracking-wider">Price Negotiable</dt>
                                        <dd className="font-bold text-gray-800">{property.is_negotiable ? 'Yes' : 'No'}</dd>
                                    </div>
                                    <div className="flex justify-between border-b border-gray-50 pb-2">
                                        <dt className="font-bold text-gray-400 text-sm uppercase tracking-wider">Posted On</dt>
                                        <dd className="font-bold text-gray-800">
                                            {property.created_at ? new Date(property.created_at).toLocaleDateString() : 'N/A'}
                                        </dd>
                                    </div>
                                </dl>
                            </div>

                            {/* ── SDV Estimate Card ── */}
                            {property.area > 0 && (() => {
                                const sdv = getSDVEstimate(property.area, property.area_unit, property.type);
                                const fmtL = (n: number) => n >= 10000000
                                    ? `₹${(n/10000000).toFixed(2)} Cr`
                                    : n >= 100000 ? `₹${(n/100000).toFixed(2)} L`
                                    : `₹${Math.round(n).toLocaleString('en-IN')}`;
                                return (
                                <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="p-1.5 bg-[#40a28f]/20 rounded-lg">
                                                <Calculator className="h-4 w-4 text-[#40a28f]" />
                                            </div>
                                            <h4 className="text-[10px] font-black text-white uppercase tracking-[0.25em]">Estimated SDV & Stamp Duty</h4>
                                        </div>
                                        <span className="text-[9px] text-white/30 font-bold uppercase tracking-widest">CG 2025-26</span>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="bg-white/5 rounded-xl p-3">
                                            <p className="text-[9px] text-white/40 font-black uppercase tracking-wider">Land SDV</p>
                                            <p className="text-lg font-black text-white mt-0.5">{fmtL(sdv.landSDV)}</p>
                                            <p className="text-[9px] text-[#40a28f] font-bold">₹{sdv.rate}/sqft guideline</p>
                                        </div>
                                        <div className="bg-white/5 rounded-xl p-3">
                                            <p className="text-[9px] text-white/40 font-black uppercase tracking-wider">Max Loan (LAP 75%)</p>
                                            <p className="text-lg font-black text-white mt-0.5">{fmtL(sdv.loanLAP)}</p>
                                            <p className="text-[9px] text-white/30 font-bold">Loan Against Property</p>
                                        </div>
                                    </div>

                                    <div className="border-t border-white/5 pt-4 grid grid-cols-3 gap-2">
                                        {[
                                            { label: 'Stamp (Male 5%)', val: fmtL(sdv.stampMale) },
                                            { label: 'Stamp (Female 4%)', val: fmtL(sdv.stampFemale) },
                                            { label: 'Reg Fee (4%)', val: fmtL(sdv.regFee) },
                                        ].map((item, i) => (
                                            <div key={i} className="text-center">
                                                <p className="text-[8px] text-white/30 font-black uppercase tracking-wider">{item.label}</p>
                                                <p className="text-sm font-black text-orange-400 mt-0.5">{item.val}</p>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-xl p-3">
                                        <AlertTriangle className="h-3 w-3 text-amber-400 flex-shrink-0" />
                                        <p className="text-[9px] text-amber-400/80 font-medium">
                                            Estimate based on Nagar Nigam base rate. Use the{' '}
                                            <button onClick={() => navigate('/sdv-calculator')}
                                                className="underline text-amber-400 font-black hover:text-amber-300 transition-colors">
                                                SDV Calculator
                                            </button>{' '}for exact zone-specific values.
                                        </p>
                                    </div>
                                </div>
                                );
                            })()}

                            {property.google_map_url && (
                                <div>
                                    <a href={property.google_map_url} target="_blank" rel="noopener noreferrer"
                                        className="flex items-center justify-center gap-2 w-full bg-blue-50 text-blue-600 font-bold py-3 rounded-xl hover:bg-blue-100 transition-colors uppercase tracking-widest text-xs">
                                        <MapPin className="h-4 w-4" /> View on Google Maps
                                    </a>
                                </div>
                            )}

                            <div>
                                <h3 className="text-lg font-black text-gray-800 uppercase tracking-wide mb-4">Description</h3>
                                <p className="text-gray-600 leading-relaxed whitespace-pre-line">{property.description}</p>
                            </div>
                        </div>

                        {/* Additional Details / Amenities placeholder */}


                    </div>

                    {/* Right Column: Contact & Sidebar */}
                    <div className="space-y-6">

                        {/* Agent / Owner Card */}
                        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/40 sticky top-24">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="h-16 w-16 bg-[#e2f2f0] rounded-full flex items-center justify-center">
                                    <User className="h-8 w-8 text-[#40a28f]" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Listed By</p>
                                    <h3 className="text-xl font-bold text-gray-800">
                                        {property.owner?.role === 'developer' && property.owner.company_name
                                            ? property.owner.company_name
                                            : property.owner?.name || "Property Owner"}
                                    </h3>
                                    <p className="text-sm text-[#40a28f] font-medium flex items-center gap-1">
                                        {property.owner?.role === 'developer' ? (
                                            <>
                                                <span className="inline-block w-2 h-2 rounded-full bg-indigo-500"></span>
                                                Pro Developer
                                            </>
                                        ) : "Verified Seller"}
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <button
                                    onClick={handleContactDealer}
                                    className="w-full py-5 bg-[#25D366] hover:bg-[#128C7E] text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 transition-all shadow-xl shadow-[#25D366]/20 active:scale-[0.98]"
                                >
                                    <MessageCircle className="h-5 w-5" />
                                    Contact Dealer (WhatsApp)
                                </button>
                                <button
                                    onClick={() => isAuthenticated ? handleToggleBookmark() : openLogin()}
                                    className="w-full py-3 bg-transparent text-gray-400 hover:text-gray-600 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-1 transition-colors"
                                >
                                    {isBookmarked ? 'Remove from Shortlist' : 'Add to Shortlist'}
                                </button>
                            </div>


                        </div>

                        {/* Safety Tips Card */}

                    </div>

                </div>
            </main>

        </div>
    );
};

export default PropertyDetailsView;
