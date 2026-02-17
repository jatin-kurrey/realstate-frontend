
import React from 'react';
import { PlusCircle } from 'lucide-react';
import { useSiteConfig } from '../contexts/SiteConfigContext';

interface HeroProps {
  onAction?: () => void;
}

const Hero: React.FC<HeroProps> = ({ onAction }) => {
  const { config } = useSiteConfig();

  return (
    <div className="bg-[#e2f2f0] py-16 px-4 text-center border-b border-[#d1e8e5]">
      <div className="max-w-4xl mx-auto space-y-4">
        <h1 className="text-4xl md:text-5xl font-bold text-[#2d3748] tracking-tight">
          {config['hero_title'] || 'Property Requirements'}
        </h1>
        <p className="text-base text-gray-600 max-w-2xl mx-auto whitespace-pre-line">
          {config['hero_subtitle'] || 'Browse what buyers and tenants are looking for in Rajnandgaon, or post your own requirement to connect with property owners.'}
        </p>
        <div className="pt-6">
          <button
            onClick={onAction}
            className="bg-[#40a28f] text-white px-8 py-3.5 rounded-lg font-bold hover:bg-[#358a7a] transition-all shadow-md flex items-center gap-2 mx-auto"
          >
            <PlusCircle className="h-5 w-5" />
            Post Your Requirement
          </button>
        </div>
      </div>
    </div>
  );
};

export default Hero;
