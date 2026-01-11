
import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase';

const Community: React.FC = () => {
  const staff = [
    { name: '[̅𝗟̲̅𝗼̲̅𝗿̲̅𝗱̲̅𝗕̲̅𝗶̲̅𝗿̲̅𝗿̲̅𝗮̲̅𝘀̲̲̅]', role: 'Server Owner', icon: 'crown' },
    { name: '[̅N̲̅a̲̅l̲̅u̲̲̅]', role: 'Head Admin', icon: 'diamond' },
    { name: '[̅𝗦̲̅𝘂̲̅𝗯̲̅𝗮̲̅𝗿̲̅𝘂̲̲̅]', role: 'Moderator', icon: 'visibility' },
    { name: '[̅G̲̅o̲̅b̲̅e̲̅r̲̅n̲̅a̲̅d̲̅o̲̅r̲̲̅]', role: 'Community Lead', icon: 'shield' },
  ];

  const [content, setContent] = useState<any[]>([]);

  useEffect(() => {
    const fetchContent = async () => {
      const { data } = await supabase
        .from('community_uploads')
        .select('*, profiles(warrior_name)')
        .eq('status', 'approved')
        .order('created_at', { ascending: false });
      if (data) setContent(data);
    };
    fetchContent();
  }, []);

  const videos = content.filter(c => c.type === 'video');
  const images = content.filter(c => c.type === 'image');

  return (
    <div className="min-h-screen bg-[#0a0a0a] py-24">
      <div className="max-w-7xl mx-auto px-4">
        {/* Discord CTA */}
        <section className="bg-surface-accent border-2 border-primary/30 p-12 text-center mb-24 relative overflow-hidden rounded-sm">
          <div className="absolute top-0 left-0 w-full h-1 bg-primary"></div>
          <h2 className="text-5xl font-display font-black text-white mb-6 uppercase tracking-widest">EL SALÓN DEL TRONO</h2>
          <p className="text-gray-400 max-w-xl mx-auto mb-10 text-lg">
            Únete a nuestra comunidad de Discord para recibir noticias en tiempo real, soporte técnico y coordinar ataques con tu clan.
          </p>
          <a href="https://discord.gg/v5kJUtwYdw" target="_blank" rel="noreferrer" className="inline-flex items-center gap-4 bg-accent-red hover:bg-red-700 text-white font-black px-12 py-5 rounded-sm uppercase tracking-widest transition-all shadow-2xl shadow-red-900/30">
            <span className="material-symbols-outlined text-2xl">chat</span>
            Entrar al Discord
          </a>
        </section>

        {/* Staff Section */}
        <div className="space-y-16">
          <div className="text-center">
            <h3 className="text-3xl font-display font-bold text-white uppercase tracking-widest">Guardianes del Valhalla</h3>
            <div className="h-1 w-20 bg-primary mx-auto mt-4"></div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {staff.map((s, i) => (
              <div key={i} className="bg-surface-dark p-8 border border-white/5 text-center group hover:border-primary/50 transition-all">
                <div className="size-20 bg-black/50 border border-primary/20 rounded-full mx-auto mb-6 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-4xl">{s.icon}</span>
                </div>
                <h4 className="text-xl font-display font-bold text-white mb-1 uppercase">{s.name}</h4>
                <p className="text-primary text-[10px] font-black uppercase tracking-[0.2em]">{s.role}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Social Feed Placeholder */}
        {/* Dynamic Community Content */}
        {/* Dynamic Community Content */}
        <div className="mt-32 grid grid-cols-1 md:grid-cols-2 gap-12">

          {/* Clips Section */}
          <div className="bg-black/40 border border-white/5 p-8 h-[600px] flex flex-col">
            <div className="flex items-center justify-center gap-4 mb-6 shrink-0">
              <span className="material-symbols-outlined text-4xl text-primary">movie</span>
              <h3 className="text-xl font-display font-bold text-white uppercase tracking-widest text-center">Clips de la Comunidad</h3>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-4">
              {videos.length > 0 ? videos.map((item) => (
                <div key={item.id} className="bg-surface-dark border border-white/5 rounded-sm overflow-hidden group hover:border-primary/50 transition-all shrink-0">
                  <video src={item.url} controls className="w-full aspect-video object-cover bg-black" />
                  <div className="p-3">
                    <h4 className="text-white font-bold text-[10px] uppercase truncate">{item.title}</h4>
                    <p className="text-primary text-[8px] uppercase font-black tracking-widest mt-1">
                      Por: {item.profiles?.warrior_name || 'Anónimo'}
                    </p>
                  </div>
                </div>
              )) : (
                <div className="h-full flex flex-col items-center justify-center text-center">
                  <p className="text-gray-600 font-bold uppercase tracking-widest text-xs">Clips de la Comunidad próximamente</p>
                </div>
              )}
            </div>
          </div>

          {/* Gallery Section */}
          <div className="bg-black/40 border border-white/5 p-8 h-[600px] flex flex-col">
            <div className="flex items-center justify-center gap-4 mb-6 shrink-0">
              <span className="material-symbols-outlined text-4xl text-primary">photo_library</span>
              <h3 className="text-xl font-display font-bold text-white uppercase tracking-widest text-center">Galería de Bases</h3>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 grid grid-cols-2 gap-4 content-start">
              {images.length > 0 ? images.map((item) => (
                <div key={item.id} className="bg-surface-dark border border-white/5 rounded-sm overflow-hidden group hover:border-primary/50 transition-all">
                  <img src={item.url} alt={item.title} className="w-full aspect-square object-cover" />
                  <div className="p-2">
                    <h4 className="text-white font-bold text-[9px] uppercase truncate">{item.title}</h4>
                    <p className="text-primary text-[8px] uppercase font-black tracking-widest mt-1">
                      Por: {item.profiles?.warrior_name || 'Anónimo'}
                    </p>
                  </div>
                </div>
              )) : (
                <div className="col-span-2 h-full flex flex-col items-center justify-center text-center mt-12">
                  <p className="text-gray-600 font-bold uppercase tracking-widest text-xs">Galería de Bases próximamente</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Community;
