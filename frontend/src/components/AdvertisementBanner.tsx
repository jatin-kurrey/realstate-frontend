import React, { useState, useEffect } from 'react';

const AdvertisementBanner: React.FC = () => {
    const [currentSlide, setCurrentSlide] = useState(0);
    // Mock data - in real app fetch from API
    const banners = [
        { id: 1, content: "Ad Space 1 - Contact Admin for Advertisement", color: "bg-indigo-600" },
        { id: 2, content: "Ad Space 2 - Prime Properties Available", color: "bg-rose-600" },
        { id: 3, content: "Ad Space 3 - Best Investment Deals", color: "bg-amber-600" },
    ];

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % banners.length);
        }, 4000);
        return () => clearInterval(timer);
    }, []);

    if (banners.length === 0) return null;

    return (
        <div className="w-full max-w-5xl mx-auto mt-10 overflow-hidden rounded-2xl shadow-2xl relative h-32 md:h-40 border-4 border-white/20">
            {banners.map((banner, index) => (
                <div
                    key={banner.id}
                    className={`absolute inset-0 transition-all duration-1000 ease-in-out flex items-center justify-center text-white text-xl md:text-2xl font-black uppercase tracking-widest ${banner.color} ${index === currentSlide ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
                        }`}
                >
                    {banner.content}
                </div>
            ))}

            {/* Indicators */}
            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-10">
                {banners.map((_, index) => (
                    <button
                        key={index}
                        className={`h-2 rounded-full transition-all duration-300 ${index === currentSlide ? 'bg-white w-8' : 'bg-white/40 w-2 hover:bg-white/60'}`}
                        onClick={() => setCurrentSlide(index)}
                        aria-label={`Go to slide ${index + 1}`}
                    />
                ))}
            </div>
        </div>
    );
};

export default AdvertisementBanner;
