import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase';

const SteamIDEnforcer: React.FC = () => {
    const [needsSteamId, setNeedsSteamId] = useState(false);
    const [steamId, setSteamId] = useState('');
    const [userId, setUserId] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const checkProfile = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            setUserId(user.id);

            const { data: profile } = await supabase
                .from('profiles')
                .select('steam_id')
                .eq('id', user.id)
                .single();

            if (profile && !profile.steam_id) {
                setNeedsSteamId(true);
            }
        };

        checkProfile();

        const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
                checkProfile();
            } else if (event === 'SIGNED_OUT') {
                setNeedsSteamId(false);
                setUserId(null);
            }
        });

        return () => {
            authListener.subscription.unsubscribe();
        };
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userId || !steamId.trim()) return;

        setLoading(true);

        try {
            const { error } = await supabase
                .from('profiles')
                .update({ steam_id: steamId.trim(), whitelist_status: 'Pendiente' })
                .eq('id', userId);

            if (error) throw error;

            alert('Steam ID vinculado correctamente. ¡Bienvenido al Valhalla!');
            setNeedsSteamId(false);
        } catch (error: any) {
            alert('Error: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    if (!needsSteamId) return null;

    return (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md">
            <div className="bg-surface-dark border-2 border-red-500 shadow-[0_0_50px_rgba(239,68,68,0.5)] p-8 max-w-md w-full rounded-sm relative overflow-hidden animate-in zoom-in-95 duration-300">

                {/* Warning Icon Background */}
                <span className="material-symbols-outlined absolute -right-4 -bottom-4 text-9xl text-red-500/10 pointer-events-none">
                    warning
                </span>

                <div className="text-center space-y-6 relative z-10">
                    <div className="mx-auto size-16 bg-red-500/10 rounded-full flex items-center justify-center border border-red-500/50 animate-pulse">
                        <span className="material-symbols-outlined text-4xl text-red-500">lock</span>
                    </div>

                    <div className="space-y-2">
                        <h2 className="text-2xl font-display font-black text-white uppercase tracking-widest">
                            Identificación Requerida
                        </h2>
                        <p className="text-gray-400 text-xs leading-relaxed">
                            Los dioses exigen saber quién eres.<br />
                            Vincula tu <strong className="text-white">Steam ID</strong> para continuar tu saga.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="relative">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                                gamepad
                            </span>
                            <input
                                required
                                value={steamId}
                                onChange={(e) => setSteamId(e.target.value)}
                                placeholder="76561198..."
                                className="w-full bg-black/50 border border-white/10 p-3 pl-10 text-white font-mono focus:outline-none focus:border-red-500 transition-colors text-sm rounded-sm"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-red-600 hover:bg-red-700 text-white py-3 font-black uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                'Vinculando...'
                            ) : (
                                <>
                                    Vincular y Entrar
                                    <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
                                </>
                            )}
                        </button>
                    </form>

                    <p className="text-[9px] text-gray-600 uppercase font-bold pt-4">
                        Esta acción es obligatoria para acceder a la web.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SteamIDEnforcer;
