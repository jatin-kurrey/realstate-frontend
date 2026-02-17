

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Trash2, ArrowRight, Building2, MapPin } from 'lucide-react';
import { Property } from '@/types/types';

const MyListView: React.FC = () => {
    const navigate = useNavigate();
    const [shortlisted, setShortlisted] = useState<Property[]>([]);


    useEffect(() => {
        const saved = localStorage.getItem('shortlisted_properties');
        if (saved) {
            setShortlisted(JSON.parse(saved));
        }
    }, []);

    const removeFromList = (id: number | string) => {
        const updated = shortlisted.filter(p => p.id !== id);
        setShortlisted(updated);
        localStorage.setItem('shortlisted_properties', JSON.stringify(updated));
    };

    const handleViewDetails = (property: Property) => {
        navigate(`/properties/${property.id}`);
    };

    return (
        <main className="min-h-screen bg-[#fcfdfd] py-16 px-4">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-16">
                    <div className="space-y-3">
                        <div className="flex items-center gap-4">
                            <h1 className="text-4xl lg:text-5xl font-black text-gray-800 tracking-tighter uppercase leading-none">My Shortlist</h1>
                            <div className="px-4 py-1.5 bg-[#40a28f] text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-[#40a28f]/20">
                                {shortlisted.length} Saved
                            </div>
                        </div>
                        <p className="text-gray-400 font-bold uppercase tracking-[0.2em] text-[10px] ml-1">Your curated collection of potential properties</p>
                    </div>
                </div>

                {shortlisted.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {shortlisted.map((property) => (
                            <div key={property.id} className="group bg-white rounded-[40px] border border-gray-50 shadow-sm hover:shadow-2xl hover:shadow-gray-200/50 transition-all duration-500 overflow-hidden relative">
                                <div className="h-64 relative overflow-hidden">
                                    <img
                                        src={property.imageUrl}
                                        alt={property.title}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                    <div className="absolute top-6 left-6">
                                        <span className="px-5 py-2 bg-white/90 backdrop-blur-md rounded-2xl text-[10px] font-black uppercase tracking-widest text-[#40a28f] shadow-sm">
                                            {property.type}
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => removeFromList(property.id)}
                                        className="absolute top-6 right-6 p-4 bg-white/90 backdrop-blur-md rounded-2xl text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-sm"
                                    >
                                        <Trash2 className="h-5 w-5" />
                                    </button>
                                </div>

                                <div className="p-10 space-y-6">
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 text-[#40a28f]">
                                            <MapPin className="h-4 w-4" />
                                            <p className="text-[10px] font-black uppercase tracking-widest">{property.location}</p>
                                        </div>
                                        <h3 className="text-xl font-black text-gray-800 tracking-tight leading-snug group-hover:text-[#40a28f] transition-colors">
                                            {property.title}
                                        </h3>
                                    </div>

                                    <div className="flex items-center justify-between pt-6 border-t border-gray-50">
                                        <p className="text-2xl font-black text-gray-800">
                                            ₹{property.price.toLocaleString()}
                                        </p>
                                        <button
                                            onClick={() => handleViewDetails(property)}
                                            className="p-4 bg-gray-50 text-gray-400 hover:bg-[#40a28f] hover:text-white rounded-2xl transition-all group/btn"
                                        >
                                            <ArrowRight className="h-5 w-5 group-hover/btn:translate-x-1 transition-transform" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="py-32 text-center bg-gray-50/50 rounded-[48px] border-2 border-dashed border-gray-100 flex flex-col items-center gap-8">
                        <div className="w-24 h-24 bg-white rounded-[32px] flex items-center justify-center shadow-sm text-gray-200">
                            <Heart className="h-10 w-10" />
                        </div>
                        <div className="space-y-3">
                            <h3 className="text-2xl font-black text-gray-800 tracking-tight uppercase">Your list is silent</h3>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Start exploring properties to build your curated collection</p>
                        </div>
                        <button
                            onClick={() => window.location.href = '/'}
                            className="px-10 py-5 bg-[#40a28f] text-white rounded-[24px] text-[10px] font-black uppercase tracking-widest shadow-xl shadow-[#40a28f]/20 hover:scale-[1.05] transition-all"
                        >
                            Browse Properties
                        </button>
                    </div>
                )}
            </div>
        </main>
    );
};

export default MyListView;
