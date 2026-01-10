import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import { useNavigate } from 'react-router-dom';

interface UserData {
    id: string;
    warrior_name: string;
    full_name: string;
    email: string;
    steam_id: string;
    role: string;
    donations: {
        package_name: string;
        amount: number;
        created_at: string;
    }[];
}

const AdminDashboard: React.FC = () => {
    const [users, setUsers] = useState<UserData[]>([]);
    const [uploads, setUploads] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentUserRole, setCurrentUserRole] = useState<string>('');
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    // Helper to update role
    const handleRoleChange = async (userId: string, newRole: string) => {
        const confirmed = window.confirm(`¿Estás seguro de cambiar el rol de este usuario a ${newRole}?`);
        if (!confirmed) return;

        const { error } = await supabase
            .from('profiles')
            .update({ role: newRole })
            .eq('id', userId);

        if (error) {
            alert('Error al actualizar rol: ' + error.message);
        } else {
            // Update local state
            setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
            alert('Rol actualizado correctamente.');
        }
    };

    const handleContentStatus = async (uploadId: string, status: 'approved' | 'rejected') => {
        const { error } = await supabase
            .from('community_uploads')
            .update({ status })
            .eq('id', uploadId);

        if (error) {
            alert('Error al actualizar: ' + error.message);
        } else {
            setUploads(prev => prev.map(u => u.id === uploadId ? { ...u, status } : u));
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            // 1. Check Admin Access
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                navigate('/join');
                return;
            }

            const { data: currentUserProfile } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', user.id)
                .single();

            const role = currentUserProfile?.role;

            if (role !== 'admin' && role !== 'moderator') {
                alert("¡Alto ahí! Solo los Jarls pueden entrar aquí.");
                navigate('/');
                return;
            }

            setCurrentUserRole(role);

            // 2. Fetch Users and Donations
            // Note: We perform two queries and merge manually because deep joining on auth.users is tricky from client
            // or requires complex views. For this prototype, we query profiles and donations separately.

            const { data: profiles, error: profilesError } = await supabase
                .from('profiles')
                .select('*');

            if (profilesError) {
                console.error('Error fetching profiles', profilesError);
            }

            const { data: donations, error: donationsError } = await supabase
                .from('donations')
                .select('*')
                .order('created_at', { ascending: false });

            if (donationsError) {
                console.error('Error fetching donations', donationsError);
            }


            // Merge data
            if (profiles) {
                const mergedData = profiles.map(profile => {
                    const userDonations = donations?.filter(d => d.user_id === profile.id) || [];
                    return {
                        ...profile,
                        email: 'Privado', // auth.users email is not accessible directly via public table join typically
                        donations: userDonations
                    };
                });
                setUsers(mergedData);
            }

            // 3. Fetch Pending/All Uploads
            const { data: uploadsData } = await supabase
                .from('community_uploads')
                .select('*, profiles(warrior_name)')
                .order('created_at', { ascending: false });

            if (uploadsData) setUploads(uploadsData);

            setLoading(false);
        };

        fetchData();
    }, [navigate]);

    if (loading) {
        return (
            <div className="min-h-screen bg-background-dark flex items-center justify-center text-primary font-black uppercase tracking-widest">
                Consultando las runas...
            </div>
        );
    }



    // ... (existing code)

    return (
        <div className="min-h-screen bg-background-dark py-24 px-4">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-4xl font-display font-black text-white uppercase tracking-widest mb-12 flex items-center gap-4">
                    <span className="material-symbols-outlined text-4xl text-primary">admin_panel_settings</span>
                    Panel de Administración
                </h1>

                {/* Search Bar */}
                <div className="mb-6">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Buscar por Guerrero o Steam ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-black/40 border border-white/10 p-4 text-white focus:outline-none focus:border-primary transition-colors text-sm pl-12"
                        />
                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">search</span>
                    </div>
                </div>

                <div className="bg-surface-dark border border-white/10 rounded-sm overflow-hidden shadow-2xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-black/40 border-b border-primary/20">
                                <tr>
                                    <th className="p-6 text-[10px] font-black text-primary uppercase tracking-widest">Usuario / Guerrero</th>
                                    <th className="p-6 text-[10px] font-black text-primary uppercase tracking-widest">Steam ID</th>
                                    <th className="p-6 text-[10px] font-black text-primary uppercase tracking-widest">Rol</th>
                                    <th className="p-6 text-[10px] font-black text-primary uppercase tracking-widest">Última Donación</th>
                                    <th className="p-6 text-[10px] font-black text-primary uppercase tracking-widest text-right">Total Donado</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {users.filter(user => {
                                    const term = searchTerm.toLowerCase();
                                    return (
                                        (user.warrior_name?.toLowerCase().includes(term)) ||
                                        (user.full_name?.toLowerCase().includes(term)) ||
                                        (user.steam_id?.toLowerCase().includes(term))
                                    );
                                }).map((user) => {
                                    const lastDonation = user.donations[0]; // Already ordered by time desc
                                    const totalDonated = user.donations.reduce((sum, d) => sum + Number(d.amount), 0);
                                    const isEditable = currentUserRole === 'admin';

                                    // Calculate Time Left
                                    let timeLeftString = "—";
                                    let isExpired = false;

                                    if (lastDonation) {
                                        const donationDate = new Date(lastDonation.created_at);
                                        const expirationDate = new Date(donationDate.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days
                                        const now = new Date();
                                        const diff = expirationDate.getTime() - now.getTime();

                                        if (diff <= 0) {
                                            timeLeftString = "Expirado";
                                            isExpired = true;
                                        } else {
                                            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
                                            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                                            timeLeftString = `${days}d ${hours}h`;
                                        }
                                    }

                                    return (
                                        <tr key={user.id} className="hover:bg-white/5 transition-colors">
                                            <td className="p-6">
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-white text-sm">{user.warrior_name || "Sin Nombre"}</span>
                                                    <span className="text-xs text-gray-500">{user.full_name}</span>
                                                </div>
                                            </td>
                                            <td className="p-6 font-mono text-xs text-gray-400">
                                                {user.steam_id || "No registrado"}
                                            </td>
                                            <td className="p-6">
                                                <select
                                                    value={user.role || 'user'}
                                                    disabled={!isEditable}
                                                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                                    className={`px-2 py-1 text-[9px] font-black uppercase tracking-widest border bg-transparent focus:outline-none cursor-pointer ${user.role === 'admin' ? 'text-red-500 border-red-500/20 focus:bg-red-500/10' :
                                                        user.role === 'moderator' ? 'text-blue-500 border-blue-500/20 focus:bg-blue-500/10' :
                                                            user.role === 'vip' ? 'text-yellow-500 border-yellow-500/20 focus:bg-yellow-500/10' :
                                                                'text-gray-500 border-gray-500/20 focus:bg-gray-500/10'
                                                        } ${!isEditable ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                >
                                                    <option value="user" className="bg-surface-dark text-gray-500">User</option>
                                                    <option value="vip" className="bg-surface-dark text-yellow-500">VIP</option>
                                                    <option value="moderator" className="bg-surface-dark text-blue-500">Moderator</option>
                                                    <option value="admin" className="bg-surface-dark text-red-500">Admin</option>
                                                </select>
                                            </td>
                                            <td className="p-6">
                                                {lastDonation ? (
                                                    <div className="flex flex-col">
                                                        <span className="text-primary font-bold text-xs uppercase">{lastDonation.package_name}</span>
                                                        <span className="text-[10px] text-gray-500 mb-1">
                                                            {new Date(lastDonation.created_at).toLocaleDateString()}
                                                        </span>
                                                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm w-fit ${isExpired ? 'bg-red-500/20 text-red-500' : 'bg-green-500/20 text-green-500'}`}>
                                                            {isExpired ? 'Expirado' : `Quedan: ${timeLeftString}`}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-600 text-[10px] uppercase">Sin donaciones</span>
                                                )}
                                            </td>
                                            <td className="p-6 text-right font-mono text-green-500 font-bold">
                                                {totalDonated > 0 ? `€${totalDonated.toFixed(2)}` : '-'}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Moderation Section */}
            <h2 className="text-3xl font-display font-black text-white uppercase tracking-widest mt-24 mb-8 flex items-center gap-4">
                <span className="material-symbols-outlined text-4xl text-primary">rate_review</span>
                Moderación de Contenido ({uploads.filter(u => u.status === 'pending').length} Pendientes)
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {uploads.filter(upload => upload.status === 'pending').map((upload) => (
                    <div key={upload.id} className={`bg-surface-dark border p-4 rounded-sm transition-all ${upload.status === 'pending' ? 'border-primary/50 shadow-[0_0_15px_rgba(242,185,13,0.1)]' : 'border-white/5 opacity-75'
                        }`}>
                        <div className="aspect-video bg-black/50 mb-4 overflow-hidden flex items-center justify-center relative group">
                            {upload.type === 'image' ? (
                                <img src={upload.url} alt="content" className="w-full h-full object-cover" />
                            ) : (
                                <video src={upload.url} controls className="w-full h-full object-cover" />
                            )}
                            <div className="absolute top-2 right-2 bg-black/80 px-2 py-1 text-[8px] font-black uppercase text-white rounded-sm">
                                {upload.type}
                            </div>
                        </div>

                        <div className="space-y-2 mb-4">
                            <h3 className="text-white font-bold text-sm truncate">{upload.title}</h3>
                            <p className="text-gray-500 text-[10px] uppercase">
                                Por: <span className="text-primary">{upload.profiles?.warrior_name || 'Desconocido'}</span>
                            </p>
                            <p className="text-gray-600 text-[9px] font-mono">
                                {new Date(upload.created_at).toLocaleDateString()}
                            </p>
                        </div>

                        {upload.status === 'pending' ? (
                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    onClick={() => handleContentStatus(upload.id, 'approved')}
                                    className="bg-green-500/10 text-green-500 border border-green-500/20 py-2 font-black uppercase text-[10px] hover:bg-green-500 hover:text-black transition-colors"
                                >
                                    Aprobar
                                </button>
                                <button
                                    onClick={() => handleContentStatus(upload.id, 'rejected')}
                                    className="bg-red-500/10 text-red-500 border border-red-500/20 py-2 font-black uppercase text-[10px] hover:bg-red-500 hover:text-black transition-colors"
                                >
                                    Rechazar
                                </button>
                            </div>
                        ) : (
                            <div className={`text-center py-2 font-black uppercase text-[10px] border ${upload.status === 'approved' ? 'text-green-500 border-green-500/20' : 'text-red-500 border-red-500/20'
                                }`}>
                                {upload.status === 'approved' ? 'Aprobado' : 'Rechazado'}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AdminDashboard;
