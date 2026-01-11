import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { useNavigate } from 'react-router-dom';

interface Claim {
    id: string;
    user_id: string;
    kit_name: string;
    status: string;
    created_at: string;
    profiles: {
        warrior_name: string;
        steam_id: string;
    };
}

const KitClaims: React.FC = () => {
    const [claims, setClaims] = useState<Claim[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchClaims = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                navigate('/join');
                return;
            }

            // Check role
            const { data: profile } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', user.id)
                .single();

            if (profile?.role !== 'admin' && profile?.role !== 'moderator') {
                navigate('/');
                return;
            }

            const { data, error } = await supabase
                .from('kit_claims')
                .select(`
          *,
          profiles (
            warrior_name,
            steam_id
          )
        `)
                .eq('status', 'pending')
                .order('created_at', { ascending: true });

            if (error) console.error(error);
            if (data) setClaims(data);
            setLoading(false);
        };

        fetchClaims();
    }, [navigate]);

    const handleDeliver = async (claimId: string) => {
        if (!confirm('¿Confirmas que has entregado este kit?')) return;

        const { error } = await supabase
            .from('kit_claims')
            .update({ status: 'delivered' })
            .eq('id', claimId);

        if (error) {
            alert('Error: ' + error.message);
        } else {
            setClaims(claims.filter(c => c.id !== claimId));
        }
    };

    if (loading) return <div className="p-10 text-white">Cargando...</div>;

    return (
        <div className="min-h-screen bg-background-dark py-24 px-4">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-4xl font-display font-black text-white uppercase tracking-widest mb-8 flex items-center gap-4">
                    <span className="material-symbols-outlined text-green-500 text-4xl">inventory_2</span>
                    Pedimentos de Kits (KitDonato)
                </h1>

                <div className="bg-surface-dark border border-white/10 rounded-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-gray-400">
                            <thead className="bg-black/40 text-xs uppercase font-black tracking-widest text-primary">
                                <tr>
                                    <th className="px-6 py-4">Guerrero</th>
                                    <th className="px-6 py-4">Steam ID</th>
                                    <th className="px-6 py-4">Kit Solicitado</th>
                                    <th className="px-6 py-4">Fecha</th>
                                    <th className="px-6 py-4 text-right">Acción</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {claims.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-8 text-center text-gray-500 italic">
                                            No hay solicitudes pendientes. ¡Los dioses están tranquilos!
                                        </td>
                                    </tr>
                                ) : (
                                    claims.map((claim) => (
                                        <tr key={claim.id} className="hover:bg-white/5 transition-colors">
                                            <td className="px-6 py-4 font-bold text-white">
                                                {claim.profiles?.warrior_name || "Desconocido"}
                                            </td>
                                            <td className="px-6 py-4 font-mono text-xs select-all">
                                                {claim.profiles?.steam_id || "N/A"}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="inline-block px-3 py-1 bg-primary/10 text-primary border border-primary/20 rounded-sm font-black text-[10px] uppercase">
                                                    {claim.kit_name}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                {new Date(claim.created_at).toLocaleDateString()} {new Date(claim.created_at).toLocaleTimeString()}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => handleDeliver(claim.id)}
                                                    className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-sm font-black uppercase text-[10px] tracking-widest transition-all shadow-[0_0_15px_rgba(34,197,94,0.3)] hover:shadow-[0_0_25px_rgba(34,197,94,0.5)]"
                                                >
                                                    ENTREGADO
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default KitClaims;
