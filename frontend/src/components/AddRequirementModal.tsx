import React, { useState } from 'react';
import { X, Loader2, ChevronRight, ChevronLeft, MapPin, IndianRupee, Home, ClipboardList, ChevronDown, CheckCircle2 } from 'lucide-react';
import { requirementService } from '../services/api';

interface AddRequirementModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

const AddRequirementModal: React.FC<AddRequirementModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isSuccess, setIsSuccess] = useState(false);

    const [formData, setFormData] = useState({
        purpose: 'Buy',
        type: 'Residential',
        minBudget: '',
        maxBudget: '',
        location: '',
        minArea: '',
        maxArea: '',
        description: '',
        contactMethod: 'In-app Messaging',
    });

    if (!isOpen) return null;

    const nextStep = () => {
        // Simple validation
        if (step === 1 && (!formData.purpose || !formData.type)) return;
        if (step === 2 && (!formData.minBudget || !formData.maxBudget)) return;
        if (step === 3 && !formData.location) return;

        setStep(prev => Math.min(prev + 1, 4));
    };
    const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

    const handleSubmit = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            setError('Please login to post a requirement');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            await requirementService.create({
                purpose: formData.purpose as any,
                type: formData.type as any,
                minBudget: Number(formData.minBudget),
                maxBudget: Number(formData.maxBudget),
                location: formData.location,
                minArea: Number(formData.minArea),
                maxArea: Number(formData.maxArea),
                description: formData.description,
                contactMethod: formData.contactMethod,
            });
            setIsSuccess(true);
            if (onSuccess) onSuccess();
            setTimeout(() => {
                onClose();
                setStep(1);
                setIsSuccess(false);
                setFormData({
                    purpose: 'Buy',
                    type: 'Residential',
                    minBudget: '',
                    maxBudget: '',
                    location: '',
                    minArea: '',
                    maxArea: '',
                    description: '',
                    contactMethod: 'In-app Messaging',
                });
            }, 2000);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to post requirement');
        } finally {
            setLoading(false);
        }
    };

    const steps = [
        { id: 1, label: 'Basics' },
        { id: 2, label: 'Budget' },
        { id: 3, label: 'Location' },
        { id: 4, label: 'Details' },
    ];

    const renderStep = () => {
        if (isSuccess) {
            return (
                <div className="flex flex-col items-center justify-center py-12 space-y-6 text-center animate-in zoom-in-95 duration-500">
                    <div className="w-20 h-20 bg-emerald-50 rounded-[30px] flex items-center justify-center">
                        <CheckCircle2 className="h-10 w-10 text-emerald-500" />
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-2xl font-black text-gray-800 tracking-tight uppercase">Successfully Posted</h3>
                        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Your requirement is pending admin approval</p>
                    </div>
                </div>
            );
        }

        switch (step) {
            case 1:
                return (
                    <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">What is your goal?</label>
                                <div className="grid grid-cols-2 gap-4">
                                    {['Buy', 'Rent'].map(p => (
                                        <button
                                            key={p}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, purpose: p })}
                                            className={`p-5 rounded-[24px] border-2 transition-all flex items-center justify-between group ${formData.purpose === p ? 'bg-[#e2f2f0] border-[#40a28f] text-[#40a28f]' : 'bg-white border-gray-100 text-gray-400 hover:border-gray-200'}`}
                                        >
                                            <span className="text-xs font-black uppercase tracking-widest">{p} Protocol</span>
                                            <div className={`w-2 h-2 rounded-full transition-all ${formData.purpose === p ? 'bg-[#40a28f] scale-125' : 'bg-gray-100'}`} />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Property Category</label>
                                <div className="grid grid-cols-3 gap-3">
                                    {['Residential', 'Commercial', 'Land'].map(t => (
                                        <button
                                            key={t}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, type: t })}
                                            className={`p-5 rounded-[24px] border-2 transition-all flex flex-col items-center gap-3 ${formData.type === t ? 'bg-[#e2f2f0] border-[#40a28f] text-[#40a28f]' : 'bg-white border-gray-100 text-gray-400 hover:border-gray-200'}`}
                                        >
                                            <div className={`p-2 rounded-xl ${formData.type === t ? 'bg-[#40a28f] text-white' : 'bg-gray-50'}`}>
                                                <Home className="h-5 w-5" />
                                            </div>
                                            <span className="text-[9px] font-black uppercase tracking-tight">{t}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case 2:
                return (
                    <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                        <div className="space-y-6">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Budget Range (₹)</label>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="relative group">
                                        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-400">₹</div>
                                        <input
                                            type="number"
                                            placeholder="Minimum"
                                            value={formData.minBudget}
                                            onChange={(e) => setFormData({ ...formData, minBudget: e.target.value })}
                                            className="w-full bg-white border-2 border-gray-100 rounded-[20px] py-4 px-6 pl-10 focus:outline-none focus:ring-8 focus:ring-[#40a28f]/5 focus:border-[#40a28f] text-sm font-bold text-gray-600 transition-all shadow-sm"
                                        />
                                    </div>
                                    <div className="relative group">
                                        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-400">₹</div>
                                        <input
                                            type="number"
                                            placeholder="Maximum"
                                            value={formData.maxBudget}
                                            onChange={(e) => setFormData({ ...formData, maxBudget: e.target.value })}
                                            className="w-full bg-white border-2 border-gray-100 rounded-[20px] py-4 px-6 pl-10 focus:outline-none focus:ring-8 focus:ring-[#40a28f]/5 focus:border-[#40a28f] text-sm font-bold text-gray-600 transition-all shadow-sm"
                                        />
                                    </div>
                                </div>
                                <div className="p-4 bg-orange-50/50 rounded-2xl border border-orange-100/50 flex gap-3">
                                    <IndianRupee className="h-4 w-4 text-orange-400 shrink-0" />
                                    <p className="text-[9px] font-black text-orange-500 uppercase tracking-widest leading-relaxed">Ensure your budget aligns with current market rates in Rajnandgaon for best results.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case 3:
                return (
                    <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Localities / Areas</label>
                                <div className="relative group">
                                    <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-300 group-focus-within:text-[#40a28f] transition-colors" />
                                    <input
                                        type="text"
                                        placeholder="e.g. Sadar Bazaar, Civil Lines, Motipur"
                                        value={formData.location}
                                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                        className="w-full bg-white border-2 border-gray-100 rounded-[20px] py-4 px-6 pl-14 focus:outline-none focus:ring-8 focus:ring-[#40a28f]/5 focus:border-[#40a28f] text-sm font-bold text-gray-600 transition-all shadow-sm"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Required Size (Sq Ft)</label>
                                <div className="grid grid-cols-2 gap-4">
                                    <input
                                        type="number"
                                        placeholder="Min Area"
                                        value={formData.minArea}
                                        onChange={(e) => setFormData({ ...formData, minArea: e.target.value })}
                                        className="w-full bg-white border-2 border-gray-100 rounded-[20px] py-4 px-6 focus:outline-none focus:ring-8 focus:ring-[#40a28f]/5 focus:border-[#40a28f] text-sm font-bold text-gray-600 transition-all shadow-sm"
                                    />
                                    <input
                                        type="number"
                                        placeholder="Max Area"
                                        value={formData.maxArea}
                                        onChange={(e) => setFormData({ ...formData, maxArea: e.target.value })}
                                        className="w-full bg-white border-2 border-gray-100 rounded-[20px] py-4 px-6 focus:outline-none focus:ring-8 focus:ring-[#40a28f]/5 focus:border-[#40a28f] text-sm font-bold text-gray-600 transition-all shadow-sm"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case 4:
                return (
                    <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Specific Requirements</label>
                                <textarea
                                    rows={5}
                                    placeholder="Mention specific amenities, floor preference, or vastu requirements..."
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full bg-white border-2 border-gray-100 rounded-[24px] py-5 px-6 focus:outline-none focus:ring-8 focus:ring-[#40a28f]/5 focus:border-[#40a28f] text-sm font-bold text-gray-600 transition-all shadow-sm resize-none"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Contact Preference</label>
                                <div className="relative">
                                    <select
                                        value={formData.contactMethod}
                                        onChange={(e) => setFormData({ ...formData, contactMethod: e.target.value })}
                                        className="w-full bg-white border-2 border-gray-100 rounded-[20px] py-4 px-6 appearance-none focus:outline-none focus:ring-8 focus:ring-[#40a28f]/5 focus:border-[#40a28f] text-sm font-bold text-gray-600 cursor-pointer shadow-sm"
                                    >
                                        <option value="In-app Messaging">In-app Messaging</option>
                                        <option value="Direct Call">Direct Call</option>
                                        <option value="WhatsApp">WhatsApp Community</option>
                                        <option value="Email">Official Email</option>
                                    </select>
                                    <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-300 pointer-events-none" />
                                </div>
                            </div>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={onClose} />

            <div className="relative bg-white rounded-[48px] w-full max-w-2xl overflow-hidden shadow-[0_32px_128px_-16px_rgba(0,0,0,0.3)] flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="p-10 pb-6">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <span className="text-[10px] font-black text-[#40a28f] uppercase tracking-[0.3em] block mb-1">RJG Property Network</span>
                            <h2 className="text-3xl font-black text-gray-800 tracking-tight uppercase">Post Requirement</h2>
                        </div>
                        <button onClick={onClose} className="p-3 bg-gray-50 hover:bg-gray-100 rounded-[20px] transition-all group">
                            <X className="h-6 w-6 text-gray-400 group-hover:rotate-90 transition-transform" />
                        </button>
                    </div>

                    {/* Step Breadcrumbs */}
                    {!isSuccess && (
                        <div className="flex items-center justify-center gap-4 text-[11px] font-black uppercase tracking-widest pb-4">
                            {steps.map((s, idx) => (
                                <React.Fragment key={s.id}>
                                    <div className={`flex items-center gap-2 transition-all ${step === s.id ? 'text-[#40a28f] scale-105' : step > s.id ? 'text-gray-800' : 'text-gray-200'}`}>
                                        <span className={`w-5 h-5 rounded-lg flex items-center justify-center text-[9px] ${step === s.id ? 'bg-[#40a28f] text-white' : step > s.id ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-400'}`}>
                                            {s.id}
                                        </span>
                                        {s.label}
                                    </div>
                                    {idx < steps.length - 1 && <ChevronRight className="h-3 w-3 text-gray-200" />}
                                </React.Fragment>
                            ))}
                        </div>
                    )}
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto px-10 pb-10">
                    {error && (
                        <div className="bg-red-50 text-red-500 p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-center mb-8 border border-red-100 shadow-sm animate-bounce">
                            {error}
                        </div>
                    )}
                    {renderStep()}
                </div>

                {/* Footer */}
                <div className="p-10 pt-6 border-t border-gray-50 flex items-center justify-between bg-gray-50/50">
                    {!isSuccess ? (
                        <>
                            <button
                                type="button"
                                onClick={prevStep}
                                className={`flex items-center gap-2 px-8 py-4 rounded-[20px] font-black uppercase tracking-widest text-[10px] transition-all ${step === 1 ? 'opacity-0 pointer-events-none' : 'text-gray-400 hover:bg-white hover:text-gray-600 shadow-sm'}`}
                            >
                                <ChevronLeft className="h-4 w-4" />
                                Previous Step
                            </button>

                            {step < 4 ? (
                                <button
                                    onClick={nextStep}
                                    className="bg-[#40a28f] text-white px-10 py-4 rounded-[20px] font-black uppercase tracking-widest text-[10px] flex items-center gap-3 hover:bg-[#358a7a] transition-all shadow-xl shadow-[#40a28f]/20 active:scale-95 group"
                                >
                                    Proceed Next
                                    <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                </button>
                            ) : (
                                <button
                                    onClick={handleSubmit}
                                    disabled={loading}
                                    className="bg-gray-800 text-white px-12 py-4 rounded-[20px] font-black uppercase tracking-widest text-[10px] flex items-center gap-3 hover:bg-black transition-all shadow-xl shadow-black/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : (
                                        <>
                                            Submit Requirement
                                            <ClipboardList className="h-4 w-4" />
                                        </>
                                    )}
                                </button>
                            )}
                        </>
                    ) : (
                        <button
                            onClick={onClose}
                            className="w-full bg-[#40a28f] text-white py-4 rounded-[20px] font-black uppercase tracking-widest text-[10px] active:scale-[0.98] transition-all shadow-xl shadow-[#40a28f]/20"
                        >
                            Return to Requirements
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AddRequirementModal;
