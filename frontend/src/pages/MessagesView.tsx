import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useChat } from '../contexts/ChatContext';
import { Send, Search, User, MapPin, Loader2, MessageSquare, ChevronLeft, ShieldCheck, Clock, Check, CheckCheck, Edit2, Trash2, MoreVertical, Reply } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import type { Message } from '../contexts/ChatContext';

const MessagesView: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const {
        threads,
        activeThread,
        messages,
        setActiveThread,
        sendMessage,
        markThreadRead,
        editMessage,
        deleteMessage,
        updateTypingStatus,
        isConnected,
        loadingMessages,
        isTyping,
        otherUserTyping,
        loadMoreMessages,
        hasMoreMessages
    } = useChat();
    const [newMessage, setNewMessage] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [editingMessage, setEditingMessage] = useState<Message | null>(null);
    const [showMessageMenu, setShowMessageMenu] = useState<number | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const [isMobileListOpen, setIsMobileListOpen] = useState(true);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const currentUserId = JSON.parse(localStorage.getItem('user') || '{}').id;

    // Sync active thread with URL
    useEffect(() => {
        if (id && threads.length > 0) {
            const thread = threads.find(t => t.id === Number(id));
            if (thread && activeThread?.id !== thread.id) {
                setActiveThread(thread);
            }
        }
    }, [id, threads, activeThread, setActiveThread]);

    // Update URL when active thread changes
    useEffect(() => {
        if (activeThread && (!id || Number(id) !== activeThread.id)) {
            navigate(`/messages/${activeThread.id}`, { replace: true });
        }
    }, [activeThread, id, navigate]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        if (activeThread) {
            setIsMobileListOpen(false);
        }
    }, [activeThread]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim()) return;
        
        if (editingMessage) {
            await editMessage(editingMessage.id, newMessage);
            setEditingMessage(null);
        } else {
            await sendMessage(newMessage);
        }
        
        setNewMessage('');
    };

    const handleEditMessage = (message: Message) => {
        setEditingMessage(message);
        setNewMessage(message.content);
        setShowMessageMenu(null);
    };

    const handleDeleteMessage = async (messageId: number) => {
        if (window.confirm('Are you sure you want to delete this message?')) {
            await deleteMessage(messageId);
        }
        setShowMessageMenu(null);
    };

    const handleTyping = () => {
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }
        
        if (!isTyping) {
            updateTypingStatus(true);
        }
        
        typingTimeoutRef.current = setTimeout(() => {
            updateTypingStatus(false);
        }, 1000);
    };

    const handleScroll = useCallback(() => {
        const container = messagesContainerRef.current;
        if (container && container.scrollTop === 0 && hasMoreMessages && !loadingMessages) {
            loadMoreMessages();
        }
    }, [hasMoreMessages, loadingMessages, loadMoreMessages]);

    // Close message menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (showMessageMenu && !(event.target as Element).closest('.message-menu')) {
                setShowMessageMenu(null);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showMessageMenu]);

    const filteredThreads = threads.filter(t => {
        const otherParticipant = t.participant1_id === currentUserId ? t.participant2 : t.participant1;
        return (otherParticipant?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.last_message?.toLowerCase().includes(searchQuery.toLowerCase())) ?? false;
    });

    return (
        <div className="h-[calc(100vh-64px)] sm:h-[calc(100vh-80px)] bg-[#fcfdfd] flex overflow-hidden">
            {/* Sidebar - Thread List */}
            <div className={`${isMobileListOpen ? 'flex' : 'hidden md:flex'} w-full md:w-[400px] bg-white border-r border-gray-100 flex-col z-20`}>
                <div className="p-4 sm:p-6 border-b border-gray-100 bg-white/50 backdrop-blur-xl">
                    <div className="flex items-center justify-between mb-4 sm:mb-8">
                        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">Chats</h1>
                        <div className={`px-2 py-1 sm:px-3 sm:py-1 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-widest flex items-center gap-1 sm:gap-2 ${isConnected ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-50 text-gray-400'}`}>
                            <div className={`w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-gray-300'}`} />
                            {isConnected ? 'Live' : 'Offline'}
                        </div>
                    </div>
                    <div className="relative group">
                        <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400 group-focus-within:text-[#40a28f] transition-colors" />
                        <input
                            type="text"
                            placeholder="Search people or messages"
                            className="w-full pl-10 pr-3 py-3 sm:pl-12 sm:pr-4 sm:py-4 bg-gray-50/50 border border-transparent rounded-[16px] sm:rounded-[20px] text-sm focus:bg-white focus:ring-2 sm:focus:ring-4 focus:ring-[#40a28f]/5 focus:border-[#40a28f]/20 transition-all font-medium placeholder:text-gray-400"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex-grow overflow-y-auto overflow-x-hidden custom-scrollbar py-1 sm:py-2">
                    {filteredThreads.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center mt-10 sm:mt-20">
                            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-50 rounded-[32px] flex items-center justify-center mb-4 sm:mb-6">
                                <MessageSquare className="h-8 w-8 sm:h-10 sm:w-10 text-gray-200" />
                            </div>
                            <h3 className="text-gray-900 font-bold mb-1 text-base sm:text-lg">No conversations</h3>
                            <p className="text-gray-400 text-xs sm:text-sm font-medium">Start a chat from any listing</p>
                        </div>
                    ) : (
                        filteredThreads.map(thread => {
                            const otherParticipant = thread.participant1_id === currentUserId ? thread.participant2 : thread.participant1;
                            const isActive = activeThread?.id === thread.id;

                            return (
                                <button
                                    key={thread.id}
                                    onClick={() => {
                                        setActiveThread(thread);
                                        if (thread.unread_count && thread.unread_count > 0) {
                                            markThreadRead(thread.id);
                                        }
                                    }}
                                    className={`relative w-[calc(100%-12px)] sm:w-[calc(100%-16px)] mx-1.5 sm:mx-2 my-1 p-3 sm:p-4 flex items-start gap-3 sm:gap-4 transition-all rounded-[20px] sm:rounded-[24px] group ${isActive ? 'bg-[#40a28f] shadow-xl shadow-[#40a28f]/20' : 'hover:bg-gray-50'}`}
                                >
                                    <div className="relative shrink-0">
                                        <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center border ${isActive ? 'bg-white/20 border-white/20' : 'bg-[#40a28f]/5 border-gray-100'}`}>
                                            <User className={`h-5 w-5 sm:h-6 sm:w-6 ${isActive ? 'text-white' : 'text-[#40a28f]'}`} />
                                        </div>
                                        <div className={`absolute -bottom-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 rounded-full border-2 border-white ${isConnected ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                                    </div>
                                    <div className="flex-grow text-left overflow-hidden">
                                        <div className="flex justify-between items-center mb-1">
                                            <h3 className={`text-sm font-black truncate ${isActive ? 'text-white' : 'text-gray-900'}`}>{otherParticipant?.name || 'User'}</h3>
                                            <span className={`text-[9px] font-bold uppercase tracking-widest ${isActive ? 'text-white/60' : 'text-gray-400'}`}>
                                                {thread.updated_at ? format(new Date(thread.updated_at), 'HH:mm') : ''}
                                            </span>
                                        </div>
                                        <p className={`text-xs line-clamp-1 font-medium italic ${isActive ? 'text-white/80' : 'text-gray-500'}`}>
                                            {thread.last_message || 'No messages'}
                                        </p>
                                    </div>
                                    {thread.unread_count && thread.unread_count > 0 && !isActive && (
                                        <div className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 bg-[#40a28f] text-white text-[9px] sm:text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white shadow-lg">
                                            {thread.unread_count}
                                        </div>
                                    )}
                                </button>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Main Chat Area */}
            <div className={`${!isMobileListOpen ? 'flex' : 'hidden md:flex'} flex-grow flex-col bg-white relative`}>
                {activeThread ? (
                    <>
                        {/* Chat Header */}
                        <div className="p-3 sm:p-4 md:p-6 border-b border-gray-100 flex items-center justify-between bg-white/80 backdrop-blur-xl sticky top-0 z-10 transition-all">
                            <div className="flex items-center gap-2 sm:gap-4 min-w-0">
                                <button
                                    onClick={() => setIsMobileListOpen(true)}
                                    className="md:hidden p-2 hover:bg-gray-100 rounded-[12px] sm:rounded-[14px] transition-colors flex-shrink-0"
                                >
                                    <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6 text-gray-900" />
                                </button>
                                <div className="relative flex-shrink-0">
                                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-[#40a28f]/5 flex items-center justify-center border border-[#40a28f]/10">
                                        <User className="h-5 w-5 sm:h-6 sm:w-6 text-[#40a28f]" />
                                    </div>
                                    <div className={`absolute -bottom-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 bg-emerald-500 rounded-full border-2 border-white`} />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <h2 className="text-base sm:text-lg font-black text-gray-900 leading-tight truncate">
                                        {activeThread.participant1_id === currentUserId
                                            ? activeThread.participant2?.name || 'User'
                                            : activeThread.participant1?.name || 'User'}
                                    </h2>
                                    <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                                        <span className="text-[9px] sm:text-[10px] font-black text-[#40a28f] uppercase tracking-widest">Active Now</span>
                                        <span className="w-1 h-1 rounded-full bg-gray-300 hidden sm:block" />
                                        <span className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-widest hidden sm:block">Verified User</span>
                                    </div>
                                </div>
                            </div>

                            {activeThread.property && (
                                <div className="hidden lg:flex items-center gap-3 sm:gap-4 px-3 sm:px-5 py-2 sm:py-2.5 bg-gray-50/50 hover:bg-gray-50 rounded-[16px] sm:rounded-[20px] border border-gray-100 transition-colors group cursor-pointer flex-shrink-0">
                                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
                                        <img src={activeThread.property.imageUrl} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                    </div>
                                    <div className="text-left min-w-0">
                                        <p className="text-[9px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Inquiry for</p>
                                        <p className="text-xs sm:text-sm font-black text-gray-900 line-clamp-1 group-hover:text-[#40a28f] transition-colors">{activeThread.property.title}</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Chat Messages */}
                        <div 
                            ref={messagesContainerRef}
                            onScroll={handleScroll}
                            className="flex-grow overflow-y-auto p-4 sm:p-6 space-y-6 sm:space-y-8 bg-[#fcfdfd]/50"
                        >
                            {hasMoreMessages && (
                                <div className="flex justify-center py-3 sm:py-4">
                                    <Loader2 className="h-5 w-5 sm:h-6 sm:w-6 text-[#40a28f] animate-spin" />
                                </div>
                            )}
                            {loadingMessages && messages.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full gap-3 sm:gap-4">
                                    <Loader2 className="h-8 w-8 sm:h-10 sm:w-10 text-[#40a28f] animate-spin" />
                                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest text-center">Synchronizing Encrypted Chat</p>
                                </div>
                            ) : (
                                <>
                                    <div className="flex justify-center mb-8">
                                        <div className="px-4 py-1.5 bg-white shadow-sm border border-gray-100 rounded-full flex items-center gap-2">
                                            <ShieldCheck className="h-3 w-3 text-emerald-500" />
                                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">End-to-end encrypted</span>
                                        </div>
                                    </div>

                                    {messages.map((msg, idx) => {
                                        const isMine = msg.sender_id === currentUserId;
                                        const showDate = idx === 0 ||
                                            format(new Date(messages[idx - 1].created_at), 'yyyy-MM-dd') !==
                                            format(new Date(msg.created_at), 'yyyy-MM-dd');

                                        if (msg.is_deleted) {
                                            return (
                                                <React.Fragment key={msg.id || idx}>
                                                    {showDate && (
                                                        <div className="flex justify-center my-4 sm:my-6">
                                                            <span className="text-[9px] sm:text-[10px] font-black text-gray-300 uppercase tracking-[0.2em]">{format(new Date(msg.created_at), 'MMMM dd, yyyy')}</span>
                                                        </div>
                                                    )}
                                                    <div className="flex justify-center my-1 sm:my-2">
                                                        <span className="text-xs text-gray-400 italic">This message was deleted</span>
                                                    </div>
                                                </React.Fragment>
                                            );
                                        }

                                        return (
                                            <React.Fragment key={msg.id || idx}>
                                                {showDate && (
                                                    <div className="flex justify-center my-4 sm:my-6">
                                                        <span className="text-[9px] sm:text-[10px] font-black text-gray-300 uppercase tracking-[0.2em]">{format(new Date(msg.created_at), 'MMMM dd, yyyy')}</span>
                                                    </div>
                                                )}
                                                <div className={`flex ${isMine ? 'justify-end' : 'justify-start'} group items-end gap-1 sm:gap-2 animate-in fade-in slide-in-from-bottom-4 duration-500`}>
                                                    {!isMine && (
                                                        <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-md sm:rounded-lg bg-gray-100 flex items-center justify-center shrink-0 mb-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <User className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-gray-400" />
                                                        </div>
                                                    )}
                                                    <div className={`max-w-[80%] xs:max-w-[75%] md:max-w-[65%] flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
                                                        <div className="relative group/message">
                                                            <div className={`px-3 py-2 sm:px-5 sm:py-4 rounded-[20px] sm:rounded-[28px] text-xs sm:text-sm font-medium shadow-sm leading-relaxed transition-all
                                                                ${isMine
                                                                    ? 'bg-[#40a28f] text-white rounded-br-none hover:shadow-xl hover:shadow-[#40a28f]/20'
                                                                    : 'bg-white border border-gray-100 text-gray-800 rounded-bl-none hover:border-[#40a28f]/20'}
                                                            `}>
                                                                {msg.content}
                                                                {msg.is_edited && (
                                                                    <span className="text-xs opacity-60 ml-1 sm:ml-2">(edited)</span>
                                                                )}
                                                            </div>
                                                            {isMine && (
                                                                 <div className="absolute top-1 right-1 opacity-0 group-hover/message:opacity-100 transition-opacity message-menu">
                                                                     <button
                                                                         onClick={() => setShowMessageMenu(showMessageMenu === msg.id ? null : msg.id)}
                                                                         className="p-1 bg-white/20 rounded-full hover:bg-white/40"
                                                                     >
                                                                         <MoreVertical className="h-3 w-3 text-white" />
                                                                     </button>
                                                                     {showMessageMenu === msg.id && (
                                                                         <div className="absolute top-6 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[120px]">
                                                                             <button
                                                                                 onClick={() => handleEditMessage(msg)}
                                                                                 className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                                                                             >
                                                                                 <Edit2 className="h-3 w-3" />
                                                                                 Edit
                                                                             </button>
                                                                             <button
                                                                                 onClick={() => handleDeleteMessage(msg.id)}
                                                                                 className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 text-red-600 flex items-center gap-2"
                                                                             >
                                                                                 <Trash2 className="h-3 w-3" />
                                                                                 Delete
                                                                             </button>
                                                                         </div>
                                                                     )}
                                                                 </div>
                                                             )}
                                                        </div>
                                                        <div className={`flex items-center gap-1 mt-1.5 sm:mt-2 opacity-0 group-hover:opacity-100 transition-all transform translate-y-1 group-hover:translate-y-0`}>
                                                            <Clock className="h-2 w-2 sm:h-2.5 sm:w-2.5 text-gray-300" />
                                                            <span className="text-[8px] sm:text-[9px] font-black text-gray-300 uppercase tracking-widest">
                                                                {format(new Date(msg.created_at), 'HH:mm')}
                                                            </span>
                                                            {isMine && (
                                                                <>
                                                                    {msg.status === 'read' ? (
                                                                        <CheckCheck className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-[#40a28f]" />
                                                                    ) : msg.status === 'delivered' ? (
                                                                        <CheckCheck className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-gray-400" />
                                                                    ) : (
                                                                        <Check className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-gray-300" />
                                                                    )}
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </React.Fragment>
                                        );
                                    })}
                                    <div ref={messagesEndRef} className="h-4" />
                                </>
                            )}
                        </div>

                        {/* Typing Indicator */}
                        {otherUserTyping && (
                            <div className="px-4 sm:px-6 py-1.5 sm:py-2 bg-gray-50/50 border-b border-gray-100">
                                <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-500">
                                    <div className="flex gap-1">
                                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                    </div>
                                    <span className="text-xs">Other user is typing...</span>
                                </div>
                            </div>
                        )}

                        {/* Message Input */}
                        <div className="p-4 sm:p-6 bg-white border-t border-gray-100">
                            <form onSubmit={handleSend} className="max-w-4xl mx-auto relative flex items-center gap-2 sm:gap-4 group">
                                {editingMessage && (
                                    <div className="absolute -top-6 sm:-top-8 left-0 bg-[#40a28f] text-white text-xs px-2 sm:px-3 py-1 rounded-full flex items-center gap-1 sm:gap-2">
                                        <Edit2 className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                                        <span className="hidden sm:inline">Editing message</span>
                                        <span className="sm:hidden">Editing</span>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setEditingMessage(null);
                                                setNewMessage('');
                                            }}
                                            className="ml-1 hover:bg-white/20 rounded-full p-0.5"
                                        >
                                            ×
                                        </button>
                                    </div>
                                )}
                                <div className="flex-grow relative">
                                    <input
                                        type="text"
                                        placeholder="Type your secure message..."
                                        className="w-full pl-4 sm:pl-6 pr-12 sm:pr-16 py-3 sm:py-5 bg-gray-50/50 border border-transparent rounded-[20px] sm:rounded-[24px] text-sm focus:bg-white focus:ring-4 sm:focus:ring-8 focus:ring-[#40a28f]/5 focus:border-[#40a28f]/20 transition-all font-medium placeholder:text-gray-400 outline-none shadow-inner"
                                        value={newMessage}
                                        onChange={(e) => {
                                            setNewMessage(e.target.value);
                                            handleTyping();
                                        }}
                                    />
                                    <div className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                                        <button
                                            type="submit"
                                            disabled={!newMessage.trim()}
                                            className="p-2.5 sm:p-3 bg-[#40a28f] text-white rounded-[14px] sm:rounded-[18px] hover:bg-[#358a7a] hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg sm:shadow-xl shadow-[#40a28f]/20"
                                        >
                                            <Send className="h-4 w-4 sm:h-5 sm:w-5" />
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="flex-grow flex flex-col items-center justify-center p-6 sm:p-12 text-center bg-[#fcfdfd]">
                        <div className="relative mb-8 sm:mb-12">
                            <div className="w-24 h-24 sm:w-32 sm:h-32 bg-white rounded-[36px] sm:rounded-[48px] flex items-center justify-center shadow-2xl shadow-[#40a28f]/10 animate-bounce duration-[3s]">
                                <MessageSquare className="h-10 w-10 sm:h-14 sm:w-14 text-[#40a28f]" />
                            </div>
                            <div className="absolute -top-3 -right-3 sm:-top-4 sm:-right-4 w-8 h-8 sm:w-12 sm:h-12 bg-emerald-50 text-[#40a28f] rounded-[16px] sm:rounded-[20px] flex items-center justify-center shadow-lg animate-pulse">
                                <User className="h-4 w-4 sm:h-6 sm:w-6" />
                            </div>
                        </div>
                        <h2 className="text-2xl sm:text-4xl font-black text-gray-900 mb-2 sm:mb-4 tracking-tight">Your Real Estate Hub</h2>
                        <p className="text-gray-400 max-w-xs sm:max-w-sm font-medium leading-relaxed text-xs sm:text-sm px-4">
                            Connect with verified owners and seekers instantly. Secure, private and fast communication for all your property needs.
                        </p>
                        <div className="mt-8 sm:mt-12 flex items-center gap-4 sm:gap-6">
                            <div className="flex flex-col items-center">
                                <span className="text-lg sm:text-xl font-black text-gray-900">{threads.length}</span>
                                <span className="text-[9px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest">Threads</span>
                            </div>
                            <div className="w-px h-6 sm:h-8 bg-gray-100" />
                            <div className="flex flex-col items-center">
                                <span className="text-lg sm:text-xl font-black text-gray-900">{isConnected ? 'ON' : 'OFF'}</span>
                                <span className="text-[9px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest">Network</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MessagesView;
