import React, { useState } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { authService } from './services/api';
import { SiteConfigProvider } from './contexts/SiteConfigContext';
import BrowsePropertiesView from './pages/BrowsePropertiesView';
import RequirementsView from './pages/RequirementsView';
import MyListingsView from './pages/MyListingsView';
import PaymentsView from './pages/PaymentsView';
import AccountView from './pages/AccountView';
import AboutView from './pages/AboutView';
import ContactView from './pages/ContactView';
import ResetPasswordView from './pages/ResetPasswordView';
import NotFoundView from './pages/NotFoundView';
import AdminView from './pages/AdminView';
import AdminLogin from './pages/AdminLogin';
import DashboardView from './pages/DashboardView';
import LoginModal from './components/LoginModal';
import SignUpModal from './components/SignUpModal';
import MyListView from './pages/MyListView';

import PropertyDetailsView from './pages/PropertyDetailsView';

const App: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSignUpModalOpen, setIsSignUpModalOpen] = useState(false);
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
          location.pathname === '/payments' ? 'Payments' :
            location.pathname === '/account' ? 'Account' :
              location.pathname === '/mylist' ? 'MyList' :
                location.pathname === '/about' ? 'About' :
                  location.pathname === '/contact' ? 'Contact' : 'Browse';

  const openLogin = () => {
    setIsSignUpModalOpen(false);
    setIsLoginModalOpen(true);
  };

  const openSignUp = () => {
    setIsLoginModalOpen(false);
    setIsSignUpModalOpen(true);
  };

  const handleAdminLogin = async (email: string, password: string) => {
    try {
      const data = await authService.login({ email, password });
      if (data.user.role === 'admin') {
        setIsAdminAuthenticated(true);
        sessionStorage.setItem('isAdminAuthenticated', 'true');
        localStorage.setItem('userRole', 'admin');
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
      case 'Payments': navigate('/payments'); break;
      case 'Account': navigate('/account'); break;
      case 'MyList': navigate('/mylist'); break;
      case 'About': navigate('/about'); break;
      case 'Contact': navigate('/contact'); break;
      case 'Admin': navigate('/admin'); break;
      default: navigate('/');
    }
  };

  const isAtAdmin = location.pathname.startsWith('/admin');

  if (isAtAdmin) {
    return (
      <SiteConfigProvider>
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
      </SiteConfigProvider>
    );
  }

  return (
    <SiteConfigProvider>
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
            <Route path="/about" element={<AboutView />} />
            <Route path="/contact" element={<ContactView />} />
            <Route path="/dashboard" element={<DashboardView />} />
            <Route path="/listings" element={<Navigate to="/dashboard" replace />} />
            <Route path="/payments" element={<Navigate to="/dashboard" replace />} />
            <Route path="/account" element={<Navigate to="/dashboard" replace />} />
            <Route path="/mylist" element={<Navigate to="/dashboard" replace />} />
            <Route path="/reset-password" element={<ResetPasswordView />} />
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
          onClose={() => setIsLoginModalOpen(false)}
          onSwitchToSignUp={openSignUp}
        />

        <SignUpModal
          isOpen={isSignUpModalOpen}
          onClose={() => setIsSignUpModalOpen(false)}
          onSwitchToLogin={openLogin}
        />

        <Footer />
      </div>
    </SiteConfigProvider>
  );
};

export default App;
