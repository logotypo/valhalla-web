import React, { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { supabase } from '../supabase';

interface AdminRouteProps {
    children?: React.ReactNode;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
    const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAdmin = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                setIsAdmin(false);
                setLoading(false);
                return;
            }

            const { data: profile } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', session.user.id)
                .single();

            if (profile && (profile.role === 'admin' || profile.role === 'moderator')) {
                setIsAdmin(true);
            } else {
                setIsAdmin(false);
            }
            setLoading(false);
        };

        checkAdmin();
    }, []);

    if (loading) {
        return <div className="h-screen flex items-center justify-center text-white">Comprobando permisos...</div>;
    }

    if (!isAdmin) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center text-white bg-black">
                <h1 className="text-3xl font-bold text-red-500 mb-4">Acceso Denegado</h1>
                <p className="mb-2">No tienes permisos para ver esta página.</p>
                <div className="text-gray-500 text-sm mt-2">
                    Si crees que esto es un error, contacta con un administrador en Discord.
                </div>
                <button
                    className="mt-6 px-4 py-2 bg-primary text-black font-bold rounded hover:bg-yellow-400 transition-colors"
                    onClick={() => window.location.href = '/'}
                >
                    Volver al Inicio
                </button>
            </div>
        );
    }

    return children ? <>{children}</> : <Outlet />;
};

export default AdminRoute;
