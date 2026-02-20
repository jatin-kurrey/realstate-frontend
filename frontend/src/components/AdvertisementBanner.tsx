import React, { useState, useEffect } from 'react';
import { ExternalLink, Building2, Home, TrendingUp, Phone } from 'lucide-react';

const AdvertisementBanner: React.FC = () => {
    const [currentSlide, setCurrentSlide] = useState(0);

    // Google Ad style format - headline, display URL, description
    const banners = [
        {
            id: 1,
            headline: "Post Your Property - Free Listing",
            displayUrl: "rjgproperties.com/post",
            description: "Reach thousands of buyers & tenants in Rajnandgaon. Quick approval, verified leads.",
            cta: "List Now",
            icon: <Building2 className="h-5 w-5" />,
            accent: "bg-[#40a28f]",
        },
        {
            id: 2,
            headline: "Verified Properties Available",
            displayUrl: "rjgproperties.com/verify",
            description: "Browse authenticated listings from trusted owners & brokers. Updated daily.",
            cta: "Explore",
            icon: <Home className="h-5 w-5" />,
            accent: "bg-slate-700",
        },
        {
            id: 3,
            headline: "Premium Investment Properties",
            displayUrl: "rjgproperties.com/invest",
            description: "High returns in prime Rajnandgaon locations. Commercial & residential.",
            cta: "View Deals",
            icon: <TrendingUp className="h-5 w-5" />,
            accent: "bg-amber-600",
        },
        {
            id: 4,
            headline: "Need Help? Contact Our Team",
            displayUrl: "rjgproperties.com/contact",
            description: "Expert assistance available 24/7 for all your property queries.",
            cta: "Get Help",
            icon: <Phone className="h-5 w-5" />,
            accent: "bg-blue-600",
        },
    ];

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % banners.length);
        }, 6000);
        return () => clearInterval(timer);
    }, [banners.length]);

    if (banners.length === 0) return null;

    const currentBanner = banners[currentSlide];

    return (
        <div className="w-full max-w-4xl mx-auto mt-8">
            {/* Google Ad Style Container */}
            <div className="relative bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden group hover:shadow-xl transition-shadow duration-300">
                
                {/* Ad Badge - Top Left */}
                <div className="absolute top-0 left-0 bg-gray-100 px-2 py-1 rounded-bl-lg z-10">
                    <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Ad</span>
                </div>

                {/* Main Ad Content */}
                <div className="p-4 sm:p-5 md:p-6">
                    <div className="flex items-start gap-4">
                        
                        {/* Icon Box */}
                        <div className={`flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 ${currentBanner.accent} rounded-lg flex items-center justify-center text-white`}>
                            {currentBanner.icon}
                        </div>

                        {/* Text Content */}
                        <div className="flex-1 min-w-0">
                            {/* Headline */}
                            <h3 className="text-base sm:text-lg md:text-xl font-semibold text-gray-800 leading-tight mb-1">
                                {currentBanner.headline}
                            </h3>

                            {/* Display URL */}
                            <div className="flex items-center gap-1 mb-1">
                                <span className="text-xs sm:text-sm text-[#40a28f] font-medium truncate">
                                    {currentBanner.displayUrl}
                                </span>
                                <ExternalLink className="h-3 w-3 text-[#40a28f] flex-shrink-0" />
                            </div>

                            {/* Description */}
                            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed line-clamp-2">
                                {currentBanner.description}
                            </p>
                        </div>

                        {/* CTA Button */}
                        <div className="flex-shrink-0">
                            <button className={`${currentBanner.accent} text-white px-4 sm:px-6 py-2 sm:py-2.5 rounded-md text-xs sm:text-sm font-semibold uppercase tracking-wide hover:opacity-90 transition-opacity whitespace-nowrap`}>
                                {currentBanner.cta}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Navigation Dots - Bottom */}
                <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-2 z-10">
                    {banners.map((_, index) => (
                        <button
                            key={index}
                            className={`h-1.5 rounded-full transition-all duration-300 ${
                                index === currentSlide 
                                    ? 'bg-[#40a28f] w-6' 
                                    : 'bg-gray-300 w-1.5 hover:bg-gray-400'
                            }`}
                            onClick={() => setCurrentSlide(index)}
                            aria-label={`Go to slide ${index + 1}`}
                        />
                    ))}
                </div>
            </div>

            {/* Advertiser Info */}
            <p className="text-[10px] text-gray-400 text-center mt-2 px-2">
                Advertisements • <span className="text-[#40a28f]">rjgpropertyconnect.com</span>
            </p>
        </div>
    );
};

export default AdvertisementBanner;
