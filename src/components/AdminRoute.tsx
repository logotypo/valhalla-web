import React, { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { supabase } from '../supabase';

const AdminRoute: React.FC = () => {
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
        // Redirect to home if not admin
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
};

export default AdminRoute;
