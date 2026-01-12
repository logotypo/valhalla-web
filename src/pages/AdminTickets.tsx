
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { Link, useNavigate } from 'react-router-dom';

const AdminTickets: React.FC = () => {
    const [tickets, setTickets] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        checkAdmin();
        fetchTickets();

        // Real-time listener for new tickets
        const channel = supabase
            .channel('admin-tickets')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'tickets' },
                () => fetchTickets()
            )
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, []);

    const checkAdmin = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) { navigate('/'); return; }
        // Role check logic ideally handled by ProtectedRoute, but double check doesn't hurt or assume context
    };

    const fetchTickets = async () => {
        const { data } = await supabase
            .from('tickets')
            .select('*, profiles(warrior_name)')
            .order('created_at', { ascending: false });

        if (data) setTickets(data);
        setLoading(false);
    };

    if (loading) return <div className="p-10 text-center text-white">Cargando bandeja de entrada...</div>;

    return (
        <div className="min-h-screen bg-[#0a0a0a] pt-24 pb-12 px-4">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-3xl font-display font-black text-white uppercase tracking-wider mb-8 flex items-center gap-3">
                    <span className="material-symbols-outlined text-red-500 text-4xl">admin_panel_settings</span>
                    Bandeja de Tickets
                </h1>

                <div className="bg-[#111] border border-white/5 rounded-sm overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-white/5 text-gray-400 text-[10px] uppercase font-black tracking-widest">
                            <tr>
                                <th className="p-4">Estado</th>
                                <th className="p-4">Asunto</th>
                                <th className="p-4">Usuario</th>
                                <th className="p-4">Fecha</th>
                                <th className="p-4">Acción</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {tickets.length === 0 ? (
                                <tr><td colSpan={5} className="p-8 text-center text-gray-500">No hay tickets pendientes.</td></tr>
                            ) : (
                                tickets.map(ticket => (
                                    <tr key={ticket.id} className="hover:bg-white/5 transition-colors">
                                        <td className="p-4">
                                            <span className={`inline-block px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-sm ${ticket.status === 'open' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-gray-800 text-gray-400'}`}>
                                                {ticket.status}
                                            </span>
                                        </td>
                                        <td className="p-4 text-white font-bold">{ticket.subject}</td>
                                        <td className="p-4 text-gray-300 text-sm font-mono">{ticket.profiles?.warrior_name || 'Anon'}</td>
                                        <td className="p-4 text-gray-500 text-xs">{new Date(ticket.created_at).toLocaleString()}</td>
                                        <td className="p-4">
                                            <Link
                                                to={`/tickets/${ticket.id}`}
                                                className="text-primary hover:text-white text-xs font-black uppercase tracking-widest border border-primary/20 hover:bg-primary hover:text-black px-3 py-1 transition-all"
                                            >
                                                Ver / Chat
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminTickets;
