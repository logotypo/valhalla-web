
import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase';

interface Profile {
    id: string;
    warrior_name: string;
    kills: number;
    deaths: number;
}

const Leaderboard: React.FC = () => {
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            const { data } = await supabase
                .from('leaderboard_monthly_view')
                .select('*')
                .order('kills', { ascending: false }) // Ordina per kills, decrescente
                .limit(50); // Mostra i top 50, per esempio

            if (data) {
                setProfiles(data);
            }
            setLoading(false);
        };

        fetchLeaderboard();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-background-dark flex items-center justify-center">
                <div className="text-center space-y-4">
                    <div className="size-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="text-primary font-black uppercase tracking-widest text-xs animate-pulse">Cargando Clasificación...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background-dark py-24 relative overflow-hidden">
            {/* Background Effect */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent opacity-50"></div>
            </div>

            <div className="max-w-6xl mx-auto px-4 relative z-10">
                <div className="text-center mb-16">
                    <h1 className="text-5xl md:text-7xl font-display font-black text-white uppercase tracking-tighter mb-4 shadow-primary drop-shadow-[0_0_15px_rgba(242,185,13,0.3)]">
                        Salón de la Fama
                    </h1>
                    <p className="text-primary font-black uppercase tracking-widest text-xs md:text-sm border-y border-white/10 py-2 inline-block px-8">
                        Los guerreros más letales de Valhalla
                    </p>
                </div>

                <div className="bg-surface-dark/90 backdrop-blur-md border border-white/10 rounded-sm overflow-hidden shadow-2xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-black/40 border-b border-white/10">
                                    <th className="p-4 text-[10px] font-black uppercase tracking-widest text-primary text-center w-20">Rank</th>
                                    <th className="p-4 text-[10px] font-black uppercase tracking-widest text-gray-500">Nombre</th>
                                    <th className="p-4 text-[10px] font-black uppercase tracking-widest text-red-500 text-center w-24">Kills</th>
                                    <th className="p-4 text-[10px] font-black uppercase tracking-widest text-gray-500 text-center w-24">Deaths</th>
                                    <th className="p-4 text-[10px] font-black uppercase tracking-widest text-primary text-center w-24">K/D</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {profiles.map((profile, index) => {
                                    const kd = profile.deaths > 0 ? (profile.kills / profile.deaths).toFixed(2) : profile.kills.toFixed(2);
                                    const rankStyle = index === 0 ? 'text-primary drop-shadow-[0_0_5px_rgba(242,185,13,0.8)]' :
                                        index === 1 ? 'text-gray-300' :
                                            index === 2 ? 'text-amber-700' : 'text-gray-600';

                                    return (
                                        <tr key={profile.steam_id || index} className="hover:bg-white/5 transition-colors group">
                                            <td className="p-4 text-center">
                                                <span className={`font-display font-black text-2xl ${rankStyle}`}>
                                                    #{index + 1}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <span className="font-bold text-white text-sm group-hover:text-primary transition-colors uppercase tracking-wider">
                                                    {profile.warrior_name || 'Guerrero Desconocido'}
                                                </span>
                                            </td>
                                            <td className="p-4 text-center">
                                                <span className="font-mono font-bold text-red-400 text-lg">{profile.kills}</span>
                                            </td>
                                            <td className="p-4 text-center">
                                                <span className="font-mono text-gray-500">{profile.deaths}</span>
                                            </td>
                                            <td className="p-4 text-center">
                                                <span className={`font-mono font-bold text-sm ${parseFloat(kd) >= 1 ? 'text-green-500' : 'text-red-500'}`}>
                                                    {kd}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                    {profiles.length === 0 && (
                        <div className="p-12 text-center text-gray-500 text-sm uppercase tracking-widest font-bold">
                            Aún no hay guerreros en la lista.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Leaderboard;
