import * as React from 'react';
import { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  User as UserIcon,
  Users,
  Building2,
  CreditCard,
  CheckCircle,
  XCircle,
  Search,
  MoreVertical,
  ArrowUpRight,
  TrendingUp,
  AlertCircle,
  LogOut,
  ClipboardList,
  Settings,
  Bell,
  Filter,
  Download,
  Trash2,
  Ban,
  Check,
  Eye,
  BarChart3,
  Calendar,
  Globe,
  ShieldCheck,
  FileText,
  Loader2,
  ChevronRight,
  Plus,
  Clock,
  Star,
  RefreshCw,
  ShieldAlert,
  Palette,
  Image,
  Home,
  X,
  EyeOff,
  Menu,
  Send,
  Power,
  Map as MapIcon,
  Gavel,
  Crown,
  Landmark,
  Edit,
  ExternalLink,
} from 'lucide-react';
import { propertyService, requirementService, adminService, advertisementService, API_URL, getImageUrl } from '@/services/api';
import { useSiteConfig } from '@/contexts/SiteConfigContext';
import { Property, Requirement, User, Advertisement } from '@/types/types';
import AddPropertyModal from '@/components/AddPropertyModal';
import AddRequirementModal from '@/components/AddRequirementModal';

type AdminTab = 'Overview' | 'Listings' | 'Requirements' | 'Mortgages' | 'Users' | 'Premium' | 'Advertisements' | 'Settings' | 'CMS' | 'Auctions';

interface AdminViewProps {
  onLogout: () => void;
}

const AdminView: React.FC<AdminViewProps> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('Overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [properties, setProperties] = useState<Property[]>([]);
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [premiumRequests, setPremiumRequests] = useState<any[]>([]);
  const [dbStats, setDbStats] = useState<any>(null);
  const [advertisements, setAdvertisements] = useState<Advertisement[]>([]);
  const [loading, setLoading] = useState(true);
  const [premiumSubTab, setPremiumSubTab] = useState<'requests' | 'users'>('requests');

  // Auction State
  const auctionAdminProperties = React.useMemo(() => {
    return properties.filter(p => p.is_auction);
  }, [properties]);

  // Advertisement Modal State
  const [isAdModalOpen, setIsAdModalOpen] = useState(false);
  const [editingAd, setEditingAd] = useState<Advertisement | null>(null);
  const [adForm, setAdForm] = useState<Partial<Advertisement>>({
    headline: '',
    displayUrl: '',
    description: '',
    cta: '',
    imageUrl: '',
    is_active: true
  });
  const [isSavingAd, setIsSavingAd] = useState(false);

  // Add/Edit Property Modal State
  const [isAddPropertyModalOpen, setIsAddPropertyModalOpen] = useState(false);
  const [editingPropertyDetails, setEditingPropertyDetails] = useState<Property | null>(null);

  // Add/Edit Requirement Modal State
  const [isAddRequirementModalOpen, setIsAddRequirementModalOpen] = useState(false);
  const [editingRequirement, setEditingRequirement] = useState<Requirement | null>(null);

  const openAddPropertyModal = (property?: Property) => {
    setEditingPropertyDetails(property || null);
    setIsAddPropertyModalOpen(true);
  };

  const closeAddPropertyModal = () => {
    setIsAddPropertyModalOpen(false);
    setEditingPropertyDetails(null);
  };

  const openAddRequirementModal = (req?: Requirement) => {
    setEditingRequirement(req || null);
    setIsAddRequirementModalOpen(true);
  };

  const closeAddRequirementModal = () => {
    setIsAddRequirementModalOpen(false);
    setEditingRequirement(null);
    fetchData(true);
  };

  const openAdModal = (ad?: Advertisement) => {
    if (ad) {
      setEditingAd(ad);
      setAdForm({ ...ad });
    } else {
      setEditingAd(null);
      setAdForm({
        headline: '',
        displayUrl: '',
        description: '',
        cta: '',
        imageUrl: '',
        is_active: true
      });
    }
    setIsAdModalOpen(true);
  };

  const closeAdModal = () => {
    setIsAdModalOpen(false);
    setEditingAd(null);
  };

  const handleSaveAd = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingAd(true);
    try {
      if (editingAd && editingAd.id) {
        await advertisementService.adminUpdateAd(editingAd.id, adForm);
      } else {
        await advertisementService.adminCreateAd(adForm as Advertisement);
      }
      fetchData(true);
      closeAdModal();
    } catch (error) {
      console.error('Failed to save advertisement:', error);
      alert('Failed to save advertisement');
    } finally {
      setIsSavingAd(false);
    }
  };

  // CMS State
  const { config, updateConfig, refreshConfig } = useSiteConfig();
  const [localConfig, setLocalConfig] = useState(config);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [lastUploadedUrl, setLastUploadedUrl] = useState<string | null>(null);


  // Property Modal State
  const [isPropertyModalOpen, setIsPropertyModalOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);

  const openPropertyModal = (property: Property) => {
    setSelectedProperty(property);
    setIsPropertyModalOpen(true);
  };

  const closePropertyModal = () => {
    setIsPropertyModalOpen(false);
    setSelectedProperty(null);
  };

  // Requirement Modal State
  const [isRequirementModalOpen, setIsRequirementModalOpen] = useState(false);
  const [selectedRequirement, setSelectedRequirement] = useState<Requirement | null>(null);

  const [reqFilter, setReqFilter] = useState<'all' | 'pending' | 'active'>('all');
  const [listingFilter, setListingFilter] = useState<'all' | 'pending' | 'active'>('all');

  const openRequirementModal = (req: Requirement) => {
    setSelectedRequirement(req);
    setIsRequirementModalOpen(true);
  };

  const closeRequirementModal = () => {
    setIsRequirementModalOpen(false);
    setSelectedRequirement(null);
  };

  useEffect(() => {
    setLocalConfig(config);
  }, [config]);

  const updateLocalConfig = (key: string, value: string) => {
    setLocalConfig(prev => ({ ...prev, [key]: value }));
  };

  const saveConfig = async () => {
    setIsSaving(true);
    try {
      await adminService.updateConfig(localConfig);
      await refreshConfig();
      alert('Configuration updated successfully!');
    } catch (error) {
      console.error('Failed to update config:', error);
      alert('Failed to update configuration');
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadingImage(true);
      const file = e.target.files[0];
      const formData = new FormData();
      formData.append('image', file);

      try {
        const response = await adminService.uploadImage(formData);
        setLastUploadedUrl(response.url);
        // auto update the currently focused field? no, just copy
      } catch (error) {
        console.error('Upload failed', error);
        alert('Image upload failed');
      } finally {
        setUploadingImage(false);
      }
    }
  };

  const fetchData = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      // Fetch datasets independently to prevent one failure from blocking others
      const fetchProps = adminService.getAllProperties().then(setProperties).catch(err => console.error('Props fetch error', err));
      const fetchReqs = adminService.getAllRequirements().then(setRequirements).catch(err => console.error('Reqs fetch error', err));
      const fetchUsers = adminService.getUsers().then(setUsers).catch(err => console.error('Users fetch error', err));
      const fetchStats = adminService.getStats().then(setDbStats).catch(err => console.error('Stats fetch error', err));
      const fetchAds = advertisementService.adminGetAds().then(setAdvertisements).catch(err => console.error('Ads fetch error', err));
      const fetchPremiumRequests = adminService.getPremiumRequests().then(setPremiumRequests).catch(err => console.error('Premium fetch error', err));

      await Promise.allSettled([fetchProps, fetchReqs, fetchUsers, fetchStats, fetchAds, fetchPremiumRequests]);
    } catch (error) {
      console.error('Failed to fetch admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleToggleVerification = async (id: number | string) => {
    try {
      // Optimistic update
      setProperties(prev => prev.map(p => 
        p.id.toString() === id.toString() ? { ...p, is_verified: !p.is_verified } : p
      ));
      
      await adminService.toggleVerification(id);
    } catch (error) {
      console.error('Failed to toggle verification:', error);
      // Revert on error
      setProperties(prev => prev.map(p => 
        p.id.toString() === id.toString() ? { ...p, is_verified: !p.is_verified } : p
      ));
      alert('Failed to toggle verification status');
    }
  };

  const handleToggleRequirementVerification = async (id: number | string) => {
    try {
      // Optimistic update
      setRequirements(prev => prev.map(r => 
        r.id.toString() === id.toString() ? { ...r, is_verified: !r.is_verified } : r
      ));
      
      await adminService.toggleRequirementVerification(id);
    } catch (error) {
      console.error('Failed to toggle requirement verification:', error);
      // Revert on error
      setRequirements(prev => prev.map(r => 
        r.id.toString() === id.toString() ? { ...r, is_verified: !r.is_verified } : r
      ));
      alert('Failed to toggle requirement verification');
    }
  };


  const handleToggleFeatured = async (id: number | string) => {
    try {
      // Optimistic update
      setProperties(prev => prev.map(p => 
        p.id.toString() === id.toString() ? { ...p, is_featured: !p.is_featured } : p
      ));
      
      await adminService.toggleFeatured(id);
    } catch (error) {
      console.error('Failed to toggle featured:', error);
      // Revert on error
      setProperties(prev => prev.map(p => 
        p.id.toString() === id.toString() ? { ...p, is_featured: !p.is_featured } : p
      ));
      alert('Failed to toggle featured status');
    }
  };

  const handleToggleActive = async (id: number | string) => {
    try {
      // Optimistic update
      setProperties(prev => prev.map(p => 
        p.id.toString() === id.toString() ? { ...p, is_active: !p.is_active } : p
      ));
      
      await adminService.toggleActive(id);
    } catch (error) {
      console.error('Failed to toggle active status:', error);
      // Revert on error
      setProperties(prev => prev.map(p => 
        p.id.toString() === id.toString() ? { ...p, is_active: !p.is_active } : p
      ));
      alert('Failed to toggle active status');
    }
  };

  const handleToggleRequirementActive = async (id: number | string) => {
    try {
      // Optimistic update
      setRequirements(prev => prev.map(r => 
        r.id.toString() === id.toString() ? { ...r, is_active: !r.is_active } : r
      ));
      
      await adminService.toggleRequirementActive(id);
    } catch (error) {
      console.error('Failed to toggle requirement active status:', error);
      // Revert on error
      setRequirements(prev => prev.map(r => 
        r.id.toString() === id.toString() ? { ...r, is_active: !r.is_active } : r
      ));
      alert('Failed to toggle requirement active status');
    }
  };


  const handleToggleBan = async (id: number) => {
    try {
      // Optimistic update
      setUsers(prev => prev.map(u => 
        u.id === id ? { ...u, role: u.role === 'admin' ? 'seeker' : 'admin' } : u
      ));
      
      await adminService.toggleUserBan(id);
    } catch (error) {
      console.error('Failed to toggle user ban:', error);
      // Revert on error
      setUsers(prev => prev.map(u => 
        u.id === id ? { ...u, role: u.role === 'admin' ? 'seeker' : 'admin' } : u
      ));
      alert('Failed to toggle user access status');
    }
  };


  const handleDeleteUser = async (id: number) => {
    if (window.confirm('Are you sure you want to permanently delete this user?')) {
      try {
        await adminService.deleteUser(id);
        fetchData();
      } catch (error) {
        console.error('Failed to delete user:', error);
      }
    }
  };

  const handleDeleteProperty = async (id: string | number) => {
    if (window.confirm('Are you sure you want to delete this listing?')) {
      try {
        await propertyService.delete(id.toString());
        fetchData();
      } catch (error) {
        console.error('Failed to delete property:', error);
      }
    }
  };

  const handleDeleteRequirement = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this requirement?')) {
      try {
        await requirementService.delete(id.toString());
        closeRequirementModal(); // Close modal if open
        fetchData();
      } catch (error) {
        console.error('Failed to delete requirement:', error);
      }
    }
  };


  const handlePremiumRequest = async (id: number, status: 'approved' | 'rejected') => {
    try {
      await adminService.updatePremiumRequest(id, status);
      fetchData(true);
      alert(`Request ${status} successfully`);
    } catch (error) {
      console.error('Failed to handle premium request:', error);
      alert('Failed to update request');
    }
  };

  const handleTogglePremium = async (id: number, currentStatus: boolean) => {
    try {
      // Optimistic update
      setUsers(prev => prev.map(u => 
        u.id === id ? { ...u, is_premium: !currentStatus } : u
      ));
      
      await adminService.toggleUserPremium(id, !currentStatus);
      alert(`User premium status ${!currentStatus ? 'enabled' : 'disabled'} successfully`);
      await fetchData(true);
    } catch (error) {
      console.error('Failed to toggle premium:', error);
      alert('Failed to update premium status');
      await fetchData(true);
    }
  };

  const handleExport = async () => {
    try {
      const blob = await adminService.exportData();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `rjg_admin_export_${new Date().toISOString().split('T')[0]}.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export data');
    }
  }
  const toggleSystemStatus = async () => {
    const newStatus = localConfig.maintenance_mode === 'true' ? 'false' : 'true';
    // Optimistic update
    setLocalConfig(prev => ({ ...prev, maintenance_mode: newStatus }));

    try {
      await adminService.updateConfig({ ...localConfig, maintenance_mode: newStatus });
      await refreshConfig();
    } catch (error) {
      console.error('Failed to toggle system status:', error);
      alert('Failed to update system status');
      // Revert on failure
      setLocalConfig(config);
    }
  };

  // Filtered lists for search and tabs
  const filteredProperties = properties.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.owner?.name?.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (listingFilter === 'pending') return !p.is_verified;
    if (listingFilter === 'active') return p.is_active;
    return true;
  });

  const filteredAuctions = properties.filter(p => {
    if (!p.is_auction) return false;
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.owner?.name?.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSearch;
  });

  const filteredRequirements = requirements.filter(r => {
    const matchesSearch = r.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (reqFilter === 'pending') return !r.is_verified;
    if (reqFilter === 'active') return r.is_active;
    return true;
  });

  const pendingProperties = properties.filter(p => !p.is_verified);
  const pendingRequirements = requirements.filter(r => !r.is_verified);

  // Compute recent activity from real data
  const recentActivity = [
    ...properties.slice(0, 5).map(p => ({
      id: p.id,
      icon: Home,
      type: 'property',
      title: `New Property: ${p.title}`,
      time: new Date(p.created_at || Date.now()).toLocaleTimeString(),
      rawDate: p.created_at,
      user: p.owner?.name || 'A user',
      color: 'bg-emerald-50 text-emerald-600'
    })),
    ...requirements.slice(0, 5).map(r => ({
      id: r.id,
      icon: Search,
      type: 'requirement',
      title: `New Requirement: ${r.type} in ${r.location}`,
      time: new Date(r.created_at || Date.now()).toLocaleTimeString(),
      rawDate: r.created_at,
      user: r.user?.name || 'A visitor',
      color: 'bg-blue-50 text-blue-600'
    })),
  ].sort((a: any, b: any) => {
    const dateA = new Date(a.rawDate || 0).getTime();
    const dateB = new Date(b.rawDate || 0).getTime();
    return dateB - dateA;
  }).slice(0, 8);

  // Stats for the overview
  const stats = [
    {
      label: 'Total Users',
      value: users.length.toString(),
      icon: Users,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      trend: '+12%',
      onClick: () => setActiveTab('Users')
    },
    {
      label: 'Properties',
      value: properties.length.toString(),
      icon: Home,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      trend: '+5%',
      onClick: () => { setActiveTab('Listings'); setListingFilter('all'); }
    },
    {
      label: 'Pending Approval',
      value: (pendingProperties.length + pendingRequirements.length).toString(),
      icon: ShieldAlert,
      color: 'text-orange-600',
      bg: 'bg-orange-50',
      trend: 'Needs Action',
      onClick: () => { setActiveTab('Listings'); setListingFilter('pending'); }
    },
    {
      label: 'Premium Users',
      value: users.filter(u => u.is_premium).length.toString(),
      icon: Crown,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      trend: `${premiumRequests.filter(r => r.status === 'pending').length} Pending`,
      onClick: () => setActiveTab('Premium')
    },
  ];

  // Auction stats for overview
  const auctionStatsOverview = [
    {
      label: 'Active Auctions',
      value: auctionAdminProperties.filter(p => p.is_active).length.toString(),
      icon: Gavel,
      color: 'text-red-600',
      bg: 'bg-red-50',
      trend: `${auctionAdminProperties.length} Total listings`,
      onClick: () => setActiveTab('Auctions')
    },
    {
      label: 'Verified Assets',
      value: auctionAdminProperties.filter(p => p.is_verified).length.toString(),
      icon: ShieldCheck,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      trend: 'Legally cleared',
      onClick: () => setActiveTab('Auctions')
    },
    {
      label: 'Featured Listings',
      value: auctionAdminProperties.filter(p => p.is_featured).length.toString(),
      icon: Star,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      trend: 'Premium visibility',
      onClick: () => setActiveTab('Auctions')
    },
  ];

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex-1 flex flex-col items-center justify-center min-h-[600px] space-y-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-[#40a28f]/10 rounded-full"></div>
            <div className="w-16 h-16 border-4 border-[#40a28f] border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
          </div>
          <p className="text-sm font-bold text-gray-400 uppercase tracking-widest animate-pulse">Initializing System...</p>
        </div>
      );
    }

    switch (activeTab) {
      case 'Listings':
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Property Management</h2>
                <p className="text-sm text-gray-500 font-medium">Review and manage site-wide listings</p>
              </div>
              <button
                onClick={() => openAddPropertyModal()}
                className="flex items-center gap-2 px-6 py-2.5 bg-[#40a28f] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[#358a7a] transition-all shadow-xl shadow-[#40a28f]/20"
              >
                <Plus className="h-4 w-4" /> Add Property
              </button>
              <div className="flex items-center gap-3">
                <div className="bg-gray-100 p-1 rounded-xl flex items-center">
                  <button
                    onClick={() => setListingFilter('all')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${listingFilter === 'all' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setListingFilter('pending')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${listingFilter === 'pending' ? 'bg-white shadow-sm text-orange-600' : 'text-gray-500 hover:text-gray-900'}`}
                  >
                    Pending ({pendingProperties.length})
                  </button>
                  <button
                    onClick={() => setListingFilter('active')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${listingFilter === 'active' ? 'bg-white shadow-sm text-emerald-600' : 'text-gray-500 hover:text-gray-900'}`}
                  >
                    Active
                  </button>
                </div>
                <div className="flex gap-3">
                  <div className="relative">
                    <Search className="h-4 w-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search by title, owner..."
                      className="pl-11 pr-4 py-3 bg-white border border-gray-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-[#40a28f]/5 focus:border-[#40a28f] w-80 shadow-sm transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-100 rounded-[32px] overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-50/50 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50">
                    <tr>
                      <th className="px-8 py-5">Property Details</th>
                      <th className="px-8 py-5">Posted By</th>
                      <th className="px-8 py-5">Owner Info</th>
                      <th className="px-8 py-5">Status</th>
                      <th className="px-8 py-5 text-center">Badges</th>
                      <th className="px-8 py-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filteredProperties.map((p) => (
                      <tr key={p.id} className="hover:bg-gray-50/30 transition-colors">
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-5">
                            <div className="w-14 h-14 rounded-2xl bg-gray-50 overflow-hidden shrink-0 border border-gray-100 shadow-sm">
                              <img src={getImageUrl(p.imageUrl) || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=400'} className="w-full h-full object-cover" alt="" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <p className="font-bold text-gray-800">{p.is_auction ? 'a' : 'p'}{p.id} - {p.title}</p>
                                {p.deleted_at && <span className="bg-red-50 text-red-600 text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-widest">Deleted Record</span>}
                                {!p.is_verified && <span className="bg-orange-50 text-orange-600 text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-widest animate-pulse">Pending</span>}
                              </div>
                              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{p.location} • ₹{p.price.toLocaleString('en-IN')}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${p.posted_as === 'Owner' ? 'bg-purple-50 text-purple-600' : p.posted_as === 'Broker' ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'}`}>
                            {p.posted_as || 'Owner'}
                          </span>
                        </td>
                        <td className="px-8 py-6">
                          <div>
                            <p className="text-sm font-bold text-gray-700">{p.owner?.name || 'Generic User'}</p>
                            <p className="text-[10px] font-bold text-gray-400">{p.owner?.email || 'No email'}</p>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <span className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${p.is_active ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-500'}`}>
                            {p.is_active ? 'Active' : 'Offline'}
                          </span>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex items-center justify-center gap-3">
                            <button onClick={() => handleToggleVerification(p.id)} className={`p-2 rounded-xl transition-all ${p.is_verified ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-300 hover:bg-blue-50 hover:text-blue-600'}`}>
                              <ShieldCheck className="h-4 w-4" />
                            </button>
                            <button onClick={() => handleToggleFeatured(p.id)} className={`p-2 rounded-xl transition-all ${p.is_featured ? 'bg-yellow-50 text-yellow-600' : 'bg-gray-100 text-gray-300 hover:bg-yellow-50 hover:text-yellow-600'}`}>
                              <Star className={`h-4 w-4 ${p.is_featured ? 'fill-current' : ''}`} />
                            </button>
                          </div>
                        </td>
                        <td className="px-8 py-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button onClick={() => openPropertyModal(p)} className="p-2 text-[#40a28f] hover:bg-[#40a28f]/5 rounded-xl transition-all" title="View Property">
                              <Eye className="h-4 w-4" />
                            </button>
                            <button onClick={() => handleToggleActive(p.id)} className={`p-2 rounded-xl transition-colors ${p.is_active ? 'text-gray-400 hover:text-gray-600' : 'text-[#40a28f] hover:bg-[#40a28f]/5'}`} title={p.is_active ? 'Deactivate' : 'Activate'}>
                              {p.is_active ? <EyeOff className="h-4 w-4" /> : <Power className="h-4 w-4" />}
                            </button>
                            <button onClick={() => handleDeleteProperty(p.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all" title="Delete Property">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredProperties.length === 0 && (
                  <div className="py-20 text-center">
                    <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">No matching properties found</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 'Requirements':
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight">User Requirements</h2>
                <p className="text-sm text-gray-500 font-medium">High intent property-seeking traffic</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-gray-100 p-1 rounded-xl flex items-center">
                  <button
                    onClick={() => setReqFilter('all')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${reqFilter === 'all' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setReqFilter('pending')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${reqFilter === 'pending' ? 'bg-white shadow-sm text-orange-600' : 'text-gray-500 hover:text-gray-900'}`}
                  >
                    Pending ({pendingRequirements.length})
                  </button>
                  <button
                    onClick={() => setReqFilter('active')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${reqFilter === 'active' ? 'bg-white shadow-sm text-emerald-600' : 'text-gray-500 hover:text-gray-900'}`}
                  >
                    Active
                  </button>
                </div>
                <div className="relative">
                  <Search className="h-4 w-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search location, name..."
                    className="pl-11 pr-4 py-3 bg-white border border-gray-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-[#40a28f]/5 focus:border-[#40a28f] w-80 shadow-sm transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-100 rounded-[32px] overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-50/50 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50">
                    <tr>
                      <th className="px-8 py-5">Goal / Type</th>
                      <th className="px-8 py-5">Budget Range</th>
                      <th className="px-8 py-5">Location</th>
                      <th className="px-8 py-5">Posted By</th>
                      <th className="px-8 py-5">Status</th>
                      <th className="px-8 py-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filteredRequirements.filter(r => r.purpose !== 'Mortgage').map((r) => (
                      <tr key={r.id} className="hover:bg-gray-50/30 transition-colors">
                        <td className="px-8 py-6">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-bold text-gray-800">r{r.id} - {r.purpose === 'Buy' ? 'Buying' : 'Renting'} {r.type}</p>
                              {r.deleted_at && <span className="bg-red-50 text-red-600 text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-widest">Historical</span>}
                              {!r.is_verified && <span className="bg-orange-50 text-orange-600 text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-widest animate-pulse">New</span>}
                            </div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{r.minArea} - {r.maxArea} Sq Ft</p>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <span className="inline-flex px-3 py-1 bg-white border border-gray-100 rounded-xl text-xs font-bold text-gray-700 shadow-sm">
                            ₹{r.minBudget.toLocaleString('en-IN')} - {r.maxBudget.toLocaleString('en-IN')}
                          </span>
                        </td>
                        <td className="px-8 py-6 text-sm font-bold text-gray-600">{r.location}</td>
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-black text-xs">
                              {r.user?.name?.[0] || 'V'}
                            </div>
                            <div>
                              <p className="text-[10px] font-black text-gray-700 uppercase">{r.user?.name || 'Visitor'}</p>
                              <p className="text-[9px] font-bold text-gray-400 lowercase">{r.user?.email || 'No email'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <span className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${r.is_active ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-500'}`}>
                            {r.is_active ? 'Active' : 'Offline'}
                          </span>
                        </td>
                        <td className="px-8 py-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button onClick={() => openRequirementModal(r)} className="p-2 text-[#40a28f] hover:bg-[#40a28f]/5 rounded-xl transition-all" title="View Requirement">
                              <Eye className="h-4 w-4" />
                            </button>
                            <button onClick={() => openAddRequirementModal(r)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-all" title="Edit">
                              <Edit className="h-4 w-4" />
                            </button>
                            <button onClick={() => handleToggleRequirementActive(r.id)} className={`p-2 rounded-xl transition-colors ${r.is_active ? 'text-gray-400 hover:text-gray-600' : 'text-[#40a28f] hover:bg-[#40a28f]/5'}`} title={r.is_active ? 'Deactivate' : 'Activate'}>
                              {r.is_active ? <EyeOff className="h-4 w-4" /> : <Power className="h-4 w-4" />}
                            </button>
                            {!r.is_verified && (
                              <button onClick={() => handleToggleRequirementVerification(r.id)} className="p-2 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-100 transition-colors">
                                <CheckCircle className="h-4 w-4" />
                              </button>
                            )}
                            <button onClick={() => handleDeleteRequirement(Number(r.id))} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredRequirements.length === 0 && (
                  <div className="py-20 text-center">
                    <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">No requirements matched your search</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 'Users':
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
                <p className="text-sm text-gray-500">Control user access and roles</p>
              </div>
              <button className="flex items-center gap-2 px-4 py-2 bg-[#40a28f] text-white rounded-lg text-sm font-medium hover:bg-[#358a7a] transition-colors shadow-sm">
                <Plus className="h-4 w-4" /> Add User
              </button>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 text-gray-700 font-semibold border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4">User</th>
                      <th className="px-6 py-4">Role</th>
                      <th className="px-6 py-4">Badge</th>
                      <th className="px-6 py-4">Joined</th>
                      <th className="px-6 py-4 text-center">Status</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {users.map((u) => (
                      <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-[#40a28f] font-bold text-lg border border-gray-200">
                              {u.name?.[0]?.toUpperCase() || 'U'}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900 flex items-center gap-2">
                                u{u.id} - {u.name}
                                {u.is_premium && (
                                  <Crown className="w-3 h-3 text-emerald-600 fill-current" />
                                )}
                                {u.deleted_at && (
                                  <span className="bg-red-50 text-red-600 text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-widest">Deactivated</span>
                                )}
                              </p>
                              <p className="text-gray-500 text-xs">{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <select
                            value={u.role}
                            onChange={async (e) => {
                              try {
                                const newRole = e.target.value;
                                // Optimistic update
                                setUsers(prev => prev.map(user =>
                                  user.id === u.id ? { ...user, role: newRole as any } : user
                                ));

                                await adminService.updateUserRole(u.id, newRole);
                                alert('Role updated successfully!');
                                await fetchData(true);
                              } catch (err) {
                                console.error('Failed to update role:', err);
                                alert('Failed to update role. Check console for details.');
                                await fetchData(true); // Revert to server state
                              }
                            }}
                            className="bg-white border border-gray-300 text-gray-700 text-xs rounded-lg focus:ring-[#40a28f] focus:border-[#40a28f] block w-full p-2.5 shadow-sm"
                          >
                            <option value="seeker">Seeker</option>
                            <option value="owner">Owner</option>
                            <option value="developer">Developer</option>
                            <option value="admin">Admin</option>
                          </select>
                        </td>
                        <td className="px-6 py-4">
                          <select
                            value={u.badge || 'User'}
                            onChange={async (e) => {
                              try {
                                const newBadge = e.target.value;
                                // Optimistic update
                                setUsers(prev => prev.map(user =>
                                  user.id === u.id ? { ...user, badge: newBadge } : user
                                ));

                                await adminService.updateUserBadge(u.id, newBadge);
                                alert('Badge updated successfully!');
                                await fetchData(true);
                              } catch (err) {
                                console.error('Failed to update badge:', err);
                                alert('Failed to update badge. Check console for details.');
                                await fetchData(true); // Revert
                              }
                            }}
                            className={`bg-white border border-gray-300 text-[10px] font-black uppercase tracking-widest rounded-lg focus:ring-[#40a28f] focus:border-[#40a28f] block w-full p-2.5 shadow-sm 
                              ${u.badge === 'Verified Broker' ? 'text-blue-600' :
                                u.badge === 'Verified User' ? 'text-emerald-600' :
                                  u.badge === 'Verified Builder' ? 'text-purple-600' :
                                    u.badge === 'Developer' ? 'text-indigo-600' :
                                      'text-gray-500'}`}
                          >
                            <option value="User">User</option>
                            <option value="Verified User">Verified User</option>
                            <option value="Verified Broker">Verified Broker</option>
                            <option value="Verified Builder">Verified Builder</option>
                            <option value="Developer">Developer</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 text-gray-600">
                          {u.created_at ? new Date(u.created_at).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Active
                          </span>
                        </td>

                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            {u.phone && (
                              <a
                                href={`https://wa.me/${u.phone.replace(/\D/g, '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all"
                                title="Contact via WhatsApp"
                              >
                                <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.414 0 .018 5.394 0 12.03c0 2.119.554 4.188 1.607 6.04L0 24l6.117-1.605A11.758 11.758 0 0012.05 24c6.632 0 12.03-5.394 12.033-12.03a11.87 11.87 0 00-3.606-8.504z" />
                                </svg>
                              </a>
                            )}
                            <button
                              onClick={() => handleTogglePremium(u.id, !!u.is_premium)}
                              className={`p-2 rounded-lg transition-all ${
                                u.is_premium 
                                  ? 'text-emerald-600 bg-emerald-50' 
                                  : 'text-gray-400 hover:text-emerald-600 hover:bg-emerald-50'
                              }`}
                              title={u.is_premium ? 'Remove Premium Status' : 'Grant Premium Status'}
                            >
                              <Crown className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleToggleBan(u.id)}
                              className={`p-2 rounded-lg transition-all ${
                                u.role === 'admin' 
                                  ? 'text-orange-600 hover:text-orange-700 bg-orange-50' 
                                  : 'text-gray-400 hover:text-green-600 hover:bg-green-50'
                              }`}
                              title={u.role === 'admin' ? 'Remove Admin Access' : 'Grant Admin Access'}
                            >
                              {u.role === 'admin' ? <ShieldCheck className="h-4 w-4" /> : <Ban className="h-4 w-4" />}
                            </button>
                            <button
                              onClick={() => handleDeleteUser(u.id)}
                              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                              title="Delete User"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {users.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                          No users found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table >
              </div >
            </div >
          </div >
        );


      case 'Premium':
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Premium Membership Management</h2>
                <p className="text-sm text-gray-500 font-medium">Manage user requests and direct premium status assignment</p>
              </div>
            </div>

            <div className="flex gap-4 p-1 bg-gray-100/50 rounded-2xl w-fit">
              <button 
                onClick={() => setPremiumSubTab('requests')}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${premiumSubTab === 'requests' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <ClipboardList className="w-3.5 h-3.5" />
                Pending Requests ({premiumRequests.filter(r => r.status === 'pending').length})
              </button>
              <button 
                onClick={() => setPremiumSubTab('users')}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${premiumSubTab === 'users' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <Users className="w-3.5 h-3.5" />
                All Users
              </button>
            </div>

            {premiumSubTab === 'requests' ? (
              <div className="bg-white border border-gray-100 rounded-[32px] overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-gray-50/50 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50">
                      <tr>
                        <th className="px-8 py-5">User</th>
                        <th className="px-8 py-5">Message</th>
                        <th className="px-8 py-5">Date</th>
                        <th className="px-8 py-5">Status</th>
                        <th className="px-8 py-5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {premiumRequests.map((r) => (
                        <tr key={r.id} className="hover:bg-gray-50/30 transition-colors">
                          <td className="px-8 py-6">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-black text-lg">
                                {r.user?.name?.[0]?.toUpperCase() || 'U'}
                              </div>
                              <div>
                                <p className="font-bold text-gray-800">{r.user?.name}</p>
                                <p className="text-[10px] font-bold text-gray-400 lowercase">{r.user?.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-6 max-w-xs">
                            <p className="text-sm text-gray-600 italic">"{r.message || 'No message provided'}"</p>
                          </td>
                          <td className="px-8 py-6 text-sm font-bold text-gray-500">
                            {new Date(r.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-8 py-6">
                            <span className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                              r.status === 'approved' ? 'bg-emerald-50 text-emerald-600' : 
                              r.status === 'rejected' ? 'bg-red-50 text-red-600' : 
                              'bg-orange-50 text-orange-600 animate-pulse'
                            }`}>
                              {r.status}
                            </span>
                          </td>
                          <td className="px-8 py-6 text-right">
                            {r.status === 'pending' && (
                              <div className="flex items-center justify-end gap-2">
                                <button 
                                  onClick={() => handlePremiumRequest(r.id, 'approved')} 
                                  className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"
                                  title="Approve Request"
                                >
                                  <CheckCircle className="h-5 w-5" />
                                </button>
                                <button 
                                  onClick={() => handlePremiumRequest(r.id, 'rejected')} 
                                  className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-all"
                                  title="Reject Request"
                                >
                                  <X className="h-5 w-5" />
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                      {premiumRequests.length === 0 && (
                        <tr>
                          <td colSpan={5} className="py-20 text-center">
                            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">No premium requests found</p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search users to upgrade..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-white border border-gray-100 rounded-2xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-sm"
                  />
                </div>

                <div className="bg-white border border-gray-100 rounded-[32px] overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-gray-50/50 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50">
                        <tr>
                          <th className="px-8 py-5">User</th>
                          <th className="px-8 py-5">Role</th>
                          <th className="px-8 py-5">Membership</th>
                          <th className="px-8 py-5 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {users.filter(u => 
                          u.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          u.email?.toLowerCase().includes(searchQuery.toLowerCase())
                        ).map((u) => (
                          <tr key={u.id} className="hover:bg-gray-50/30 transition-colors">
                            <td className="px-8 py-6">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center font-black text-lg">
                                  {u.name?.[0]?.toUpperCase() || 'U'}
                                </div>
                                <div>
                                  <p className="font-bold text-gray-800">{u.name}</p>
                                  <p className="text-[10px] font-bold text-gray-400 lowercase">{u.email}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-8 py-6">
                              <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">{u.role}</span>
                            </td>
                            <td className="px-8 py-6">
                              {u.is_premium ? (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest border border-emerald-100">
                                  <Crown className="w-3 h-3" /> Premium
                                </span>
                              ) : (
                                <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Standard</span>
                              )}
                            </td>
                            <td className="px-8 py-6 text-right">
                              <button
                                onClick={() => handleTogglePremium(u.id, !!u.is_premium)}
                                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                  u.is_premium 
                                    ? 'bg-red-50 text-red-600 hover:bg-red-100' 
                                    : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                                }`}
                              >
                                {u.is_premium ? 'Downgrade' : 'Upgrade to Premium'}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case 'Advertisements':
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Advertisement Management</h2>
                <p className="text-sm text-gray-500">Manage promotional banners across the site</p>
              </div>
              <button
                onClick={() => openAdModal()}
                className="flex items-center gap-2 px-4 py-2 bg-[#40a28f] text-white rounded-lg text-sm font-medium hover:bg-[#358a7a] transition-colors shadow-sm"
              >
                <Plus className="h-4 w-4" /> Add Advertisement
              </button>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 text-gray-700 font-semibold border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4">Image</th>
                      <th className="px-6 py-4">Headline</th>
                      <th className="px-6 py-4">Display URL</th>
                      <th className="px-6 py-4 text-center">Status</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {advertisements.map((ad) => (
                      <tr key={ad.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <img src={getImageUrl(ad.imageUrl) || 'https://via.placeholder.com/150'} alt="Ad" className="w-16 h-10 object-cover rounded shadow" />
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="font-semibold text-gray-900">ad{ad.id} - {ad.headline}</span>
                            {ad.deleted_at && <span className="text-[10px] text-red-500 font-bold uppercase">Deleted</span>}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-blue-600 truncate max-w-[200px]">
                          <a href={ad.displayUrl} target="_blank" rel="noreferrer">{ad.displayUrl}</a>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${ad.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                            {ad.is_active ? 'Active' : 'Hidden'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={async () => {
                                if (!ad.id) return;
                                try {
                                  // Optimistic update
                                  setAdvertisements(prev => prev.map(a => 
                                    a.id === ad.id ? { ...a, is_active: !a.is_active } : a
                                  ));
                                  
                                  await advertisementService.adminUpdateAd(ad.id, { is_active: !ad.is_active });
                                } catch (e) { 
                                  console.error('Toggle ad status failed', e); 
                                  // Revert on error
                                  setAdvertisements(prev => prev.map(a => 
                                    a.id === ad.id ? { ...a, is_active: !a.is_active } : a
                                  ));
                                }
                              }}
                              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                              title={ad.is_active ? 'Hide Ad' : 'Show Ad'}
                            >
                              {ad.is_active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                            <button
                              onClick={async () => {
                                if (!ad.id || !confirm('Delete this advertisement?')) return;
                                try {
                                  await advertisementService.adminDeleteAd(ad.id);
                                  fetchData(true);
                                } catch (e) { console.error('Delete ad failed', e); }
                              }}
                              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                              title="Delete Ad"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {advertisements.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                          No advertisements found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      case 'Mortgages':
        const mortgageRequests = filteredRequirements.filter(r => r.purpose === 'Mortgage');
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Lending & Mortgage Requests</h2>
                <p className="text-sm text-gray-500 font-medium">Verify and manage community lending requests</p>
              </div>
              <div className="relative">
                <Search className="h-4 w-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search location, user..."
                  className="pl-11 pr-4 py-3 bg-white border border-gray-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-[#40a28f]/5 focus:border-[#40a28f] w-80 shadow-sm transition-all"
                />
              </div>
            </div>

            <div className="bg-white border border-gray-100 rounded-[32px] overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-50/50 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50">
                    <tr>
                      <th className="px-8 py-5">Request ID / Type</th>
                      <th className="px-8 py-5">Amount Required</th>
                      <th className="px-8 py-5">Location</th>
                      <th className="px-8 py-5">Requester</th>
                      <th className="px-8 py-5">Verification</th>
                      <th className="px-8 py-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {mortgageRequests.map((m) => (
                      <tr key={m.id} className="hover:bg-gray-50/30 transition-colors">
                        <td className="px-8 py-6">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-bold text-gray-800">m{m.id}</p>
                              {m.deleted_at && <span className="bg-red-50 text-red-600 text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-widest">Historical</span>}
                              {!m.is_verified && <span className="bg-orange-50 text-orange-600 text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-widest animate-pulse">New Request</span>}
                            </div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{m.type} Asset</p>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <span className="inline-flex px-3 py-1 bg-white border border-gray-100 rounded-xl text-xs font-bold text-gray-700 shadow-sm">
                            ₹{(m.maxBudget / (m.maxBudget >= 10000000 ? 10000000 : 100000)).toFixed(1)}{m.maxBudget >= 10000000 ? ' Cr' : ' L'}
                          </span>
                        </td>
                        <td className="px-8 py-6 text-sm font-bold text-gray-600">{m.location}</td>
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-black text-xs">
                              {m.contact_name?.[0] || m.user?.name?.[0] || 'V'}
                            </div>
                            <div>
                              <p className="text-[10px] font-black text-gray-700 uppercase">{m.contact_name || m.user?.name || 'Visitor'}</p>
                              <p className="text-[9px] font-bold text-gray-400">{m.contact_phone || m.user?.phone || 'No phone'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <button 
                            onClick={() => handleToggleRequirementVerification(m.id)}
                            className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${m.is_verified ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-orange-600 shadow-sm border border-orange-100'}`}
                          >
                            {m.is_verified ? 'Verified' : 'Pending Verification'}
                          </button>
                        </td>
                        <td className="px-8 py-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button onClick={() => openRequirementModal(m)} className="p-2 text-[#40a28f] hover:bg-[#40a28f]/5 rounded-xl transition-all" title="View Quick Details">
                              <Eye className="h-4 w-4" />
                            </button>
                            <button onClick={() => openAddRequirementModal(m)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-all" title="Edit Mortgage">
                              <Edit className="h-4 w-4" />
                            </button>
                            <button onClick={() => window.location.href = `/mortgage/${m.id}`} className="p-2 text-gray-400 hover:text-[#40a28f] hover:bg-[#40a28f]/5 rounded-xl transition-all" title="View Full Page">
                              <ArrowUpRight className="h-4 w-4" />
                            </button>
                            <button onClick={() => handleToggleRequirementVerification(m.id)} className={`p-2 transition-all rounded-xl ${m.is_verified ? 'text-blue-600 bg-blue-50' : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50'}`} title={m.is_verified ? 'Verified' : 'Verify'}>
                              <ShieldCheck className="h-4 w-4" />
                            </button>
                            <button onClick={() => handleDeleteRequirement(Number(m.id))} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all" title="Delete">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {mortgageRequests.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-8 py-12 text-center text-gray-500 font-bold uppercase tracking-widest text-[10px]">
                          No mortgage requests found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      case 'Settings':
        return (
          <div className="max-w-4xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Platform Settings</h2>
              <p className="text-sm text-gray-500">Configure global application parameters</p>
            </div>

            <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm space-y-8">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
                  <CreditCard className="h-6 w-6" />
                </div>
                <div className="flex-1 space-y-6">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Platform Thresholds</h3>
                    <p className="text-sm text-gray-500">Configure business rules and logic</p>
                  </div>

                  <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-900">Premium Price Threshold</p>
                      <p className="text-xs text-gray-500 mt-1">Properties above this price become Premium-only listings</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500 font-medium">₹</span>
                      <input
                        type="number"
                        value={localConfig.premium_price_threshold || ''}
                        onChange={(e) => updateLocalConfig('premium_price_threshold', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#40a28f]/20 focus:border-[#40a28f] text-sm font-semibold"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-red-50 rounded-lg text-red-600">
                  <AlertCircle className="h-6 w-6" />
                </div>
                <div className="flex-1 space-y-6">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">System Status</h3>
                    <p className="text-sm text-gray-500">Control website availability</p>
                  </div>

                  <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-900">Maintenance Mode</p>
                      <p className="text-xs text-gray-500 mt-1">Temporarily disable public access to the site (Local developers bypass this)</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={config.maintenance_mode === 'true'}
                        onChange={(e) => {
                          const val = e.target.checked ? 'true' : 'false';
                          updateLocalConfig('maintenance_mode', val);
                          updateConfig('maintenance_mode', val);
                        }}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                      <span className="ml-3 text-sm font-medium text-gray-900">{config.maintenance_mode === 'true' ? 'Enabled' : 'Disabled'}</span>
                    </label>
                  </div>

                  <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-900">Property Listings</p>
                      <p className="text-xs text-gray-500 mt-1">Global toggle for posting properties</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={config.enable_listings === 'true'}
                        onChange={(e) => {
                          const val = e.target.checked ? 'true' : 'false';
                          updateLocalConfig('enable_listings', val);
                          updateConfig('enable_listings', val);
                        }}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#40a28f]/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#40a28f]"></div>
                      <span className="ml-3 text-sm font-medium text-gray-900">{config.enable_listings === 'true' ? 'Enabled' : 'Disabled'}</span>
                    </label>
                  </div>

                  <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-900">Mortgage Postings</p>
                      <p className="text-xs text-gray-500 mt-1">Allow users to post new lending requirements</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={config.enable_mortgage_listings === 'true'}
                        onChange={(e) => {
                          const val = e.target.checked ? 'true' : 'false';
                          updateLocalConfig('enable_mortgage_listings', val);
                          updateConfig('enable_mortgage_listings', val);
                        }}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#40a28f]/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#40a28f]"></div>
                      <span className="ml-3 text-sm font-medium text-gray-900">{config.enable_mortgage_listings === 'true' ? 'Enabled' : 'Disabled'}</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Navigation Control */}
              <div className="flex items-start gap-4">
                <div className="p-3 bg-emerald-50 rounded-lg text-emerald-600">
                  <Menu className="h-6 w-6" />
                </div>
                <div className="flex-1 space-y-6">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Navigation Control</h3>
                    <p className="text-sm text-gray-500">Toggle visibility of items in the main navigation bar</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { key: 'enable_properties', label: 'Properties Link' },
                      { key: 'enable_requirements', label: 'Requirements Link' },
                      { key: 'enable_about', label: 'About Page Link' },
                      { key: 'enable_auctions', label: 'Bank Auctions' },
                      { key: 'enable_sdv', label: 'SDV Calculator' },
                      { key: 'enable_mortgage', label: 'Mortgage Link' },
                      { key: 'navbar_dropdown', label: 'Compact Tools Dropdown' },
                      { key: 'enable_search', label: 'Search Feature' },
                      { key: 'enable_notifications', label: 'Notifications Bell' },
                      { key: 'enable_navbar_tagline', label: 'Navbar Tagline' },
                    ].map(item => (
                      <div key={item.key} className="bg-gray-50 p-4 rounded-xl border border-gray-200 flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">{item.label}</span>
                        <label className="relative inline-flex items-center cursor-pointer scale-90">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={config[item.key] === 'true'}
                            onChange={(e) => {
                              const val = e.target.checked ? 'true' : 'false';
                              updateLocalConfig(item.key, val);
                              updateConfig(item.key, val);
                            }}
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#40a28f]"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* User Experience Settings */}
              <div className="flex items-start gap-4">
                <div className="p-3 bg-purple-50 rounded-lg text-purple-600">
                  <UserIcon className="h-6 w-6" />
                </div>
                <div className="flex-1 space-y-6">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">User Experience</h3>
                    <p className="text-sm text-gray-500">Customize user-side interface elements</p>
                  </div>

                  <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-900">Registration Role Selection</p>
                      <p className="text-xs text-gray-500 mt-1">Show "I am a" (Broker, Developer, etc) selection on signup</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={config.registration_role_selection === 'true'}
                        onChange={(e) => {
                          const val = e.target.checked ? 'true' : 'false';
                          updateLocalConfig('registration_role_selection', val);
                          updateConfig('registration_role_selection', val);
                        }}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#40a28f]/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#40a28f]"></div>
                      <span className="ml-3 text-sm font-medium text-gray-900">{config.registration_role_selection === 'true' ? 'Visible' : 'Hidden'}</span>
                    </label>
                  </div>

                  <div className="space-y-4">
                    <p className="text-sm font-bold text-gray-700 uppercase tracking-widest px-1">Dashboard Sections Control</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        { key: 'dashboard_my_properties', label: 'My Properties' },
                        { key: 'dashboard_my_requirements', label: 'My Requirements' },
                        { key: 'dashboard_mortgage', label: 'Mortgage Section' },
                        { key: 'dashboard_saved_list', label: 'Saved List' },
                        { key: 'dashboard_settings', label: 'Account Settings' }
                      ].map(section => (
                        <div key={section.key} className="bg-gray-50 p-4 rounded-xl border border-gray-200 flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-700">{section.label}</span>
                          <label className="relative inline-flex items-center cursor-pointer scale-90">
                            <input
                              type="checkbox"
                              className="sr-only peer"
                              checked={config[section.key] === 'true'}
                              onChange={(e) => {
                                const val = e.target.checked ? 'true' : 'false';
                                updateLocalConfig(section.key, val);
                                updateConfig(section.key, val);
                              }}
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#40a28f]"></div>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>


              <div className="flex gap-4 pt-4">
                <button
                  onClick={saveConfig}
                  disabled={isSaving}
                  className="px-6 py-2.5 bg-[#40a28f] text-white rounded-lg text-sm font-medium hover:bg-[#358a7a] transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2">
                  {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                  Save Changes
                </button>
                <button className="px-6 py-2.5 bg-white border border-gray-200 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
                  Reset
                </button>
              </div>
            </div>
          </div>
        );


      case 'Auctions': {
        const filteredAuctionAdmin = auctionAdminProperties.filter(p =>
          p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.location?.toLowerCase().includes(searchQuery.toLowerCase())
        );
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Bank Auctions & Notices</h2>
                <p className="text-sm text-gray-500 font-medium">Manage institutional asset listings and auction documentation</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => fetchData(true)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-200 transition-all"
                >
                  <RefreshCw className="h-3.5 w-3.5" /> Refresh
                </button>
                <button
                  onClick={() => openAddPropertyModal({ is_auction: true } as Property)}
                  className="flex items-center gap-2 px-6 py-2.5 bg-amber-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-amber-600 transition-all shadow-xl shadow-amber-500/20"
                >
                  <Plus className="h-4 w-4" /> Add Auction
                </button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Total Auctions', value: auctionAdminProperties.length, icon: Gavel, color: 'text-amber-600', bg: 'bg-amber-50' },
                { label: 'Active Listings', value: auctionAdminProperties.filter(p => p.is_active).length, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                { label: 'Featured', value: auctionAdminProperties.filter(p => p.is_featured).length, icon: Star, color: 'text-blue-600', bg: 'bg-blue-50' },
                { label: 'Verified', value: auctionAdminProperties.filter(p => p.is_verified).length, icon: ShieldCheck, color: 'text-rose-600', bg: 'bg-rose-50' },
              ].map((stat) => (
                <div key={stat.label} className="bg-white border border-gray-100 rounded-2xl p-5 flex items-center gap-4 shadow-sm">
                  <div className={`w-11 h-11 ${stat.bg} rounded-xl flex items-center justify-center shrink-0`}>
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{stat.label}</p>
                    <p className="text-xl font-black text-gray-900">{stat.value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Search */}
            <div className="relative w-full md:w-80">
              <Search className="h-4 w-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search auctions..."
                className="w-full pl-11 pr-4 py-3 bg-white border border-gray-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-amber-500/5 focus:border-amber-400 shadow-sm transition-all"
              />
            </div>

            {/* Table */}
            <div className="bg-white border border-gray-100 rounded-[32px] overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-50/50 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50">
                    <tr>
                      <th className="px-8 py-5">Property</th>
                      <th className="px-8 py-5">Reserve Price</th>
                      <th className="px-8 py-5">Auction Link</th>
                      <th className="px-8 py-5">Ends On</th>
                      <th className="px-8 py-5">Status</th>
                      <th className="px-8 py-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filteredAuctionAdmin.map((p) => (
                      <tr key={p.id} className="hover:bg-amber-50/20 transition-colors">
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-gray-50 overflow-hidden shrink-0 border border-gray-100 shadow-sm">
                              <img src={getImageUrl(p.imageUrl) || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=200'} className="w-full h-full object-cover" alt="" />
                            </div>
                            <div>
                              <p className="font-bold text-gray-800 mb-1">{p.title}</p>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="bg-amber-50 text-amber-600 text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-widest border border-amber-100">Auction</span>
                                {p.is_verified && <span className="bg-blue-50 text-blue-600 text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-widest">Verified</span>}
                                {p.is_premium && <span className="bg-yellow-50 text-yellow-600 text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-widest">Premium</span>}
                              </div>
                              <p className="text-[10px] text-gray-400 font-bold mt-1">{p.location}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <p className="font-black text-gray-900">₹{Number(p.price).toLocaleString('en-IN')}</p>
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">Starting Value</p>
                        </td>
                        <td className="px-8 py-6">
                          {p.auction_link ? (
                            <a 
                              href={p.auction_link} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-[#40a28f] hover:underline font-bold text-xs"
                            >
                              Link <ExternalLink className="h-3 w-3" />
                            </a>
                          ) : (
                            <span className="text-xs text-gray-300 font-medium italic">Not added</span>
                          )}
                        </td>
                        <td className="px-8 py-6">
                          {p.expiry_date && new Date(p.expiry_date).getFullYear() > 2000 ? (
                            <div>
                              <p className="text-sm font-bold text-gray-700">{new Date(p.expiry_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                              <p className={`text-[10px] font-bold uppercase tracking-wider mt-0.5 ${
                                new Date(p.expiry_date) < new Date() ? 'text-red-500' :
                                new Date(p.expiry_date) < new Date(Date.now() + 7 * 86400000) ? 'text-orange-500' : 'text-gray-400'
                              }`}>
                                {new Date(p.expiry_date) < new Date() ? 'Expired' :
                                  `${Math.ceil((new Date(p.expiry_date).getTime() - Date.now()) / 86400000)} days left`}
                              </p>
                            </div>
                          ) : <span className="text-xs text-gray-400 font-bold">No deadline</span>}
                        </td>
                        <td className="px-8 py-6">
                          <span className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                            p.is_active ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-500'
                          }`}>
                            {p.is_active ? 'Live' : 'Offline'}
                          </span>
                        </td>
                        <td className="px-8 py-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button onClick={() => openAddPropertyModal(p as Property)} className="p-2 text-[#40a28f] hover:bg-[#40a28f]/5 rounded-xl transition-all" title="Edit">
                              <Edit className="h-4 w-4" />
                            </button>
                            <button onClick={() => handleToggleVerification(p.id)} className={`p-2 rounded-xl transition-all ${p.is_verified ? 'text-blue-600 bg-blue-50' : 'text-gray-300 hover:text-blue-600 hover:bg-blue-50'}`} title={p.is_verified ? 'Verified' : 'Verify'}>
                              <ShieldCheck className="h-4 w-4" />
                            </button>
                            <button onClick={() => handleDeleteProperty(p.id)} className="p-2 text-gray-300 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all" title="Delete">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredAuctionAdmin.length === 0 && (
                  <div className="py-24 text-center">
                    <Gavel className="h-10 w-10 text-gray-200 mx-auto mb-4" />
                    <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">No auction properties found</p>
                    <button onClick={() => openAddPropertyModal({ is_auction: true } as Property)} className="mt-6 px-6 py-2.5 bg-amber-500 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-amber-600 transition-all">
                      Post First Auction
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Auction Management UI - Just property card management */}
          </div>
        );
      }

      case 'CMS':
        return (
          <div className="max-w-4xl space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-black text-gray-900 tracking-tight">Content Management</h1>
                <p className="mt-2 text-gray-500">Manage website text, images, and configuration.</p>
              </div>
            </div>

            {/* General Settings */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <div className="flex items-center gap-3">
                  <Globe className="h-5 w-5 text-[#40a28f]" />
                  <h2 className="text-lg font-bold text-gray-900">General Identity</h2>
                </div>
              </div>
              <div className="p-6 grid gap-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Site Name</label>
                    <input
                      type="text"
                      value={localConfig.site_name || ''}
                      onChange={(e) => updateLocalConfig('site_name', e.target.value)}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#40a28f]/20 focus:border-[#40a28f] transition-all bg-gray-50/50 focus:bg-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Support Email</label>
                    <input
                      type="email"
                      value={localConfig.support_email || ''}
                      onChange={(e) => updateLocalConfig('support_email', e.target.value)}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#40a28f]/20 focus:border-[#40a28f] transition-all bg-gray-50/50 focus:bg-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Support Phone</label>
                    <input
                      type="text"
                      value={localConfig.phone_number || ''}
                      onChange={(e) => updateLocalConfig('phone_number', e.target.value)}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#40a28f]/20 focus:border-[#40a28f] transition-all bg-gray-50/50 focus:bg-white"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-semibold text-gray-700">Office Address</label>
                    <textarea
                      rows={2}
                      value={localConfig.office_address || ''}
                      onChange={(e) => updateLocalConfig('office_address', e.target.value)}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#40a28f]/20 focus:border-[#40a28f] transition-all bg-gray-50/50 focus:bg-white"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Premium System Settings */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <div className="flex items-center gap-3">
                  <Crown className="h-5 w-5 text-emerald-600" />
                  <h2 className="text-lg font-bold text-gray-900">Premium System</h2>
                </div>
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Premium Price Threshold (₹)</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={localConfig.premium_price_threshold || '30000000'}
                      onChange={(e) => updateLocalConfig('premium_price_threshold', e.target.value)}
                      placeholder="30000000"
                      className="w-full pl-8 pr-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#40a28f]/20 focus:border-[#40a28f] transition-all bg-gray-50/50 focus:bg-white"
                    />
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₹</span>
                  </div>
                  <p className="text-[10px] text-gray-400 font-medium">Properties & Requirements above this price require premium membership to post/view.</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Enable Premium Features</label>
                  <div className="flex items-center h-[42px]">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer"
                        checked={localConfig.enable_premium_features !== 'false'}
                        onChange={(e) => updateLocalConfig('enable_premium_features', e.target.checked ? 'true' : 'false')}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                      <span className="ms-3 text-xs font-bold text-gray-500 uppercase tracking-widest leading-none">
                        {localConfig.enable_premium_features !== 'false' ? 'Active' : 'Disabled'}
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Social Links */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <div className="flex items-center gap-3">
                  <Plus className="h-5 w-5 text-[#40a28f]" />
                  <h2 className="text-lg font-bold text-gray-900">Social Presence</h2>
                </div>
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Facebook URL</label>
                  <input
                    type="url"
                    value={localConfig.facebook_url || ''}
                    onChange={(e) => updateLocalConfig('facebook_url', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#40a28f]/20 focus:border-[#40a28f] transition-all bg-gray-50/50 focus:bg-white"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Instagram URL</label>
                  <input
                    type="url"
                    value={localConfig.instagram_url || ''}
                    onChange={(e) => updateLocalConfig('instagram_url', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#40a28f]/20 focus:border-[#40a28f] transition-all bg-gray-50/50 focus:bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Home Page Content */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <div className="flex items-center gap-3">
                  <LayoutDashboard className="h-5 w-5 text-[#40a28f]" />
                  <h2 className="text-lg font-bold text-gray-900">Home Page Hero</h2>
                </div>
              </div>
              <div className="p-6 space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Hero Title</label>
                  <input
                    type="text"
                    value={localConfig.hero_title || ''}
                    onChange={(e) => updateLocalConfig('hero_title', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#40a28f]/20 focus:border-[#40a28f] transition-all bg-gray-50/50 focus:bg-white"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Hero Subtitle</label>
                  <textarea
                    rows={3}
                    value={localConfig.hero_subtitle || ''}
                    onChange={(e) => updateLocalConfig('hero_subtitle', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#40a28f]/20 focus:border-[#40a28f] transition-all bg-gray-50/50 focus:bg-white resize-y"
                  />
                </div>
              </div>
            </div>

            {/* About Page Content */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-[#40a28f]" />
                  <h2 className="text-lg font-bold text-gray-900">About Section</h2>
                </div>
              </div>
              <div className="p-6 space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">About Text</label>
                  <textarea
                    rows={4}
                    value={localConfig.about_text || ''}
                    onChange={(e) => updateLocalConfig('about_text', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#40a28f]/20 focus:border-[#40a28f] transition-all bg-gray-50/50 focus:bg-white resize-y"
                  />
                </div>
              </div>
            </div>

            {/* Image Upload Util */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <div className="flex items-center gap-3">
                  <Image className="h-5 w-5 text-[#40a28f]" />
                  <h2 className="text-lg font-bold text-gray-900">Image Assets</h2>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:border-[#40a28f]/50 transition-colors bg-gray-50/50">
                  <input
                    type="file"
                    id="cms-image-upload"
                    className="hidden"
                    onChange={handleImageUpload}
                    accept="image/*"
                  />
                  <label htmlFor="cms-image-upload" className="cursor-pointer flex flex-col items-center gap-2">
                    {uploadingImage ? (
                      <Loader2 className="h-8 w-8 text-[#40a28f] animate-spin" />
                    ) : (
                      <Palette className="h-8 w-8 text-gray-400" />
                    )}
                    <span className="text-sm font-medium text-gray-600">
                      {uploadingImage ? 'Uploading...' : 'Click to upload banner/logo'}
                    </span>
                  </label>
                </div>
                {lastUploadedUrl && (
                  <div className="p-4 bg-green-50 rounded-lg border border-green-100 flex items-center justify-between">
                    <code className="text-xs text-green-800 break-all">{lastUploadedUrl}</code>
                    <button
                      onClick={() => navigator.clipboard.writeText(lastUploadedUrl)}
                      className="p-1 hover:bg-green-100 rounded text-green-600"
                      title="Copy URL"
                    >
                      <ClipboardList className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-4 pb-12">
              <button
                onClick={saveConfig}
                disabled={isSaving}
                className="px-8 py-3 bg-[#40a28f] text-white rounded-xl font-bold hover:bg-[#358a7a] transition-all shadow-lg shadow-[#40a28f]/20 disabled:opacity-50 flex items-center gap-2"
              >
                {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Check className="h-5 w-5" />}
                Save Changes
              </button>
            </div>
          </div>
        );

      case 'Overview':
      default:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Dashboard Overview</h2>
                <p className="text-sm text-gray-500 mt-1">Welcome back, here's what's happening today.</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 bg-white border border-gray-200 rounded-md text-xs font-medium text-gray-600 shadow-sm">
                  {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </span>
                <button
                  onClick={() => fetchData()}
                  className="p-2 bg-white border border-gray-200 rounded-md text-gray-500 hover:text-[#40a28f] hover:border-[#40a28f] transition-colors shadow-sm active:scale-95"
                  title="Refresh Data"
                >
                  <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {stats.map((s, i) => (
                <button
                  key={i}
                  onClick={s.onClick}
                  className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all text-left w-full hover:scale-[1.02] active:scale-95 group"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-2 rounded-lg ${s.bg}`}>
                      <s.icon className={`h-5 w-5 ${s.color}`} />
                    </div>
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${s.trend.includes('+') ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                      {s.trend}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 group-hover:text-[#40a28f] transition-colors">{s.value}</h3>
                    <p className="text-sm text-gray-500 font-medium">{s.label}</p>
                  </div>
                </button>
              ))}
            </div>

            {/* Auction Stats Grid */}
            <div className="bg-gradient-to-r from-red-50 to-amber-50 rounded-xl border border-red-100 p-6 mb-6">
              <div className="flex items-center gap-2 mb-4">
                <Gavel className="h-5 w-5 text-red-600" />
                <h3 className="text-lg font-bold text-gray-900">Auction Performance</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {auctionStatsOverview.map((s, i) => (
                  <button
                    key={i}
                    onClick={s.onClick}
                    className="bg-white/80 backdrop-blur-sm p-4 rounded-lg border border-white/50 shadow-sm hover:shadow-md transition-all text-left w-full hover:scale-[1.02] active:scale-95 group"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className={`p-2 rounded-lg ${s.bg}`}>
                        <s.icon className={`h-4 w-4 ${s.color}`} />
                      </div>
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-gray-900 group-hover:text-red-600 transition-colors">{s.value}</h4>
                      <p className="text-xs text-gray-600 font-medium">{s.label}</p>
                      <p className="text-[10px] text-gray-500 mt-1">{s.trend}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Recent Activity / Feed */}
              <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-gray-900">Recent Activity</h3>
                  <button className="text-sm text-[#40a28f] font-medium hover:underline">View All</button>
                </div>
                <div className="space-y-6">
                  {recentActivity.length > 0 ? recentActivity.map((item: any, idx) => (
                    <div key={idx} className="flex items-center justify-between group">
                      <div className="flex gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${item.color}`}>
                          <item.icon className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900 group-hover:text-[#40a28f] transition-colors">{item.title}</p>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-0.5">{item.user}</p>
                          <p className="text-[10px] text-gray-400 mt-1 font-medium">{item.time}</p>
                        </div>
                      </div>
                      {item.type !== 'payment' && (
                        <button
                          onClick={() => {
                            if (item.type === 'property') {
                              const p = properties.find(prop => prop.id === item.id);
                              if (p) {
                                openPropertyModal(p);
                                return;
                              }
                            }
                            window.open(`/${item.type === 'property' ? 'properties' : 'requirements'}/${item.id}`, '_blank');
                          }}
                          className="p-2 opacity-0 group-hover:opacity-100 bg-gray-50 text-gray-400 hover:text-[#40a28f] rounded-lg transition-all"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  )) : (
                    <div className="py-10 text-center text-gray-400 text-sm">No recent activity detected.</div>
                  )}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-6">Quick Actions</h3>
                <div className="space-y-3">
                  <button
                    onClick={() => {
                      setActiveTab('Listings');
                      setListingFilter('pending');
                    }}
                    className="w-full flex items-center justify-between p-4 bg-gray-50 border border-gray-100 rounded-lg hover:bg-white hover:border-[#40a28f] hover:shadow-sm transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="bg-orange-100 p-2 rounded-md text-orange-600">
                        <ShieldCheck className="h-4 w-4" />
                      </div>
                      <span className="text-sm font-medium text-gray-700 group-hover:text-[#40a28f]">Review Pending Items</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-[#40a28f]" />
                  </button>

                  <button
                    onClick={() => setActiveTab('Users')}
                    className="w-full flex items-center justify-between p-4 bg-gray-50 border border-gray-100 rounded-lg hover:bg-white hover:border-[#40a28f] hover:shadow-sm transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-100 p-2 rounded-md text-blue-600">
                        <Users className="h-4 w-4" />
                      </div>
                      <span className="text-sm font-medium text-gray-700 group-hover:text-[#40a28f]">Manage Users</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-[#40a28f]" />
                  </button>

                  <button
                    onClick={handleExport}
                    className="w-full flex items-center justify-between p-4 bg-gray-50 border border-gray-100 rounded-lg hover:bg-white hover:border-[#40a28f] hover:shadow-sm transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="bg-purple-100 p-2 rounded-md text-purple-600">
                        <Download className="h-4 w-4" />
                      </div>
                      <span className="text-sm font-medium text-gray-700 group-hover:text-[#40a28f]">Export Report</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-[#40a28f]" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // ... (existing code)

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row font-sans text-gray-900 relative">
      {/* Mobile Header - Admin Only */}
      <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-[60]">
        <div className="flex items-center gap-2">
          <div className="bg-[#40a28f] w-8 h-8 rounded-lg text-white flex items-center justify-center shadow-md">
            <Building2 className="h-5 w-5" />
          </div>
          <span className="font-bold text-gray-900 tracking-tight">{config.site_name}</span>
        </div>
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Menu className="h-6 w-6" />
        </button>
      </div>

      {/* Admin Sidebar Backdrop (Mobile) */}
      {isSidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-[70] transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <aside className={`
        fixed inset-y-0 left-0 w-72 bg-white border-r border-gray-200 z-[80] transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:block
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-6 flex flex-col h-full overflow-y-auto">
          {/* Sidebar Logo & Close Button */}
          <div className="flex items-center justify-between mb-12 px-2 lg:block">
            <div className="flex items-center gap-3">
              <div className="bg-[#40a28f] w-10 h-10 rounded-lg text-white flex items-center justify-center shadow-md">
                <Building2 className="h-6 w-6" />
              </div>
              <div>
                <span className="font-bold text-gray-900 text-xl tracking-tight block">{config.site_name}</span>
                <span className="text-xs font-medium text-gray-500 block">Administration</span>
              </div>
            </div>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors mt-2"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <nav className="space-y-1 flex-grow">
            {[
              { id: 'Overview', label: 'Overview', icon: LayoutDashboard },
              { id: 'CMS', label: 'CMS', icon: Palette },
              { id: 'Listings', label: 'Listings', icon: Building2 },
              { id: 'Requirements', label: 'Requirements', icon: ClipboardList },
              { id: 'Mortgages', label: 'Mortgages', icon: Landmark },
              { id: 'Users', label: 'Users', icon: Users },
              { id: 'Premium', label: 'Premium', icon: Crown },
              { id: 'Advertisements', label: 'Advertisements', icon: Image },
              { id: 'Auctions', label: 'Auctions', icon: Gavel },
              { id: 'Settings', label: 'Settings', icon: Settings },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id as AdminTab);
                  setIsSidebarOpen(false);
                }}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-colors duration-200 ${activeTab === item.id
                  ? 'bg-[#40a28f]/10 text-[#40a28f]'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon className={`h-5 w-5 ${activeTab === item.id ? 'text-[#40a28f]' : 'text-gray-400 group-hover:text-gray-500'}`} />
                  {item.id}
                </div>
                {activeTab === item.id && (
                  <div className="w-1.5 h-1.5 rounded-full bg-[#40a28f]"></div>
                )}
              </button>
            ))}

            <div className="pt-6 mt-6 border-t border-gray-100">
              <a
                href="/"
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                target="_blank"
                rel="noreferrer"
              >
                <Globe className="h-5 w-5 text-gray-400" />
                Live Website
              </a>
            </div>
          </nav>

          <div className="mt-auto pt-6 border-t border-gray-100">
            <div className="flex items-center gap-3 mb-4 px-2">
              <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200 text-gray-500">
                <UserIcon className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">Administrator</p>
                <p className="text-xs text-gray-500 truncate">admin@rjg.com</p>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 hover:border-red-100 transition-colors"
            >
              <LogOut className="h-4 w-4" /> Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      < main className="flex-grow min-h-screen overflow-y-auto bg-gray-50 px-4 sm:px-8 py-6 sm:py-8" >
        <div className="max-w-7xl mx-auto">
          {renderContent()}
        </div>
      </main >

      {/* Property Details Modal */}
      {
        isPropertyModalOpen && selectedProperty && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" onClick={closePropertyModal}></div>
            <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl ring-1 ring-gray-900/5 overflow-hidden animate-in fade-in zoom-in-95 duration-300 my-8">
              <div className="relative h-64 sm:h-80 bg-gray-100">
                <img
                  src={getImageUrl(selectedProperty.imageUrl) || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=1200'}
                  className="w-full h-full object-cover"
                  alt={selectedProperty.title}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                <button
                  onClick={closePropertyModal}
                  className="absolute top-4 right-4 p-2 bg-white/20 backdrop-blur-md hover:bg-white/40 text-white rounded-full transition-all"
                >
                  <X className="h-6 w-6" />
                </button>
                <div className="absolute bottom-6 left-6 right-6 text-white">
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    <span className={`px-3 py-1 rounded-lg text-xs font-black uppercase tracking-widest bg-white/20 backdrop-blur-md`}>
                      {selectedProperty.status} ({selectedProperty.type})
                    </span>
                    {selectedProperty.is_verified && (
                      <span className="flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-black uppercase tracking-widest bg-blue-500/80 backdrop-blur-md text-white">
                        <ShieldCheck className="h-3 w-3" /> Verified
                      </span>
                    )}
                    {selectedProperty.is_featured && (
                      <span className="flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-black uppercase tracking-widest bg-yellow-500/80 backdrop-blur-md text-white">
                        <Star className="h-3 w-3 fill-current" /> Featured
                      </span>
                    )}
                  </div>
                  <h2 className="text-3xl sm:text-4xl font-black tracking-tight mb-2">{selectedProperty.title}</h2>
                  <div className="flex items-center gap-2 text-white/80 font-medium">
                    <MapIcon className="h-4 w-4" />
                    {selectedProperty.location} {selectedProperty.district ? `, ${selectedProperty.district}` : ''}
                  </div>
                </div>
              </div>

              <div className="p-6 sm:p-10 grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12">
                <div className="md:col-span-2 space-y-8">
                  <div>
                    <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight mb-4 flex items-center gap-2">
                      <FileText className="h-5 w-5 text-[#40a28f]" /> Description
                    </h3>
                    <p className="text-gray-600 leading-relaxed whitespace-pre-line">{selectedProperty.description}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
                      <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Area Size</p>
                      <p className="text-xl font-black text-gray-900">{selectedProperty.area} <span className="text-sm font-bold text-gray-500 uppercase">{selectedProperty.area_unit}</span></p>
                    </div>
                    <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
                      <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Price</p>
                      <p className="text-xl font-black text-[#40a28f]">₹{selectedProperty.price.toLocaleString('en-IN')}</p>
                      {selectedProperty.is_negotiable && <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Negotiable</span>}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-sm">
                    {selectedProperty.street_name && (
                      <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Street / Colony</p>
                        <p className="font-semibold text-gray-800">{selectedProperty.street_name}</p>
                      </div>
                    )}
                    {selectedProperty.village && (
                      <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Village / Ward</p>
                        <p className="font-semibold text-gray-800">{selectedProperty.village}</p>
                      </div>
                    )}
                    {selectedProperty.landmark && (
                      <div className="col-span-2">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Landmark</p>
                        <p className="font-semibold text-gray-800">{selectedProperty.landmark}</p>
                      </div>
                    )}
                  </div>

                  {selectedProperty.google_map_url && (
                    <div>
                      <a
                        href={selectedProperty.google_map_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-5 py-3 bg-[#40a28f]/10 text-[#40a28f] hover:bg-[#40a28f] hover:text-white rounded-xl font-bold transition-all text-sm"
                      >
                        <MapIcon className="h-4 w-4" /> View on Google Maps
                      </a>
                    </div>
                  )}
                </div>

                <div className="space-y-6">
                  <div className="p-6 bg-white border border-gray-200 rounded-2xl shadow-sm">
                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Posted By</h3>
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 font-bold text-lg">
                        {selectedProperty.owner?.name?.[0] || 'U'}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">{selectedProperty.owner?.name || 'Unknown'}</p>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{selectedProperty.posted_as || 'Owner'}</p>
                      </div>
                    </div>

                    <div className="space-y-3 pt-4 border-t border-gray-100">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Phone</span>
                        <span className="font-mono font-medium text-gray-800">{selectedProperty.owner?.phone || 'Hidden'}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Email</span>
                        <span className="font-medium text-gray-800 truncate max-w-[150px]" title={selectedProperty.owner?.email}>{selectedProperty.owner?.email || 'Hidden'}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        window.location.href = `tel:${selectedProperty.owner?.phone}`;
                      }}
                      className="w-full mt-6 py-3 bg-gray-900 text-white rounded-xl font-bold text-sm hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                    >
                      Contact Owner
                    </button>
                  </div>

                  <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100">
                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Quick Actions</h3>
                    <div className="space-y-2">
                      <button
                        onClick={() => {
                          handleToggleVerification(selectedProperty.id);
                          closePropertyModal();
                        }}
                        className="w-full py-2.5 px-4 bg-white border border-gray-200 hover:border-blue-500 hover:text-blue-600 rounded-xl text-sm font-semibold transition-all flex items-center justify-between group"
                      >
                        <span>{selectedProperty.is_verified ? 'Revoke Verification' : 'Verify Property'}</span>
                        <ShieldCheck className="h-4 w-4 text-gray-300 group-hover:text-blue-500" />
                      </button>
                      <button
                        onClick={() => {
                          handleToggleFeatured(selectedProperty.id);
                          closePropertyModal();
                        }}
                        className="w-full py-2.5 px-4 bg-white border border-gray-200 hover:border-yellow-500 hover:text-yellow-600 rounded-xl text-sm font-semibold transition-all flex items-center justify-between group"
                      >
                        <span>{selectedProperty.is_featured ? 'Remove Featured' : 'Mark Featured'}</span>
                        <Star className="h-4 w-4 text-gray-300 group-hover:text-yellow-500" />
                      </button>
                      <button
                        onClick={() => {
                          handleDeleteProperty(selectedProperty.id);
                          closePropertyModal();
                        }}
                        className="w-full py-2.5 px-4 bg-white border border-gray-200 hover:border-red-500 hover:text-red-600 rounded-xl text-sm font-semibold transition-all flex items-center justify-between group"
                      >
                        <span>Delete Listing</span>
                        <Trash2 className="h-4 w-4 text-gray-300 group-hover:text-red-500" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      }

      {/* Requirement Details Modal */}
      {
        isRequirementModalOpen && selectedRequirement && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" onClick={closeRequirementModal}></div>
            <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl ring-1 ring-gray-900/5 overflow-hidden animate-in fade-in zoom-in-95 duration-300 my-8">
              <div className="px-8 py-8 border-b border-gray-100 bg-[#40a28f] text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                  <Search className="w-40 h-40 transform rotate-12" />
                </div>
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-lg text-xs font-black uppercase tracking-widest">
                      {selectedRequirement.purpose === 'Mortgage' ? 'Lending / Mortgage' : selectedRequirement.purpose === 'Buy' ? 'Buying' : 'Renting'} Requirement
                    </span>
                    {!selectedRequirement.is_verified && (
                      <span className="ml-2 px-3 py-1 bg-white text-[#40a28f] rounded-lg text-xs font-black uppercase tracking-widest animate-pulse">
                        Pending Verification
                      </span>
                    )}
                  </div>
                  <h2 className="text-3xl font-black tracking-tight">{selectedRequirement.type}</h2>
                  <p className="text-white/80 font-medium mt-2 flex items-center gap-2">
                    <MapIcon className="h-4 w-4" /> {selectedRequirement.location}
                  </p>
                </div>
                <button
                  onClick={closeRequirementModal}
                  className="absolute top-4 right-4 p-2 bg-white/20 backdrop-blur-md hover:bg-white/40 text-white rounded-full transition-all z-20"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="p-8 space-y-8">
                <div className="grid grid-cols-2 gap-6">
                  {selectedRequirement.purpose === 'Mortgage' ? (
                    <>
                      <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Loan Amount</p>
                        <p className="text-xl font-black text-[#40a28f]">
                          ₹{selectedRequirement.maxBudget.toLocaleString()}
                        </p>
                      </div>
                      <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Expected Rate</p>
                        <p className="text-xl font-black text-gray-900">
                          {selectedRequirement.expected_rate || 'Market Rate'}
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Budget Range</p>
                        <p className="text-xl font-black text-[#40a28f]">
                          ₹{selectedRequirement.minBudget.toLocaleString()} - {selectedRequirement.maxBudget.toLocaleString()}
                        </p>
                      </div>
                      <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Area Range</p>
                        <p className="text-xl font-black text-gray-900">
                          {selectedRequirement.minArea} - {selectedRequirement.maxArea} Sq Ft
                        </p>
                      </div>
                    </>
                  )}
                </div>

                {selectedRequirement.purpose === 'Mortgage' && (
                  <div className="bg-emerald-50/50 p-5 rounded-2xl border border-emerald-100 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-black text-emerald-600 uppercase tracking-widest mb-1">Asset for Collateral</p>
                      <p className="text-lg font-black text-gray-900 uppercase">{selectedRequirement.type}</p>
                    </div>
                    <div>
                      <p className="text-xs font-black text-emerald-600 uppercase tracking-widest mb-1">Duration</p>
                      <p className="text-lg font-black text-gray-900">{selectedRequirement.loan_duration || 'Not specified'}</p>
                    </div>
                  </div>
                )}

                <div>
                  <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Description / Preferences</h3>
                  <p className="text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-2xl border border-gray-100">
                    {selectedRequirement.description || "No specific preferences provided."}
                  </p>
                </div>

                <div className="border-t border-gray-100 pt-6">
                  <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Requester Information</h3>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 font-bold text-lg">
                      {selectedRequirement.user?.name?.[0] || 'U'}
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-gray-900">{selectedRequirement.user?.name || 'Visitor'}</p>
                      <p className="text-xs text-gray-500">{selectedRequirement.user?.email || 'No email provided'}</p>
                    </div>
                    {selectedRequirement.contact_phone && (
                      <a href={`tel:${selectedRequirement.contact_phone}`} className="px-4 py-2 bg-gray-900 text-white rounded-xl text-xs font-bold hover:bg-gray-800 transition-colors">
                        {selectedRequirement.contact_phone}
                      </a>
                    )}
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => {
                      handleToggleRequirementVerification(selectedRequirement.id);
                      closeRequirementModal();
                    }}
                    className="flex-1 py-3 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2"
                  >
                    <ShieldCheck className="h-4 w-4" />
                    {selectedRequirement.is_verified ? 'Revoke Verification' : 'Verify Request'}
                  </button>
                  <button
                    onClick={() => {
                      handleDeleteRequirement(Number(selectedRequirement.id));
                    }}
                    className="flex-1 py-3 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2"
                  >
                    <Trash2 className="h-4 w-4" /> Delete Request
                  </button>
                </div>
              </div>
            </div>
          </div>
        )
      }
      {/* Advertisement Modal */}
      {
        isAdModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" onClick={closeAdModal}></div>
            <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl ring-1 ring-gray-900/5 overflow-hidden animate-in fade-in zoom-in-95 duration-300 my-8">
              <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <h2 className="text-xl font-bold text-gray-900">{editingAd ? 'Edit Advertisement' : 'Create Advertisement'}</h2>
                <button onClick={closeAdModal} className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-500 rounded-full transition-all">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSaveAd} className="p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-semibold text-gray-700">Headline</label>
                    <input
                      type="text"
                      required
                      value={adForm.headline || ''}
                      onChange={(e) => setAdForm({ ...adForm, headline: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#40a28f]/20 focus:border-[#40a28f] transition-all bg-gray-50/50 focus:bg-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Display URL</label>
                    <input
                      type="text"
                      required
                      value={adForm.displayUrl || ''}
                      onChange={(e) => setAdForm({ ...adForm, displayUrl: e.target.value })}
                      placeholder="e.g. yoursite.com/promo"
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#40a28f]/20 focus:border-[#40a28f] transition-all bg-gray-50/50 focus:bg-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">CTA Button Text</label>
                    <input
                      type="text"
                      required
                      value={adForm.cta || ''}
                      onChange={(e) => setAdForm({ ...adForm, cta: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#40a28f]/20 focus:border-[#40a28f] transition-all bg-gray-50/50 focus:bg-white"
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-semibold text-gray-700">Description</label>
                    <textarea
                      required
                      rows={2}
                      value={adForm.description || ''}
                      onChange={(e) => setAdForm({ ...adForm, description: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#40a28f]/20 focus:border-[#40a28f] transition-all bg-gray-50/50 focus:bg-white"
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-semibold text-gray-700">Background Image URL</label>
                    <div className="flex gap-2">
                      <input
                        type="url"
                        value={adForm.imageUrl || ''}
                        onChange={(e) => setAdForm({ ...adForm, imageUrl: e.target.value })}
                        placeholder="https://..."
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#40a28f]/20 focus:border-[#40a28f] transition-all bg-gray-50/50 focus:bg-white"
                      />
                    </div>
                    <p className="text-xs text-gray-500">Paste an image URL. Use high resolution (min 1200x800) for best results.</p>
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={adForm.is_active}
                        onChange={(e) => setAdForm({ ...adForm, is_active: e.target.checked })}
                        className="w-5 h-5 text-[#40a28f] border-gray-300 rounded focus:ring-[#40a28f]"
                      />
                      <span className="text-sm font-medium text-gray-900">Make Advertisement Active</span>
                    </label>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={closeAdModal}
                    className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingAd}
                    className="px-6 py-2.5 bg-[#40a28f] text-white rounded-xl font-bold hover:bg-[#358a7a] transition-all shadow-md shadow-[#40a28f]/20 disabled:opacity-50 flex items-center gap-2"
                  >
                    {isSavingAd && <Loader2 className="h-4 w-4 animate-spin" />}
                    Save Advertisement
                  </button>
                </div>
              </form>
            </div>
          </div>
        )
      }
      {
        isAddPropertyModalOpen && (
          <AddPropertyModal
            isOpen={isAddPropertyModalOpen}
            onClose={closeAddPropertyModal}
            property={editingPropertyDetails}
            onSuccess={() => {
              fetchData();
              closeAddPropertyModal();
            }}
          />
        )
      }


      {/* Add/Edit Requirement Modal */}
      <AddRequirementModal
        isOpen={isAddRequirementModalOpen}
        onClose={closeAddRequirementModal}
        requirement={editingRequirement}
        onSuccess={() => fetchData(true)}
      />
    </div >
  );
};

export default AdminView;
