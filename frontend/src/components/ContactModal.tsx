import React, { useState } from 'react';
import { X, Send, User, MessageSquare, Loader2 } from 'lucide-react';

interface ContactModalProps {
    isOpen: boolean;
    onClose: () => void;
    recipientName: string;
    propertyName: string;
    onSend: (message: string) => Promise<void>;
}

const ContactModal: React.FC<ContactModalProps> = ({ isOpen, onClose, recipientName, propertyName, onSend }) => {
    const [message, setMessage] = useState(`Hi, I'm interested in "${propertyName}". Could you please provide more details?`);
    const [sending, setSending] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Submitting ContactModal form...');
        if (!message.trim() || sending) {
            console.log('Submission blocked:', { isMessageEmpty: !message.trim(), isAlreadySending: sending });
            return;
        }

        setSending(true);
        try {
            console.log('Calling onSend callback...');
            await onSend(message);
            console.log('onSend callback completed, closing modal.');
            onClose();
        } catch (error) {
            console.error('Failed to send message:', error);
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-lg bg-white rounded-[32px] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                <div className="p-8">
                    <div className="flex justify-between items-start mb-8">
                        <div>
                            <h2 className="text-2xl font-black text-gray-800 uppercase tracking-tight">Contact Vendor</h2>
                            <p className="text-sm text-gray-500 font-medium">Send a direct message to start the conversation.</p>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                            <X className="h-6 w-6 text-gray-400" />
                        </button>
                    </div>

                    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100 mb-8">
                        <div className="h-12 w-12 bg-[#40a28f]/10 rounded-full flex items-center justify-center">
                            <User className="h-6 w-6 text-[#40a28f]" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Messaging</p>
                            <p className="text-lg font-bold text-gray-800">{recipientName}</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Your Message</label>
                            <textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                className="w-full h-32 bg-gray-50 border-gray-100 rounded-2xl p-5 text-sm font-medium text-gray-800 focus:ring-2 focus:ring-[#40a28f]/20 focus:border-[#40a28f] outline-none transition-all resize-none"
                                placeholder="Write your message here..."
                                autoFocus
                            />
                            <div className="flex flex-wrap gap-2 mt-2">
                                {[
                                    "Is this still available?",
                                    "What is the final price?",
                                    "Can I schedule a visit?",
                                    "I'm ready to move forward."
                                ].map((suggestion) => (
                                    <button
                                        key={suggestion}
                                        type="button"
                                        onClick={() => setMessage(suggestion)}
                                        className="px-3 py-1.5 bg-white border border-gray-100 rounded-lg text-[10px] font-bold text-gray-500 hover:border-[#40a28f] hover:text-[#40a28f] transition-all"
                                    >
                                        {suggestion}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={!message.trim() || sending}
                            className="w-full py-4 bg-[#40a28f] hover:bg-[#358a7a] text-white rounded-2xl font-black uppercase tracking-widest text-[11px] flex items-center justify-center gap-3 transition-all shadow-xl shadow-[#40a28f]/20 disabled:opacity-50 disabled:cursor-not-allowed group"
                        >
                            {sending ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                <Send className="h-4 w-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                            )}
                            {sending ? 'Sending...' : 'Send Message'}
                        </button>
                    </form>
                </div>

                <div className="p-6 bg-gray-50 border-t border-gray-100 flex items-center justify-center gap-2">
                    <MessageSquare className="h-4 w-4 text-gray-400" />
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Your conversation will be secure and private.</p>
                </div>
            </div>
        </div>
    );
};

export default ContactModal;
