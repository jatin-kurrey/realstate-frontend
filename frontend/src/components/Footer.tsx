
import React from 'react';
import { useSiteConfig } from '../contexts/SiteConfigContext';

const Footer: React.FC = () => {
    const { config } = useSiteConfig();

    return (
        <footer className="bg-white border-t border-gray-100 py-10">
            <div className="max-w-7xl mx-auto px-4 text-center">
                <p className="text-gray-400 text-sm font-medium">
                    &copy; {new Date().getFullYear()} {config.site_name || 'RJG Property Connect'}. All rights reserved.
                </p>
                <div className="mt-4 flex justify-center gap-6">
                    {config.facebook_url && (
                        <a href={config.facebook_url} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#40a28f] transition-colors text-xs font-bold uppercase tracking-widest">Facebook</a>
                    )}
                    {config.instagram_url && (
                        <a href={config.instagram_url} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#40a28f] transition-colors text-xs font-bold uppercase tracking-widest">Instagram</a>
                    )}
                    {config.twitter_url && (
                        <a href={config.twitter_url} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#40a28f] transition-colors text-xs font-bold uppercase tracking-widest">Twitter</a>
                    )}
                </div>
            </div>
        </footer>
    );
};

export default Footer;
