
import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase';

interface GameEvent {
  id: string;
  title: string;
  description: string;
  start_time: string;
  end_time: string | null;
  type: 'raid' | 'event' | 'maintenance' | 'other' | 'PvP' | 'PvE' | 'VIP' | 'SOLOADMIN';
  image_url?: string;
}

const Events: React.FC = () => {
  const [activeEvents, setActiveEvents] = useState<GameEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [canManage, setCanManage] = useState(false); // Permission state
  const [expandedEvents, setExpandedEvents] = useState<Set<string>>(new Set());

  const toggleExpand = (id: string) => {
    setExpandedEvents(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  useEffect(() => {
    const fetchActiveEvents = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      let role = 'user';
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();
        if (profile) role = profile.role;
      }

      // Set management permissions
      if (role === 'admin' || role === 'moderator') {
        setCanManage(true);
      }

      const now = new Date().toISOString();

      // Base Query: Active Events
      let query = supabase
        .from('events')
        .select('*')
        .lte('start_time', now)
        .or(`end_time.is.null,end_time.gt.${now}`)
        .order('start_time', { ascending: false });

      // Filter based on Role
      if (role !== 'admin' && role !== 'moderator') {
        if (role === 'vip') {
          // VIPs see everything EXCEPT 'SOLOADMIN'
          query = query.neq('type', 'SOLOADMIN');
        } else {
          // Regular Users/Public see everything EXCEPT 'VIP' AND 'SOLOADMIN'
          query = query.neq('type', 'SOLOADMIN').neq('type', 'VIP');
        }
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching active events:', error);
      } else {
        setActiveEvents(data as any);
      }
      setLoading(false);
    };

    fetchActiveEvents();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm('¿ELIMINAR EVENTO ACTIVO? Esta acción es inmediata.')) return;

    const { error } = await supabase.from('events').delete().eq('id', id);
    if (error) {
      alert('Error al borrar: ' + error.message);
    } else {
      // Optimistic update
      setActiveEvents(prev => prev.filter(e => e.id !== id));
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'raid': return 'bg-red-500 text-white';
      case 'event': return 'bg-primary text-black';
      case 'maintenance': return 'bg-yellow-500 text-black';
      case 'PvP': return 'bg-red-600 text-white border border-red-400';
      case 'PvE': return 'bg-green-600 text-white border border-green-400';
      case 'VIP': return 'bg-purple-600 text-white border border-purple-400 font-bold';
      case 'SOLOADMIN': return 'bg-gray-800 text-red-500 border border-red-500 font-black';
      default: return 'bg-gray-500 text-white';
    }
  };

  return (
    <div className="bg-background-dark min-h-screen">
      {/* Header */}
      <div className="relative h-64 flex items-center justify-center bg-cover bg-center" style={{ backgroundImage: 'linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.9)), url("https://picsum.photos/seed/events/1600/400")' }}>
        <h1 className="text-4xl md:text-6xl font-display font-black text-white uppercase tracking-widest text-center px-4">Eventos Activos</h1>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-16 space-y-24">
        {loading ? (
          <div className="text-center text-primary font-mono uppercase">Escaneando el campo de batalla...</div>
        ) : activeEvents.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 font-mono text-xl uppercase">No hay eventos activos en este momento.</p>
            <p className="text-gray-700 text-sm mt-2">Revisa el Calendario para futuras glorias.</p>
          </div>
        ) : (
          activeEvents.map((ev, i) => (
            <div key={ev.id} className={`flex flex-col lg:flex-row gap-12 items-center ${i % 2 !== 0 ? 'lg:flex-row-reverse' : ''}`}>
              <div className="lg:w-1/2 group relative overflow-hidden rounded-sm border border-white/10">
                {ev.image_url ? (
                  <img src={ev.image_url} alt={ev.title} className="w-full aspect-video object-cover transition-transform duration-700 group-hover:scale-110" />
                ) : (
                  <div className="w-full aspect-video bg-black/50 flex items-center justify-center">
                    <span className="text-gray-700 font-black uppercase">Sin Imagen</span>
                  </div>
                )}
                <div className={`absolute top-4 left-4 font-black text-[10px] px-3 py-1 uppercase tracking-widest ${getTypeColor(ev.type)}`}>{ev.type}</div>
              </div>
              <div className="lg:w-1/2 space-y-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <span className="text-green-500 font-bold uppercase tracking-widest text-xs border border-green-500/30 px-2 py-1 rounded-sm">
                      EN CURSO
                    </span>
                    <h2 className="text-4xl font-display font-black text-white uppercase leading-tight">{ev.title}</h2>
                  </div>

                  {canManage && (
                    <button
                      onClick={() => handleDelete(ev.id)}
                      className="text-gray-500 hover:text-red-500 material-symbols-outlined transition-colors p-2 hover:bg-white/5 rounded-full"
                      title="Eliminar Evento Activo"
                    >
                      delete
                    </button>
                  )}
                </div>
                <div className="text-gray-400 text-lg leading-relaxed whitespace-pre-wrap">
                  {expandedEvents.has(ev.id) ? ev.description : `${ev.description.slice(0, 250)}${ev.description.length > 250 ? '...' : ''}`}
                  {ev.description.length > 250 && (
                    <button
                      onClick={() => toggleExpand(ev.id)}
                      className="ml-2 text-primary font-bold hover:text-white transition-colors text-sm uppercase tracking-wider"
                    >
                      {expandedEvents.has(ev.id) ? ' [Leer menos]' : ' [Leer más]'}
                    </button>
                  )}
                </div>

                {ev.end_time && (
                  <div className="flex items-center gap-4 text-sm text-gray-500 font-bold uppercase">
                    <span className="material-symbols-outlined text-red-500">timer</span>
                    Termina: {new Date(ev.end_time).toLocaleDateString()} {new Date(ev.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Events;
