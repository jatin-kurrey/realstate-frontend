import React from 'react';
import { Home, ShieldCheck, Users, Target, Award, MapPin, Mail, Phone, Send, Instagram, Twitter, Facebook, Loader2 } from 'lucide-react';
import Breadcrumbs from '@/components/Breadcrumbs';
import { useSiteConfig } from '@/contexts/SiteConfigContext';

const AboutView: React.FC = () => {
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
        <main className="min-h-screen bg-[#fcfdfd]">
            <div className="max-w-7xl mx-auto px-4 pt-6">
                <Breadcrumbs />
            </div>

            {/* Hero Section */}
            <div className="bg-[#40a28f] py-24 px-4 text-center text-white">
                <div className="max-w-4xl mx-auto space-y-6">
                    <h1 className="text-5xl md:text-6xl font-black uppercase tracking-tighter leading-none">
                        Rethinking Property Connect in RJG
                    </h1>
                    <p className="text-xl text-white/80 font-medium whitespace-pre-wrap">
                        {config.about_text || "RJG Property Connect is Rajnandgaon's premier real estate platform, built to bridge the gap between people and their dream spaces."}
                    </p>
                </div>
            </div>

            {/* Mission Section */}
            <section className="max-w-7xl mx-auto px-4 py-24 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                <div className="space-y-8">
                    <div className="space-y-2">
                        <span className="text-[10px] font-black text-[#40a28f] uppercase tracking-[0.3em]">Our Vision</span>
                        <h2 className="text-4xl font-black text-gray-800 tracking-tight uppercase">Simplifying the search for every citizen.</h2>
                    </div>
                    <p className="text-gray-600 leading-relaxed text-lg">
                        Finding a home or commercial space shouldn't be a maze. We've built a platform that focus on transparency, direct owner-seeker connection, and local expertise specific to Rajnandgaon.
                    </p>
                    <div className="grid grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <div className="h-1 bg-[#40a28f] w-12"></div>
                            <p className="text-3xl font-black text-gray-800 tracking-tight leading-none">100%</p>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Local Focus</p>
                        </div>
                        <div className="space-y-2">
                            <div className="h-1 bg-[#40a28f] w-12"></div>
                            <p className="text-3xl font-black text-gray-800 tracking-tight leading-none">FREE</p>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Direct Connect</p>
                        </div>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-[#e2f2f0] rounded-[40px] aspect-square flex items-center justify-center text-[#40a28f]">
                        <Home className="h-16 w-16" />
                    </div>
                    <div className="bg-gray-50 rounded-[40px] aspect-square flex items-center justify-center text-gray-300 mt-12">
                        <Users className="h-16 w-16" />
                    </div>
                    <div className="bg-gray-50 rounded-[40px] aspect-square flex items-center justify-center text-gray-300 -mt-12">
                        <ShieldCheck className="h-16 w-16" />
                    </div>
                    <div className="bg-[#40a28f] rounded-[40px] aspect-square flex items-center justify-center text-white">
                        <Award className="h-16 w-16" />
                    </div>
                </div>
            </section>

            {/* Values Section */}
            <section className="bg-gray-50 py-24 px-4">
                <div className="max-w-7xl mx-auto space-y-16">
                    <div className="text-center space-y-3">
                        <h2 className="text-4xl font-black text-gray-800 tracking-tight uppercase">Core Principles</h2>
                        <p className="text-xs font-black text-gray-400 uppercase tracking-[0.3em]">The foundation of our platform</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        {[
                            { title: 'Transparency', desc: 'Real photos, real prices, and verified identities.', icon: ShieldCheck },
                            { title: 'Accessibility', desc: 'Simple interface designed for everyone in Rajnandgaon.', icon: Target },
                            { title: 'Community', desc: 'Building trust between neighbors and local businesses.', icon: Users },
                        ].map((v, i) => (
                            <div key={i} className="bg-white p-10 rounded-3xl space-y-6 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
                                <div className="h-14 w-14 bg-[#e2f2f0] rounded-2xl flex items-center justify-center text-[#40a28f]">
                                    <v.icon className="h-7 w-7" />
                                </div>
                                <h3 className="text-xl font-black text-gray-800 uppercase tracking-tight">{v.title}</h3>
                                <p className="text-sm text-gray-500 leading-relaxed font-medium">{v.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Contact Section Integrated */}
            <section className="max-w-7xl mx-auto px-4 py-24">
                <div className="bg-white rounded-[64px] border border-gray-100 shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-2">
                    <div className="bg-[#40a28f] p-12 md:p-20 text-white space-y-8">
                        <div className="space-y-4">
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/60">Contact Us</span>
                            <h2 className="text-5xl font-black uppercase tracking-tighter leading-none">Get In <br />Touch.</h2>
                        </div>
                        <p className="text-lg text-white/80 font-medium">
                            Have questions or need assistance? Our local team in Rajnandgaon is here for you.
                        </p>

                        <div className="space-y-6 pt-6">
                            <div className="flex items-center gap-4">
                                <Mail className="h-5 w-5 text-white/60" />
                                <span className="font-bold">{config.support_email || 'hello@rjgproperty.com'}</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <Phone className="h-5 w-5 text-white/60" />
                                <span className="font-bold">{config.phone_number || '+91 98765 43210'}</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <MapPin className="h-5 w-5 text-white/60" />
                                <span className="font-bold">{config.office_address || 'Rajnandgaon, Chhattisgarh'}</span>
                            </div>
                        </div>

                        <div className="flex gap-4 pt-8">
                            {[Instagram, Twitter, Facebook].map((Icon, idx) => (
                                <button key={idx} className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all">
                                    <Icon className="h-5 w-5" />
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="p-12 md:p-20">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <h3 className="text-2xl font-black text-gray-800 uppercase tracking-tight">Send a Message</h3>
                                <p className="text-xs font-black text-gray-400 uppercase tracking-widest">We'll get back to you shortly</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Name</label>
                                    <input type="text" placeholder="Full Name" className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 px-4 focus:outline-none focus:border-[#40a28f] text-sm font-bold" required />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email</label>
                                    <input type="email" placeholder="Email Address" className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 px-4 focus:outline-none focus:border-[#40a28f] text-sm font-bold" required />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Message</label>
                                <textarea rows={4} placeholder="How can we help?" className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 px-4 focus:outline-none focus:border-[#40a28f] text-sm font-bold resize-none" required></textarea>
                            </div>

                            <button
                                type="submit"
                                disabled={sending}
                                className="w-full bg-[#40a28f] text-white py-4 rounded-xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 shadow-xl shadow-[#40a28f]/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                            >
                                {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                                Send Message
                            </button>
                        </form>
                    </div>
                </div>
            </section>

            {/* Location CTA */}
            <section className="max-w-7xl mx-auto px-4 py-24 pb-32">
                <div className="bg-[#1e293b] rounded-[64px] p-12 md:p-20 text-white flex flex-col md:flex-row items-center justify-between gap-12 relative overflow-hidden">
                    <div className="space-y-6 relative z-10 w-full md:w-2/3">
                        <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tight leading-none text-center md:text-left">
                            Proudly Serving <br />
                            <span className="text-[#40a28f]">Rajnandgaon.</span>
                        </h2>
                        <p className="text-white/40 font-bold uppercase tracking-widest text-center md:text-left max-w-lg">
                            We are local, we are dedicated, and we are here to help you find your place in our city.
                        </p>
                    </div>
                    <div className="relative z-10">
                        <div className="h-40 w-40 bg-[#40a28f] rounded-[40px] flex items-center justify-center rotate-12 shadow-2xl shadow-[#40a28f]/40">
                            <MapPin className="h-20 w-20 text-white -rotate-12" />
                        </div>
                    </div>
                    <div className="absolute top-0 right-0 w-96 h-96 bg-[#40a28f]/5 rounded-full blur-[100px] -mr-48 -mt-48"></div>
                </div>
            </section>
        </main>
    );
};

export default AboutView;
