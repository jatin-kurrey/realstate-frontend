
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, ArrowLeft, Search } from 'lucide-react';

const NotFoundView: React.FC = () => {
    const navigate = useNavigate();

    return (
        <main className="min-h-screen bg-white flex items-center justify-center p-4">
            <div className="max-w-xl w-full text-center space-y-12">
                {/* 404 Graphic */}
                <div className="relative">
                    <h1 className="text-[180px] font-black text-gray-50 leading-none select-none">404</h1>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="h-40 w-40 bg-[#e2f2f0] rounded-[40px] flex items-center justify-center rotate-12 shadow-2xl shadow-[#40a28f]/10">
                            <Search className="h-16 w-16 text-[#40a28f] -rotate-12" />
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <h2 className="text-4xl font-black text-gray-800 uppercase tracking-tight">Lost in Rajnandgaon?</h2>
                    <p className="text-gray-500 font-medium text-lg">
                        The property or page you are looking for doesn't exist or has been moved to a new location.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-6">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-3 px-8 py-4 bg-gray-50 text-gray-600 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-gray-100 transition-all w-full sm:w-auto"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Go Back
                    </button>
                    <button
                        onClick={() => navigate('/')}
                        className="flex items-center gap-3 px-8 py-4 bg-[#40a28f] text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-[#358a7a] shadow-xl shadow-[#40a28f]/20 transition-all w-full sm:w-auto"
                    >
                        <Home className="h-4 w-4" />
                        Return Home
                    </button>
                </div>

                <div className="pt-12">
                    <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.3em]">RJG Property Connect &copy; {new Date().getFullYear()}</p>
                </div>
            </div>
        </main>
    );
};

export default NotFoundView;
