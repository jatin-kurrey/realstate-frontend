import React, { useState, useEffect } from 'react';
import {
  Home, FileText, Bell, CreditCard, Settings, Heart, ShieldCheck,
  Plus, User, AlertTriangle, LayoutGrid, Search, Loader2, LogOut,
  TrendingUp, MessageSquare, CheckCircle, Eye, Phone, Calendar
} from 'lucide-react';
import { propertyService, requirementService, adminService, paymentService, notificationService, bookmarkService, userService } from '@/services/api';
import { Property, Requirement, User as UserType } from '@/types/types';
import PropertyCard from '@/components/PropertyCard';
import AddPropertyModal from '@/components/AddPropertyModal';
import AddRequirementModal from '@/components/AddRequirementModal';
import ActivateListingModal from '@/components/ActivateListingModal';

type Tab = 'overview' | 'assets' | 'mylist' | 'requirements' | 'finance' | 'settings';

// Mock Inquiries Data
const MOCK_INQUIRIES = [
  { id: 1, name: "Rahul Verma", phone: "+91 98765...", property: "Luxury Villa in Civil Lines", date: "2 mins ago", status: "New" },
  { id: 2, name: "Anita Singh", phone: "+91 99887...", property: "Commercial Space", date: "2 hours ago", status: "Contacted" },
  { id: 3, name: "Vikram Malhotra", phone: "+91 76543...", property: "2BHK Apartment", date: "1 day ago", status: "Pending" },
];

const DashboardView: React.FC = () => {
  const token = localStorage.getItem('token');
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [userRole, setUserRole] = useState<string | null>(localStorage.getItem('userRole'));

  // Data States
  const [properties, setProperties] = useState<Property[]>([]);
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [profile, setProfile] = useState<UserType | null>(null);
  const [paymentStats, setPaymentStats] = useState<any>(null);
  const [shortlistCount, setShortlistCount] = useState(0);
  const [shortlistedProperties, setShortlistedProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  // States for editable profile fields in settings
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editCompanyName, setEditCompanyName] = useState('');


  // Profile Completeness State
  const [completionPercentage, setCompletionPercentage] = useState(80);

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isReqModalOpen, setIsReqModalOpen] = useState(false);
  const [isActivateModalOpen, setIsActivateModalOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const fetchTasks: Promise<any>[] = [
        notificationService.getAll(),
        requirementService.getAll(),
        propertyService.getAll(), // for shortlist matching
        userService.getProfile()
      ];

      // Fetch listings for everyone
      fetchTasks.push(propertyService.getMyListings());

      if (userRole === 'owner' || userRole === 'admin') {
        fetchTasks.push(paymentService.getMyPayments());
      }

      const results = await Promise.all(fetchTasks);

      setNotifications(results[0]);
      setRequirements(results[1].slice(0, 5));
      const allProperties = results[2];
      const userProfile = results[3];
      setProfile(userProfile);

      // Initialize edit states
      if (userProfile) {
        setEditName(userProfile.name || '');
        setEditPhone(userProfile.phone || '');
        setEditCompanyName(userProfile.company_name || '');
      }

      setProperties(results[4] || []);


      if (userRole === 'owner' || userRole === 'admin') {
        const payRes = results[4] || [];
        setPayments(payRes);
        const totalAmount = payRes.reduce((acc: number, p: any) => acc + (p.status === 'Success' ? p.amount : 0), 0);
        setPaymentStats({ total: totalAmount, count: payRes.filter((p: any) => p.status === 'Success').length });
      }

      // Handle Shortlist
      if (token) {
        const bookmarks = await bookmarkService.getAll();
        setShortlistCount(bookmarks.length);
        setShortlistedProperties(bookmarks);
      } else {
        const saved = localStorage.getItem('shortlisted_properties');
        if (saved) {
          const savedIds = JSON.parse(saved);
          setShortlistCount(savedIds.length);
          const myShortlist = allProperties.filter((p: Property) => savedIds.includes(p.id));
          setShortlistedProperties(myShortlist);
        }
      }

    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    const handleShortlistUpdate = () => {
      fetchDashboardData();
    };
    window.addEventListener('shortlistUpdated', handleShortlistUpdate);

    // Check URL params for deep linking
    const params = new URLSearchParams(window.location.search);
    const tab = params.get('tab');
    const action = params.get('action');

    if (tab && ['overview', 'assets', 'mylist', 'requirements', 'finance', 'settings'].includes(tab)) {
      setActiveTab(tab as Tab);
    }
    if (action === 'new') {
      setIsAddModalOpen(true);
    }

    return () => window.removeEventListener('shortlistUpdated', handleShortlistUpdate);
  }, [userRole]);

  // Actions
  const handleEdit = (property: Property) => { setSelectedProperty(property); setIsAddModalOpen(true); };
  const handleOpenActivate = (property: Property) => { setSelectedProperty(property); setIsActivateModalOpen(true); };
  const handleActivate = async () => {
    if (!selectedProperty) return;
    try {
      await paymentService.processListingPayment({ property_id: selectedProperty.id as number, amount: 100, plan: '30 Days Activation' });
      setIsActivateModalOpen(false); fetchDashboardData();
    } catch (error) { console.error(error); alert('Activation failed.'); }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    window.location.href = '/';
  }

  // --- Sub-Components ---

  const renderSidebar = () => (
    <div className="hidden lg:flex flex-col w-72 bg-white border-r border-gray-100 min-h-screen fixed left-0 top-16 z-30 pt-8 px-6">
      <div className="space-y-8">
        {/* User Info */}
        <div className="flex items-center gap-3 px-2">
          <div className="h-10 w-10 bg-[#40a28f] rounded-full flex items-center justify-center text-white font-black uppercase shadow-lg shadow-[#40a28f]/20">
            {profile?.name?.charAt(0) || <User className="h-5 w-5" />}
          </div>
          <div className="overflow-hidden">
            <h3 className="text-sm font-black text-gray-800 line-clamp-1 truncate">{profile?.name || 'User'}</h3>
            <p className="text-[10px] font-black text-[#40a28f] uppercase tracking-widest truncate">{profile?.role || 'Member'}</p>
          </div>
        </div>

        {/* Profile Completion Widget */}
        <div className="bg-gradient-to-br from-[#40a28f]/5 to-white border border-[#40a28f]/20 rounded-2xl p-4 relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#40a28f]">Profile Status</span>
              <span className="text-xs font-black text-gray-700">{completionPercentage}%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-1.5 mb-3">
              <div className="bg-[#40a28f] h-1.5 rounded-full transition-all duration-1000" style={{ width: `${completionPercentage}%` }}></div>
            </div>
            <p className="text-[10px] text-gray-500 font-medium leading-tight">Complete verification to get the <span className="text-gray-800 font-bold">Trusted Badge</span>.</p>
          </div>
        </div>

        <div>
          <h2 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Main Menu</h2>
          <nav className="space-y-2">
            <button onClick={() => setActiveTab('overview')} className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all ${activeTab === 'overview' ? 'bg-[#40a28f]/10 text-[#40a28f]' : 'text-gray-500 hover:bg-gray-50'}`}>
              <LayoutGrid className="h-5 w-5" /> Overview
            </button>
            <button onClick={() => setActiveTab('assets')} className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all ${activeTab === 'assets' ? 'bg-[#40a28f]/10 text-[#40a28f]' : 'text-gray-500 hover:bg-gray-50'}`}>
              <Home className="h-5 w-5" /> My Properties
            </button>
            <button onClick={() => setActiveTab('mylist')} className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all ${activeTab === 'mylist' ? 'bg-[#40a28f]/10 text-[#40a28f]' : 'text-gray-500 hover:bg-gray-50'}`}>
              <Heart className="h-5 w-5" /> Saved List
              {shortlistCount > 0 && <span className="ml-auto bg-[#40a28f] text-white text-[10px] px-2 py-0.5 rounded-full">{shortlistCount}</span>}
            </button>
            <button onClick={() => setActiveTab('requirements')} className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all ${activeTab === 'requirements' ? 'bg-[#40a28f]/10 text-[#40a28f]' : 'text-gray-500 hover:bg-gray-50'}`}>
              <FileText className="h-5 w-5" /> My Requirements
            </button>
            {(userRole === 'owner' || userRole === 'admin') && (
              <button onClick={() => setActiveTab('finance')} className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all ${activeTab === 'finance' ? 'bg-[#40a28f]/10 text-[#40a28f]' : 'text-gray-500 hover:bg-gray-50'}`}>
                <CreditCard className="h-5 w-5" /> Finance
              </button>
            )}
            <button onClick={() => setActiveTab('settings')} className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all ${activeTab === 'settings' ? 'bg-[#40a28f]/10 text-[#40a28f]' : 'text-gray-500 hover:bg-gray-50'}`}>
              <Settings className="h-5 w-5" /> Settings
            </button>
            {userRole === 'admin' && (
              <button onClick={() => window.location.href = '/admin'} className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-sm font-bold text-[#40a28f] bg-[#40a28f]/5 hover:bg-[#40a28f]/10 transition-all border border-[#40a28f]/20 mt-4">
                <ShieldCheck className="h-5 w-5" /> Switch to Admin
              </button>
            )}
          </nav>
        </div>

        <div>
          <button onClick={handleLogout} className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-sm font-bold text-red-400 hover:bg-red-50 transition-all mt-6">
            <LogOut className="h-5 w-5" /> Logout
          </button>
        </div>
      </div>
    </div>
  );

  const renderOverview = () => (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 bg-[#40a28f] p-10 rounded-[40px] text-white relative overflow-hidden shadow-xl shadow-[#40a28f]/20">
        <div className="space-y-2 relative z-10">
          <h1 className="text-4xl font-black uppercase tracking-tighter">
            Welcome, {profile?.name || (userRole === 'owner' ? 'Owner' : 'User')}
          </h1>
          <p className="text-white/80 font-medium tracking-wide">
            {userRole === 'owner' ? 'Track your property performance & leads.' : 'Track your property search journey.'}
          </p>
        </div>
        <div className="relative z-10 hidden sm:block">
          <div className="flex gap-3">
            <div className="px-4 py-2 bg-white/20 backdrop-blur-md rounded-xl border border-white/20 text-center">
              <span className="block text-xl font-black">{completionPercentage}%</span>
              <span className="text-[9px] uppercase tracking-widest opacity-80">Profile</span>
            </div>
            <div className="px-4 py-2 bg-white/20 backdrop-blur-md rounded-xl border border-white/20 text-center">
              <span className="block text-xl font-black">{userRole === 'owner' ? properties.length : shortlistCount}</span>
              <span className="text-[9px] uppercase tracking-widest opacity-80">{userRole === 'owner' ? 'Listings' : 'Saved'}</span>
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-24 -mt-24"></div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: userRole === 'owner' ? 'Total Views' : 'Shortlisted', value: userRole === 'owner' ? 1240 : shortlistCount, icon: userRole === 'owner' ? Eye : Heart, color: 'text-[#40a28f]' },
          { label: userRole === 'owner' ? 'Total Leads' : 'Matches', value: userRole === 'owner' ? 24 : requirements.length, icon: userRole === 'owner' ? MessageSquare : Search, color: 'text-blue-500' },
          { label: 'Notifications', value: notifications.filter(n => !n.is_read).length, icon: Bell, color: 'text-red-400' },
          { label: 'Security Score', value: '100%', icon: ShieldCheck, color: 'text-emerald-500' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className={`p-4 bg-gray-50 rounded-2xl ${stat.color} bg-opacity-10`}>
              <stat.icon className={`h-6 w-6 ${stat.color}`} />
            </div>
            <div>
              <div className="text-2xl font-black text-gray-800">{stat.value}</div>
              <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Area (2 cols) */}
        <div className="lg:col-span-2 space-y-8">
          {/* Recent Leads (Owner) or Matching Properties (Seeker) */}
          {userRole === 'owner' ? (
            <div className="bg-white rounded-[40px] border border-gray-100 overflow-hidden">
              <div className="p-8 border-b border-gray-50 flex justify-between items-center">
                <h3 className="text-xl font-black text-gray-800 tracking-tight uppercase">Recent Inquiries</h3>
                <button className="text-[#40a28f] text-xs font-bold uppercase tracking-widest hover:underline">View All</button>
              </div>
              <div className="divide-y divide-gray-50">
                {MOCK_INQUIRIES.map(inquiry => (
                  <div key={inquiry.id} className="p-6 hover:bg-gray-50/50 transition-colors flex items-center justify-between group">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center font-bold">
                        {inquiry.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-gray-800">{inquiry.name}</p>
                        <p className="text-xs text-gray-400 font-medium">Interested in <span className="text-gray-600">{inquiry.property}</span></p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex gap-2 justify-end mb-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-2 bg-[#25D366] text-white rounded-full hover:scale-110 transition-transform"><MessageSquare className="h-3 w-3" /></button>
                        <button className="p-2 bg-blue-500 text-white rounded-full hover:scale-110 transition-transform"><Phone className="h-3 w-3" /></button>
                      </div>
                      <p className="text-[10px] font-black uppercase text-gray-300 tracking-widest">{inquiry.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        {/* Sidebar Area (1 col) - Market Intelligence */}
        <div className="space-y-8">


          {/* Premium Upsell Card */}
          {userRole === 'owner' && (
            <div className="bg-[#1e293b] rounded-[40px] p-8 text-white text-center space-y-4">
              <div className="w-12 h-12 bg-[#40a28f] rounded-full flex items-center justify-center mx-auto shadow-lg shadow-[#40a28f]/40">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div>
                <h4 className="font-black uppercase tracking-widest text-lg">Boost Listing</h4>
                <p className="text-gray-400 text-xs font-medium mt-2">Get 5x more leads by promoting your top properties.</p>
              </div>
              <button className="w-full py-3 bg-white text-[#1e293b] rounded-xl font-bold text-sm hover:bg-gray-100 transition-colors">Start Promoting</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderAssets = () => (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-gray-800 uppercase tracking-tight">My Assets</h2>
          <p className="text-gray-400 font-medium text-sm pt-1">Manage your property portfolio</p>
        </div>
        <button onClick={() => setIsAddModalOpen(true)} className="bg-[#40a28f] text-white px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center gap-2 shadow-xl shadow-[#40a28f]/20 hover:bg-[#358a7a] transition-all">
          <Plus className="h-4 w-4" /> Add Property
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {properties.map(property => (
          <PropertyCard
            key={property.id}
            property={property}
            onViewDetails={(prop) => window.location.href = `/properties/${prop.id}`}
            onActivate={handleOpenActivate}
            onEdit={handleEdit}
            compact
            // Mock stats for demonstration
            stats={{ views: Math.floor(Math.random() * 500) + 50, leads: Math.floor(Math.random() * 20) }}
          />
        ))}
        {properties.length === 0 && (
          <div className="col-span-full py-20 text-center bg-white rounded-[40px] border-2 border-dashed border-gray-100">
            <Home className="h-12 w-12 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-400 font-medium">No properties listed yet.</p>
          </div>
        )}
      </div>
      <AddPropertyModal
        isOpen={isAddModalOpen}
        onClose={() => { setIsAddModalOpen(false); setSelectedProperty(null); }}
        property={selectedProperty}
        onSuccess={fetchDashboardData}
      />
      <ActivateListingModal isOpen={isActivateModalOpen} onClose={() => setIsActivateModalOpen(false)} onActivate={handleActivate} propertyTitle={selectedProperty?.title || ''} />
    </div>
  );

  const renderFinance = () => (
    <div className="space-y-10 animate-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-3xl font-black text-gray-800 uppercase tracking-tight">Payment History</h2>
        <p className="text-gray-400 font-medium text-sm pt-1">Listing subscriptions and transactions</p>
      </div>

      <div className="bg-[#1e293b] rounded-[40px] p-10 text-white flex flex-col sm:flex-row justify-between items-center gap-6 shadow-2xl">
        <div className="space-y-2">
          <p className="text-[10px] font-black uppercase tracking-widest text-[#40a28f]">Total Spend</p>
          <div className="text-5xl font-black tracking-tighter">₹{paymentStats?.total || 0}</div>
        </div>
        <div className="px-6 py-3 bg-white/10 rounded-2xl border border-white/10 backdrop-blur-md">
          <p className="text-[10px] font-black uppercase tracking-widest text-white/80">Successful Tx: {paymentStats?.count || 0}</p>
        </div>
      </div>

      <div className="bg-white rounded-[40px] border border-gray-100 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50/50 text-gray-400 font-black uppercase tracking-widest text-[10px]">
              <tr>
                <th className="px-8 py-5">Date</th>
                <th className="px-8 py-5">Item</th>
                <th className="px-8 py-5 text-right">Amount</th>
                <th className="px-8 py-5 text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {payments.length > 0 ? payments.map((tx, i) => (
                <tr key={tx.id} className="border-t border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="px-8 py-5 font-bold text-gray-700">{new Date(tx.created_at).toLocaleDateString()}</td>
                  <td className="px-8 py-5 text-xs font-bold text-gray-500">{tx.property?.title || 'Listing Activation'}</td>
                  <td className="px-8 py-5 text-right font-black text-gray-900">₹{tx.amount}</td>
                  <td className="px-8 py-5 text-center">
                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${tx.status === 'Success' ? 'bg-emerald-50 text-emerald-500' : 'bg-red-50 text-red-500'}`}>{tx.status}</span>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan={4} className="px-8 py-10 text-center text-gray-400 italic">No transaction history found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const handleUpdateProfile = async () => {
    try {
      setLoading(true);
      await userService.updateProfile({
        name: editName,
        phone: editPhone,
        company_name: editCompanyName
      });
      alert('Profile updated successfully!');
      fetchDashboardData();
    } catch (err) {
      console.error('Failed to update profile:', err);
      alert('Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  const renderSettings = () => (
    <div className="space-y-10 max-w-3xl animate-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-3xl font-black text-gray-800 uppercase tracking-tight">Account Settings</h2>
        <p className="text-gray-400 font-medium text-sm pt-1">Manage profile security and preferences</p>
      </div>

      {/* Profile Completeness Large Widget */}
      <div className="bg-white rounded-[40px] border border-gray-100 p-10 space-y-6 shadow-sm relative overflow-hidden">
        <div className="flex justify-between items-start relative z-10">
          <div>
            <h3 className="text-lg font-black text-gray-800 uppercase tracking-tight mb-2">Profile Completeness</h3>
            <p className="text-sm text-gray-500 max-w-md">Complete your profile to unlock the <span className="text-[#40a28f] font-bold">Verified Badge</span> and get 20% more visibility.</p>
          </div>
          <div className="text-4xl font-black text-[#40a28f]">{completionPercentage}%</div>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-3 relative z-10">
          <div className="bg-[#40a28f] h-3 rounded-full transition-all duration-1000" style={{ width: `${completionPercentage}%` }}></div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 relative z-10">
          <div className="flex items-center gap-2 text-xs font-bold text-gray-700">
            <CheckCircle className="h-4 w-4 text-[#40a28f]" /> Email Verified
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-gray-700">
            <CheckCircle className="h-4 w-4 text-[#40a28f]" /> Phone Verified
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-gray-400">
            <div className="h-4 w-4 rounded-full border-2 border-gray-300"></div> Add Photo
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-gray-400">
            <div className="h-4 w-4 rounded-full border-2 border-gray-300"></div> KYC
          </div>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#40a28f]/5 rounded-full blur-3xl -mr-12 -mt-12"></div>
      </div>

      <div className="bg-white rounded-[40px] border border-gray-100 p-10 space-y-8 shadow-sm">
        <div className="flex items-center gap-4 border-b border-gray-50 pb-8">
          <div className="w-16 h-16 bg-[#e2f2f0] rounded-full flex items-center justify-center text-[#40a28f]"><User className="h-8 w-8" /></div>
          <div>
            <h3 className="text-lg font-black text-gray-800 uppercase tracking-tight">{profile?.name || 'User'}</h3>
            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">{profile?.role || 'Seeker'}</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              placeholder="Full Name"
              className="w-full bg-gray-50 border-gray-100 rounded-2xl py-3 px-5 text-sm font-bold text-gray-800 focus:ring-[#40a28f] focus:border-[#40a28f] outline-none"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email (Read-only)</label>
            <input type="email" value={profile?.email || ''} disabled className="w-full bg-gray-50 border-gray-100 rounded-2xl py-3 px-5 text-sm font-bold text-gray-400" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Phone</label>
            <input
              type="tel"
              value={editPhone}
              onChange={(e) => setEditPhone(e.target.value)}
              placeholder="+91 98..."
              className="w-full bg-gray-50 border-gray-100 rounded-2xl py-3 px-5 text-sm font-bold text-gray-800 focus:ring-[#40a28f] focus:border-[#40a28f] outline-none"
            />
          </div>
          {profile?.role === 'developer' && (
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Company Name</label>
              <input
                type="text"
                value={editCompanyName}
                onChange={(e) => setEditCompanyName(e.target.value)}
                placeholder="Company Name"
                className="w-full bg-gray-50 border-gray-100 rounded-2xl py-3 px-5 text-sm font-bold text-gray-800 focus:ring-[#40a28f] focus:border-[#40a28f] outline-none"
              />
            </div>
          )}
        </div>
        <button
          onClick={handleUpdateProfile}
          disabled={loading}
          className="bg-[#40a28f] text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-[#40a28f]/20 hover:bg-[#358a7a] transition-all disabled:opacity-50"
        >
          {loading ? 'Updating...' : 'Update Profile'}
        </button>
      </div>

      <div className="bg-white rounded-[40px] border border-gray-100 p-10 space-y-8 shadow-sm">
        <div className="flex items-center gap-4 border-b border-gray-50 pb-8">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center text-red-500"><AlertTriangle className="h-8 w-8" /></div>
          <div>
            <h3 className="text-lg font-black text-red-500 uppercase tracking-tight">Danger Zone</h3>
            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Irreversible Actions</p>
          </div>
        </div>
        <button className="w-full border border-red-100 text-red-500 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-red-50 transition-all">Deactivate Account</button>
      </div>
    </div>
  );

  const renderRequirements = () => (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-gray-800 uppercase tracking-tight">My Requirements</h2>
          <p className="text-gray-400 font-medium text-sm pt-1">Manage your posted needs</p>
        </div>
        <button onClick={() => setIsReqModalOpen(true)} className="bg-[#40a28f] text-white px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center gap-2 shadow-xl shadow-[#40a28f]/20 hover:bg-[#358a7a] transition-all">
          <Plus className="h-4 w-4" /> Post Requirement
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {requirements.length > 0 ? requirements.map(req => (
          <div key={req.id} className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
            <div className="absolute top-4 right-4 z-10">
              <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${req.is_verified ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                {req.is_verified ? 'Approved' : 'Pending Approval'}
              </span>
            </div>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-black text-gray-800 uppercase tracking-tight">{req.purpose} {req.type}</h3>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{req.location}</p>
              </div>
              <div className="flex gap-2 flex-wrap">
                <div className="px-3 py-1 bg-gray-50 rounded-lg text-[10px] font-bold text-gray-600 border border-gray-100">
                  Amount: ₹{(req.minBudget / 100000).toFixed(1)}L - ₹{(req.maxBudget / 100000).toFixed(1)}L
                </div>
                <div className="px-3 py-1 bg-gray-50 rounded-lg text-[10px] font-bold text-gray-600 border border-gray-100">
                  Area: {req.minArea} - {req.maxArea} sq.ft
                </div>
              </div>
              <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">{req.description}</p>
            </div>
          </div>
        )) : (
          <div className="col-span-full py-20 text-center bg-white rounded-[40px] border-2 border-dashed border-gray-100">
            <FileText className="h-12 w-12 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-400 font-medium">No requirements posted yet.</p>
          </div>
        )}
      </div>
      <AddRequirementModal isOpen={isReqModalOpen} onClose={() => setIsReqModalOpen(false)} onSuccess={fetchDashboardData} />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#fcfdfd]">
      {renderSidebar()}

      <div className="lg:pl-72 pt-8 lg:pt-0">
        {/* Mobile Tab Bar */}
        <div className="lg:hidden flex overflow-x-auto gap-2 p-4 no-scrollbar bg-white sticky top-0 z-20 border-b border-gray-100">
          {['overview', 'assets', 'mylist', 'requirements', 'finance', 'settings'].map(t => (
            <button key={t} onClick={() => setActiveTab(t as Tab)} className={`px-5 py-2 rounded-full text-xs font-black uppercase tracking-widest whitespace-nowrap transition-all ${activeTab === t ? 'bg-[#40a28f] text-white' : 'bg-gray-50 text-gray-400'}`}>
              {t}
            </button>
          ))}
        </div>

        <div className="p-4 sm:p-8 lg:p-12 max-w-7xl mx-auto">
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'assets' && renderAssets()}
          {activeTab === 'finance' && renderFinance()}
          {activeTab === 'requirements' && renderRequirements()}
          {activeTab === 'settings' && renderSettings()}
          {activeTab === 'mylist' && (
            <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-3xl font-black text-gray-800 uppercase tracking-tight">Saved Homes</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                {shortlistedProperties.length > 0 ? shortlistedProperties.map(property => (
                  <PropertyCard key={property.id} property={property} onViewDetails={(prop) => window.location.href = `/properties/${prop.id}`} compact />
                )) : (
                  <div className="col-span-full py-20 text-center bg-white rounded-[40px] border-2 border-dashed border-gray-100">
                    <Heart className="h-12 w-12 text-gray-200 mx-auto mb-4" />
                    <p className="text-gray-400 font-medium">Your saved list is empty.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardView;
