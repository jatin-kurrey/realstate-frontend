import React, { useState, useEffect } from 'react';
import { ExternalLink, Building2, Home, TrendingUp, Phone, ArrowRight, Image as ImageIcon } from 'lucide-react';
import { advertisementService } from '../services/api';
import { Advertisement } from '../types/types';

interface AdvertisementBannerProps {
    mode?: 'property' | 'requirement' | 'mortgage' | 'auction';
}

const AdvertisementBanner: React.FC<AdvertisementBannerProps> = ({ mode = 'property' }) => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [banners, setBanners] = useState<Advertisement[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAds = async () => {
            try {
                const activeAds = await advertisementService.getActiveAds();
                setBanners(activeAds);
            } catch (error) {
                console.error('Failed to fetch advertisements', error);
            } finally {
                setLoading(false);
            }
        };
        fetchAds();
    }, []);

    useEffect(() => {
        if (banners.length <= 1) return;
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % banners.length);
        }, 6000);
        return () => clearInterval(timer);
    }, [banners.length]);

    if (loading) return null;
    if (banners.length === 0) return null;

    const currentBanner = banners[currentSlide];

    return (
        <div className="w-full max-w-7xl mx-auto mt-8 sm:mt-12 px-4 mb-10">
            <div className="relative w-full h-[360px] sm:h-[420px] md:h-[480px] rounded-3xl overflow-hidden shadow-2xl group">
                {/* Background Image with Overlay */}
                <div className="absolute inset-0">
                    <img
                        src={currentBanner.imageUrl}
                        alt={currentBanner.headline}
                        className="w-full h-full object-cover transition-transform duration-[6000ms] group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-transparent"></div>
                </div>

                {/* Ad Badge */}
                <div className="absolute top-4 left-4 sm:top-6 sm:left-6 bg-white/20 backdrop-blur-md px-3 py-1 rounded-lg border border-white/30 z-20">
                    <span className="text-[10px] sm:text-xs font-black text-white uppercase tracking-widest leading-none">Sponsored</span>
                </div>

                {/* Content Container */}
                <div className="absolute inset-0 z-10 flex flex-col justify-center p-6 sm:p-10 md:p-16 w-full lg:w-3/4">
                    <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-6 sm:p-8 rounded-[2rem] shadow-2xl transform transition-transform duration-500 max-w-xl border-l-[6px] border-l-[#40a28f]">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-5">
                            <div className={`flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center text-white shadow-lg ${currentBanner.accent || 'bg-[#40a28f]'}`}>
                                <ImageIcon className="h-5 w-5 sm:h-6 sm:w-6" />
                            </div>
                            <div className="inline-flex items-center gap-2 bg-black/30 backdrop-blur-md px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl border border-white/10 text-white shadow-inner max-w-fit">
                                <span className="text-[10px] sm:text-xs font-bold tracking-wide">
                                    {currentBanner.displayUrl}
                                </span>
                                <ExternalLink className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-gray-300" />
                            </div>
                        </div>

                        <h3 className="text-2xl sm:text-3xl md:text-4xl font-black text-white leading-tight mb-3 tracking-tight drop-shadow-md">
                            {currentBanner.headline}
                        </h3>

                        <p className="text-sm sm:text-base text-gray-200 leading-relaxed mb-6 sm:mb-8 font-medium max-w-[90%] drop-shadow">
                            {currentBanner.description}
                        </p>

                        <button className={`inline-flex items-center gap-2 ${currentBanner.accent || 'bg-[#40a28f]'} text-white px-6 py-3 sm:px-8 sm:py-4 rounded-xl text-xs sm:text-sm font-black uppercase tracking-widest hover:brightness-110 transition-all shadow-lg shadow-black/20 active:scale-95 group/btn`}>
                            {currentBanner.cta}
                            <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 group-hover/btn:translate-x-1.5 transition-transform" />
                        </button>
                    </div>
                </div>

                {/* Navigation Dots */}
                <div className="absolute bottom-4 sm:bottom-6 left-0 right-0 flex justify-center gap-2 sm:gap-3 z-30">
                    {banners.map((_, index) => (
                        <button
                            key={index}
                            className={`h-1.5 sm:h-2 rounded-full transition-all duration-300 ${index === currentSlide
                                ? 'bg-white w-8 sm:w-10'
                                : 'bg-white/40 w-2 sm:w-2 hover:bg-white/60'
                                }`}
                            onClick={() => setCurrentSlide(index)}
                            aria-label={`Go to slide ${index + 1}`}
                        />
                    ))}
                </div>
            </div>

            <p className="text-[9px] sm:text-[10px] text-gray-400 text-center mt-3 sm:mt-4 font-bold uppercase tracking-widest">
                Advertisement • <span className="text-[#40a28f]">rjgpropertyconnect.com</span>
            </p>
        </div>
    );
};

export default AdvertisementBanner;
