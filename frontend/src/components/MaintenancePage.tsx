import React from 'react';
import { Settings, Lock } from 'lucide-react';

interface MaintenancePageProps {
    onOpenLogin: () => void;
}

const MaintenancePage: React.FC<MaintenancePageProps> = ({ onOpenLogin }) => {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center border border-gray-100">
                <div className="mb-6 flex justify-center">
                    <div className="h-20 w-20 bg-amber-50 rounded-full flex items-center justify-center">
                        <Settings className="h-10 w-10 text-amber-500 animate-spin-slow" />
                    </div>
                </div>

                <h1 className="text-3xl font-bold text-gray-900 mb-4 font-serif">
                    Under Maintenance
                </h1>

                <p className="text-gray-600 mb-8 leading-relaxed">
                    We are currently performing scheduled maintenance to improve our services.
                    Please check back shortly. We apologize for any inconvenience.
                </p>

                <div className="h-1 w-24 bg-amber-500 mx-auto rounded-full mb-8"></div>

                <button
                    onClick={onOpenLogin}
                    className="flex items-center justify-center gap-2 mx-auto text-sm text-gray-400 hover:text-amber-600 transition-colors"
                >
                    <Lock className="h-3 w-3" />
                    <span>Admin Access</span>
                </button>
            </div>

            <div className="mt-8 text-center text-gray-400 text-xs">
                &copy; {new Date().getFullYear()} RJG Property Connect. All rights reserved.
            </div>
        </div>
    );
};

export default MaintenancePage;
