import React, { useState, useEffect } from 'react';
import { Bell, CheckCircle2 } from 'lucide-react';
import { notificationService } from '../services/api';

const NotificationBell: React.FC = () => {
    const [notifications, setNotifications] = useState<any[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    const fetchNotifications = async () => {
        try {
            const data = await notificationService.getAll();
            setNotifications(data);
            setUnreadCount(data.filter((n: any) => !n.is_read).length);
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        }
    };

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000); // Poll every 30s
        return () => clearInterval(interval);
    }, []);

    const handleMarkAllRead = async () => {
        try {
            await notificationService.markAllRead();
            fetchNotifications();
        } catch (error) {
            console.error('Failed to mark all read:', error);
        }
    };

    const handleMarkRead = async (id: string) => {
        try {
            await notificationService.markRead(id);
            fetchNotifications();
        } catch (error) {
            console.error('Failed to mark read:', error);
        }
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 sm:p-2.5 bg-gray-50 text-gray-400 hover:text-[#40a28f] hover:bg-[#40a28f]/5 rounded-xl sm:rounded-2xl transition-all relative group"
            >
                <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
                {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 w-3.5 h-3.5 sm:w-4 sm:h-4 bg-orange-500 text-white text-[7px] sm:text-[8px] font-black flex items-center justify-center rounded-full border border-white sm:border-2 animate-bounce">
                        {unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-[60]" onClick={() => setIsOpen(false)} />
                    <div className="absolute right-0 mt-2 sm:mt-3 w-72 sm:w-80 bg-white rounded-[20px] sm:rounded-[24px] shadow-2xl border border-gray-100 z-[70] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="p-4 sm:p-5 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                            <h3 className="text-xs font-black text-gray-800 uppercase tracking-widest">Notifications</h3>
                            <button
                                onClick={handleMarkAllRead}
                                className="text-[10px] font-black text-[#40a28f] uppercase tracking-widest hover:underline"
                            >
                                Mark All Read
                            </button>
                        </div>

                        <div className="max-h-80 sm:max-h-96 overflow-y-auto">
                            {notifications.length === 0 ? (
                                <div className="p-8 sm:p-10 text-center space-y-2">
                                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-2 text-gray-200">
                                        <Bell className="h-5 w-5 sm:h-6 sm:w-6" />
                                    </div>
                                    <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest leading-tight">All caught up!</p>
                                </div>
                            ) : (
                                notifications.map((n) => (
                                    <div
                                        key={n.id}
                                        className={`p-3 sm:p-4 border-b border-gray-50 last:border-0 hover:bg-gray-50/80 transition-colors flex gap-2 sm:gap-3 cursor-pointer ${!n.is_read ? 'bg-[#40a28f]/[0.02]' : ''}`}
                                        onClick={() => !n.is_read && handleMarkRead(n.id)}
                                    >
                                        <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl flex-shrink-0 flex items-center justify-center ${n.type === 'system' ? 'bg-orange-50 text-orange-500' : 'bg-blue-50 text-blue-500'}`}>
                                            <CheckCircle2 className="h-3 w-3 sm:h-4 sm:w-4" />
                                        </div>
                                        <div className="space-y-1 min-w-0 flex-1">
                                            <p className={`text-xs leading-relaxed ${!n.is_read ? 'text-gray-800 font-bold' : 'text-gray-500 font-medium'}`}>
                                                {n.content}
                                            </p>
                                            <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest">
                                                {new Date(n.created_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default NotificationBell;
