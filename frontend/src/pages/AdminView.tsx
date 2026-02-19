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
  Mail,
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
  MessageSquare,
  Send,
  Power,
  Map as MapIcon
} from 'lucide-react';
import { propertyService, requirementService, adminService, API_URL } from '@/services/api';
import { useSiteConfig } from '@/contexts/SiteConfigContext';
import { Property, Requirement, User } from '@/types/types';

type AdminTab = 'Overview' | 'Listings' | 'Requirements' | 'Users' | 'Payments' | 'Settings' | 'CMS';

interface AdminViewProps {
  onLogout: () => void;
}

const AdminView: React.FC<AdminViewProps> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('Overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [properties, setProperties] = useState<Property[]>([]);
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [dbStats, setDbStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // CMS State
  const { config, updateConfig, refreshConfig } = useSiteConfig();
  const [localConfig, setLocalConfig] = useState(config);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [lastUploadedUrl, setLastUploadedUrl] = useState<string | null>(null);

  // Message Modal State
  const [messageModalOpen, setMessageModalOpen] = useState(false);
  const [selectedUserForMessage, setSelectedUserForMessage] = useState<User | null>(null);
  const [messageContent, setMessageContent] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [messageError, setMessageError] = useState('');

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
      const fetchPayments = adminService.getPayments().then(setPayments).catch(err => console.error('Payments fetch error', err));
      const fetchStats = adminService.getStats().then(setDbStats).catch(err => console.error('Stats fetch error', err));

      await Promise.allSettled([fetchProps, fetchReqs, fetchUsers, fetchPayments, fetchStats]);
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
      await adminService.toggleVerification(id);
      fetchData();
    } catch (error) {
      console.error('Failed to toggle verification:', error);
    }
  };

  const handleToggleRequirementVerification = async (id: number | string) => {
    try {
      await adminService.toggleRequirementVerification(id);
      fetchData();
    } catch (error) {
      console.error('Failed to toggle requirement verification:', error);
    }
  };

  const openMessageModal = (user: User) => {
    setSelectedUserForMessage(user);
    setMessageContent('');
    setMessageError('');
    setMessageModalOpen(true);
  };

  const closeMessageModal = () => {
    setMessageModalOpen(false);
    setSelectedUserForMessage(null);
  };

  const handleSendMessage = async () => {
    if (!selectedUserForMessage || !messageContent.trim()) {
      setMessageError('Message content is required');
      return;
    }

    setSendingMessage(true);
    setMessageError('');

    try {
      await adminService.sendMessage(selectedUserForMessage.id, messageContent);
      alert('Message sent successfully!');
      closeMessageModal();
    } catch (error) {
      console.error('Failed to send message:', error);
      setMessageError('Failed to send message. Please try again.');
    } finally {
      setSendingMessage(false);
    }
  };

  const handleToggleFeatured = async (id: number | string) => {
    try {
      await adminService.toggleFeatured(id);
      fetchData();
    } catch (error) {
      console.error('Failed to toggle featured:', error);
    }
  };

  const handleToggleActive = async (id: number | string) => {
    try {
      await adminService.toggleActive(id);
      fetchData();
    } catch (error) {
      console.error('Failed to toggle active status:', error);
    }
  };

  const handleToggleRequirementActive = async (id: number | string) => {
    try {
      await adminService.toggleRequirementActive(id);
      fetchData();
    } catch (error) {
      console.error('Failed to toggle requirement active status:', error);
    }
  };

  const handleToggleBan = async (id: number) => {
    try {
      await adminService.toggleUserBan(id);
      fetchData();
    } catch (error) {
      console.error('Failed to toggle user ban:', error);
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
    ...payments.slice(0, 5).map(pay => ({
      id: pay.id,
      icon: CreditCard,
      type: 'payment',
      title: `Payment: ${pay.plan}`,
      time: new Date(pay.created_at || Date.now()).toLocaleTimeString(),
      rawDate: pay.created_at,
      user: `₹${pay.amount}`,
      color: 'bg-purple-50 text-purple-600'
    }))
  ].sort((a: any, b: any) => {
    const dateA = new Date(a.rawDate || 0).getTime();
    const dateB = new Date(b.rawDate || 0).getTime();
    return dateB - dateA;
  }).slice(0, 8);

  // Stats for the overview
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
      label: 'Total Revenue',
      value: `₹${(dbStats?.revenue || 0).toLocaleString('en-IN')}`,
      icon: CreditCard,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
      trend: 'Live',
      onClick: () => setActiveTab('Payments')
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
                              <img src={p.imageUrl || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=400'} className="w-full h-full object-cover" alt="" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <p className="font-bold text-gray-800">{p.title}</p>
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
                    {filteredRequirements.map((r) => (
                      <tr key={r.id} className="hover:bg-gray-50/30 transition-colors">
                        <td className="px-8 py-6">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-bold text-gray-800">{r.purpose === 'Buy' ? 'Buying' : 'Renting'} {r.type}</p>
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
                              <p className="font-semibold text-gray-900">{u.name}</p>
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
                            <button
                              onClick={() => openMessageModal(u)}
                              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                              title="Send Message"
                            >
                              <Mail className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleToggleBan(u.id)}
                              className="p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all"
                              title="Restrict Access"
                            >
                              <Ban className="h-4 w-4" />
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

      case 'Payments':
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                  <h3 className="text-3xl font-bold text-gray-900 mt-1">₹{dbStats?.revenue.toLocaleString() || '0'}</h3>
                </div>
                <div className="p-3 bg-green-50 rounded-lg text-green-600">
                  <TrendingUp className="h-6 w-6" />
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Settled Transactions</p>
                  <h3 className="text-3xl font-bold text-gray-900 mt-1">{payments.filter(p => p.status === 'Success').length}</h3>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
                  <CheckCircle className="h-6 w-6" />
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Pending Amount</p>
                  <h3 className="text-3xl font-bold text-gray-900 mt-1">₹0</h3>
                </div>
                <div className="p-3 bg-orange-50 rounded-lg text-orange-600">
                  <Clock className="h-6 w-6" />
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="font-bold text-gray-900">Recent Transactions</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 text-gray-700 font-semibold border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4">Transaction ID</th>
                      <th className="px-6 py-4">User</th>
                      <th className="px-6 py-4">Service</th>
                      <th className="px-6 py-4">Amount</th>
                      <th className="px-6 py-4 text-center">Status</th>
                      <th className="px-6 py-4 text-right">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {payments.map((p) => (
                      <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4 font-mono text-gray-500 text-xs">
                          #{String(p.id).padStart(8, '0')}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center text-xs font-bold">
                              {p.user?.name?.[0] || 'C'}
                            </div>
                            <span className="font-medium text-gray-900">{p.user?.name || 'Customer'}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-600">{p.plan || 'Standard Listing'}</td>
                        <td className="px-6 py-4 font-bold text-gray-900">₹{p.amount.toLocaleString()}</td>
                        <td className="px-6 py-4 text-center">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${p.status === 'Success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {p.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right text-gray-500">
                          {p.created_at ? new Date(p.created_at).toLocaleDateString() : 'N/A'}
                        </td>
                      </tr>
                    ))}
                    {payments.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                          No transactions found.
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
                    <h3 className="text-lg font-bold text-gray-900">Financial Settings</h3>
                    <p className="text-sm text-gray-500">Manage fees and billing parameters</p>
                  </div>

                  <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-900">Verification Fee</p>
                      <p className="text-xs text-gray-500 mt-1">Standard cost for property verification</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500 font-medium">₹</span>
                      <input
                        type="number"
                        value={localConfig.verification_fee || ''}
                        onChange={(e) => updateLocalConfig('verification_fee', e.target.value)}
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
                      <p className="text-xs text-gray-500 mt-1">Temporarily disable public access to the site</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        value=""
                        className="sr-only peer"
                        checked={localConfig.maintenance_mode === 'true'}
                        onChange={(e) => updateLocalConfig('maintenance_mode', e.target.checked ? 'true' : 'false')}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                      <span className="ml-3 text-sm font-medium text-gray-900">{localConfig.maintenance_mode === 'true' ? 'Enabled' : 'Disabled'}</span>
                    </label>
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row font-sans text-gray-900">
      {/* Admin Sidebar */}
      <aside className="w-full lg:w-72 bg-white border-r border-gray-200 shrink-0 flex flex-col h-screen sticky top-0 z-50">
        <div className="p-6 flex flex-col h-full">
          <div className="flex items-center gap-3 mb-12 px-2">
            <div className="bg-[#40a28f] w-10 h-10 rounded-lg text-white flex items-center justify-center shadow-md">
              <Building2 className="h-6 w-6" />
            </div>
            <div>
              <span className="font-bold text-gray-900 text-xl tracking-tight block">{config.site_name}</span>
              <span className="text-xs font-medium text-gray-500 block">Administration</span>
            </div>
          </div>

          <nav className="space-y-1 flex-grow">
            {[
              { id: 'Overview', icon: LayoutDashboard },
              { id: 'CMS', icon: Palette },
              { id: 'Listings', icon: Building2 },
              { id: 'Requirements', icon: ClipboardList },
              { id: 'Users', icon: Users },
              { id: 'Payments', icon: CreditCard },
              { id: 'Settings', icon: Settings },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as AdminTab)}
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
      <main className="flex-grow min-h-screen overflow-y-auto bg-gray-50 px-8 py-8">
        <div className="max-w-7xl mx-auto">
          {renderContent()}
        </div>
      </main>

      {/* Message Modal */}
      {messageModalOpen && selectedUserForMessage && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" onClick={closeMessageModal}></div>
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl ring-1 ring-gray-900/5 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                  <MessageSquare className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Send Message</h3>
                  <p className="text-xs text-gray-500 font-medium">To: <span className="text-gray-900">{selectedUserForMessage.name}</span> ({selectedUserForMessage.email})</p>
                </div>
              </div>
              <button
                onClick={closeMessageModal}
                className="p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="message" className="text-sm font-bold text-gray-700 block">Message Content</label>
                <textarea
                  id="message"
                  rows={5}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm resize-none transition-all"
                  placeholder="Type your message here..."
                  value={messageContent}
                  onChange={(e) => setMessageContent(e.target.value)}
                />
                {messageError && <p className="text-xs font-medium text-red-600 mt-1 flex items-center gap-1"><AlertCircle className="h-3 w-3" /> {messageError}</p>}
                <p className="text-xs text-gray-400">This message will appear in the user's notifications.</p>
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-50 flex items-center justify-end gap-3 border-t border-gray-100">
              <button
                type="button"
                onClick={closeMessageModal}
                className="px-4 py-2 text-sm font-bold text-gray-600 hover:text-gray-800 bg-white border border-gray-200 hover:bg-gray-50 rounded-xl transition-all shadow-sm"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSendMessage}
                disabled={sendingMessage || !messageContent.trim()}
                className="inline-flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-md shadow-blue-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {sendingMessage ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Send Message
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Property Details Modal */}
      {isPropertyModalOpen && selectedProperty && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" onClick={closePropertyModal}></div>
          <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl ring-1 ring-gray-900/5 overflow-hidden animate-in fade-in zoom-in-95 duration-300 my-8">
            <div className="relative h-64 sm:h-80 bg-gray-100">
              <img
                src={selectedProperty.imageUrl || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=1200'}
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
      )}

      {/* Requirement Details Modal */}
      {isRequirementModalOpen && selectedRequirement && (
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
                    {selectedRequirement.purpose === 'Buy' ? 'Buying' : 'Renting'} Requirement
                  </span>
                  {!selectedRequirement.is_verified && (
                    <span className="px-3 py-1 bg-white text-[#40a28f] rounded-lg text-xs font-black uppercase tracking-widest">
                      New Request
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
              </div>

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
      )}
    </div>
  );
};

export default AdminView;
