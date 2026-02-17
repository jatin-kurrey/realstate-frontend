
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { propertyService, bookmarkService } from '@/services/api';
import { Property } from '@/types/types';
import {
    MapPin,
    Ruler,
    Maximize,
    Home,
    Tag,
    CheckCircle,
    ArrowLeft,
    Share2,
    Heart,
    Calendar,
    ShieldCheck,
    Phone,
    MessageCircle,
    Clock,
    User
} from 'lucide-react';
import LoginModal from '@/components/LoginModal';
import SignUpModal from '@/components/SignUpModal';

const PropertyDetailsView: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [property, setProperty] = useState<Property | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isBookmarked, setIsBookmarked] = useState(false);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [showSignUpModal, setShowSignUpModal] = useState(false);

    const isAuthenticated = !!localStorage.getItem('token');

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
            } catch (err) {
                console.error('Failed to fetch property details:', err);
                setError('Failed to load property details. Please try again later.');
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
                                src={property.imageUrl}
                                alt={property.title}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            />

                            <div className="absolute top-6 right-6 flex flex-col gap-2 items-end">
                                <span className="bg-[#40a28f] text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-[#40a28f]/20">
                                    {property.status}
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
                            </div>
                        </div>

                        {/* Title & Location Header */}
                        <div className="space-y-4">
                            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                                <div className="space-y-2">
                                    <h1 className="text-3xl md:text-4xl font-black text-gray-800 leading-tight">
                                        {property.title}
                                    </h1>
                                    <div className="flex items-center gap-2 text-gray-500 font-medium text-lg">
                                        <MapPin className="h-5 w-5 text-[#40a28f]" />
                                        {property.location}
                                    </div>
                                </div>

                                <div className="flex flex-col items-start md:items-end">
                                    <div className="text-3xl md:text-4xl font-black text-[#40a28f] tracking-tight">
                                        ₹{property.price.toLocaleString()}
                                    </div>
                                    {property.status === 'Rent' && (
                                        <span className="text-gray-400 font-bold uppercase tracking-wider text-xs">Per Month</span>
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
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 bg-white rounded-2xl border border-gray-100 shadow-sm">
                            <div className="space-y-1">
                                <div className="flex items-center gap-2 text-gray-400 text-xs font-bold uppercase tracking-widest">
                                    <Ruler className="h-4 w-4" /> Area
                                </div>
                                <p className="text-lg font-bold text-gray-800">{property.area} <span className="text-sm font-medium text-gray-400">sq.ft</span></p>
                            </div>
                            <div className="space-y-1">
                                <div className="flex items-center gap-2 text-gray-400 text-xs font-bold uppercase tracking-widest">
                                    <Maximize className="h-4 w-4" /> Dimensions
                                </div>
                                <p className="text-lg font-bold text-gray-800">{property.dimensions}</p>
                            </div>
                            <div className="space-y-1">
                                <div className="flex items-center gap-2 text-gray-400 text-xs font-bold uppercase tracking-widest">
                                    <Home className="h-4 w-4" /> Type
                                </div>
                                <p className="text-lg font-bold text-gray-800">{property.type}</p>
                            </div>
                            <div className="space-y-1">
                                <div className="flex items-center gap-2 text-gray-400 text-xs font-bold uppercase tracking-widest">
                                    <Clock className="h-4 w-4" /> Posted
                                </div>
                                {/* Assuming created_at exists, generic fallback provided */}
                                <p className="text-lg font-bold text-gray-800">Recently</p>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="space-y-4">
                            <h3 className="text-xl font-bold text-gray-800">About this Property</h3>
                            <div className="prose prose-gray max-w-none">
                                <p className="text-gray-600 leading-relaxed text-lg">
                                    {property.description}
                                </p>
                            </div>
                        </div>

                        {/* Additional Details / Amenities placeholder */}
                        <div className="space-y-4">
                            <h3 className="text-xl font-bold text-gray-800">Property Highlights</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                                    <CheckCircle className="h-5 w-5 text-[#40a28f]" />
                                    <span className="font-medium text-gray-700">Prime Location</span>
                                </div>
                                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                                    <CheckCircle className="h-5 w-5 text-[#40a28f]" />
                                    <span className="font-medium text-gray-700">Close to Market</span>
                                </div>
                                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                                    <CheckCircle className="h-5 w-5 text-[#40a28f]" />
                                    <span className="font-medium text-gray-700">Excellent Accessibility</span>
                                </div>
                                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                                    <CheckCircle className="h-5 w-5 text-[#40a28f]" />
                                    <span className="font-medium text-gray-700">Verified Ownership</span>
                                </div>
                            </div>
                        </div>

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
                                <button className="w-full py-4 bg-[#40a28f] hover:bg-[#358a7a] text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#40a28f]/20 active:scale-[0.98]">
                                    <Phone className="h-5 w-5" />
                                    Show Phone Number
                                </button>
                                <button className="w-full py-4 bg-white border-2 border-gray-100 hover:border-[#40a28f]/30 hover:bg-[#f0f9f8] text-gray-700 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98]">
                                    <MessageCircle className="h-5 w-5 text-[#40a28f]" />
                                    Send Inquiry
                                </button>
                                <button
                                    onClick={() => isAuthenticated ? handleToggleBookmark() : setShowLoginModal(true)}
                                    className="w-full py-3 bg-transparent text-gray-400 hover:text-gray-600 text-sm font-semibold flex items-center justify-center gap-1 transition-colors"
                                >
                                    {isBookmarked ? 'Remove from Shortlist' : 'Add to Shortlist'}
                                </button>
                            </div>

                            <div className="mt-8 pt-6 border-t border-gray-100">
                                <p className="text-xs text-center text-gray-400 leading-relaxed">
                                    <ShieldCheck className="h-3 w-3 inline mr-1" />
                                    Your safety matters. Never transfer money before visiting the property.
                                </p>
                            </div>
                        </div>

                        {/* Safety Tips Card */}
                        <div className="bg-blue-50/50 p-6 rounded-3xl border border-blue-100">
                            <h4 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
                                <ShieldCheck className="h-5 w-5 text-blue-600" />
                                Safety Check
                            </h4>
                            <ul className="space-y-2 text-sm text-blue-800/80">
                                <li className="flex items-start gap-2">
                                    <span className="mt-1.5 h-1 w-1 bg-blue-400 rounded-full flex-shrink-0" />
                                    Verify property documents physically.
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="mt-1.5 h-1 w-1 bg-blue-400 rounded-full flex-shrink-0" />
                                    Avoid payments without receipts.
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="mt-1.5 h-1 w-1 bg-blue-400 rounded-full flex-shrink-0" />
                                    Report suspicious listings immediately.
                                </li>
                            </ul>
                        </div>
                    </div>

                </div>
            </main>

            {/* Auth Modals */}
            <LoginModal
                isOpen={showLoginModal}
                onClose={() => setShowLoginModal(false)}
                onSwitchToSignUp={() => {
                    setShowLoginModal(false);
                    setShowSignUpModal(true);
                }}
            />
            <SignUpModal
                isOpen={showSignUpModal}
                onClose={() => setShowSignUpModal(false)}
                onSwitchToLogin={() => {
                    setShowSignUpModal(false);
                    setShowLoginModal(true);
                }}
            />

        </div>
    );
};

export default PropertyDetailsView;
