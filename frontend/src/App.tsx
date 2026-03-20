import React, { useState } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { authService } from './services/api';
import { useSiteConfig } from './contexts/SiteConfigContext';
import MaintenancePage from './components/MaintenancePage';
import BrowsePropertiesView from './pages/BrowsePropertiesView';
import RequirementsView from './pages/RequirementsView';
import MyListingsView from './pages/MyListingsView';
import AccountView from './pages/AccountView';
import AboutView from './pages/AboutView';
import ResetPasswordView from './pages/ResetPasswordView';
import NotFoundView from './pages/NotFoundView';
import AdminView from './pages/AdminView';
import AdminLogin from './pages/AdminLogin';
import DashboardView from './pages/DashboardView';
import MyListView from './pages/MyListView';
import AuctionPropertiesView from './pages/AuctionPropertiesView';
import SDVCalculatorView from './pages/SDVCalculatorView';
import MortgageView from './pages/MortgageView';
import MortgageCalculatorView from './pages/MortgageCalculatorView';
import { useAuth } from './contexts/AuthContext';
import LoginModal from './components/LoginModal';
import SignUpModal from './components/SignUpModal';

import PropertyDetailsView from './pages/PropertyDetailsView';
import RequirementDetailsView from './pages/RequirementDetailsView';
import MortgageDetailsView from './pages/MortgageDetailsView';
import AuctionDetailView from './pages/AuctionDetailView';
import GodMode from './pages/GodMode/GodMode';
import PremiumModal from './components/PremiumModal';

const App: React.FC = () => {
  const { config, loading } = useSiteConfig();
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoginModalOpen, isSignUpModalOpen, openLogin, openSignUp, closeModals } = useAuth();
  const [isPremiumModalOpen, setIsPremiumModalOpen] = useState(false);

  React.useEffect(() => {
    const handleOpenPremium = () => setIsPremiumModalOpen(true);
    window.addEventListener('openPremiumModal', handleOpenPremium);
    return () => window.removeEventListener('openPremiumModal', handleOpenPremium);
  }, []);

  const [userRole, setUserRole] = useState<'seeker' | 'owner' | 'admin' | null>(() => {
    return localStorage.getItem('userRole') as 'seeker' | 'owner' | 'admin' | null;
  });

  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(() => {
    const isAuth = sessionStorage.getItem('isAdminAuthenticated') === 'true';
    const hasAdminRole = localStorage.getItem('userRole') === 'admin';
    return isAuth || hasAdminRole;
  });

  // Derive current view for Navbar from the current path
  const currentView = location.pathname === '/' ? 'Browse' :
    location.pathname === '/requirements' ? 'Requirements' :
      location.pathname === '/dashboard' ? 'Dashboard' :
        location.pathname === '/listings' ? 'MyListings' :
            location.pathname === '/account' ? 'Account' :
              location.pathname === '/mylist' ? 'MyList' :
                location.pathname === '/auctions' ? 'Auctions' :
                location.pathname === '/sdv-calculator' ? 'SDV' :
                location.pathname === '/mortgage' ? 'Mortgage' :
                location.pathname === '/mortgage-calculator' ? 'Mortgage Calculator' :
                location.pathname === '/contact' ? 'About' : 'Browse';

  const handleAdminLogin = async (email: string, password: string) => {
    try {
      const data = await authService.login({ email, password });
      // Check for admin role OR master admin email (failsafe for accidental role changes)
      if (data.user.role === 'admin' || email === 'admin@rjg.com') {
        setIsAdminAuthenticated(true);
        sessionStorage.setItem('isAdminAuthenticated', 'true');
        localStorage.setItem('userRole', 'admin'); // Force admin role even if DB says otherwise
        localStorage.setItem('token', data.token); // Ensure token is also synced
        navigate('/admin');
        window.location.reload(); // Hard reload to refresh navbar state consistently
      } else {
        alert('You do not have administrative privileges.');
      }
    } catch (error) {
      console.error('Admin login failed:', error);
      alert('Invalid admin credentials');
    }
  };

  const handleAdminLogout = () => {
    setIsAdminAuthenticated(false);
    sessionStorage.removeItem('isAdminAuthenticated');
    navigate('/');
  };

  const handleUserLogout = () => {
    authService.logout();
    setUserRole(null);
    navigate('/');
  };

  const handleViewChange = (view: string) => {
    switch (view) {
      case 'Browse': navigate('/'); break;
      case 'Requirements': navigate('/requirements'); break;
      case 'Dashboard': navigate('/dashboard'); break;
      case 'MyListings': navigate('/listings'); break;
      case 'Account': navigate('/account'); break;
      case 'MyList': navigate('/mylist'); break;
      case 'About': navigate('/about'); break;
      case 'Contact': navigate('/about'); break;
      case 'Auctions': navigate('/auctions'); break;
      case 'SDV': navigate('/sdv-calculator'); break;
      case 'Mortgage': navigate('/mortgage'); break;
      case 'Mortgage Calculator': navigate('/mortgage-calculator'); break;
      case 'Admin': navigate('/admin'); break;
      default: navigate('/');
    }
  };

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[#fcfdfd]">
        <div className="w-16 h-16 border-4 border-[#40a28f]/20 border-t-[#40a28f] rounded-full animate-spin"></div>
      </div>
    );
  }

  if (location.pathname === '/god') {
    return <GodMode />;
  }

  const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

  if (config.maintenance_mode === 'true' && !isAdminAuthenticated) {
    return (
      <div className="min-h-screen bg-[#fcfdfd]">
        <MaintenancePage onOpenLogin={openLogin} />
        <LoginModal
          isOpen={isLoginModalOpen}
          onClose={closeModals}
          onSwitchToSignUp={openSignUp}
        />
        <SignUpModal
          isOpen={isSignUpModalOpen}
          onClose={closeModals}
          onSwitchToLogin={openLogin}
        />
      </div>
    );
  }

  const isAtAdmin = location.pathname.startsWith('/admin');

  if (isAtAdmin) {
    return (
      // <SiteConfigProvider> Removed: now in main.tsx
      <div className="h-screen bg-[#fcfdfd]">
        <Routes>
          <Route
            path="/admin/*"
            element={
              isAdminAuthenticated ? (
                <AdminView onLogout={handleAdminLogout} />
              ) : (
                <AdminLogin onLogin={handleAdminLogin} />
              )
            }
          />
        </Routes>
      </div>
      // </SiteConfigProvider>
    );
  }

  return (
    // <SiteConfigProvider> Removed: now in main.tsx
    <div className="min-h-screen flex flex-col bg-[#fcfdfd]">
      <Navbar
        currentView={currentView}
        onViewChange={handleViewChange}
        onOpenLogin={openLogin}
        onOpenSignUp={openSignUp}
        onLogout={handleUserLogout}
      />

      <div className="flex-grow">
        <Routes>
          <Route path="/" element={<BrowsePropertiesView onNavigateToRequirements={() => navigate('/requirements')} onOpenLogin={openLogin} />} />
          <Route path="/properties/:id" element={<PropertyDetailsView />} />
          <Route path="/requirements" element={<RequirementsView />} />
          <Route path="/requirements/:id" element={<RequirementDetailsView />} />
          <Route path="/mortgage/:id" element={<MortgageDetailsView />} />
          <Route path="/auction/:id" element={<AuctionDetailView />} />
          <Route path="/about" element={<AboutView />} />
          <Route path="/contact" element={<AboutView />} />
          <Route path="/dashboard" element={<DashboardView />} />
          <Route path="/listings" element={<Navigate to="/dashboard" replace />} />
          <Route path="/account" element={<Navigate to="/dashboard" replace />} />
          <Route path="/mylist" element={<Navigate to="/dashboard" replace />} />
          <Route path="/reset-password" element={<ResetPasswordView />} />
          <Route path="/auctions" element={<AuctionPropertiesView />} />
          <Route path="/auctions/:id" element={<AuctionDetailView />} />
          <Route path="/sdv-calculator" element={<SDVCalculatorView />} />
          <Route path="/mortgage" element={<MortgageView />} />
          <Route path="/mortgage-calculator" element={<MortgageCalculatorView />} />
          <Route
            path="/admin/*"
            element={
              isAdminAuthenticated ? <AdminView onLogout={handleAdminLogout} /> : <AdminLogin onLogin={handleAdminLogin} />
            }
          />
          <Route path="*" element={<NotFoundView />} />
        </Routes>
      </div>

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={closeModals}
        onSwitchToSignUp={openSignUp}
      />

      <SignUpModal
        isOpen={isSignUpModalOpen}
        onClose={closeModals}
        onSwitchToLogin={openLogin}
      />

      <PremiumModal
        isOpen={isPremiumModalOpen}
        onClose={() => setIsPremiumModalOpen(false)}
      />

      {!location.pathname.startsWith('/dashboard') && !location.pathname.startsWith('/admin') && <Footer />}
    </div>
    // </SiteConfigProvider>
  );
};

export default App;
