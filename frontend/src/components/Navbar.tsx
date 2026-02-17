import React from 'react';
import { LogOut, Menu, X, Map as MapIcon } from 'lucide-react';
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

interface NavbarProps {
  currentView: string;
  onViewChange: (view: string) => void;
  onOpenLogin: () => void;
  onOpenSignUp: () => void;
  onLogout: () => void;
  isAdmin?: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ currentView, onViewChange, onOpenLogin, onOpenSignUp, onLogout }) => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('userRole');
  const { config } = useSiteConfig();

  const handleLogout = () => {
    onLogout();
    setIsMenuOpen(false);
  };

  const navItems = [
    { label: 'Browse Properties', value: 'Browse', show: true },
    { label: 'Requirements', value: 'Requirements', show: true },
    { label: 'Dashboard', value: 'Dashboard', show: !!token },
    { label: 'Admin', value: 'Admin', show: !!token && userRole === 'admin' },
    { label: 'About', value: 'About', show: true },
    { label: 'Contact', value: 'Contact', show: true },
  ];

  const visibleItems = navItems.filter(item => item.show);

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 py-2">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo Section */}
          <button
            onClick={() => onViewChange('Browse')}
            className="flex items-center gap-3 hover:opacity-90 transition-all outline-none group"
          >
            <div className="w-10 h-10 bg-[#40a28f]/10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105">
              <div className="relative">
                <MapIcon className="w-6 h-6 text-[#40a28f]" />
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-[#40a28f] rounded-full border-2 border-white"></div>
              </div>
            </div>
            <span className="text-xl font-bold text-[#40a28f] tracking-tight">
              {config['site_name'] || 'RJG Property Connect'}
            </span>
          </button>

          {/* Desktop Nav Links */}
          <div className="hidden lg:flex items-center space-x-6">
            {visibleItems.map((item) => (
              <button
                key={item.value}
                onClick={() => onViewChange(item.value)}
                className={`text-sm font-semibold transition-colors outline-none ${currentView === item.value
                  ? 'text-[#40a28f]'
                  : 'text-gray-600 hover:text-[#40a28f]'
                  }`}
              >
                {item.label}
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
          <div className="flex items-center gap-3">
            {token ? (
              <div className="flex items-center gap-4">
                <NotificationBell />
                <div className="h-8 w-px bg-gray-100 mx-1"></div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-red-500 hover:bg-red-50 rounded-xl transition-all"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-3">
                <button
                  onClick={onOpenLogin}
                  className="px-7 py-2.5 bg-[#40a28f] text-white rounded-xl text-sm font-black uppercase tracking-widest hover:bg-[#358a7a] transition-all shadow-xl shadow-[#40a28f]/20 active:scale-95"
                >
                  Log In
                </button>
                <button
                  onClick={onOpenSignUp}
                  className="px-7 py-2.5 bg-[#e2f2f0] text-[#40a28f] rounded-xl text-sm font-black uppercase tracking-widest hover:bg-[#d4e9e6] transition-all active:scale-95"
                >
                  Sign Up
                </button>
              </div>
            )}

            {/* Mobile Toggle */}
            <button
              className="lg:hidden p-2 text-gray-400 hover:text-[#40a28f]"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-50 p-4 space-y-1">
          {visibleItems.map((item) => (
            <button
              key={item.value}
              onClick={() => {
                onViewChange(item.value);
                setIsMenuOpen(false);
              }}
              className={`w-full text-left px-4 py-3 text-sm font-semibold rounded-xl transition-all ${currentView === item.value
                ? 'bg-[#40a28f]/10 text-[#40a28f]'
                : 'text-gray-600 hover:bg-gray-50'
                }`}
            >
              {item.label}
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
            className="w-full text-left px-4 py-3 text-sm font-bold text-[#40a28f] bg-[#40a28f]/5 rounded-xl mt-2"
          >
            List Property
          </button>
          {!token && (
            <div className="pt-4 grid grid-cols-2 gap-3">
              <button
                onClick={() => { onOpenLogin(); setIsMenuOpen(false); }}
                className="w-full py-3.5 text-sm font-bold text-white bg-[#40a28f] rounded-xl shadow-lg shadow-[#40a28f]/20"
              >
                Log In
              </button>
              <button
                onClick={() => { onOpenSignUp(); setIsMenuOpen(false); }}
                className="w-full py-3.5 text-sm font-bold text-[#40a28f] bg-[#e2f2f0] rounded-xl"
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
