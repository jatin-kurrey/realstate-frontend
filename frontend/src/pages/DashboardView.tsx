import React, { useState, useEffect } from 'react';
import {
  Home, FileText, Bell, CreditCard, Settings, Heart, ShieldCheck,
  Plus, User, AlertTriangle, LayoutGrid, Search, Loader2, LogOut,
  TrendingUp, MessageSquare, CheckCircle, Eye, Phone, Calendar,
  Edit, Trash2, EyeOff, Landmark, Crown
} from 'lucide-react';
import { propertyService, requirementService, adminService, notificationService, bookmarkService, userService } from '@/services/api';
import { Property, Requirement, User as UserType } from '@/types/types';
import PropertyCard from '@/components/PropertyCard';
import AddPropertyModal from '@/components/AddPropertyModal';
import AddRequirementModal from '@/components/AddRequirementModal';
import ActivateListingModal from '@/components/ActivateListingModal';
import { useSiteConfig } from '@/contexts/SiteConfigContext';
import Footer from '@/components/Footer';

type Tab = 'overview' | 'assets' | 'mylist' | 'requirements' | 'finance' | 'settings';



const DashboardView: React.FC = () => {
  const token = localStorage.getItem('token');
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [userRole, setUserRole] = useState<string | null>(localStorage.getItem('userRole'));

  // Data States
  const [properties, setProperties] = useState<Property[]>([]);
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [profile, setProfile] = useState<UserType | null>(null);
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
        requirementService.getMyRequirements(),
        propertyService.getAll(), // for shortlist matching
        userService.getProfile()
      ];

      // Fetch listings for everyone
      fetchTasks.push(propertyService.getMyListings());

      const results = await Promise.all(fetchTasks);

      setNotifications(results[0]);
      setRequirements(results[1]);
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


      // Handle Shortlist
      if (token) {
        const bookmarks = await bookmarkService.getAll();
        setShortlistCount(bookmarks.length);
        // Correctly extract property from bookmark
        const actualProperties = bookmarks.map((b: any) => b.property).filter(Boolean);
        setShortlistedProperties(actualProperties);
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
    const tabParam = params.get('tab');
    const action = params.get('action');

    if (tabParam && ['overview', 'assets', 'mylist', 'requirements', 'finance', 'settings'].includes(tabParam)) {
      setActiveTab(tabParam as Tab);
      
      if (action === 'new') {
        if (tabParam === 'requirements' || tabParam === 'finance') {
          setReqDefaultPurpose(tabParam === 'finance' ? 'Mortgage' : undefined);
          setIsReqModalOpen(true);
        } else if (tabParam === 'assets') {
          setIsAddModalOpen(true);
        }
      }
    } else if (action === 'new') {
      setIsAddModalOpen(true);
    }

    return () => window.removeEventListener('shortlistUpdated', handleShortlistUpdate);
  }, [userRole]);

  // Actions
  const [selectedRequirement, setSelectedRequirement] = useState<Requirement | null>(null);
  const [reqDefaultPurpose, setReqDefaultPurpose] = useState<string | undefined>(undefined);
  const handleEdit = (property: Property) => { setSelectedProperty(property); setIsAddModalOpen(true); };
  const handleEditRequirement = (req: Requirement) => { setSelectedRequirement(req); setIsReqModalOpen(true); };
  const handleOpenActivate = (property: Property) => { setSelectedProperty(property); setIsActivateModalOpen(true); };
  const handleActivate = async () => {
    if (!selectedProperty) return;
    try {
      // Payment removed - directly activate in the future or keep disabled
      alert('Payment feature removed. Please contact admin for activation.');
      setIsActivateModalOpen(false);
    } catch (error) { console.error(error); }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    window.location.href = '/';
  };

  const { config } = useSiteConfig();

  const handleTogglePropertyActive = async (id: number | string) => {
    try {
      await propertyService.toggleActive(id);
      fetchDashboardData();
    } catch (err) {
      console.error('Failed to toggle property status:', err);
    }
  };

  const handleToggleRequirementActive = async (id: number | string) => {
    try {
      await requirementService.toggleActive(id);
      fetchDashboardData();
    } catch (err) {
      console.error('Failed to toggle requirement status:', err);
    }
  };

  const handleDeleteProperty = async (id: number | string) => {
    if (window.confirm('Are you sure you want to delete this property?')) {
      try {
        await propertyService.delete(id.toString());
        fetchDashboardData();
      } catch (err) {
        console.error('Failed to delete property:', err);
      }
    }
  };

  const handleDeleteRequirement = async (id: number | string) => {
    if (window.confirm('Are you sure you want to delete this requirement?')) {
      try {
        await requirementService.delete(id.toString());
        fetchDashboardData();
      } catch (err) {
        console.error('Failed to delete requirement:', err);
      }
    }
  };


  // --- Sub-Components ---

  const renderSidebar = () => (
    <div className="hidden lg:flex flex-col w-72 bg-white border-r border-gray-100 min-h-screen fixed left-0 top-20 z-30 pt-8 px-6 overflow-y-auto scrollbar-hide pb-20">
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


        <div>
          <h2 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Main Menu</h2>
          <nav className="space-y-2">
            <button onClick={() => setActiveTab('overview')} className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all ${activeTab === 'overview' ? 'bg-[#40a28f]/10 text-[#40a28f]' : 'text-gray-500 hover:bg-gray-50'}`}>
              <LayoutGrid className="h-5 w-5" /> Overview
            </button>
            {config['dashboard_my_properties'] === 'true' && (
              <button onClick={() => setActiveTab('assets')} className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all ${activeTab === 'assets' ? 'bg-[#40a28f]/10 text-[#40a28f]' : 'text-gray-500 hover:bg-gray-50'}`}>
                <Home className="h-5 w-5" /> My Properties
              </button>
            )}
            {config['dashboard_saved_list'] === 'true' && (
              <button onClick={() => setActiveTab('mylist')} className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all ${activeTab === 'mylist' ? 'bg-[#40a28f]/10 text-[#40a28f]' : 'text-gray-500 hover:bg-gray-50'}`}>
                <Heart className="h-5 w-5" /> Saved List
                {shortlistCount > 0 && <span className="ml-auto bg-[#40a28f] text-white text-[10px] px-2 py-0.5 rounded-full">{shortlistCount}</span>}
              </button>
            )}
            {config['dashboard_my_requirements'] === 'true' && (
              <button onClick={() => setActiveTab('requirements')} className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all ${activeTab === 'requirements' ? 'bg-[#40a28f]/10 text-[#40a28f]' : 'text-gray-500 hover:bg-gray-50'}`}>
                <FileText className="h-5 w-5" /> My Requirements
              </button>
            )}
            {config['dashboard_mortgage'] === 'true' && (userRole === 'owner' || userRole === 'admin') && (
              <button onClick={() => setActiveTab('finance')} className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all ${activeTab === 'finance' ? 'bg-[#40a28f]/10 text-[#40a28f]' : 'text-gray-500 hover:bg-gray-50'}`}>
                <CreditCard className="h-5 w-5" /> Mortgage
              </button>
            )}
            {config['dashboard_settings'] === 'true' && (
              <button onClick={() => setActiveTab('settings')} className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all ${activeTab === 'settings' ? 'bg-[#40a28f]/10 text-[#40a28f]' : 'text-gray-500 hover:bg-gray-50'}`}>
                <Settings className="h-5 w-5" /> Settings
              </button>
            )}
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
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 bg-[#40a28f] p-6 sm:p-10 rounded-[32px] sm:rounded-[40px] text-white relative overflow-hidden shadow-xl shadow-[#40a28f]/20">
        <div className="space-y-2 relative z-10 w-full">
          <h1 className="text-2xl sm:text-4xl font-black uppercase tracking-tighter">
            Welcome, {profile?.name || (userRole === 'owner' ? 'Owner' : 'User')}
          </h1>
          <p className="text-white/80 text-xs sm:text-base font-medium tracking-wide">
            {userRole === 'owner' ? 'Track your property performance & leads.' : 'Track your property search journey.'}
          </p>
        </div>
        <div className="relative z-10 hidden sm:block">
          <div className="flex gap-3">
            <div className="px-6 py-2 bg-white/20 backdrop-blur-md rounded-xl border border-white/20 text-center">
              <span className="block text-xl font-black">{userRole === 'owner' ? properties.length : shortlistCount}</span>
              <span className="text-[9px] uppercase tracking-widest opacity-80">{userRole === 'owner' ? 'Listings' : 'Saved'}</span>
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-24 -mt-24"></div>
      </div>

      {!profile?.is_premium && (
        <div className="bg-gradient-to-br from-amber-400 to-amber-600 p-8 rounded-[40px] text-white shadow-xl shadow-amber-500/20 relative overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-6 group border border-amber-300/30">
          <div className="absolute top-0 right-0 p-8 opacity-10 transform translate-x-12 -translate-y-12 group-hover:scale-110 transition-transform">
            <Crown className="w-48 h-48" />
          </div>
          <div className="relative z-10 space-y-2 text-center lg:text-left">
            <h3 className="text-2xl font-black uppercase tracking-tight">Unlock Professional Grade Intelligence</h3>
            <p className="text-white/90 text-sm font-medium">Access high-value properties (₹3Cr+), detailed lead analytics, and priority verification labels.</p>
          </div>
          <button 
            onClick={() => window.dispatchEvent(new CustomEvent('openPremiumModal'))}
            className="relative z-10 px-10 py-4 bg-white text-amber-600 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl hover:bg-amber-50 transition-all active:scale-95 whitespace-nowrap"
          >
            Go Premium
          </button>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: userRole === 'owner' ? 'Listings' : 'Shortlisted', value: userRole === 'owner' ? properties.length : shortlistCount, icon: userRole === 'owner' ? Home : Heart, color: 'text-[#40a28f]' },
          { label: userRole === 'owner' ? 'Requirements' : 'Matches', value: requirements.length, icon: userRole === 'owner' ? FileText : Search, color: 'text-blue-500' },
          { label: 'Notifications', value: notifications.filter(n => !n.is_read).length, icon: Bell, color: 'text-red-400' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow shrink-0">
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

        </div>

        {/* Sidebar Area (1 col) - Market Intelligence */}
        <div className="space-y-8">


          {/* Premium Upsell Card */}
          {(!profile?.is_premium && userRole !== 'admin') && (
            <div className="bg-gradient-to-br from-[#1e293b] to-[#0f172a] rounded-[40px] p-8 text-white text-center space-y-6 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-emerald-500/20 transition-all duration-700"></div>
              <div className="w-16 h-16 bg-gradient-to-tr from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20 rotate-3 group-hover:rotate-6 transition-transform">
                <Crown className="h-8 w-8 text-white" />
              </div>
              <div className="space-y-2">
                <h4 className="font-black uppercase tracking-widest text-xl">Upgrade to Premium</h4>
                <p className="text-gray-400 text-xs font-medium max-w-[200px] mx-auto leading-relaxed">
                  List luxury properties, access exclusive requirements, and get priority support.
                </p>
              </div>
              <button 
                onClick={() => window.dispatchEvent(new CustomEvent('openPremiumModal'))}
                className="w-full py-4 bg-emerald-500 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/25 active:scale-95"
              >
                Become Premium
              </button>
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
            onToggleActive={(prop) => handleTogglePropertyActive(prop.id)}
            onDelete={(prop) => handleDeleteProperty(prop.id)}
            compact
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
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-gray-800 uppercase tracking-tight">Mortgage & Lending</h2>
          <p className="text-gray-400 font-medium text-sm pt-1">Manage your borrowing requests and payments</p>
        </div>
        <button 
          onClick={() => { 
            setSelectedRequirement(null); 
            setReqDefaultPurpose('Mortgage');
            setIsReqModalOpen(true); 
          }} 
          className="bg-[#40a28f] text-white px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center gap-2 shadow-xl shadow-[#40a28f]/20 hover:bg-[#358a7a] transition-all"
        >
          <Plus className="h-4 w-4" /> Post Mortgage Request
        </button>
      </div>

      {/* Own Mortgage Requests */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {requirements.filter(r => r.purpose === 'Mortgage').length > 0 ? requirements.filter(r => r.purpose === 'Mortgage').map(req => (
          <div key={req.id} className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all flex flex-col justify-between">
            <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${req.is_verified ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                {req.is_verified ? 'Approved' : 'Pending'}
              </span>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center border border-gray-100">
                  <Landmark className="w-5 h-5 text-[#40a28f]" />
                </div>
                <div>
                  <h3 className="text-base font-black text-gray-800 uppercase tracking-tight">₹{(req.maxBudget / 100000).toFixed(1)}L Loan</h3>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{req.type} Collateral</p>
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                <div className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[9px] font-black uppercase tracking-widest border border-emerald-100">
                  Rate: {req.expected_rate || 'Market'}
                </div>
                <div className="px-3 py-1 bg-gray-50 rounded-lg text-[9px] font-bold text-gray-600 border border-gray-100">
                  {req.location}
                </div>
              </div>
              <div className="pt-4 flex items-center gap-3 border-t border-gray-50">
                <button 
                  onClick={() => { setSelectedRequirement(req); setReqDefaultPurpose('Mortgage'); setIsReqModalOpen(true); }}
                  className="flex-1 py-2 bg-gray-50 text-gray-400 hover:text-emerald-600 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all"
                >
                  <Edit className="h-3 w-3 inline mr-1" /> Edit
                </button>
                <button 
                  onClick={() => handleDeleteRequirement(req.id)}
                  className="px-3 py-2 bg-gray-50 text-red-300 hover:text-red-500 rounded-lg transition-all"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            </div>
          </div>
        )) : (
          <div className="col-span-full py-16 text-center bg-white rounded-[40px] border-2 border-dashed border-gray-100">
            <Landmark className="h-10 w-10 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-400 font-medium text-xs">No active mortgage requests.</p>
          </div>
        )}
      </div>

      {/* Community Opportunities Section (Sample Content) */}
      <div className="pt-6 space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-50 rounded-xl">
             <TrendingUp className="w-5 h-5 text-amber-500" />
          </div>
          <h3 className="text-xl font-black text-gray-800 uppercase tracking-tight">Community Lending Board</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { id: 's1', amount: '25L', asset: 'Commercial', rate: '10.5%', location: 'Rajnandgaon' },
            { id: 's2', amount: '12L', asset: 'Residential', rate: '12%', location: 'Durg' },
            { id: 's3', amount: '50L', asset: 'Plots', rate: '9.8%', location: 'Raipur' }
          ].map(sample => (
            <div key={sample.id} className="bg-gray-50 p-5 rounded-[28px] border border-gray-100 opacity-60 hover:opacity-100 transition-all cursor-not-allowed">
              <div className="space-y-3">
                <div className="flex justify-between items-start text-[8px] font-black uppercase tracking-widest text-amber-600">
                  <span>Sample Req</span>
                  <span className="bg-white px-2 py-0.5 rounded-full border border-amber-100">Live Board</span>
                </div>
                <div>
                  <h4 className="text-base font-black text-gray-800">₹{sample.amount} Loan</h4>
                  <p className="text-[10px] font-bold text-gray-500 uppercase">{sample.asset} Security</p>
                </div>
                <div className="flex justify-between items-center bg-white p-2.5 rounded-xl border border-gray-100">
                  <span className="text-[10px] font-black text-[#40a28f]">{sample.rate} Rate</span>
                  <span className="text-[9px] font-bold text-gray-400">{sample.location}</span>
                </div>
              </div>
            </div>
          ))}
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
        <button 
          onClick={() => {
            setSelectedRequirement(null);
            setReqDefaultPurpose(undefined);
            setIsReqModalOpen(true);
          }} 
          className="bg-[#40a28f] text-white px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center gap-2 shadow-xl shadow-[#40a28f]/20 hover:bg-[#358a7a] transition-all"
        >
          <Plus className="h-4 w-4" /> Post Requirement
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {requirements.length > 0 ? requirements.map(req => (
          <div key={req.id} className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all flex flex-col justify-between">
            <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${req.is_verified ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                {req.is_verified ? 'Approved' : 'Pending Approval'}
              </span>
              {!req.is_active && (
                <span className="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-gray-100 text-gray-500 border border-gray-200 flex items-center gap-1">
                  <EyeOff className="h-2.5 w-2.5" /> Hidden
                </span>
              )}
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
              
              <div className="pt-4 flex items-center gap-3 border-t border-gray-50">
                <button 
                  onClick={() => handleEditRequirement(req)}
                  className="flex-1 py-2.5 bg-gray-50 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 border border-transparent hover:border-emerald-100"
                >
                  <Edit className="h-3.5 w-3.5" /> Edit
                </button>
                <button 
                  onClick={() => handleToggleRequirementActive(req.id)}
                  className={`flex-1 py-2.5 border rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${req.is_active ? 'bg-gray-50 text-amber-500 border-amber-100 hover:bg-amber-50' : 'bg-gray-50 text-emerald-500 border-emerald-100 hover:bg-emerald-50'}`}
                >
                  {req.is_active ? <><EyeOff className="h-3.5 w-3.5" /> Hide</> : <><Eye className="h-3.5 w-3.5" /> Unhide</>}
                </button>
                <button 
                  onClick={() => handleDeleteRequirement(req.id)}
                  className="px-3 py-2.5 bg-gray-50 text-red-300 hover:text-red-500 hover:bg-red-50 rounded-xl border border-transparent hover:border-red-100 transition-all"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        )) : (
          <div className="col-span-full py-20 text-center bg-white rounded-[40px] border-2 border-dashed border-gray-100">
            <FileText className="h-12 w-12 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-400 font-medium">No requirements posted yet.</p>
          </div>
        )}
      </div>
      <AddRequirementModal 
        isOpen={isReqModalOpen} 
        onClose={() => { setIsReqModalOpen(false); setSelectedRequirement(null); setReqDefaultPurpose(undefined); }} 
        requirement={selectedRequirement}
        defaultPurpose={reqDefaultPurpose}
        onSuccess={fetchDashboardData} 
      />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#fcfdfd] flex flex-col">
      <div className="flex flex-1 relative">
        {renderSidebar()}

        <div className="flex-1 lg:pl-72 flex flex-col min-w-0">
          <div className="flex-grow">
            {/* Mobile Tab Bar */}
            <div className="lg:hidden flex overflow-x-auto gap-2 p-4 no-scrollbar bg-white sticky top-20 z-20 border-b border-gray-100">
              {[
                { id: 'overview', label: 'Overview', show: true },
                { id: 'assets', label: 'Properties', show: config['dashboard_my_properties'] === 'true' },
                { id: 'mylist', label: 'Saved', show: config['dashboard_saved_list'] === 'true' },
                { id: 'requirements', label: 'Needs', show: config['dashboard_my_requirements'] === 'true' },
                { id: 'finance', label: 'Mortgage', show: config['dashboard_mortgage'] === 'true' && (userRole === 'owner' || userRole === 'admin') },
                { id: 'settings', label: 'Settings', show: config['dashboard_settings'] === 'true' }
              ].filter(t => t.show).map(t => (
                <button key={t.id} onClick={() => setActiveTab(t.id as Tab)} className={`px-5 py-2 rounded-full text-xs font-black uppercase tracking-widest whitespace-nowrap transition-all ${activeTab === t.id ? 'bg-[#40a28f] text-white' : 'bg-gray-50 text-gray-400'}`}>
                  {t.label}
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
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default DashboardView;
