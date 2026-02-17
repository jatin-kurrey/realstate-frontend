import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

const Breadcrumbs: React.FC = () => {
    const location = useLocation();
    const pathnames = location.pathname.split('/').filter((x) => x);

    if (pathnames.length === 0) return null;

    return (
        <nav className="flex mb-8" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-2">
                <li>
                    <Link
                        to="/"
                        className="text-gray-400 hover:text-[#40a28f] transition-colors flex items-center"
                    >
                        <Home className="h-4 w-4" />
                    </Link>
                </li>
                {pathnames.map((value, index) => {
                    const last = index === pathnames.length - 1;
                    const to = `/${pathnames.slice(0, index + 1).join('/')}`;
                    const label = value.charAt(0).toUpperCase() + value.slice(1).replace(/-/g, ' ');

                    return (
                        <li key={to} className="flex items-center space-x-2">
                            <ChevronRight className="h-4 w-4 text-gray-300" />
                            {last ? (
                                <span className="text-xs font-black text-[#40a28f] uppercase tracking-widest leading-none">
                                    {label}
                                </span>
                            ) : (
                                <Link
                                    to={to}
                                    className="text-xs font-bold text-gray-400 hover:text-gray-600 uppercase tracking-widest leading-none"
                                >
                                    {label}
                                </Link>
                            )}
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
};

export default Breadcrumbs;
