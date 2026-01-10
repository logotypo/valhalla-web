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
  created_by: string;
}

const Future: React.FC = () => {
  const [events, setEvents] = useState<GameEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [canManage, setCanManage] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<GameEvent | null>(null);
  const [uploading, setUploading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    start_time: '',
    end_time: '',
    type: 'event',
    image_url: ''
  });

  useEffect(() => {
    fetchEvents();
    checkPermissions();
  }, []);

  const checkPermissions = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();

      if (profile && (profile.role === 'admin' || profile.role === 'moderator')) {
        setCanManage(true);
      }
    }
  };

  const fetchEvents = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    let query = supabase
      .from('events')
      .select('*')
      .order('start_time', { ascending: true });

    // 1. Get User Role
    let role = 'user';
    if (session?.user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();
      if (profile) role = profile.role;
    }

    // 2. Logic for Visibility
    const now = new Date().toISOString();

    if (role === 'admin' || role === 'moderator') {
      // Admins see ALL, but we still might want to visually distinguish published vs draft, handled in render
      // No filter needed on query for them
    } else {
      // Everyone else only sees FUTURE events that are PUBLISHED (start_time > now)
      // Note: The previous logic showed future events.
      // Clarification: "Calendar" shows FUTURE events.
      query = query.gt('start_time', now);

      if (role === 'vip') {
        // VIPs see everything EXCEPT 'SOLOADMIN'
        query = query.neq('type', 'SOLOADMIN');
      } else {
        // Regular Users/Public see everything EXCEPT 'VIP' AND 'SOLOADMIN'
        query = query.neq('type', 'SOLOADMIN').neq('type', 'VIP');
      }
    }

    const { data, error } = await query;

    if (error) console.error('Error fetching events:', error);
    if (data) setEvents(data as any);
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Seguro que quieres borrar este evento?')) return;

    const { error } = await supabase.from('events').delete().eq('id', id);
    if (error) {
      alert('Error al borrar: ' + error.message);
    } else {
      fetchEvents();
    }
  };

  const handleEdit = (event: GameEvent) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      description: event.description || '',
      start_time: new Date(event.start_time).toISOString().slice(0, 16), // Format for datetime-local
      end_time: event.end_time ? new Date(event.end_time).toISOString().slice(0, 16) : '',
      type: event.type,
      image_url: event.image_url || ''
    });
    setShowModal(true);
  };

  const handleCreate = () => {
    setEditingEvent(null);
    setFormData({
      title: '',
      description: '',
      start_time: '',
      end_time: '',
      type: 'event',
      image_url: ''
    });
    setShowModal(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    setUploading(true);

    const { error: uploadError } = await supabase.storage
      .from('event-images')
      .upload(filePath, file);

    if (uploadError) {
      alert('Error subiendo imagen: ' + uploadError.message);
      setUploading(false);
      return;
    }

    const { data } = supabase.storage
      .from('event-images')
      .getPublicUrl(filePath);

    setFormData({ ...formData, image_url: data.publicUrl });
    setUploading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const eventData = {
      title: formData.title,
      description: formData.description,
      start_time: new Date(formData.start_time).toISOString(),
      end_time: formData.end_time ? new Date(formData.end_time).toISOString() : null,
      type: formData.type,
      image_url: formData.image_url || null
    };

    if (editingEvent) {
      const { error } = await supabase
        .from('events')
        .update(eventData)
        .eq('id', editingEvent.id);

      if (error) alert('Error: ' + error.message);
    } else {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('events')
        .insert([{ ...eventData, created_by: user.id }]);

      if (error) alert('Error: ' + error.message);
    }

    setShowModal(false);
    fetchEvents();
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
    <div className="bg-background-dark min-h-screen py-24 relative">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16 space-y-6">
          <h1 className="text-5xl md:text-8xl font-display font-black text-white uppercase tracking-tighter">CALENDARIO</h1>
          <p className="text-primary font-bold uppercase tracking-[0.3em] text-sm">Eventos y Glorias Futuras</p>

          {canManage && (
            <button
              onClick={handleCreate}
              className="mt-8 bg-primary text-black font-black uppercase tracking-widest px-8 py-3 rounded-sm hover:bg-yellow-400 transition-colors"
            >
              + Nuevo Evento
            </button>
          )}
        </div>

        {loading ? (
          <div className="text-center text-primary font-mono uppercase">Consultando las runas...</div>
        ) : (
          <div className="relative border-l-2 border-primary/20 ml-4 md:ml-auto md:mr-auto space-y-16 max-w-4xl">
            {events.length === 0 && (
              <div className="pl-12 text-gray-500 font-mono text-xl py-12">
                No hay eventos programados... por ahora.
              </div>
            )}

            {events.map((event) => {
              const now = new Date();
              const start = new Date(event.start_time);
              const end = event.end_time ? new Date(event.end_time) : null;

              const isUpcoming = start > now;
              const isExpired = end && end < now;
              const isActive = !isUpcoming && !isExpired;
              const statusColor = isUpcoming ? 'text-yellow-500 border-yellow-500/50' : isExpired ? 'text-red-500 border-red-500/50' : 'text-green-500 border-green-500/50';
              const statusText = isUpcoming ? 'PROGRAMADO' : isExpired ? 'FINALIZADO' : 'ACTIVO';

              return (
                <div key={event.id} className="relative pl-12 group">
                  {/* Timeline Dot */}
                  <div className={`absolute top-0 left-[-9px] size-4 rounded-full shadow-[0_0_15px_rgba(242,185,13,0.5)] transition-all duration-500 group-hover:scale-125 ${getTypeColor(event.type)}`}></div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <span className="bg-surface-accent border border-primary/40 text-primary font-bold px-3 py-1 text-xs uppercase tracking-widest">
                          {canManage ? new Date(event.start_time).toLocaleDateString() : 'DISPONIBLE'}
                        </span>
                        <span className={`font-bold uppercase text-[10px] tracking-widest px-2 py-1 rounded-sm bg-opacity-20 ${getTypeColor(event.type)}`}>
                          {event.type}
                        </span>
                        {canManage && (
                          <span className={`border px-2 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-sm ${statusColor}`}>
                            {statusText}
                          </span>
                        )}
                      </div>

                      {canManage && (
                        <div className="flex gap-2">
                          <button onClick={() => handleEdit(event)} className="text-gray-500 hover:text-white material-symbols-outlined text-sm">edit</button>
                          <button onClick={() => handleDelete(event.id)} className="text-gray-500 hover:text-red-500 material-symbols-outlined text-sm">delete</button>
                        </div>
                      )}
                    </div>

                    <h2 className="text-3xl font-display font-black text-white uppercase tracking-widest group-hover:text-primary transition-colors duration-300">
                      {event.title}
                    </h2>

                    <div className="bg-surface-dark border border-white/5 p-6 rounded-sm max-w-2xl overflow-hidden">
                      {event.image_url && (
                        <div className="mb-6 rounded-sm overflow-hidden border border-white/10">
                          <img src={event.image_url} alt={event.title} className="w-full h-auto object-cover max-h-80 hover:scale-105 transition-transform duration-700" />
                        </div>
                      )}
                      <p className="text-gray-400 text-sm leading-relaxed whitespace-pre-wrap">
                        {event.description}
                      </p>
                      {canManage && (
                        <p className="mt-4 text-[10px] text-gray-600 uppercase font-bold tracking-wider">
                          {event.end_time ? `Expira: ${new Date(event.end_time).toLocaleDateString()}` : 'Permanente'}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface-dark border border-white/10 p-8 w-full max-w-lg rounded-sm shadow-2xl relative animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-white"
            >
              <span className="material-symbols-outlined">close</span>
            </button>

            <h2 className="text-2xl font-display font-black text-white uppercase tracking-widest mb-8">
              {editingEvent ? 'Editar Evento' : 'Nuevo Evento'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-primary uppercase tracking-widest mb-2">Título</label>
                <input
                  type="text"
                  required
                  className="w-full bg-black/50 border border-white/10 p-3 text-white focus:border-primary focus:outline-none transition-colors rounded-sm"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-primary uppercase tracking-widest mb-2">Fecha Publicación (Inicio)</label>
                  <input
                    type="datetime-local"
                    required
                    className="w-full bg-black/50 border border-white/10 p-3 text-white focus:border-primary focus:outline-none transition-colors rounded-sm text-sm"
                    value={formData.start_time}
                    onChange={e => setFormData({ ...formData, start_time: e.target.value })}
                  />
                  <p className="text-[9px] text-gray-500 mt-1">El evento será visible a partir de esta fecha.</p>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Fecha Retirada (Fin)</label>
                  <input
                    type="datetime-local"
                    className="w-full bg-black/50 border border-white/10 p-3 text-white focus:border-primary focus:outline-none transition-colors rounded-sm text-sm"
                    value={formData.end_time}
                    onChange={e => setFormData({ ...formData, end_time: e.target.value })}
                  />
                  <p className="text-[9px] text-gray-500 mt-1">El evento se ocultará después de esta fecha.</p>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-primary uppercase tracking-widest mb-2">Tipo</label>
                <select
                  className="w-full bg-black/50 border border-white/10 p-3 text-white focus:border-primary focus:outline-none transition-colors rounded-sm"
                  value={formData.type}
                  onChange={e => setFormData({ ...formData, type: e.target.value as any })}
                >
                  <option value="event">Evento</option>
                  <option value="raid">Raid</option>
                  <option value="maintenance">Mantenimiento</option>
                  <option value="PvP">PvP</option>
                  <option value="PvE">PvE</option>
                  <option value="VIP">VIP</option>
                  <option value="SOLOADMIN">SOLOADMIN</option>
                  <option value="other">Otro</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black text-primary uppercase tracking-widest mb-2">Imagen</label>
                <div className="space-y-2">
                  {formData.image_url && (
                    <img src={formData.image_url} alt="Preview" className="h-32 rounded border border-white/20 object-cover" />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploading}
                    className="w-full bg-black/50 border border-white/10 p-3 text-white focus:border-primary focus:outline-none transition-colors rounded-sm text-sm file:mr-4 file:py-2 file:px-4 file:rounded-sm file:border-0 file:text-xs file:font-semibold file:bg-primary file:text-black hover:file:bg-yellow-400"
                  />
                  {uploading && <p className="text-primary text-xs animate-pulse">Subiendo imagen...</p>}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-primary uppercase tracking-widest mb-2">Descripción</label>
                <textarea
                  rows={4}
                  className="w-full bg-black/50 border border-white/10 p-3 text-white focus:border-primary focus:outline-none transition-colors rounded-sm"
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="pt-4 flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-6 py-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="bg-primary text-black px-8 py-2 font-black uppercase tracking-widest rounded-sm hover:bg-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? 'Subiendo...' : (editingEvent ? 'Guardar Cambios' : 'Crear Evento')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Future;
