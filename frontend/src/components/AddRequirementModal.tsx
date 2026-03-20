import React, { useState } from 'react';
import { X, Loader2, ChevronRight, ChevronLeft, MapPin, IndianRupee, Home, ClipboardList, ChevronDown, CheckCircle2 } from 'lucide-react';
import { requirementService, locationService } from '../services/api';
import { Requirement, LocationMetadata } from '../types/types';

interface AddRequirementModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
    requirement?: Requirement | null;
    defaultPurpose?: string;
}

const AddRequirementModal: React.FC<AddRequirementModalProps> = ({ isOpen, onClose, onSuccess, requirement, defaultPurpose }) => {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isSuccess, setIsSuccess] = useState(false);
    const [locations, setLocations] = useState<LocationMetadata[]>([]);
    const [locationLoading, setLocationLoading] = useState(false);

    React.useEffect(() => {
        const fetchLocations = async () => {
            setLocationLoading(true);
            try {
                const data = await locationService.getAll();
                setLocations(data);
            } catch (err) {
                console.error('Failed to fetch locations:', err);
            } finally {
                setLocationLoading(false);
            }
        };
        if (isOpen) fetchLocations();
    }, [isOpen]);

    const [formData, setFormData] = useState({
        purpose: requirement?.purpose || defaultPurpose || 'Buy',
        type: requirement?.type || 'Residential',
        minBudget: requirement?.minBudget?.toString() || '',
        maxBudget: requirement?.maxBudget?.toString() || '',
        location: requirement?.location || '',
        street_name: requirement?.street_name || '',
        village: requirement?.village || '',
        revenue_inspector_circle: requirement?.revenue_inspector_circle || '',
        tehsil: requirement?.tehsil || '',
        district: requirement?.district || '',
        landmark: requirement?.landmark || '',
        land_use: requirement?.land_use || 'Residential',
        minArea: requirement?.minArea?.toString() || '',
        maxArea: requirement?.maxArea?.toString() || '',
        area_unit: requirement?.area_unit || 'sqft',
        expected_rate: requirement?.expected_rate || '',
        description: requirement?.description || '',
        contactMethod: requirement?.contactMethod || 'In-app Messaging',
        contact_name: requirement?.contact_name || '',
        contact_phone: requirement?.contact_phone || '',
    });

    // Reset form when requirement or open state changes
    React.useEffect(() => {
        if (requirement) {
            setFormData({
                purpose: requirement.purpose,
                type: requirement.type,
                minBudget: requirement.minBudget.toString(),
                maxBudget: requirement.maxBudget.toString(),
                location: requirement.location,
                street_name: requirement.street_name || '',
                village: requirement.village || '',
                revenue_inspector_circle: requirement.revenue_inspector_circle || '',
                tehsil: requirement.tehsil || '',
                district: requirement.district || '',
                landmark: requirement.landmark || '',
                land_use: requirement.land_use || 'Residential',
                minArea: requirement.minArea.toString(),
                maxArea: requirement.maxArea.toString(),
                area_unit: requirement.area_unit,
                expected_rate: requirement.expected_rate || '',
                description: requirement.description,
                contactMethod: requirement.contactMethod,
                contact_name: requirement.contact_name || '',
                contact_phone: requirement.contact_phone || '',
            });
        } else if (isOpen) {
            setFormData({
                purpose: defaultPurpose || 'Buy',
                type: 'Residential',
                minBudget: '',
                maxBudget: '',
                location: '',
                street_name: '',
                village: '',
                revenue_inspector_circle: '',
                tehsil: '',
                district: '',
                landmark: '',
                land_use: 'Residential',
                minArea: '',
                maxArea: '',
                area_unit: 'sqft',
                expected_rate: '',
                description: '',
                contactMethod: 'In-app Messaging',
                contact_name: '',
                contact_phone: '',
            });
            setStep(1);
        }
    }, [requirement, isOpen, defaultPurpose]);

    if (!isOpen) return null;

    const nextStep = () => {
        // Simple validation
        if (step === 1 && (!formData.purpose || !formData.type)) return;
        if (step === 2 && (!formData.minBudget || !formData.maxBudget)) return;
        if (step === 3 && !formData.village) return;

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
            const data = {
                purpose: formData.purpose as any,
                type: formData.type as any,
                minBudget: Number(formData.minBudget),
                maxBudget: Number(formData.maxBudget),
                location: `${formData.village}${formData.tehsil ? ', ' + formData.tehsil : ''}${formData.district ? ', ' + formData.district : ''}`,
                street_name: formData.street_name,
                village: formData.village,
                revenue_inspector_circle: formData.revenue_inspector_circle,
                tehsil: formData.tehsil,
                district: formData.district,
                landmark: formData.landmark,
                land_use: formData.land_use as any,
                minArea: Number(formData.minArea),
                maxArea: Number(formData.maxArea),
                area_unit: formData.area_unit as any,
                expected_rate: formData.expected_rate,
                description: formData.description,
                contactMethod: formData.contactMethod as any,
                contact_name: formData.contact_name,
                contact_phone: formData.contact_phone,
            };

            if (requirement) {
                await requirementService.update(requirement.id, data);
            } else {
                await requirementService.create(data);
            }
            
            setIsSuccess(true);
            if (onSuccess) onSuccess();
            setTimeout(() => {
                onClose();
                setStep(1);
                setIsSuccess(false);
                if (!requirement) {
                    setFormData({
                        purpose: 'Buy',
                        type: 'Residential',
                        minBudget: '',
                        maxBudget: '',
                        location: '',
                        street_name: '',
                        village: '',
                        revenue_inspector_circle: '',
                        tehsil: '',
                        district: '',
                        landmark: '',
                        land_use: 'Residential',
                        minArea: '',
                        maxArea: '',
                        area_unit: 'sqft',
                        expected_rate: '',
                        description: '',
                        contactMethod: 'In-app Messaging',
                        contact_name: '',
                        contact_phone: '',
                    });
                }
            }, 2000);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to process requirement');
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
                                    {['Buy', 'Rent', 'Mortgage'].map(p => (
                                        <button
                                            key={p}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, purpose: p as any })}
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
                                    {['Residential', 'Commercial', 'Plots'].map(t => (
                                        <button
                                            key={t}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, type: t as any })}
                                            className={`p-5 rounded-[24px] border-2 transition-all flex flex-col items-center gap-3 ${formData.type === t ? 'bg-[#e2f2f0] border-[#40a28f] text-[#40a28f]' : 'bg-white border-gray-100 text-gray-400 hover:border-gray-200'}`}
                                        >
                                            <div className={`p-2 rounded-xl ${formData.type === t ? 'bg-[#40a28f] text-white' : 'bg-gray-50'}`}>
                                                <Home className="h-5 w-5" />
                                            </div>
                                            <span className="text-[9px] font-black uppercase tracking-tight">{t === 'Plots' ? 'Plot / Open Land' : t}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Land Use Preference</label>
                                <div className="relative">
                                    <select
                                        value={formData.land_use}
                                        onChange={(e) => setFormData({ ...formData, land_use: e.target.value })}
                                        className="w-full bg-white border-2 border-gray-100 rounded-[20px] py-4 px-6 appearance-none focus:outline-none focus:ring-8 focus:ring-[#40a28f]/5 focus:border-[#40a28f] text-sm font-bold text-gray-600 cursor-pointer shadow-sm"
                                    >
                                        <option value="Residential">Residential</option>
                                        <option value="Commercial">Commercial</option>
                                        <option value="Commercial Cum Residential">Commercial Cum Residential</option>
                                        <option value="Agriculture">Agriculture</option>
                                    </select>
                                    <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-300 pointer-events-none" />
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case 2:
                return (
                    <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                        <div className="space-y-6">
                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                                    {formData.purpose === 'Mortgage' ? 'Loan Amount Preferred (₹)' : 'Budget Range (₹)'}
                                </label>
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
                                
                                {formData.purpose === 'Mortgage' && (
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Expected Interest Rate (%)</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. 10% - 12%"
                                            value={formData.expected_rate}
                                            onChange={(e) => setFormData({ ...formData, expected_rate: e.target.value })}
                                            className="w-full bg-white border-2 border-gray-100 rounded-[20px] py-4 px-6 focus:outline-none focus:ring-8 focus:ring-[#40a28f]/5 focus:border-[#40a28f] text-sm font-bold text-gray-600 transition-all shadow-sm"
                                        />
                                    </div>
                                )}

                                <div className="p-4 bg-orange-50/50 rounded-2xl border border-orange-100/50 flex gap-3">
                                    <IndianRupee className="h-4 w-4 text-orange-400 shrink-0" />
                                    <p className="text-[9px] font-black text-orange-500 uppercase tracking-widest leading-relaxed">Ensure your {formData.purpose === 'Mortgage' ? 'request' : 'budget'} aligns with current market rates in Rajnandgaon for best results.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case 3:
                return (
                    <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                        <div className="space-y-6">
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Street Name</label>
                                        <input type="text" placeholder="Street Name" value={formData.street_name}
                                            onChange={(e) => setFormData({ ...formData, street_name: e.target.value })}
                                            className="w-full bg-white border-2 border-gray-100 rounded-[20px] py-3.5 px-5 focus:outline-none focus:ring-8 focus:ring-[#40a28f]/5 focus:border-[#40a28f] text-sm font-bold text-gray-600 shadow-sm" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">District</label>
                                        <div className="relative">
                                            <select
                                                value={formData.district}
                                                onChange={(e) => setFormData({ ...formData, district: e.target.value, tehsil: '', revenue_inspector_circle: '', village: '' })}
                                                className="w-full bg-white border-2 border-gray-100 rounded-[20px] py-3.5 px-5 appearance-none focus:outline-none focus:ring-8 focus:ring-[#40a28f]/5 focus:border-[#40a28f] text-sm font-bold text-gray-600 shadow-sm"
                                            >
                                                <option value="">Select District</option>
                                                {locations.filter(l => l.type === 'district').map(l => (
                                                    <option key={l.id} value={l.name}>{l.name}</option>
                                                ))}
                                            </select>
                                            <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                                        </div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-3">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Tehsil</label>
                                        <div className="relative">
                                            <select
                                                disabled={!formData.district}
                                                value={formData.tehsil}
                                                onChange={(e) => setFormData({ ...formData, tehsil: e.target.value, revenue_inspector_circle: '', village: '' })}
                                                className="w-full bg-white border-2 border-gray-100 rounded-[20px] py-3.5 px-4 appearance-none focus:outline-none focus:ring-8 focus:ring-[#40a28f]/5 focus:border-[#40a28f] text-sm font-bold text-gray-600 shadow-sm disabled:opacity-50"
                                            >
                                                <option value="">Select Tehsil</option>
                                                {locations.filter(l => l.type === 'tehsil' && l.parent_id === locations.find(p => p.name === formData.district)?.id).map(l => (
                                                    <option key={l.id} value={l.name}>{l.name}</option>
                                                ))}
                                            </select>
                                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">RI Circle</label>
                                        <div className="relative">
                                            <select
                                                disabled={!formData.tehsil}
                                                value={formData.revenue_inspector_circle}
                                                onChange={(e) => setFormData({ ...formData, revenue_inspector_circle: e.target.value, village: '' })}
                                                className="w-full bg-white border-2 border-gray-100 rounded-[20px] py-3.5 px-4 appearance-none focus:outline-none focus:ring-8 focus:ring-[#40a28f]/5 focus:border-[#40a28f] text-sm font-bold text-gray-600 shadow-sm disabled:opacity-50"
                                            >
                                                <option value="">Select RI Circle</option>
                                                {locations.filter(l => l.type === 'ri_circle' && l.parent_id === locations.find(p => p.name === formData.tehsil)?.id).map(l => (
                                                    <option key={l.id} value={l.name}>{l.name}</option>
                                                ))}
                                            </select>
                                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Village</label>
                                        <div className="relative">
                                            <select
                                                disabled={!formData.revenue_inspector_circle}
                                                value={formData.village}
                                                onChange={(e) => setFormData({ ...formData, village: e.target.value, location: e.target.value })}
                                                className="w-full bg-white border-2 border-gray-100 rounded-[20px] py-3.5 px-4 appearance-none focus:outline-none focus:ring-8 focus:ring-[#40a28f]/5 focus:border-[#40a28f] text-sm font-bold text-gray-600 shadow-sm disabled:opacity-50"
                                            >
                                                <option value="">Select Village</option>
                                                {locations.filter(l => l.type === 'village' && l.parent_id === locations.find(p => p.name === formData.revenue_inspector_circle)?.id).map(l => (
                                                    <option key={l.id} value={l.name}>{l.name}</option>
                                                ))}
                                            </select>
                                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Landmark</label>
                                    <input type="text" placeholder="Landmark" value={formData.landmark}
                                        onChange={(e) => setFormData({ ...formData, landmark: e.target.value })}
                                        className="w-full bg-white border-2 border-gray-100 rounded-[20px] py-3.5 px-5 focus:outline-none focus:ring-8 focus:ring-[#40a28f]/5 focus:border-[#40a28f] text-sm font-bold text-gray-600 shadow-sm" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Required Size (Sq Ft)</label>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                                    <select
                                        value={formData.area_unit}
                                        onChange={(e) => setFormData({ ...formData, area_unit: e.target.value as any })}
                                        className="w-full bg-white border-2 border-gray-100 rounded-[20px] py-4 px-4 appearance-none focus:outline-none focus:ring-8 focus:ring-[#40a28f]/5 focus:border-[#40a28f] text-sm font-bold text-gray-600 cursor-pointer shadow-sm"
                                    >
                                        <option value="sqft">Sq foot</option>
                                        <option value="acre">Acers</option>
                                    </select>
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

                            {/* Contact Details Section */}
                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Contact Information</label>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <input
                                            type="text"
                                            placeholder="Contact Name"
                                            value={formData.contact_name}
                                            onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                                            className="w-full bg-white border-2 border-gray-100 rounded-[20px] py-4 px-6 focus:outline-none focus:ring-8 focus:ring-[#40a28f]/5 focus:border-[#40a28f] text-sm font-bold text-gray-600 transition-all shadow-sm"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <input
                                            type="tel"
                                            placeholder="Contact Phone"
                                            value={formData.contact_phone}
                                            onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                                            className="w-full bg-white border-2 border-gray-100 rounded-[20px] py-4 px-6 focus:outline-none focus:ring-8 focus:ring-[#40a28f]/5 focus:border-[#40a28f] text-sm font-bold text-gray-600 transition-all shadow-sm"
                                        />
                                    </div>
                                </div>
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
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={onClose} />
            <div className="relative bg-white w-[95%] sm:w-full max-w-2xl rounded-[32px] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="p-4 sm:p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
                    <div className="space-y-1">
                        <h2 className="text-lg sm:text-xl font-black text-gray-800 tracking-tight uppercase">
                            Post Requirement
                        </h2>
                        <p className="text-[9px] sm:text-[10px] font-bold text-[#40a28f] uppercase tracking-widest">
                            Post what you are looking for
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-2xl transition-all">
                        <X className="h-5 w-5 sm:h-6 sm:w-6 text-gray-400" />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-5 sm:p-8 custom-scrollbar">
                    {/* Step Breadcrumbs */}
                    {!isSuccess && (
                        <div className="flex items-center justify-center gap-4 text-[9px] sm:text-[11px] font-black uppercase tracking-widest pb-6 sm:pb-8">
                            {steps.map((s, idx) => (
                                <React.Fragment key={s.id}>
                                    <div className={`flex items-center gap-1.5 transition-all ${step === s.id ? 'text-[#40a28f] scale-105' : step > s.id ? 'text-gray-800' : 'text-gray-200'}`}>
                                        <span className={`w-4 h-4 sm:w-5 sm:h-5 rounded-lg flex items-center justify-center text-[8px] sm:text-[9px] ${step === s.id ? 'bg-[#40a28f] text-white' : step > s.id ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-400'}`}>
                                            {s.id}
                                        </span>
                                        <span className="hidden sm:inline">{s.label}</span>
                                    </div>
                                    {idx < steps.length - 1 && <ChevronRight className="h-3 w-3 text-gray-200" />}
                                </React.Fragment>
                            ))}
                        </div>
                    )}

                    {error && (
                        <div className="bg-red-50 text-red-500 p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-center mb-8 border border-red-100 shadow-sm">
                            {error}
                        </div>
                    )}

                    {renderStep()}
                </div>

                {/* Footer */}
                <div className="p-5 sm:p-8 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between sticky bottom-0">
                    {!isSuccess ? (
                        <>
                            <button
                                type="button"
                                onClick={prevStep}
                                className={`flex items-center gap-2 px-4 sm:px-8 py-3 rounded-xl sm:rounded-[20px] font-black uppercase tracking-widest text-[9px] sm:text-[10px] transition-all ${step === 1 ? 'opacity-0 pointer-events-none' : 'text-gray-400 hover:bg-white hover:text-gray-600 shadow-sm'}`}
                            >
                                <ChevronLeft className="h-4 w-4" />
                                <span className="hidden sm:inline">Previous Step</span>
                                <span className="sm:hidden">Back</span>
                            </button>

                            {step < 4 ? (
                                <button
                                    onClick={nextStep}
                                    className="bg-[#40a28f] text-white px-6 sm:px-10 py-3 rounded-xl sm:rounded-[20px] font-black uppercase tracking-widest text-[9px] sm:text-[10px] flex items-center gap-3 hover:bg-[#358a7a] transition-all shadow-xl shadow-[#40a28f]/20 active:scale-95 group"
                                >
                                    Proceed Next
                                    <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                </button>
                            ) : (
                                <button
                                    onClick={handleSubmit}
                                    disabled={loading}
                                    className="bg-gray-800 text-white px-8 sm:px-12 py-3 rounded-xl sm:rounded-[20px] font-black uppercase tracking-widest text-[9px] sm:text-[10px] flex items-center gap-3 hover:bg-black transition-all shadow-xl shadow-black/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : (
                                        <>
                                            Submit
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

            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2f2f0; border-radius: 10px; }
            `}</style>
        </div>
    );
};

export default AddRequirementModal;
