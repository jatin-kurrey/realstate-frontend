import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { chatService, API_URL } from '../services/api';

export interface Message {
    id: number;
    thread_id: number;
    sender_id: number;
    content: string;
    created_at: string;
    is_read: boolean;
    status: 'sent' | 'delivered' | 'read';
    is_edited: boolean;
    edited_at?: string;
    is_deleted: boolean;
    deleted_at?: string;
    delivered_at?: string;
    read_at?: string;
    reply_to_id?: number;
    reply_to?: Message;
    sender?: { name: string; avatar?: string };
}

interface Thread {
    id: number;
    participant1_id: number;
    participant2_id: number;
    last_message: string;
    updated_at: string;
    participant1: { name: string; id: number };
    participant2: { name: string; id: number };
    property?: { title: string; imageUrl: string };
    unread_count?: number;
    is_typing1?: boolean;
    is_typing2?: boolean;
    last_activity?: string;
}

interface ChatContextType {
    threads: Thread[];
    activeThread: Thread | null;
    messages: Message[];
    setActiveThread: (thread: Thread | null) => void;
    sendMessage: (content: string) => Promise<void>;
    createThread: (targetUserId: number, propertyId?: number, initialMessage?: string) => Promise<any>;
    markThreadRead: (threadId: number) => Promise<void>;
    editMessage: (messageId: number, content: string) => Promise<void>;
    deleteMessage: (messageId: number) => Promise<void>;
    searchMessages: (query: string) => Promise<Message[]>;
    updateTypingStatus: (isTyping: boolean) => Promise<void>;
    isConnected: boolean;
    refreshThreads: () => Promise<void>;
    loadingMessages: boolean;
    totalUnreadCount: number;
    isTyping: boolean;
    otherUserTyping: boolean;
    loadMoreMessages: () => Promise<void>;
    hasMoreMessages: boolean;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [threads, setThreads] = useState<Thread[]>([]);
    const [activeThread, setActiveThread] = useState<Thread | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [isConnected, setIsConnected] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [otherUserTyping, setOtherUserTyping] = useState(false);
    const [hasMoreMessages, setHasMoreMessages] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const ws = useRef<WebSocket | null>(null);
    const activeThreadRef = useRef<Thread | null>(null);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        activeThreadRef.current = activeThread;
    }, [activeThread]);

    const fetchThreads = useCallback(async (retryCount = 0) => {
        const maxRetries = 3;
        const retryDelay = 1000 * Math.pow(2, retryCount); // Exponential backoff
        
        try {
            const data = await chatService.getThreads();
            setThreads(data);
        } catch (err) {
            console.error('Failed to fetch threads', err);
            
            if (retryCount < maxRetries) {
                console.log(`Retrying fetchThreads in ${retryDelay}ms (attempt ${retryCount + 1}/${maxRetries})`);
                setTimeout(() => fetchThreads(retryCount + 1), retryDelay);
            } else {
                // Show user-friendly error notification
                console.error('Max retries reached for fetchThreads');
            }
        }
    }, []);

    const [loadingMessages, setLoadingMessages] = useState(false);

    const fetchMessages = useCallback(async (threadId: number, silent: boolean = false, page: number = 1, retryCount = 0) => {
        const maxRetries = 3;
        const retryDelay = 1000 * Math.pow(2, retryCount); // Exponential backoff
        
        if (!silent) setLoadingMessages(true);
        try {
            console.log('Fetching messages for thread:', threadId, 'page:', page);
            const response = await chatService.getThreadMessages(threadId, page);
            
            if (page === 1) {
                setMessages(response.messages);
            } else {
                setMessages(prev => [...response.messages.reverse(), ...prev]);
            }
            
            setHasMoreMessages(page < response.pagination.pages);
            setCurrentPage(page);
        } catch (err) {
            console.error('Failed to fetch messages', err);
            
            if (retryCount < maxRetries) {
                console.log(`Retrying fetchMessages in ${retryDelay}ms (attempt ${retryCount + 1}/${maxRetries})`);
                setTimeout(() => fetchMessages(threadId, silent, page, retryCount + 1), retryDelay);
            } else {
                // Show user-friendly error notification
                console.error('Max retries reached for fetchMessages');
            }
        } finally {
            if (!silent) setLoadingMessages(false);
        }
    }, []);

    // Watch for active thread changes and fetch messages
    useEffect(() => {
        if (activeThread) {
            // Reset pagination when changing threads
            setCurrentPage(1);
            setHasMoreMessages(false);
            
            // Check if we already have messages for this thread to avoid double-loading or showing blank
            const hasInitialMessage = messages.length > 0 && messages[0].thread_id === activeThread.id;

            if (hasInitialMessage) {
                // Background refresh if we already have data
                fetchMessages(activeThread.id, true);
            } else {
                // Clear and full load for new thread selection
                setMessages([]);
                fetchMessages(activeThread.id);
            }
        }
    }, [activeThread?.id]);

    const handleNewMessage = (data: any, currentUserId: number) => {
        const { thread, message } = data;

        // Play notification sound if message is not from me
        if (message.sender_id !== currentUserId) {
            const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3');
            audio.play().catch(() => { });
        }

        // Update threads list
        setThreads(prev => {
            const filtered = prev.filter(t => t.id !== thread.id);
            const isNotActive = activeThreadRef.current?.id !== thread.id;
            const updatedThread = {
                ...thread,
                unread_count: isNotActive ? (thread.unread_count || 0) + 1 : 0
            };
            return [updatedThread, ...filtered];
        });

        // Update active thread messages and metadata if applicable
        const currentActive = activeThreadRef.current;
        if (currentActive && currentActive.id === thread.id) {
            setMessages(prev => {
                if (prev.some(m => m.id === message.id)) return prev;
                return [...prev, message];
            });

            // Update activeThread state metadata
            setActiveThread(prev => prev ? { ...prev, last_message: thread.last_message, updated_at: thread.updated_at } : null);

            // Mark as read immediately on backend if active
            chatService.markAsRead(thread.id);
        }
    };

    const handleMessageStatusUpdate = (data: any) => {
        const { message_id, status } = data;
        setMessages(prev => prev.map(msg => 
            msg.id === message_id ? { ...msg, status } : msg
        ));
    };

    const handleMessageEdited = (data: any) => {
        const { message_id, content, edited_at } = data;
        setMessages(prev => prev.map(msg => 
            msg.id === message_id ? { 
                ...msg, 
                content, 
                is_edited: true, 
                edited_at 
            } : msg
        ));
    };

    const handleMessageDeleted = (data: any) => {
        const { message_id } = data;
        setMessages(prev => prev.filter(msg => msg.id !== message_id));
    };

    const handleTypingStatus = (data: any, currentUserId: number) => {
        const { thread_id, user_id, is_typing } = data;
        if (thread_id === activeThreadRef.current?.id && user_id !== currentUserId) {
            setOtherUserTyping(is_typing);
        }
    };

    useEffect(() => {
        let reconnectTimeout: NodeJS.Timeout;
        let reconnectAttempts = 0;
        const maxReconnectAttempts = 5;
        const baseReconnectDelay = 1000;

        const connectWebSocket = () => {
            const currentToken = localStorage.getItem('token');
            if (!currentToken) {
                setIsConnected(false);
                return;
            }

            fetchThreads();

            const wsUrl = API_URL.replace('http', 'ws') + '/ws';
            console.log('Connecting to WS:', wsUrl);
            const socket = new WebSocket(`${wsUrl}?token=${currentToken}`);

            socket.onopen = () => {
                console.log('WS Connected');
                setIsConnected(true);
                reconnectAttempts = 0; // Reset reconnect attempts on successful connection
            };

            socket.onmessage = (event) => {
                const data = JSON.parse(event.data);
                const currentUserId = JSON.parse(localStorage.getItem('user') || '{}').id;

                switch (data.type) {
                    case 'NEW_MESSAGE':
                        handleNewMessage(data, currentUserId);
                        break;
                    case 'MESSAGE_STATUS_UPDATE':
                        handleMessageStatusUpdate(data);
                        break;
                    case 'MESSAGE_EDITED':
                        handleMessageEdited(data);
                        break;
                    case 'MESSAGE_DELETED':
                        handleMessageDeleted(data);
                        break;
                    case 'TYPING_STATUS':
                        handleTypingStatus(data, currentUserId);
                        break;
                }
            };

            socket.onclose = (event) => {
                console.log('WS Disconnected', event.code, event.reason);
                setIsConnected(false);
                
                // Only attempt reconnection if not a normal closure (1000) or authentication failure (1008)
                if (event.code !== 1000 && event.code !== 1008 && reconnectAttempts < maxReconnectAttempts) {
                    const delay = baseReconnectDelay * Math.pow(2, reconnectAttempts); // Exponential backoff
                    reconnectAttempts++;
                    console.log(`Attempting reconnection ${reconnectAttempts}/${maxReconnectAttempts} in ${delay}ms`);
                    
                    reconnectTimeout = setTimeout(() => {
                        connectWebSocket();
                    }, delay);
                }
            };

            socket.onerror = (error) => {
                console.error('WebSocket error:', error);
                setIsConnected(false);
            };

            ws.current = socket;
        };

        connectWebSocket();

        return () => {
            if (reconnectTimeout) {
                clearTimeout(reconnectTimeout);
            }
            if (ws.current) {
                ws.current.close();
            }
        };
    }, [fetchThreads]);

    const markThreadRead = useCallback(async (threadId: number) => {
        try {
            await chatService.markAsRead(threadId);
            setThreads(prev => prev.map(t =>
                t.id === threadId ? { ...t, unread_count: 0 } : t
            ));
        } catch (err) {
            console.error('Failed to mark thread as read', err);
        }
    }, []);

    const sendMessage = async (content: string) => {
        if (!activeThread) return;
        
        // Optimistic update - add message immediately with temporary ID
        const tempMessage: Message = {
            id: Date.now(), // Temporary ID
            thread_id: activeThread.id,
            sender_id: JSON.parse(localStorage.getItem('user') || '{}').id,
            content,
            created_at: new Date().toISOString(),
            is_read: false,
            status: 'sent',
            is_edited: false,
            is_deleted: false
        };

        // Add message immediately for better UX
        setMessages(prev => [...prev, tempMessage]);

        try {
            const newMessage = await chatService.sendMessage(activeThread.id, content);
            
            // Replace temporary message with real one
            setMessages(prev => prev.map(msg => 
                msg.id === tempMessage.id ? newMessage : msg
            ));

            // Update last message in threads list
            setThreads(prev => {
                const filtered = prev.filter(t => t.id !== activeThread.id);
                return [{ ...activeThread, last_message: content, updated_at: new Date().toISOString() }, ...filtered];
            });
        } catch (err) {
            console.error('Failed to send message', err);
            
            // Remove the temporary message on failure
            setMessages(prev => prev.filter(msg => msg.id !== tempMessage.id));
            
            // Show error notification (you could add a toast notification here)
            alert('Failed to send message. Please try again.');
            
            // Re-throw to allow component to handle the error
            throw err;
        }
    };

    const createThread = async (targetUserId: number, propertyId?: number, initialMessage: string = "Hi, I'm interested in this property.") => {
        try {
            console.log('Initiating thread creation:', { targetUserId, propertyId });
            const data = await chatService.createThread({ target_user_id: targetUserId, property_id: propertyId, message: initialMessage });
            const newThread = data.thread;
            const firstMessage = data.message;

            console.log('Thread created successfully:', newThread);

            // Update local state instantly
            setThreads(prev => [newThread, ...prev.filter(t => t.id !== newThread.id)]);
            setMessages([firstMessage]); // Pre-populate messages!
            setActiveThread(newThread);

            return newThread;
        } catch (err) {
            console.error('Failed to create thread', err);
            throw err;
        }
    };

    const editMessage = async (messageId: number, content: string) => {
        try {
            const updatedMessage = await chatService.editMessage(messageId, content);
            setMessages(prev => prev.map(msg => 
                msg.id === messageId ? updatedMessage : msg
            ));
        } catch (err) {
            console.error('Failed to edit message', err);
            throw err;
        }
    };

    const deleteMessage = async (messageId: number) => {
        try {
            await chatService.deleteMessage(messageId);
            setMessages(prev => prev.filter(msg => msg.id !== messageId));
        } catch (err) {
            console.error('Failed to delete message', err);
            throw err;
        }
    };

    const searchMessages = async (query: string): Promise<Message[]> => {
        try {
            const results = await chatService.searchMessages(query);
            return results;
        } catch (err) {
            console.error('Failed to search messages', err);
            return [];
        }
    };

    const updateTypingStatus = async (isTyping: boolean) => {
        if (!activeThread) return;
        
        try {
            await chatService.updateTypingStatus(activeThread.id, isTyping);
            setIsTyping(isTyping);
        } catch (err) {
            console.error('Failed to update typing status', err);
        }
    };

    const loadMoreMessages = async () => {
        if (!activeThread || !hasMoreMessages || loadingMessages) return;
        
        const nextPage = currentPage + 1;
        await fetchMessages(activeThread.id, true, nextPage);
    };

    // Typing indicator debouncing
    useEffect(() => {
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        if (isTyping) {
            typingTimeoutRef.current = setTimeout(() => {
                setIsTyping(false);
                if (activeThread) {
                    updateTypingStatus(false);
                }
            }, 2000);
        }

        return () => {
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
        };
    }, [isTyping, activeThread]);

    const totalUnreadCount = threads.reduce((acc, thread) => acc + (thread.unread_count || 0), 0);

    return (
        <ChatContext.Provider value={{
            threads,
            activeThread,
            messages,
            setActiveThread,
            sendMessage,
            createThread,
            markThreadRead,
            editMessage,
            deleteMessage,
            searchMessages,
            updateTypingStatus,
            isConnected,
            refreshThreads: fetchThreads,
            loadingMessages,
            totalUnreadCount,
            isTyping,
            otherUserTyping,
            loadMoreMessages,
            hasMoreMessages
        }}>
            {children}
        </ChatContext.Provider>
    );
};

export const useChat = () => {
    const context = useContext(ChatContext);
    if (context === undefined) {
        throw new Error('useChat must be used within a ChatProvider');
    }
    return context;
};
