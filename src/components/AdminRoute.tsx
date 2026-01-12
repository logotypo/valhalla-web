import React, { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { supabase } from '../supabase';

interface AdminRouteProps {
    children?: React.ReactNode;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
    const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
    const [loading, setLoading] = useState(true);
    const [debugInfo, setDebugInfo] = useState<any>(null);

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
            setDebugInfo({ sessionUser: session.user.id, profile });
            setLoading(false);
        };

        checkAdmin();
    }, []);

    if (loading) {
        return <div className="h-screen flex items-center justify-center text-white">Comprobando permisos...</div>;
    }

    if (!isAdmin) {
        // Debugging: Show why access is denied instead of redirecting immediately
        return (
            <div className="min-h-screen flex flex-col items-center justify-center text-white bg-black">
                <h1 className="text-3xl font-bold text-red-500 mb-4">Acceso Denegado</h1>
                <p className="mb-2">No tienes permisos para ver esta página.</p>
                <div className="bg-gray-800 p-4 rounded text-sm font-mono text-left">
                    <p>DEBUG INFO:</p>
                    <p>Loading: {loading ? 'True' : 'False'}</p>
                    <p>IsAdmin state: {isAdmin === null ? 'null' : isAdmin.toString()}</p>
                    <pre className="mt-2 text-xs text-gray-400">
                        {JSON.stringify(debugInfo, null, 2)}
                    </pre>
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
