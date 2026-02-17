import React, { useState, useEffect } from 'react';
import { userService, authService } from '@/services/api';
import {
    User,
    Settings,
    Bell,
    Shield,
    Trash2,
    Mail,
    Phone,
    Save,
    Loader2,
    ChevronRight,
    Eye,
    EyeOff,
    LogOut
} from 'lucide-react';

const AccountSettingsView: React.FC = () => {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');
    const [isDeactivating, setIsDeactivating] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        public_preference: 'Anonymized',
        contact_preference: 'In-app',
        email_notifications: true,
        in_app_notifications: true
    });

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const data = await userService.getProfile();
                setUser(data);
                setFormData({
                    name: data.name,
                    phone: data.phone || '',
                    public_preference: data.public_preference,
                    contact_preference: data.contact_preference,
                    email_notifications: data.email_notifications,
                    in_app_notifications: data.in_app_notifications
                });
            } catch (error) {
                console.error('Failed to fetch profile:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMessage('');
        try {
            const updated = await userService.updateProfile(formData);
            setUser(updated);
            setMessage('Profile updated successfully!');
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            setMessage('Failed to update profile.');
        } finally {
            setSaving(false);
        }
    };

    const handleDeactivate = async () => {
        try {
            await userService.deactivateAccount();
            authService.logout();
            window.location.href = '/';
        } catch (error) {
            alert('Failed to deactivate account.');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#fcfdfd]">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-10 w-10 animate-spin text-[#40a28f]" />
                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Loading Preferences</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#fcfdfd] py-16 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto space-y-12">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b border-gray-100 pb-8">
                    <div className="space-y-2">
                        <h1 className="text-4xl font-black text-gray-800 tracking-tight uppercase">Account Settings</h1>
                        <p className="text-xs font-black text-[#40a28f] uppercase tracking-[0.2em]">Manage your profile and privacy preferences</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-black text-gray-800">{user?.name}</p>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{user?.role}</p>
                        </div>
                        <div className="h-12 w-12 bg-[#e2f2f0] rounded-2xl flex items-center justify-center text-[#40a28f] font-black text-xl">
                            {user?.name?.[0]}
                        </div>
                    </div>
                </div>

                {message && (
                    <div className="animate-in fade-in slide-in-from-top-4 p-4 bg-[#e2f2f0] border border-[#40a28f]/20 text-[#40a28f] text-[10px] font-black uppercase tracking-widest rounded-2xl text-center">
                        {message}
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Sidebar Nav */}
                    <nav className="space-y-2 lg:col-span-1">
                        <button className="w-full flex items-center justify-between p-4 bg-white border border-gray-100 rounded-2xl text-gray-800 shadow-sm">
                            <div className="flex items-center gap-3">
                                <Settings className="h-4 w-4 text-[#40a28f]" />
                                <span className="text-[11px] font-black uppercase tracking-widest">Profile</span>
                            </div>
                            <ChevronRight className="h-4 w-4 text-gray-300" />
                        </button>
                        <button className="w-full flex items-center justify-between p-4 hover:bg-white transition-all rounded-2xl text-gray-400">
                            <div className="flex items-center gap-3">
                                <Bell className="h-4 w-4" />
                                <span className="text-[11px] font-black uppercase tracking-widest">Notifications</span>
                            </div>
                            <ChevronRight className="h-4 w-4 text-gray-200" />
                        </button>
                        <button className="w-full flex items-center justify-between p-4 hover:bg-white transition-all rounded-2xl text-gray-400">
                            <div className="flex items-center gap-3">
                                <Shield className="h-4 w-4" />
                                <span className="text-[11px] font-black uppercase tracking-widest">Security</span>
                            </div>
                            <ChevronRight className="h-4 w-4 text-gray-200" />
                        </button>
                    </nav>

                    {/* Main Form */}
                    <div className="lg:col-span-2 space-y-12">
                        <form onSubmit={handleUpdateProfile} className="space-y-12">
                            {/* Basic Info */}
                            <section className="space-y-6">
                                <h2 className="text-xs font-black text-gray-400 uppercase tracking-[0.3em]">Personal Information</h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full bg-white border border-gray-100 rounded-2xl py-3.5 px-5 focus:outline-none focus:ring-4 focus:ring-[#40a28f]/5 focus:border-[#40a28f] transition-all text-sm font-bold text-gray-600 shadow-sm"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Phone Number</label>
                                        <input
                                            type="tel"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            className="w-full bg-white border border-gray-100 rounded-2xl py-3.5 px-5 focus:outline-none focus:ring-4 focus:ring-[#40a28f]/5 focus:border-[#40a28f] transition-all text-sm font-bold text-gray-600 shadow-sm"
                                        />
                                    </div>
                                </div>
                                <div className="p-4 bg-gray-50/50 rounded-2xl border border-gray-100 flex items-center gap-4">
                                    <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center border border-gray-100">
                                        <Mail className="h-4 w-4 text-[#40a28f]" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Primary Email</p>
                                        <p className="text-sm font-bold text-gray-600">{user?.email}</p>
                                    </div>
                                </div>
                            </section>

                            {/* Privacy Preferences */}
                            <section className="space-y-6">
                                <h2 className="text-xs font-black text-gray-400 uppercase tracking-[0.3em]">Privacy & Display</h2>
                                <div className="space-y-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Public Display Style</label>
                                        <div className="grid grid-cols-2 gap-4">
                                            <button
                                                type="button"
                                                onClick={() => setFormData({ ...formData, public_preference: 'Anonymized' })}
                                                className={`p-4 rounded-2xl border transition-all text-left space-y-1 ${formData.public_preference === 'Anonymized' ? 'bg-[#e2f2f0] border-[#40a28f]/20 ring-4 ring-[#40a28f]/5' : 'bg-white border-gray-100 hover:border-gray-200'}`}
                                            >
                                                <p className="text-[11px] font-black uppercase tracking-widest text-gray-800">Anonymized</p>
                                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Visitor {user.id + 100}</p>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setFormData({ ...formData, public_preference: 'Full' })}
                                                className={`p-4 rounded-2xl border transition-all text-left space-y-1 ${formData.public_preference === 'Full' ? 'bg-[#e2f2f0] border-[#40a28f]/20 ring-4 ring-[#40a28f]/5' : 'bg-white border-gray-100 hover:border-gray-200'}`}
                                            >
                                                <p className="text-[11px] font-black uppercase tracking-widest text-gray-800">Full Name</p>
                                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{user.name}</p>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Action Buttons */}
                            <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="bg-[#40a28f] text-white px-8 py-3.5 rounded-2xl font-black uppercase tracking-widest text-[11px] hover:bg-[#358a7a] transition-all shadow-xl shadow-[#40a28f]/20 flex items-center gap-2 active:scale-95"
                                >
                                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                    Save Changes
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIsDeactivating(true)}
                                    className="px-6 py-3.5 rounded-2xl font-black uppercase tracking-widest text-[11px] text-red-400 hover:bg-red-50 transition-all ml-auto"
                                >
                                    Deactivate Account
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            {/* Deactivation Modal */}
            {isDeactivating && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsDeactivating(false)} />
                    <div className="relative bg-white w-full max-w-sm rounded-[32px] p-8 space-y-6 shadow-2xl animate-in fade-in zoom-in duration-300">
                        <div className="h-16 w-16 bg-red-50 rounded-3xl flex items-center justify-center mx-auto text-red-500">
                            <Trash2 className="h-8 w-8" />
                        </div>
                        <div className="text-center space-y-2">
                            <h3 className="text-xl font-black text-gray-800 uppercase tracking-tight">Wait, don't leave!</h3>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest leading-loose">Deactivating your account will hide all your listings and requirements. You can reactivate by logging back in later.</p>
                        </div>
                        <div className="flex flex-col gap-3">
                            <button
                                onClick={handleDeactivate}
                                className="w-full bg-red-500 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-xl shadow-red-500/20 hover:bg-red-600 transition-all"
                            >
                                Confirm deactivation
                            </button>
                            <button
                                onClick={() => setIsDeactivating(false)}
                                className="w-full bg-gray-50 text-gray-400 py-4 rounded-2xl font-black uppercase tracking-widest text-[11px] hover:bg-gray-100 transition-all"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AccountSettingsView;
