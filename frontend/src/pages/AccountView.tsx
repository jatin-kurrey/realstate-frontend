import React, { useState, useEffect } from 'react';
import { User, ShieldCheck, Contact, Lock, AlertTriangle, Info, Loader2 } from 'lucide-react';
import { userService } from '@/services/api';

const AccountView: React.FC = () => {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await userService.getProfile();
        setProfile(data);
        setEmail(data.email || '');
        setPhone(data.phone || '');
        setName(data.name || '');
      } catch (err) {
        console.error('Failed to fetch profile', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleUpdate = async () => {
    try {
      setLoading(true);
      await userService.updateProfile({ name, phone });
      alert('Profile updated successfully!');
    } catch (err) {
      console.error('Failed to update profile', err);
      alert('Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fcfdfd]">
        <Loader2 className="h-8 w-8 animate-spin text-[#40a28f]" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#fcfdfd]">
      {/* Header */}
      <div className="bg-[#40a28f] py-24 px-4 text-white text-center">
        <div className="max-w-7xl mx-auto space-y-4">
          <h1 className="text-5xl md:text-6xl font-black uppercase tracking-tighter leading-none">Account Settings</h1>
          <p className="text-xl text-white/80 font-medium">Manage your contact details and security</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

          {/* Left Sidebar */}
          <div className="space-y-8">
            <div className="bg-white rounded-[40px] shadow-2xl shadow-gray-200/50 border border-gray-100 p-10 text-center space-y-6 relative overflow-hidden group">
              <div className="w-32 h-32 bg-[#40a28f]/10 rounded-full mx-auto flex items-center justify-center text-[#40a28f] relative z-10 group-hover:scale-110 transition-transform duration-500">
                <div className="w-24 h-24 bg-[#40a28f] rounded-full flex items-center justify-center text-white shadow-xl shadow-[#40a28f]/30 font-black text-2xl">
                  {name.charAt(0)}
                </div>
              </div>
              <div className="space-y-2 relative z-10">
                <h3 className="text-xl font-black text-gray-800 uppercase tracking-tight">{name}</h3>
                <div className="flex items-center justify-center gap-2 text-[#40a28f]">
                  <ShieldCheck className="h-5 w-5" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em]">{profile?.role || 'User'}</span>
                </div>
              </div>
              <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-[#40a28f]/5 rounded-full blur-2xl"></div>
            </div>

            <div className="bg-[#e2f2f0] rounded-[40px] border border-[#d1e8e5] p-10 space-y-4 relative overflow-hidden">
              <div className="flex items-center gap-4 text-[#40a28f] relative z-10">
                <ShieldCheck className="h-6 w-6" />
                <h4 className="text-lg font-black uppercase tracking-tight">Verified Profile</h4>
              </div>
              <p className="text-gray-500 leading-relaxed font-medium text-sm relative z-10">
                Your account information is encrypted and secure.
              </p>
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/20 rounded-full blur-2xl -mr-12 -mt-12"></div>
            </div>
          </div>

          {/* Right Main Column */}
          <div className="lg:col-span-2 space-y-12">

            {/* Contact Details */}
            <section className="bg-white rounded-[40px] shadow-2xl shadow-gray-200/50 border border-gray-100 p-12 space-y-10">
              <div className="flex items-center gap-5">
                <div className="h-14 w-14 bg-[#e2f2f0] rounded-2xl flex items-center justify-center text-[#40a28f]">
                  <Contact className="h-7 w-7" />
                </div>
                <h3 className="text-3xl font-black text-gray-800 uppercase tracking-tight">Contact Details</h3>
              </div>

              <div className="grid grid-cols-1 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full bg-gray-50 border border-gray-100 rounded-[24px] py-5 px-8 focus:outline-none focus:ring-4 focus:ring-[#40a28f]/5 text-gray-800 font-bold "
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email Address (Read-only)</label>
                  <input type="email" value={email} disabled className="w-full bg-gray-50 border border-gray-100 rounded-[24px] py-5 px-8 focus:outline-none focus:ring-4 focus:ring-[#40a28f]/5 text-gray-400 font-bold " />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Phone Number</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full bg-gray-50 border border-gray-100 rounded-[24px] py-5 px-8 focus:outline-none focus:ring-4 focus:ring-[#40a28f]/5 text-gray-800 font-bold "
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  onClick={handleUpdate}
                  disabled={loading}
                  className="bg-[#40a28f] text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-[#40a28f]/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50">
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </section>

            {/* Change Password */}
            <section className="bg-white rounded-[40px] shadow-2xl shadow-gray-200/50 border border-gray-100 p-12 space-y-10">
              <div className="flex items-center gap-5">
                <div className="h-14 w-14 bg-[#e2f2f0] rounded-2xl flex items-center justify-center text-[#40a28f]">
                  <Lock className="h-7 w-7" />
                </div>
                <h3 className="text-3xl font-black text-gray-800 uppercase tracking-tight">Change Password</h3>
              </div>

              <div className="space-y-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Current Password</label>
                  <input type="password" placeholder="Enter current password" className="w-full bg-gray-50 border border-gray-100 rounded-[24px] py-5 px-8 focus:outline-none focus:ring-4 focus:ring-[#40a28f]/5 text-gray-800 font-bold " />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">New Password</label>
                  <input type="password" placeholder="Enter new password" className="w-full bg-gray-50 border border-gray-100 rounded-[24px] py-5 px-8 focus:outline-none focus:ring-4 focus:ring-[#40a28f]/5 text-gray-800 font-bold " />
                </div>
              </div>

              <button className="w-full bg-[#40a28f] text-white py-5 rounded-[24px] font-black uppercase tracking-widest text-xs shadow-2xl shadow-[#40a28f]/30 hover:scale-[1.01] active:scale-[0.99] transition-all">
                Update Password
              </button>
            </section>

            {/* Danger Zone */}
            <section className="bg-white rounded-[40px] shadow-2xl shadow-red-100/30 border border-red-50 p-12 space-y-10">
              <div className="flex items-center gap-5">
                <div className="h-14 w-14 bg-red-50 rounded-2xl flex items-center justify-center text-red-500">
                  <AlertTriangle className="h-7 w-7" />
                </div>
                <h3 className="text-3xl font-black text-red-500 uppercase tracking-tight">Danger Zone</h3>
              </div>

              <div className="space-y-8">
                <p className="text-gray-500 leading-relaxed font-medium">
                  Deactivating your account will hide your listings. You can reactivate by logging in again.
                </p>

                <div className="bg-orange-50 border border-orange-100 rounded-[32px] p-8 flex gap-6 items-start text-orange-600">
                  <Info className="h-6 w-6 shrink-0 mt-1" />
                  <p className="text-sm font-black uppercase tracking-tight leading-relaxed">
                    This action is reversible.
                  </p>
                </div>

                <button className="w-full bg-[#e35639] text-white py-5 rounded-[24px] font-black uppercase tracking-widest text-xs shadow-2xl shadow-red-500/20 hover:bg-red-600 transition-all">
                  Deactivate Account
                </button>
              </div>
            </section>

          </div>
        </div>
      </div>
    </main >
  );
};

export default AccountView;
