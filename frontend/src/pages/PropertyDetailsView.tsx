
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
    MessageCircle,
    Clock,
    User
} from 'lucide-react';
import LoginModal from '@/components/LoginModal';
import SignUpModal from '@/components/SignUpModal';
import ContactModal from '@/components/ContactModal';
import { useChat } from '@/contexts/ChatContext';
import { useAuth } from '@/contexts/AuthContext';

const PropertyDetailsView: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [property, setProperty] = useState<Property | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isBookmarked, setIsBookmarked] = useState(false);
    const [showContactModal, setShowContactModal] = useState(false);
    const { createThread } = useChat();
    const { isAuthenticated, openLogin } = useAuth();

    const handleContactDealer = async () => {
        if (!isAuthenticated) {
            openLogin();
            return;
        }
        if (!property || !property.owner_id) return;
        setShowContactModal(true);
    };

    const handleSendMessage = async (message: string) => {
        if (!property || !property.owner_id) return;
        try {
            const thread = await createThread(Number(property.owner_id), Number(property.id), message);
            navigate(`/messages/${thread.id}`);
        } catch (err) {
            console.error("Failed to initiate contact", err);
        }
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
                                        {(() => {
                                            const mainLoc = property.street_name || property.landmark;
                                            const locParts = [mainLoc, property.village].filter(Boolean);
                                            return locParts.length > 0 ? locParts.join(', ') : property.location;
                                        })()}
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
                                                property.landmark,
                                                property.street_name,
                                                property.village,
                                                property.revenue_inspector_circle && `RI: ${property.revenue_inspector_circle}`,
                                                property.tehsil && `Tehsil: ${property.tehsil}`,
                                                property.district && `Dist: ${property.district}`
                                            ].filter(Boolean).join(' > ')}
                                        </dd>
                                    </div>
                                    <div className="flex justify-between border-b border-gray-50 pb-2">
                                        <dt className="font-bold text-gray-400 text-sm uppercase tracking-wider">Area</dt>
                                        <dd className="font-bold text-gray-800">{property.area} {property.area_unit}</dd>
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
                                    className="w-full py-5 bg-[#40a28f] hover:bg-[#358a7a] text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 transition-all shadow-xl shadow-[#40a28f]/20 active:scale-[0.98]"
                                >
                                    <MessageCircle className="h-5 w-5" />
                                    Contact Dealer (In-App)
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

            {/* Contact Modal */}
            <ContactModal
                isOpen={showContactModal}
                onClose={() => setShowContactModal(false)}
                recipientName={property.owner?.role === 'developer' && property.owner.company_name
                    ? property.owner.company_name
                    : property.owner?.name || "Property Owner"}
                propertyName={property.title}
                onSend={handleSendMessage}
            />
        </div>
    );
};

export default PropertyDetailsView;
