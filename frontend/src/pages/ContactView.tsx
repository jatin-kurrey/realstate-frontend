
import React from 'react';
import { Mail, Phone, MapPin, Send, Instagram, Twitter, Facebook, Loader2 } from 'lucide-react';
import Breadcrumbs from '@/components/Breadcrumbs';
import { useSiteConfig } from '@/contexts/SiteConfigContext';

const ContactView: React.FC = () => {
    const { config } = useSiteConfig();
    const [sending, setSending] = React.useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSending(true);
        setTimeout(() => {
            setSending(false);
            alert('Your message has been sent successfully!');
        }, 1500);
    };

    return (
        <main className="min-h-screen bg-[#fcfdfd] pb-24">
            <div className="max-w-7xl mx-auto px-8 pt-8">
                <Breadcrumbs />
            </div>
            {/* Split Header */}
            <div className="grid grid-cols-1 lg:grid-cols-2">
                <div className="bg-[#40a28f] py-24 px-8 md:px-20 text-white space-y-8">
                    <div className="space-y-4">
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/60">Connect With Us</span>
                        <h1 className="text-5xl md:text-6xl font-black uppercase tracking-tighter leading-none">
                            Get In <br />Touch.
                        </h1>
                    </div>
                    <p className="text-lg text-white/80 font-medium max-w-md">
                        Have a question about a listing or technical issue? We're here to help you 24/7.
                    </p>

                    <div className="space-y-6 pt-10">
                        <div className="flex items-center gap-6 group">
                            <div className="h-14 w-14 bg-white/10 rounded-2xl flex items-center justify-center group-hover:bg-white group-hover:text-[#40a28f] transition-all duration-300">
                                <Mail className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-white/50">Email Support</p>
                                <p className="text-lg font-bold">{config.support_email || 'hello@rjgproperty.com'}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-6 group">
                            <div className="h-14 w-14 bg-white/10 rounded-2xl flex items-center justify-center group-hover:bg-white group-hover:text-[#40a28f] transition-all duration-300">
                                <Phone className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-white/50">Call Us</p>
                                <p className="text-lg font-bold">{config.phone_number || '+91 98765 43210'}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-6 group">
                            <div className="h-14 w-14 bg-white/10 rounded-2xl flex items-center justify-center group-hover:bg-white group-hover:text-[#40a28f] transition-all duration-300">
                                <MapPin className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-white/50">Office</p>
                                <p className="text-lg font-bold">{config.office_address || 'Rajnandgaon, Chhattisgarh'}</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4 pt-12">
                        {[Instagram, Twitter, Facebook].map((Icon, idx) => (
                            <button key={idx} className="h-12 w-12 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white/20 transition-all">
                                <Icon className="h-5 w-5" />
                            </button>
                        ))}
                    </div>
                </div>

                <div className="py-24 px-8 md:px-20 bg-white">
                    <form onSubmit={handleSubmit} className="max-w-xl space-y-8">
                        <div className="space-y-2">
                            <h2 className="text-3xl font-black text-gray-800 tracking-tight uppercase">Send a Message</h2>
                            <p className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">We'll respond within 4 hours</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Your Name</label>
                                <input type="text" placeholder="Full Name" className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 focus:outline-none focus:border-[#40a28f] focus:ring-4 focus:ring-[#40a28f]/5 transition-all text-sm font-bold text-gray-800" required />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
                                <input type="email" placeholder="example@mail.com" className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 focus:outline-none focus:border-[#40a28f] focus:ring-4 focus:ring-[#40a28f]/5 transition-all text-sm font-bold text-gray-800" required />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Subject</label>
                            <input type="text" placeholder="What is this regarding?" className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 focus:outline-none focus:border-[#40a28f] focus:ring-4 focus:ring-[#40a28f]/5 transition-all text-sm font-bold text-gray-800" required />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Message</label>
                            <textarea rows={6} placeholder="Write your message here..." className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 focus:outline-none focus:border-[#40a28f] focus:ring-4 focus:ring-[#40a28f]/5 transition-all text-sm font-bold text-gray-800 resize-none" required></textarea>
                        </div>

                        <button
                            type="submit"
                            disabled={sending}
                            className="w-full bg-[#40a28f] text-white py-5 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 shadow-2xl shadow-[#40a28f]/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                        >
                            {sending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                            Send Message
                        </button>
                    </form>
                </div>
            </div>
        </main>
    );
};

export default ContactView;
