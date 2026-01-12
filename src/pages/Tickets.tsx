
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { Link, useNavigate } from 'react-router-dom';

interface Ticket {
    id: string;
    subject: string;
    status: string;
    created_at: string;
}

const Tickets: React.FC = () => {
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);

    // Form State
    const [subject, setSubject] = useState('');
    const [description, setDescription] = useState('');
    const [creating, setCreating] = useState(false);

    const [user, setUser] = useState<any>(null);

    const navigate = useNavigate();

    useEffect(() => {
        checkUser();
    }, []);

    const checkUser = async () => {
        // Reliable check
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);

        if (user) {
            fetchTickets(user.id);
        } else {
            setLoading(false);
        }
    };

    const fetchTickets = async (userId: string) => {
        const { data, error } = await supabase
            .from('tickets')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (data) setTickets(data);
        setLoading(false);
    };

    const handleCreateClick = () => {
        if (!user) {
            navigate('/join');
            return;
        }
        setShowCreate(true);
    };

    const createTicket = async (e: React.FormEvent) => {
        e.preventDefault();
        setCreating(true);

        if (!user) return;

        // 1. Create Ticket
        const { data: ticket, error } = await supabase
            .from('tickets')
            .insert({
                user_id: user.id,
                subject,
                description,
                status: 'open'
            })
            .select()
            .single();

        if (error) {
            alert('Error creando ticket: ' + error.message);
            setCreating(false);
            return;
        }

        // 2. Insert initial message if description exists (optional, but good for chat flow)
        if (description && ticket) {
            await supabase.from('ticket_messages').insert({
                ticket_id: ticket.id,
                sender_id: user.id,
                content: description
            });
        }

        // Redirect to Detail for adding attachments or chatting
        navigate(`/tickets/${ticket.id}`);
    };

    if (loading) return <div className="p-10 text-center text-white">Cargando tickets...</div>;

    return (
        <div className="min-h-screen bg-[#0a0a0a] pt-24 pb-12 px-4">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-10">
                    <div>
                        <h1 className="text-4xl font-display font-black text-white uppercase tracking-tighter shadow-primary drop-shadow-[0_0_15px_rgba(242,185,13,0.3)]">
                            Soporte / Tickets
                        </h1>
                        <p className="text-gray-400 font-mono text-xs uppercase tracking-widest mt-2">
                            Reporta problemas o dudas. Respuesta en menos de 24h.
                        </p>
                    </div>
                    <button
                        onClick={handleCreateClick}
                        className="bg-primary text-black font-black uppercase tracking-widest text-xs px-6 py-3 hover:bg-white transition-colors"
                    >
                        + Nuevo Ticket
                    </button>
                </div>

                {!user ? (
                    <div className="text-center py-20 border border-white/5 bg-white/5 rounded-sm">
                        <span className="material-symbols-outlined text-4xl text-primary mb-4">lock</span>
                        <p className="text-white font-black uppercase tracking-widest mb-4">Inicia sesión para gestionar tus tickets</p>
                        <Link to="/join" className="inline-block bg-white text-black font-black uppercase tracking-widest text-xs px-8 py-3 hover:bg-primary transition-colors">
                            Entrar / Registrarse
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {tickets.length === 0 ? (
                            <div className="text-center py-20 border border-white/5 bg-white/5 rounded-sm">
                                <span className="material-symbols-outlined text-4xl text-gray-600 mb-4">confirmation_number</span>
                                <p className="text-gray-500 uppercase tracking-widest text-sm">No tienes tickets abiertos</p>
                            </div>
                        ) : (
                            tickets.map(ticket => (
                                <Link to={`/tickets/${ticket.id}`} key={ticket.id} className="block group">
                                    <div className="bg-[#111] border border-white/5 p-6 flex justify-between items-center hover:border-primary/50 transition-all cursor-pointer">
                                        <div>
                                            <div className="flex items-center gap-3 mb-2">
                                                <span className={`w-2 h-2 rounded-full ${ticket.status === 'open' ? 'bg-green-500 shadow-[0_0_10px_#22c55e]' : 'bg-red-500'}`}></span>
                                                <span className="text-primary font-bold uppercase tracking-wider text-sm">#{ticket.id.slice(0, 8)}</span>
                                                <span className="text-gray-500 text-[10px] uppercase font-mono">{new Date(ticket.created_at).toLocaleDateString()}</span>
                                            </div>
                                            <h3 className="text-white font-bold text-lg group-hover:text-primary transition-colors">{ticket.subject}</h3>
                                        </div>
                                        <span className="material-symbols-outlined text-gray-600 group-hover:text-white group-hover:translate-x-1 transition-all">arrow_forward_ios</span>
                                    </div>
                                </Link>
                            ))
                        )}
                    </div>
                )}
            </div>

            {/* Create Modal */}
            {
                showCreate && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                        <div className="bg-[#111] border border-primary/20 w-full max-w-lg p-8 shadow-2xl animate-in zoom-in-95">
                            <h2 className="text-2xl font-display font-black text-white uppercase tracking-wider mb-6">Crear Nuevo Reporte</h2>
                            <form onSubmit={createTicket} className="space-y-6">
                                <div>
                                    <label className="block text-gray-500 text-xs font-black uppercase tracking-widest mb-2">Asunto</label>
                                    <input
                                        value={subject}
                                        onChange={e => setSubject(e.target.value)}
                                        required
                                        className="w-full bg-black/50 border border-white/10 p-3 text-white focus:border-primary outline-none transition-colors"
                                        placeholder="Ej: Bug en el mapa, Reporte de jugador..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-500 text-xs font-black uppercase tracking-widest mb-2">Descripción</label>
                                    <textarea
                                        value={description}
                                        onChange={e => setDescription(e.target.value)}
                                        required
                                        rows={4}
                                        className="w-full bg-black/50 border border-white/10 p-3 text-white focus:border-primary outline-none transition-colors"
                                        placeholder="Describe tu problema. Podrás adjuntar fotos y videos en el siguiente paso."
                                    />
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <button type="button" onClick={() => setShowCreate(false)} className="flex-1 py-3 border border-white/10 text-gray-400 font-black uppercase tracking-widest text-xs hover:bg-white/5">Cancelar</button>
                                    <button type="submit" disabled={creating} className="flex-1 py-3 bg-primary text-black font-black uppercase tracking-widest text-xs hover:bg-white transition-colors">
                                        {creating ? 'Creando...' : 'Crear y Adjuntar'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }
        </div >
    );
};

export default Tickets;
