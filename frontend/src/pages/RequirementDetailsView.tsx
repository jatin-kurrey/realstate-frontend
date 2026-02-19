
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { requirementService, bookmarkService } from '@/services/api';
import { Requirement } from '@/types/types';
import {
    MapPin,
    Ruler,
    Maximize,
    DollarSign,
    ClipboardList,
    CheckCircle,
    ArrowLeft,
    Share2,
    Heart,
    Calendar,
    ShieldCheck,
    MessageCircle,
    Clock,
    User,
    Info,
    Building2
} from 'lucide-react';
import LoginModal from '@/components/LoginModal';
import SignUpModal from '@/components/SignUpModal';
import ContactModal from '@/components/ContactModal';
import { useChat } from '@/contexts/ChatContext';

import { useAuth } from '@/contexts/AuthContext';

const RequirementDetailsView: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [requirement, setRequirement] = useState<Requirement | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isBookmarked, setIsBookmarked] = useState(false);
    const [showContactModal, setShowContactModal] = useState(false);
    const { createThread } = useChat();
    const { isAuthenticated, openLogin } = useAuth();

    const handleContactSeeker = async () => {
        if (!isAuthenticated) {
            openLogin();
            return;
        }
        if (!requirement || !requirement.user_id) return;
        setShowContactModal(true);
    };

    const handleSendMessage = async (message: string) => {
        if (!requirement || !requirement.user_id) return;
        try {
            const thread = await createThread(Number(requirement.user_id), undefined, message);
            navigate(`/messages/${thread.id}`);
        } catch (err) {
            console.error("Failed to initiate contact", err);
        }
    };

    useEffect(() => {
        const fetchRequirement = async () => {
            if (!id) return;
            try {
                setLoading(true);
                const data = await requirementService.getById(id);
                setRequirement(data);

                if (isAuthenticated) {
                    try {
                        const bookmarked = await bookmarkService.isBookmarked(id, 'requirement');
                        setIsBookmarked(bookmarked);
                    } catch (err) {
                        console.error("Failed to check bookmark status", err);
                    }
                }
            } catch (err) {
                console.error('Failed to fetch requirement details:', err);
                setError('Failed to load requirement details. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchRequirement();
    }, [id, isAuthenticated]);

    const handleToggleBookmark = async () => {
        if (!requirement) return;

        if (!isAuthenticated) {
            openLogin();
            return;
        }

        try {
            await bookmarkService.toggle(requirement.id, 'requirement');
            setIsBookmarked(!isBookmarked);
        } catch (err) {
            console.error('Failed to toggle bookmark:', err);
        }
    };

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: `Requirement for ${requirement?.type}`,
                    text: `Check out this property requirement in ${requirement?.location}`,
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
                <p className="mt-4 text-gray-400 font-bold uppercase tracking-widest text-sm">Loading Requirement...</p>
            </div>
        );
    }

    if (error || !requirement) {
        return (
            <div className="min-h-screen bg-[#fcfdfd] flex flex-col items-center justify-center p-4 text-center">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Requirement Not Found</h2>
                <p className="text-gray-500 mb-6">{error || "The requirement you're looking for doesn't exist or has been removed."}</p>
                <button
                    onClick={() => navigate('/requirements')}
                    className="px-6 py-3 bg-[#40a28f] text-white rounded-xl font-bold uppercase tracking-wide hover:bg-[#358a7a] transition-all"
                >
                    Back to Requirements
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
                            title="Share Requirement"
                        >
                            <Share2 className="h-5 w-5" />
                        </button>
                        <button
                            onClick={handleToggleBookmark}
                            className={`p-2.5 rounded-full hover:bg-gray-100 transition-colors ${isBookmarked ? 'text-red-500' : 'text-gray-500'}`}
                            title={isBookmarked ? "Remove from Watchlist" : "Add to Watchlist"}
                        >
                            <Heart className={`h-5 w-5 ${isBookmarked ? 'fill-current' : ''}`} />
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
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${requirement.purpose === 'Rent' ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-600'
                                            }`}>
                                            Looking to {requirement.purpose}
                                        </span>
                                        <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest">
                                            {requirement.type}
                                        </span>
                                    </div>
                                    <h1 className="text-3xl font-black text-gray-800 leading-tight">
                                        Requirement for {requirement.type}
                                    </h1>
                                    <div className="flex items-center gap-2 text-gray-500 mt-2">
                                        <MapPin className="h-4 w-4 text-[#40a28f]" />
                                        <span className="font-bold">{requirement.location}</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Budget Range</p>
                                    <p className="text-2xl font-black text-[#40a28f]">
                                        ₹{requirement.minBudget.toLocaleString()} - ₹{requirement.maxBudget.toLocaleString()}
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-gray-50">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Min Area</p>
                                    <div className="flex items-center gap-2 text-gray-800 font-bold">
                                        <Maximize className="h-4 w-4 text-[#40a28f]" />
                                        <span>{requirement.minArea}</span>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Max Area</p>
                                    <div className="flex items-center gap-2 text-gray-800 font-bold">
                                        <Maximize className="h-4 w-4 text-[#40a28f]" />
                                        <span>{requirement.maxArea}</span>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Posted On</p>
                                    <div className="flex items-center gap-2 text-gray-800 font-bold">
                                        <Calendar className="h-4 w-4 text-[#40a28f]" />
                                        <span>{requirement.created_at ? new Date(requirement.created_at).toLocaleDateString() : 'N/A'}</span>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</p>
                                    <div className="flex items-center gap-2 text-[#40a28f] font-bold">
                                        <ShieldCheck className="h-4 w-4" />
                                        <span>{requirement.is_verified ? 'Verified' : 'Active'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Detailed Description */}
                        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                            <h3 className="text-lg font-black text-gray-800 uppercase tracking-wide mb-6 flex items-center gap-2">
                                <ClipboardList className="h-5 w-5 text-[#40a28f]" />
                                Detailed Description
                            </h3>
                            <p className="text-gray-600 leading-relaxed whitespace-pre-line text-lg">
                                {requirement.description || "No additional description provided."}
                            </p>
                        </div>

                        {/* Contact Preferences */}
                        <div className="bg-[#40a28f]/5 rounded-3xl p-8 border border-[#40a28f]/10">
                            <h3 className="text-lg font-black text-[#40a28f] uppercase tracking-wide mb-4 flex items-center gap-2">
                                <Info className="h-5 w-5" />
                                Preference & Reach
                            </h3>
                            <div className="space-y-4">
                                <div className="flex items-start gap-4">
                                    <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center shrink-0 border border-[#40a28f]/10">
                                        <MessageCircle className="h-5 w-5 text-[#40a28f]" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-800 uppercase tracking-wider text-xs">Preferred Contact Method</p>
                                        <p className="text-gray-600 font-medium capitalize">{requirement.contactMethod}</p>
                                    </div>
                                </div>
                            </div>
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
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Requirement By</p>
                                    <h3 className="text-xl font-bold text-gray-800">
                                        {requirement.contact_name || requirement.user?.name || "Interested Buyer"}
                                    </h3>
                                    <p className="text-sm text-[#40a28f] font-medium flex items-center gap-1">
                                        <ShieldCheck className="h-3 w-3" /> Potential Client
                                    </p>
                                </div>
                            </div>



                            <button
                                onClick={handleContactSeeker}
                                className="w-full py-4 bg-[#40a28f] hover:bg-[#358a7a] text-white rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 transition-all shadow-xl shadow-[#40a28f]/20 active:scale-[0.98]"
                            >
                                <MessageCircle className="h-4 w-4" />
                                Contact Seeker (Chat)
                            </button>
                        </div>

                        <div className="mt-6 p-4 bg-amber-50 rounded-2xl border border-amber-100 flex gap-3">
                            <Info className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                            <p className="text-[10px] text-amber-700 font-bold leading-relaxed uppercase tracking-tight">
                                Safety Tip: Always verify property documents and avoid making upfront payments without legal verification.
                            </p>
                        </div>
                    </div>
                </div>
            </main>

            {/* Contact Modal */}
            <ContactModal
                isOpen={showContactModal}
                onClose={() => setShowContactModal(false)}
                recipientName={requirement.contact_name || requirement.user?.name || "Interested Buyer"}
                propertyName={`Requirement for ${requirement.type} in ${requirement.location}`}
                onSend={handleSendMessage}
            />
        </div>
    );
};

export default RequirementDetailsView;
