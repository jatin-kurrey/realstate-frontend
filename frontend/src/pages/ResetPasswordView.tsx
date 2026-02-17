
import React, { useState } from 'react';
import { ShieldCheck, Lock, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';

const ResetPasswordView: React.FC = () => {
    const [step, setStep] = useState<'request' | 'success'>('request');
    const [loading, setLoading] = useState(false);
    const [passwords, setPasswords] = useState({ new: '', confirm: '' });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        // Simulate API call
        setTimeout(() => {
            setLoading(false);
            setStep('success');
        }, 2000);
    };

    if (step === 'success') {
        return (
            <main className="min-h-screen bg-white flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-white rounded-[48px] p-12 shadow-2xl shadow-gray-200/50 border border-gray-50 text-center space-y-8">
                    <div className="h-24 w-24 bg-[#e2f2f0] rounded-[32px] flex items-center justify-center text-[#40a28f] mx-auto">
                        <CheckCircle2 className="h-12 w-12" />
                    </div>
                    <div className="space-y-3">
                        <h2 className="text-3xl font-black text-gray-800 uppercase tracking-tight">Access Restored</h2>
                        <p className="text-sm font-medium text-gray-500">Your password has been reset successfully. You can now log in with your new credentials.</p>
                    </div>
                    <button
                        onClick={() => window.location.href = '/'}
                        className="w-full bg-[#40a28f] text-white py-5 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-[#40a28f]/20 hover:scale-[1.02] transition-all"
                    >
                        Go to Login
                    </button>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-[48px] p-10 md:p-14 shadow-2xl shadow-gray-200/50 border border-gray-50 space-y-10">
                <div className="space-y-4 text-center">
                    <div className="h-20 w-20 bg-[#e2f2f0] rounded-[32px] flex items-center justify-center text-[#40a28f] mx-auto">
                        <ShieldCheck className="h-10 w-10" />
                    </div>
                    <div className="space-y-1">
                        <h1 className="text-3xl font-black text-gray-800 uppercase tracking-tight leading-none">Reset Password</h1>
                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest pt-2">Secure your account access</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">New Password</label>
                            <div className="relative">
                                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300" />
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 pl-14 pr-6 focus:outline-none focus:border-[#40a28f] focus:ring-4 focus:ring-[#40a28f]/5 transition-all text-sm font-bold text-gray-800"
                                    value={passwords.new}
                                    onChange={e => setPasswords({ ...passwords, new: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Confirm New Password</label>
                            <div className="relative">
                                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300" />
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 pl-14 pr-6 focus:outline-none focus:border-[#40a28f] focus:ring-4 focus:ring-[#40a28f]/5 transition-all text-sm font-bold text-gray-800"
                                    value={passwords.confirm}
                                    onChange={e => setPasswords({ ...passwords, confirm: e.target.value })}
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-[#40a28f] text-white py-5 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 shadow-2xl shadow-[#40a28f]/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                    >
                        {loading ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                            <>
                                Update Password
                                <ArrowRight className="h-4 w-4" />
                            </>
                        )}
                    </button>
                </form>

                <div className="text-center">
                    <button
                        onClick={() => window.location.href = '/'}
                        className="text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-[#40a28f] transition-all"
                    >
                        Return to Main Site
                    </button>
                </div>
            </div>
        </main>
    );
};

export default ResetPasswordView;
