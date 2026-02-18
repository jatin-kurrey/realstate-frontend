
import React, { useState } from 'react';
import { Lock, Building2, ShieldCheck, LogIn, AlertTriangle, User } from 'lucide-react';

interface AdminLoginProps {
    onLogin: (email: string, password: string) => void;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ onLogin }) => {
    const [email, setEmail] = useState('admin@rjg.com');
    const [password, setPassword] = useState('');
    const [error] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onLogin(email, password);
    };

    return (
        <div className="min-h-screen bg-[#fcfdfd] flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#40a28f]/5 rounded-full blur-[120px] -mr-64 -mt-64" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px] -ml-64 -mb-64" />

            <div className="relative z-10 w-full max-w-lg">
                <div className="bg-white rounded-[48px] shadow-2xl shadow-gray-200/50 border border-gray-100 p-10 md:p-14 space-y-10 animate-in fade-in zoom-in-95 duration-700">
                    <div className="text-center space-y-4">
                        <div className="w-24 h-24 bg-[#e2f2f0] rounded-[32px] flex items-center justify-center text-[#40a28f] mx-auto rotate-3 shadow-xl shadow-[#40a28f]/10">
                            <ShieldCheck className="h-12 w-12" />
                        </div>
                        <div className="space-y-1">
                            <h1 className="text-4xl font-black text-gray-900 tracking-tight uppercase">Admin Access</h1>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em]">Secure Gateway • Control Center</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2 flex items-center gap-2">
                                    <User className="h-3 w-3" /> Administrative Email
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="admin@rjgproperty.com"
                                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-5 px-8 focus:outline-none focus:border-[#40a28f] focus:ring-4 focus:ring-[#40a28f]/5 transition-all text-sm font-bold text-gray-800"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2 flex items-center gap-2">
                                    <Lock className="h-3 w-3" /> Master Password
                                </label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-5 px-8 focus:outline-none focus:border-[#40a28f] focus:ring-4 focus:ring-[#40a28f]/5 transition-all text-sm font-bold text-gray-800"
                                    required
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="p-4 bg-red-50 rounded-2xl border border-red-100 flex items-center gap-3 animate-in slide-in-from-top-2">
                                <AlertTriangle className="h-4 w-4 text-red-500" />
                                <p className="text-xs font-bold text-red-600">Authorization failed. Please check credentials.</p>
                            </div>
                        )}

                        <button
                            type="submit"
                            className="w-full bg-[#40a28f] text-white py-5 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 shadow-2xl shadow-[#40a28f]/30 hover:bg-[#358a7a] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
                        >
                            Verify Identity & Enter
                            <LogIn className="h-4 w-4" />
                        </button>
                    </form>

                    <div className="text-center pt-2">
                        <button
                            onClick={() => window.location.href = '/'}
                            className="text-[10px] font-black text-gray-300 uppercase tracking-widest hover:text-[#40a28f] transition-colors flex items-center justify-center gap-2 mx-auto"
                        >
                            ← Back to Main Website
                        </button>
                    </div>
                </div>

                <p className="text-center mt-10 text-[9px] font-bold text-gray-300 uppercase tracking-[0.5em] opacity-50">
                    Encrypted Connection • Rajnandgaon Property Network
                </p>
                <div className="mt-4 text-center">
                    <p className="text-[10px] text-gray-400 font-mono bg-gray-50 inline-block px-3 py-1 rounded-full border border-gray-100">
                        CREDENTIALS: admin@rjg.com / admin123
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;
