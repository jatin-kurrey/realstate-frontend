import React, { useState, useRef, useEffect } from 'react';
import { LogOut, Menu, X, Map as MapIcon, ChevronDown, LayoutDashboard, ShieldCheck, Info, Crown, Star, MapPin } from 'lucide-react';
import NotificationBell from './NotificationBell';
import { useSiteConfig } from '../contexts/SiteConfigContext';
import { useAuth } from '../contexts/AuthContext';
import PremiumModal from './PremiumModal';

interface NavbarProps {
  currentView: string;
  onViewChange: (view: string) => void;
  onOpenLogin: () => void;
  onOpenSignUp: () => void;
  onLogout: () => void;
  isAdmin?: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ currentView, onViewChange, onOpenLogin, onOpenSignUp, onLogout }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [isPremiumModalOpen, setIsPremiumModalOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const accountRef = useRef<HTMLDivElement>(null);
  const { isAuthenticated: token, userRole, isPremium, user } = useAuth();
  const { config, refreshConfig } = useSiteConfig();
  const enableListings = config['enable_listings'] === 'true';
  // Robust check for the dropdown toggle
  const showToolsDropdown = String(config['navbar_dropdown']).toLowerCase().trim() === 'true';
  
  // Debug log to trace the config value
  useEffect(() => {
    console.log('Navbar Config:', {
      raw: config['navbar_dropdown'],
      parsed: showToolsDropdown,
      type: typeof config['navbar_dropdown']
    });
  }, [config, showToolsDropdown]);

  // Manual refresh function for testing
  const handleRefreshConfig = async () => {
    console.log('Manual config refresh triggered - Current navbar_dropdown:', config['navbar_dropdown']);
    await refreshConfig();
  };


  const handleLogout = () => {
    onLogout();
    setIsMenuOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (accountRef.current && !accountRef.current.contains(event.target as Node)) {
        setIsAccountOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const mainNavItems = [
    { label: 'Properties', value: 'Browse', show: config['enable_properties'] !== 'false' },
    { label: 'Requirements', value: 'Requirements', show: config['enable_requirements'] !== 'false' },
    { label: 'Map', value: 'Map', show: config['enable_map'] !== 'false' },
    { label: 'About', value: 'About', show: config['enable_about'] !== 'false' },
  ];

  const serviceItems = [
    ...(config['enable_auctions'] !== 'false' ? [{ label: 'Auctions', value: 'Auctions', path: '/auctions' }] : []),
    ...(config['enable_sdv'] !== 'false' ? [{ label: 'SDV Calculator', value: 'SDV', path: '/sdv-calculator' }] : []),
    ...(config['enable_mortgage'] !== 'false' ? [
      { label: 'Mortgage', value: 'Mortgage', path: '/mortgage' },
      { label: 'Mortgage Calculator', value: 'Mortgage Calculator', path: '/mortgage-calculator' }
    ] : []),
  ];

  const authItems = [
    { label: 'My Account', value: 'Account', show: !!token },
  ];

  return (
    <nav className="bg-white/70 backdrop-blur-xl border-b border-gray-100/30 sticky top-0 z-50 font-['Outfit'] shadow-[0_4px_20px_-1px_rgba(0,0,0,0.02)]">
      <div className="max-w-[1600px] mx-auto px-6 md:px-10">
        <div className="flex justify-between h-24 items-center">
          {/* Logo Section */}
          <button
            onClick={() => onViewChange('Browse')}
            className="flex items-center gap-4 hover:opacity-90 transition-all outline-none group"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-[#40a28f] to-[#348e7c] rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:scale-105 group-hover:rotate-6 shadow-2xl shadow-[#40a28f]/30">
              <MapIcon className="w-7 h-7 text-white" />
            </div>
            <div className="flex flex-col items-start pt-1">
              <span className="text-2xl font-black text-[#40a28f] tracking-tighter leading-none uppercase">
                {config['site_name']?.split(' ')[0] || 'RJG'}
              </span>
              {config['enable_navbar_tagline'] !== 'false' && (
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] leading-none mt-1">
                  Property Connect
                </span>
              )}
            </div>
          </button>

          {/* Desktop Nav Links */}
          <div className="hidden lg:flex items-center space-x-8">
            {mainNavItems.filter(i => i.show).map((item) => (
              <button
                key={item.value}
                onClick={() => onViewChange(item.value)}
                className={`text-[11px] font-black uppercase tracking-[0.2em] transition-all relative py-2 group outline-none ${
                   currentView === item.value ? 'text-[#40a28f]' : 'text-gray-400 hover:text-gray-900'
                 }`}
               >
                 {item.label}
                 <span className={`absolute bottom-0 left-0 h-0.5 bg-[#40a28f] transition-all duration-500 rounded-full ${
                   currentView === item.value ? 'w-full' : 'w-0 group-hover:w-full'
                 }`} />
               </button>
            ))}

            {/* Layout Toggle: Dropdown vs Flat */}
            {showToolsDropdown && serviceItems.length > 0 ? (
              /* Services Dropdown */
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className={`flex items-center gap-1 text-[11px] font-black uppercase tracking-widest transition-all outline-none ${
                    serviceItems.some(i => currentView === i.value) ? 'text-[#40a28f]' : 'text-gray-500 hover:text-[#40a28f]'
                  }`}
                >
                  Tools
                  <ChevronDown className={`w-3 h-3 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {isDropdownOpen && (
                  <div className="absolute top-full right-0 mt-4 w-56 bg-white rounded-2xl shadow-2xl border border-gray-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="p-2">
                      {serviceItems.map((item) => (
                        <button
                          key={item.value}
                          onClick={() => {
                            onViewChange(item.value);
                            setIsDropdownOpen(false);
                          }}
                          className="w-full flex items-center px-4 py-3 text-[10px] font-bold text-gray-600 hover:text-[#40a28f] hover:bg-[#40a28f]/5 rounded-xl transition-all uppercase tracking-widest"
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Flat Navigation Items */
              <div className="flex items-center space-x-8">
                {serviceItems.map((item) => (
                  <button
                    key={item.value}
                    onClick={() => onViewChange(item.value)}
                    className={`text-[11px] font-black uppercase tracking-widest transition-all outline-none ${
                      currentView === item.value ? 'text-[#40a28f]' : 'text-gray-500 hover:text-[#40a28f]'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            )}

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-4">
                {token && !isPremium && userRole !== 'admin' && (
                  <button
                    onClick={() => setIsPremiumModalOpen(true)}
                    className="hidden lg:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:shadow-lg hover:shadow-emerald-500/20 transition-all border border-emerald-400/30 group"
                  >
                    <Crown className="w-3.5 h-3.5 group-hover:rotate-12 transition-transform" />
                    Become Premium
                  </button>
                )}
                {token && config['enable_notifications'] !== 'false' && <NotificationBell />}
                {token && config['enable_notifications'] !== 'false' && <div className="h-4 w-px bg-gray-100 hidden sm:block"></div>}
                
                <div className="relative" ref={accountRef}>
                  <button
                    onClick={() => setIsAccountOpen(!isAccountOpen)}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all shadow-sm active:scale-95 border ${
                      token 
                        ? 'bg-gray-50 border-gray-100 text-gray-700 hover:bg-white' 
                        : 'bg-[#40a28f] border-[#40a28f] text-white hover:bg-[#358a7a] shadow-[#40a28f]/20'
                    }`}
                  >
                    <span className="text-[10px] font-black uppercase tracking-widest">
                      {token ? 'My Account' : 'Get Started'}
                    </span>
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${isAccountOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isAccountOpen && (
                    <div className="absolute top-full right-0 mt-3 w-64 bg-white rounded-2xl shadow-2xl border border-gray-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300">
                      <div className="p-3 space-y-1">
                        {token ? (
                          <>
                            <div className="px-4 py-3 mb-2 bg-gray-50 rounded-xl">
                              <div className="flex items-center justify-between mb-1">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Signed in as</p>
                                {isPremium && (
                                  <span className="flex items-center gap-1 px-2 py-0.5 bg-[#40a28f]/10 text-[#40a28f] text-[9px] font-black rounded-full uppercase tracking-tighter border border-[#40a28f]/20">
                                    <Crown className="w-2.5 h-2.5" /> Premium
                                  </span>
                                )}
                              </div>
                              <p className="text-xs font-bold text-gray-800 truncate">{user?.email || localStorage.getItem('userEmail') || 'User'}</p>
                            </div>
                            
                            {!isPremium && userRole !== 'admin' && (
                              <button
                                onClick={() => { setIsPremiumModalOpen(true); setIsAccountOpen(false); }}
                                className="w-full flex items-center gap-3 px-4 py-3 text-[10px] font-black text-[#40a28f] bg-[#40a28f]/5 hover:bg-[#40a28f]/10 rounded-xl transition-all uppercase tracking-widest border border-[#40a28f]/20 mb-1"
                              >
                                <Star className="w-4 h-4 fill-current" /> Upgrade to Premium
                              </button>
                            )}

                            <button
                              onClick={() => { onViewChange('Dashboard'); setIsAccountOpen(false); }}
                              className="w-full flex items-center gap-3 px-4 py-3 text-[10px] font-black text-gray-600 hover:text-[#40a28f] hover:bg-[#40a28f]/5 rounded-xl transition-all uppercase tracking-widest"
                            >
                              <LayoutDashboard className="w-4 h-4" /> Dashboard
                            </button>
                            <button
                              onClick={() => { onViewChange('Account'); setIsAccountOpen(false); }}
                              className="w-full flex items-center gap-3 px-4 py-3 text-[10px] font-black text-gray-600 hover:text-[#40a28f] hover:bg-[#40a28f]/5 rounded-xl transition-all uppercase tracking-widest"
                            >
                              <ShieldCheck className="w-4 h-4" /> My Account
                            </button>
                            {userRole === 'admin' && (
                              <>
                                <button
                                  onClick={() => { onViewChange('Admin'); setIsAccountOpen(false); }}
                                  className="w-full flex items-center gap-3 px-4 py-3 text-[10px] font-black text-gray-600 hover:text-[#40a28f] hover:bg-[#40a28f]/5 rounded-xl transition-all uppercase tracking-widest"
                                >
                                  <ShieldCheck className="w-4 h-4" /> Admin Panel
                                </button>
                                <button
                                  onClick={() => { handleRefreshConfig(); setIsAccountOpen(false); }}
                                  className="w-full flex items-center gap-3 px-4 py-3 text-[10px] font-black text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-xl transition-all uppercase tracking-widest"
                                >
                                  <ShieldCheck className="w-4 h-4" /> Refresh Config
                                </button>
                              </>
                            )}
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => { onOpenLogin(); setIsAccountOpen(false); }}
                              className="w-full flex items-center gap-3 px-4 py-3 text-[10px] font-black text-gray-600 hover:text-[#40a28f] hover:bg-[#40a28f]/5 rounded-xl transition-all uppercase tracking-widest"
                            >
                              <Info className="w-4 h-4" /> Log In
                            </button>
                            <button
                              onClick={() => { onOpenSignUp(); setIsAccountOpen(false); }}
                              className="w-full flex items-center gap-3 px-4 py-3 text-[10px] font-black text-[#40a28f] bg-[#40a28f]/5 hover:bg-[#40a28f]/10 rounded-xl transition-all uppercase tracking-widest"
                            >
                              <ShieldCheck className="w-4 h-4" /> Create Account
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Mobile Toggle */}
            <button
              className="lg:hidden p-2 text-gray-400 hover:text-[#40a28f] bg-gray-50 rounded-xl"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-50 p-6 space-y-6 animate-in slide-in-from-top duration-300">
          <div className="flex flex-col gap-4">
            {[...mainNavItems.filter(i => i.show), ...serviceItems].map((item) => (
              <button
                key={item.value}
                onClick={() => {
                  onViewChange(item.value);
                  setIsMenuOpen(false);
                }}
                className={`text-sm font-black uppercase tracking-widest py-2 text-left ${
                  currentView === item.value ? 'text-[#40a28f]' : 'text-gray-500 hover:text-[#40a28f]'
                }`}
              >
                {item.label}
              </button>
            ))}
            
            {token && (
              <>
                <button
                  onClick={() => { onViewChange('Dashboard'); setIsMenuOpen(false); }}
                  className="text-sm font-black uppercase tracking-widest py-2 text-[#40a28f] text-left flex items-center gap-2"
                >
                  <LayoutDashboard className="w-4 h-4" /> Dashboard
                </button>
                {userRole === 'admin' && (
                  <button
                    onClick={() => { onViewChange('Admin'); setIsMenuOpen(false); }}
                    className="text-sm font-black uppercase tracking-widest py-2 text-gray-500 text-left flex items-center gap-2"
                  >
                    <ShieldCheck className="w-4 h-4" /> Admin Panel
                  </button>
                )}
                <button
                  onClick={handleLogout}
                  className="text-sm font-black uppercase tracking-widest py-2 text-red-500 text-left flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              </>
            )}
          </div>

          {!token && (
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => { onOpenLogin(); setIsMenuOpen(false); }}
                className="py-4 text-xs font-black uppercase tracking-widest text-gray-500 bg-gray-50 rounded-2xl"
              >
                Login
              </button>
              <button
                onClick={() => { onOpenSignUp(); setIsMenuOpen(false); }}
                className="py-4 text-xs font-black uppercase tracking-widest text-[#40a28f] bg-[#40a28f]/10 rounded-2xl"
              >
                Join
              </button>
            </div>
          )}

        </div>
      )}
      <PremiumModal isOpen={isPremiumModalOpen} onClose={() => setIsPremiumModalOpen(false)} />
    </nav>
  );
};

export default Navbar;
