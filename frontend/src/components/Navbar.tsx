import React from 'react';
import { LogOut, Menu, X, Map as MapIcon, MessageSquare } from 'lucide-react';
import NotificationBell from './NotificationBell';

interface NavbarProps {
  currentView: string;
  onViewChange: (view: string) => void;
  onOpenLogin: () => void;
  onOpenSignUp: () => void;
  onLogout: () => void;
  isAdmin?: boolean;
}

import { useSiteConfig } from '../contexts/SiteConfigContext';
import { useChat } from '../contexts/ChatContext';

const Navbar: React.FC<NavbarProps> = ({ currentView, onViewChange, onOpenLogin, onOpenSignUp, onLogout }) => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('userRole');
  const { config } = useSiteConfig();
  const { totalUnreadCount } = useChat();

  const handleLogout = () => {
    onLogout();
    setIsMenuOpen(false);
  };

  const navItems = [
    { label: 'Browse Properties', value: 'Browse', show: true },
    { label: 'Requirements', value: 'Requirements', show: true },
    { label: 'Messages', value: 'Messages', show: !!token },
    { label: 'Dashboard', value: 'Dashboard', show: !!token },
    { label: 'Admin', value: 'Admin', show: !!token && userRole === 'admin' },
    { label: 'About Us', value: 'About', show: true },
  ];

  const visibleItems = navItems.filter(item => item.show);

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 py-1 sm:py-2">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        <div className="flex justify-between h-12 sm:h-16 items-center">
          {/* Logo Section */}
          <button
            onClick={() => onViewChange('Browse')}
            className="flex items-center gap-2 sm:gap-3 hover:opacity-90 transition-all outline-none group"
          >
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#40a28f]/10 rounded-lg sm:rounded-xl flex items-center justify-center transition-transform group-hover:scale-105">
              <div className="relative">
                <MapIcon className="w-5 h-5 sm:w-6 sm:h-6 text-[#40a28f]" />
                <div className="absolute -bottom-0.5 -right-0.5 sm:-bottom-1 sm:-right-1 w-2 h-2 sm:w-3 sm:h-3 bg-[#40a28f] rounded-full border border-white"></div>
              </div>
            </div>
            <span className="text-lg sm:text-xl font-bold text-[#40a28f] tracking-tight hidden xs:inline">
              {config['site_name'] || 'RJG Property Connect'}
            </span>
            <span className="text-lg font-bold text-[#40a28f] tracking-tight xs:hidden">
              RJG
            </span>
          </button>

          {/* Desktop Nav Links */}
          <div className="hidden lg:flex items-center space-x-6">
            {visibleItems.map((item) => (
              <button
                key={item.value}
                onClick={() => onViewChange(item.value)}
                className={`text-sm font-semibold transition-colors outline-none relative ${currentView === item.value
                  ? 'text-[#40a28f]'
                  : 'text-gray-600 hover:text-[#40a28f]'
                  }`}
              >
                {item.label}
                {item.value === 'Messages' && totalUnreadCount > 0 && (
                  <span className="absolute -top-2 -right-3 w-4 h-4 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                    {totalUnreadCount}
                  </span>
                )}
              </button>
            ))}
            {/* Direct List Property Action */}
            <button
              onClick={() => {
                if (token) {
                  window.location.href = '/dashboard?tab=assets&action=new';
                } else {
                  onOpenLogin();
                }
              }}
              className="text-sm font-bold text-[#40a28f] bg-[#40a28f]/10 px-4 py-2 rounded-xl hover:bg-[#40a28f] hover:text-white transition-all outline-none"
            >
              List Property
            </button>
          </div>

          {/* Action Group */}
          <div className="flex items-center gap-2 sm:gap-3">
            {token ? (
              <div className="flex items-center gap-2 sm:gap-4">
                <NotificationBell />
                <div className="h-6 sm:h-8 w-px bg-gray-100 mx-0.5 sm:mx-1"></div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 text-sm font-bold text-red-500 hover:bg-red-50 rounded-lg sm:rounded-xl transition-all"
                >
                  <LogOut className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2 sm:gap-3">
                <button
                  onClick={onOpenLogin}
                  className="px-5 sm:px-7 py-2 sm:py-2.5 bg-[#40a28f] text-white rounded-lg sm:rounded-xl text-sm font-black uppercase tracking-widest hover:bg-[#358a7a] transition-all shadow-lg sm:shadow-xl shadow-[#40a28f]/20 active:scale-95"
                >
                  Log In
                </button>
                <button
                  onClick={onOpenSignUp}
                  className="px-5 sm:px-7 py-2 sm:py-2.5 bg-[#e2f2f0] text-[#40a28f] rounded-lg sm:rounded-xl text-sm font-black uppercase tracking-widest hover:bg-[#d4e9e6] transition-all active:scale-95"
                >
                  Sign Up
                </button>
              </div>
            )}

            {/* Mobile Toggle */}
            <button
              className="lg:hidden p-1.5 sm:p-2 text-gray-400 hover:text-[#40a28f]"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-5 w-5 sm:h-6 sm:w-6" /> : <Menu className="h-5 w-5 sm:h-6 sm:w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-50 p-3 sm:p-4 space-y-1">
          {visibleItems.map((item) => (
            <button
              key={item.value}
              onClick={() => {
                onViewChange(item.value);
                setIsMenuOpen(false);
              }}
              className={`w-full text-left px-3 sm:px-4 py-2.5 sm:py-3 text-sm font-semibold rounded-lg sm:rounded-xl transition-all relative flex items-center justify-between ${currentView === item.value
                ? 'bg-[#40a28f]/10 text-[#40a28f]'
                : 'text-gray-600 hover:bg-gray-50'
                }`}
            >
              <span className="truncate">{item.label}</span>
              {item.value === 'Messages' && totalUnreadCount > 0 && (
                <span className="w-4 h-4 sm:w-5 sm:h-5 bg-red-500 text-white text-[9px] sm:text-[10px] font-black rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                  {totalUnreadCount}
                </span>
              )}
            </button>
          ))}
          <button
            onClick={() => {
              if (token) {
                window.location.href = '/dashboard?tab=assets&action=new';
              } else {
                onOpenLogin();
              }
              setIsMenuOpen(false);
            }}
            className="w-full text-left px-3 sm:px-4 py-2.5 sm:py-3 text-sm font-bold text-[#40a28f] bg-[#40a28f]/5 rounded-lg sm:rounded-xl mt-1.5 sm:mt-2"
          >
            List Property
          </button>
          {!token && (
            <div className="pt-3 sm:pt-4 grid grid-cols-2 gap-2 sm:gap-3">
              <button
                onClick={() => { onOpenLogin(); setIsMenuOpen(false); }}
                className="w-full py-3 text-sm font-bold text-white bg-[#40a28f] rounded-lg sm:rounded-xl shadow-lg shadow-[#40a28f]/20"
              >
                Log In
              </button>
              <button
                onClick={() => { onOpenSignUp(); setIsMenuOpen(false); }}
                className="w-full py-3 text-sm font-bold text-[#40a28f] bg-[#e2f2f0] rounded-lg sm:rounded-xl"
              >
                Sign Up
              </button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
