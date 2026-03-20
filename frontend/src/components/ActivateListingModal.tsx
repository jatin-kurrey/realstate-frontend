
import React from 'react';
import { CheckCircle2, XCircle, ShieldCheck, Clock, Check } from 'lucide-react';

interface ActivateListingModalProps {
    isOpen: boolean;
    onClose: () => void;
    onActivate: () => void;
    propertyTitle: string;
}

const ActivateListingModal: React.FC<ActivateListingModalProps> = ({ isOpen, onClose, onActivate, propertyTitle }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-300"
                onClick={onClose}
            />

            <div className="relative w-full max-w-lg bg-white rounded-[48px] overflow-hidden shadow-2xl animate-in zoom-in-95 fade-in duration-300 border border-gray-100">
                {/* Header Section */}
                <div className="bg-[#40a28f] p-10 text-center space-y-4">
                    <div className="h-16 w-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto backdrop-blur-md">
                        <ShieldCheck className="h-8 w-8 text-white" />
                    </div>
                    <div className="space-y-1">
                        <h3 className="text-2xl font-black text-white uppercase tracking-tight">Activate Listing</h3>
                        <p className="text-[#e2f2f0] text-xs font-bold uppercase tracking-widest">{propertyTitle}</p>
                    </div>
                </div>

                {/* Content Section */}
                <div className="p-10 space-y-8">
                    <div className="space-y-6">
                        <div className="flex items-start gap-4">
                            <div className="mt-1 flex-shrink-0 h-6 w-6 rounded-full bg-[#e2f2f0] flex items-center justify-center">
                                <Check className="h-3.5 w-3.5 text-[#40a28f] stroke-[3]" />
                            </div>
                            <div>
                                <h4 className="text-sm font-black text-gray-800 uppercase tracking-tight">30-Day Visibility</h4>
                                <p className="text-xs font-semibold text-gray-500 leading-relaxed">Your property will be actively featured in Rajnandgaon's premium marketplace for a full month.</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="mt-1 flex-shrink-0 h-6 w-6 rounded-full bg-[#f3f1ee] flex items-center justify-center">
                                <Clock className="h-3.5 w-3.5 text-gray-400 stroke-[3]" />
                            </div>
                            <div>
                                <h4 className="text-sm font-black text-gray-800 uppercase tracking-tight">Renewal Control</h4>
                                <p className="text-xs font-semibold text-gray-500 leading-relaxed">Choose to renew or deactivate anytime. No forced subscriptions or hidden cancellation fees.</p>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-2 space-y-3">
                        <button
                            onClick={onActivate}
                            className="w-full bg-[#40a28f] text-white py-5 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-[#40a28f]/20 hover:bg-[#358a7a] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3"
                        >
                            <ShieldCheck className="h-4 w-4" />
                            Request Activation
                        </button>
                        <button
                            onClick={onClose}
                            className="w-full py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-gray-600 transition-all text-center"
                        >
                            Cancel & Keep as Draft
                        </button>
                    </div>
                </div>

                {/* Security Footer */}
                <div className="bg-gray-50/80 p-6 flex items-center justify-center gap-2 border-t border-gray-100">
                    <ShieldCheck className="h-3 w-3 text-gray-300" />
                    <span className="text-[8px] font-black text-gray-300 uppercase tracking-[0.3em]">Professional Grade • Secure Verification</span>
                </div>
            </div>
        </div>
    );
};

export default ActivateListingModal;
