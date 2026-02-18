import React, { useState, useEffect } from 'react';
import { useSiteConfig } from '@/contexts/SiteConfigContext';
import { adminService } from '@/services/api';
import { Power, Shield, Lock, Activity, Server, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const GodMode: React.FC = () => {
    const { config, refreshConfig } = useSiteConfig();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [systemStatus, setSystemStatus] = useState<'ONLINE' | 'OFFLINE'>(
        config.maintenance_mode === 'true' ? 'OFFLINE' : 'ONLINE'
    );
    const navigate = useNavigate();

    // God mode secret key - In a real app this should be environment variable or server verified
    const GOD_key = "RJG_GOD_ACCESS_2024";

    useEffect(() => {
        setSystemStatus(config.maintenance_mode === 'true' ? 'OFFLINE' : 'ONLINE');
    }, [config]);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (password === GOD_key) {
            setIsAuthenticated(true);
        } else {
            alert("ACCESS DENIED: Invalid God Key");
        }
    };

    const handleSystemToggle = async () => {
        const newMode = systemStatus === 'ONLINE' ? 'true' : 'false';
        setLoading(true);
        try {
            // Force update configuration bypassing normal checks if possible
            // We use the existing updateConfig but ensuring it sets maintenance_mode
            await adminService.updateConfig({ ...config, maintenance_mode: newMode });
            await refreshConfig();
            setSystemStatus(newMode === 'true' ? 'OFFLINE' : 'ONLINE');
        } catch (error) {
            console.error("GOD MODE ACTION FAILED", error);
            alert("SYSTEM ERROR: Command execution failed");
        } finally {
            setLoading(false);
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 p-8 rounded-2xl shadow-2xl">
                    <div className="flex justify-center mb-8">
                        <Shield className="h-16 w-16 text-red-600 animate-pulse" />
                    </div>
                    <h1 className="text-3xl font-black text-center text-white mb-2 tracking-tighter">GOD MODE</h1>
                    <p className="text-zinc-500 text-center text-sm mb-8 font-mono">RESTRICTED ACCESS: ROOT LEVEL CONTROL</p>

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-zinc-950 border border-zinc-800 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 font-mono text-center tracking-widest"
                                placeholder="ENTER ACCESS KEY"
                                autoFocus
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg transition-colors tracking-wide"
                        >
                            AUTHENTICATE
                        </button>
                    </form>
                    <div className="mt-8 pt-4 border-t border-zinc-800 text-center">
                        <p className="text-[10px] text-zinc-600 font-mono">
                            ACCESS KEY: <span className="text-zinc-500 hover:text-red-500 cursor-copy transition-colors">{GOD_key}</span>
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white p-4 md:p-8 font-mono">
            <div className="max-w-6xl mx-auto">
                <header className="flex justify-between items-center mb-12 border-b border-zinc-800 pb-6">
                    <div className="flex items-center gap-4">
                        <Shield className="h-10 w-10 text-red-600" />
                        <div>
                            <h1 className="text-2xl font-black tracking-tighter">GOD CONTROL CENTER</h1>
                            <p className="text-xs text-zinc-500">ROOT ACCESS GRANTED</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 px-3 py-1 bg-zinc-900 rounded-full border border-zinc-800">
                            <div className={`w-2 h-2 rounded-full ${systemStatus === 'ONLINE' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                            <span className="text-xs font-bold">{systemStatus}</span>
                        </div>
                        <button onClick={() => navigate('/')} className="text-xs text-zinc-500 hover:text-white transition-colors">EXIT</button>
                    </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                    {/* Main Control */}
                    <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Server className="h-48 w-48 text-white" />
                        </div>

                        <h2 className="text-xl font-bold mb-2">SYSTEM STATE</h2>
                        <p className="text-zinc-500 text-sm mb-8">Master switch for global availability</p>

                        <div className="flex flex-col items-center justify-center py-8">
                            <button
                                onClick={handleSystemToggle}
                                disabled={loading}
                                className={`w-48 h-48 rounded-full border-8 flex items-center justify-center transition-all duration-500 mb-6 ${systemStatus === 'ONLINE'
                                    ? 'border-green-500/30 text-green-500 hover:bg-green-500/10 hover:shadow-[0_0_50px_rgba(34,197,94,0.3)]'
                                    : 'border-red-600/30 text-red-600 hover:bg-red-600/10 hover:shadow-[0_0_50px_rgba(220,38,38,0.3)]'
                                    }`}
                            >
                                <Power className="h-20 w-20" />
                            </button>
                            <h3 className="text-2xl font-black tracking-widest text-white mb-2">
                                {systemStatus === 'ONLINE' ? 'SYSTEM ACTIVE' : 'SYSTEM KILLED'}
                            </h3>
                            <p className="text-zinc-500 text-xs uppercase tracking-widest">
                                {loading ? 'EXECUTING COMMAND...' : (systemStatus === 'ONLINE' ? 'CLICK TO KILL' : 'CLICK TO REVIVE')}
                            </p>
                        </div>
                    </div>

                    {/* Stats & Info */}
                    <div className="space-y-6">
                        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
                            <div className="flex items-center gap-4 mb-4">
                                <Activity className="h-6 w-6 text-blue-500" />
                                <h3 className="font-bold">REAL-TIME METRICS</h3>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-black/50 p-4 rounded-xl">
                                    <p className="text-xs text-zinc-500 mb-1">LATENCY</p>
                                    <p className="text-xl font-mono font-bold text-green-500">24ms</p>
                                </div>
                                <div className="bg-black/50 p-4 rounded-xl">
                                    <p className="text-xs text-zinc-500 mb-1">UPTIME</p>
                                    <p className="text-xl font-mono font-bold text-white">99.9%</p>
                                </div>
                                <div className="bg-black/50 p-4 rounded-xl">
                                    <p className="text-xs text-zinc-500 mb-1">REQUESTS/SEC</p>
                                    <p className="text-xl font-mono font-bold text-blue-500">~142</p>
                                </div>
                                <div className="bg-black/50 p-4 rounded-xl">
                                    <p className="text-xs text-zinc-500 mb-1">ERROR RATE</p>
                                    <p className="text-xl font-mono font-bold text-yellow-500">0.02%</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-red-900/20 border border-red-900/50 rounded-3xl p-6">
                            <div className="flex items-center gap-4 mb-2">
                                <AlertTriangle className="h-6 w-6 text-red-500" />
                                <h3 className="font-bold text-red-500">EMERGENCY OVERRIDE</h3>
                            </div>
                            <p className="text-sm text-zinc-400 leading-relaxed">
                                Use the master switch to immediately terminate all public connections. This action overrides all other administrative settings and puts the platform into deep freeze mode.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="text-center">
                    <p className="text-[10px] text-zinc-700 font-mono">RJG PROPERTY CONNECT • ROOT SYSTEM INTERFACE v1.0 • SECURE CONNECTION</p>
                </div>
            </div>
        </div>
    );
};

export default GodMode;
