import React from 'react';
import { useSiteConfig } from '../contexts/SiteConfigContext';
import { MapIcon, Facebook, Instagram, Twitter, Mail, Phone, MapPin } from 'lucide-react';

const Footer: React.FC = () => {
  const { config } = useSiteConfig();

  return (
    <footer className="bg-white border-t border-gray-100 pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
          {/* Brand Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#40a28f] rounded-xl flex items-center justify-center shadow-lg shadow-[#40a28f]/20">
                <MapIcon className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-black text-[#40a28f] tracking-tighter uppercase">
                {config['site_name']?.split(' ')[0] || 'RJG'}
              </span>
            </div>
            <p className="text-sm text-gray-500 font-medium leading-relaxed">
              The premier real estate bridge for Rajnandgaon and beyond. Verified community property intelligence built for professional growth.
            </p>
            <div className="flex gap-4">
              <a href="#" className="p-2 bg-gray-50 text-gray-400 hover:text-[#40a28f] hover:bg-[#40a28f]/5 rounded-lg transition-all"><Facebook className="w-4 h-4" /></a>
              <a href="#" className="p-2 bg-gray-50 text-gray-400 hover:text-[#40a28f] hover:bg-[#40a28f]/5 rounded-lg transition-all"><Instagram className="w-4 h-4" /></a>
              <a href="#" className="p-2 bg-gray-50 text-gray-400 hover:text-[#40a28f] hover:bg-[#40a28f]/5 rounded-lg transition-all"><Twitter className="w-4 h-4" /></a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-6">
            <h4 className="text-[10px] font-black text-gray-900 uppercase tracking-[0.2em]">Properties</h4>
            <ul className="space-y-4">
              <li><a href="/" className="text-sm text-gray-500 font-bold hover:text-[#40a28f] transition-colors">Residential</a></li>
              <li><a href="/" className="text-sm text-gray-500 font-bold hover:text-[#40a28f] transition-colors">Commercial</a></li>
              <li><a href="/" className="text-sm text-gray-500 font-bold hover:text-[#40a28f] transition-colors">Plots & Land</a></li>
              <li><a href="/auctions" className="text-sm text-gray-500 font-bold hover:text-[#40a28f] transition-colors">Bank Auctions</a></li>
            </ul>
          </div>

          {/* Tools & Services */}
          <div className="space-y-6">
            <h4 className="text-[10px] font-black text-gray-900 uppercase tracking-[0.2em]">Services</h4>
            <ul className="space-y-4">
              <li><a href="/sdv-calculator" className="text-sm text-gray-500 font-bold hover:text-[#40a28f] transition-colors">SDV Calculation</a></li>
              <li><a href="/mortgage" className="text-sm text-gray-500 font-bold hover:text-[#40a28f] transition-colors">Property Lending</a></li>
              <li><a href="/requirements" className="text-sm text-gray-500 font-bold hover:text-[#40a28f] transition-colors">Community Demand</a></li>
              <li><button onClick={() => window.dispatchEvent(new CustomEvent('openPremiumModal'))} className="text-sm text-[#40a28f] font-black hover:text-[#358a7a] transition-colors uppercase tracking-tight">Become Premium</button></li>
              <li><a href="/about" className="text-sm text-gray-500 font-bold hover:text-[#40a28f] transition-colors">About RJG</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-6">
            <h4 className="text-[10px] font-black text-gray-900 uppercase tracking-[0.2em]">Contact Us</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-[#40a28f] mt-0.5" />
                <span className="text-sm text-gray-500 font-medium">Rajnandgaon, Chhattisgarh, India</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-[#40a28f]" />
                <span className="text-sm text-gray-500 font-medium">+91 (800) PROPERTY</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-[#40a28f]" />
                <span className="text-sm text-gray-500 font-medium">contact@rjgproperty.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-10 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest text-center md:text-left">
            &copy; {new Date().getFullYear()} {config.site_name || 'RJG Property Connect'}. Professional Grade Real Estate Intelligence.
          </p>
          <div className="flex gap-8">
            <a href="#" className="text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-[#40a28f]">Privacy</a>
            <a href="#" className="text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-[#40a28f]">Terms</a>
            <a href="#" className="text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-[#40a28f]">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
